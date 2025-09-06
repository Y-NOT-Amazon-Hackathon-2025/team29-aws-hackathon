const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

async function askBedrockAboutCertifications() {
  try {
    // DynamoDB에서 자격증 정보 가져오기
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.CERT_TABLE || 'CertificationStack-CertificationsTable'
    }));
    
    const certifications = result.Items || [];
    
    // 자격증 정보를 컨텍스트로 구성
    const context = '다음은 한국데이터산업진흥원 자격증 정보입니다:\n\n' +
      certifications.map(cert => {
        return `${cert.name?.S || 'Unknown'}:\n` +
               `- 정식명칭: ${cert.fullName?.S || 'N/A'}\n` +
               `- 난이도: ${cert.difficulty?.S || 'N/A'}\n` +
               `- 학습기간: ${cert.studyPeriod?.S || 'N/A'}\n` +
               `- 응시료: ${cert.examFee?.S || 'N/A'}\n` +
               `- 시험시간: ${cert.examTime?.S || 'N/A'}\n` +
               `- 출제과목: ${cert.subjects?.L?.map(s => s.S).join(', ') || 'N/A'}\n`;
      }).join('\n') + '\n\n';

    const question = "ADSP와 ASP의 차이점이 뭔가요?";
    
    const prompt = `${context}사용자 질문: ${question}\n\n` +
                  `위 자격증 정보를 바탕으로 ADSP와 ASP의 차이점을 자세히 설명해주세요. ` +
                  `만약 ASP 자격증이 위 목록에 없다면, 일반적으로 알려진 ASP(Active Server Pages) 기술과의 ` +
                  `차이점이나 혼동될 수 있는 부분에 대해서도 설명해주세요.`;

    console.log('🤖 Bedrock AI에게 질문 중...');
    console.log('질문:', question);
    console.log('\n' + '='.repeat(50));

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

    console.log('🎯 Bedrock AI 답변:');
    console.log(answer);
    console.log('\n' + '='.repeat(50));
    
    return answer;

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    
    // 오프라인 시뮬레이션 답변
    console.log('\n🔄 오프라인 시뮬레이션 답변:');
    console.log(`
📊 ADSP와 ASP의 차이점 분석

🎯 ADSP (데이터분석 준전문가)
- 정식명칭: Advanced Data Analytics Semi-Professional
- 주관기관: 한국데이터산업진흥원
- 분야: 데이터 분석
- 난이도: 초급
- 응시료: 55,000원
- 시험시간: 100분
- 출제과목: 데이터 이해, 데이터 분석 기획, 데이터 분석
- 학습기간: 2-3개월

❓ ASP 관련 설명
ASP라는 자격증은 한국데이터산업진흥원에서 주관하는 자격증 목록에 없습니다.

혹시 다음 중 하나를 의미하시는 건 아닌지요?

1️⃣ ASP (Active Server Pages)
- Microsoft의 웹 개발 기술
- 서버 사이드 스크립팅 환경
- 데이터 자격증과는 완전히 다른 분야

2️⃣ 다른 자격증과의 혼동
- ADP (데이터분석 전문가): ADSP의 상위 자격증
- DAsP (데이터아키텍처 준전문가): 데이터 모델링 분야

💡 결론
ADSP는 데이터 분석 분야의 입문 자격증이며, ASP는 해당 기관에서 제공하지 않는 자격증입니다.
혹시 다른 자격증을 의미하셨다면 구체적으로 알려주시면 더 정확한 비교를 도와드릴 수 있습니다.
    `);
  }
}

// 실행
askBedrockAboutCertifications();
