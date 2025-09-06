const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, ScanCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

// DynamoDB에서 자격증 정보 검색
const searchCertifications = async (query) => {
  try {
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.CERT_TABLE
    }));
    
    return result.Items || [];
  } catch (error) {
    console.error('Certificate search error:', error);
    return [];
  }
};

// 특정 자격증 정보 가져오기
const getCertificationById = async (certId) => {
  try {
    const result = await dynamodb.send(new GetItemCommand({
      TableName: process.env.CERT_TABLE,
      Key: { id: { S: certId } }
    }));
    
    return result.Item || null;
  } catch (error) {
    console.error('Get certification error:', error);
    return null;
  }
};

// AI 답변 생성
exports.askAI = async (data) => {
  const { question, certId } = data;
  
  try {
    let context = '';
    
    if (certId) {
      // 특정 자격증에 대한 질문
      const cert = await getCertificationById(certId);
      if (cert) {
        context = `다음은 ${cert.name.S} 자격증 정보입니다:\n` +
                 `- 주관기관: ${cert.organization.S}\n` +
                 `- 응시료: ${cert.examFee.S}\n` +
                 `- 시험시간: ${cert.examTime.S}\n` +
                 `- 합격기준: ${cert.passingScore.S}\n` +
                 `- 난이도: ${cert.difficulty.S}\n` +
                 `- 권장 학습기간: ${cert.studyPeriod.S}\n` +
                 `- 출제과목: ${cert.subjects.L.map(s => s.S).join(', ')}\n\n`;
      }
    } else {
      // 일반적인 자격증 질문
      const allCerts = await searchCertifications();
      context = '다음은 한국데이터산업진흥원에서 주관하는 자격증 목록입니다:\n' +
               allCerts.map(cert => 
                 `- ${cert.name.S}: ${cert.category.S} 분야, ${cert.difficulty.S} 난이도`
               ).join('\n') + '\n\n';
    }

    const prompt = `${context}사용자 질문: ${question}\n\n` +
                  `위 자격증 정보를 바탕으로 정확하고 도움이 되는 답변을 해주세요. ` +
                  `구체적인 시험 정보, 학습 방법, 난이도 비교 등을 포함해서 답변해주세요.`;

    const command = new ConverseCommand({
      modelId: 'meta.llama3-1-8b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { 
        maxTokens: 2000, 
        temperature: 0.3
      }
    });

    const aiResponse = await bedrock.send(command);
    const answer = aiResponse.output.message.content[0].text;

    return response(200, {
      question,
      answer,
      certId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI search error:', error);
    return response(500, { error: 'AI 답변 생성에 실패했습니다.' });
  }
};

// 자격증 추천
exports.recommendCertifications = async (data) => {
  const { userLevel, interests, timeAvailable } = data;
  
  try {
    const allCerts = await searchCertifications();
    
    const context = '다음은 사용가능한 자격증 목록입니다:\n' +
                   allCerts.map(cert => 
                     `- ${cert.name.S}: ${cert.difficulty.S} 난이도, ` +
                     `${cert.studyPeriod.S} 학습기간, ${cert.category.S} 분야`
                   ).join('\n') + '\n\n';

    const prompt = `${context}사용자 정보:\n` +
                  `- 현재 수준: ${userLevel}\n` +
                  `- 관심 분야: ${interests}\n` +
                  `- 사용 가능한 시간: ${timeAvailable}\n\n` +
                  `위 정보를 바탕으로 가장 적합한 자격증 2-3개를 추천하고 이유를 설명해주세요.`;

    const command = new ConverseCommand({
      modelId: 'meta.llama3-1-8b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { 
        maxTokens: 2000, 
        temperature: 0.5
      }
    });

    const aiResponse = await bedrock.send(command);
    const recommendation = aiResponse.output.message.content[0].text;

    return response(200, {
      userProfile: { userLevel, interests, timeAvailable },
      recommendation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return response(500, { error: '자격증 추천에 실패했습니다.' });
  }
};
