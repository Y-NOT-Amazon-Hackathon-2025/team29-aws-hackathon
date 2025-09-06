const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, GetItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

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

// AI 기반 관심사 맞춤 자격증 추천
exports.getAIRecommendations = async (userId) => {
  try {
    // 1. 사용자 프로필 및 관심사 조회
    const userProfile = await dynamodb.send(new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: { 
        userId: { S: userId },
        'type#id': { S: 'profile' }
      }
    }));

    if (!userProfile.Item || !userProfile.Item.interests) {
      return response(200, { recommendations: [], reason: '관심사 정보가 없습니다.' });
    }

    const userInterests = userProfile.Item.interests.L.map(item => item.S);
    const userName = userProfile.Item.name?.S || '사용자';

    // 2. 전체 자격증 목록 조회
    const allCerts = await dynamodb.send(new ScanCommand({
      TableName: process.env.CERT_TABLE
    }));

    const certList = allCerts.Items.map(item => ({
      id: item.id?.S,
      name: item.name?.S || item.fullName?.S,
      category: item.category?.S,
      difficulty: item.difficulty?.S,
      organization: item.organization?.S,
      studyPeriod: item.studyPeriod?.S
    }));

    // 3. AI 프롬프트 생성
    const prompt = `
사용자 정보:
- 이름: ${userName}
- 관심사: ${userInterests.join(', ')}

자격증 목록:
${certList.map(cert => `- ${cert.id}: ${cert.name} (${cert.category}, ${cert.difficulty})`).join('\n')}

위 사용자의 관심사를 분석하여 가장 적합한 자격증 3개를 추천해주세요.
각 추천에 대해 구체적인 이유도 설명해주세요.

응답 형식 (JSON):
{
  "recommendations": [
    {
      "certId": "자격증ID",
      "reason": "추천 이유 (관심사와의 연관성, 난이도, 취업 전망 등)",
      "priority": 1-3
    }
  ],
  "summary": "전체 추천 요약"
}
`;

    // 4. Bedrock AI 호출
    const bedrockCommand = new InvokeModelCommand({
      modelId: 'meta.llama3-1-8b-instruct-v1:0',
      body: JSON.stringify({
        prompt: prompt,
        max_gen_len: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    const bedrockResponse = await bedrock.send(bedrockCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    
    let aiRecommendations;
    try {
      aiRecommendations = JSON.parse(responseBody.generation);
    } catch (parseError) {
      // AI 응답이 JSON이 아닐 경우 기본 추천 사용
      console.log('AI response parsing failed, using fallback');
      return await getFallbackRecommendations(userInterests, certList);
    }

    // 5. 추천된 자격증 상세 정보 조회
    const detailedRecommendations = [];
    for (const rec of aiRecommendations.recommendations) {
      const cert = certList.find(c => c.id === rec.certId);
      if (cert) {
        detailedRecommendations.push({
          ...cert,
          aiReason: rec.reason,
          priority: rec.priority
        });
      }
    }

    return response(200, {
      recommendations: detailedRecommendations,
      summary: aiRecommendations.summary,
      userInterests: userInterests,
      aiGenerated: true
    });

  } catch (error) {
    console.error('AI recommendation error:', error);
    
    // 오류 시 기본 추천 시스템 사용
    return await getFallbackRecommendations(userInterests, []);
  }
};

// 기본 추천 시스템 (AI 실패 시 백업)
const getFallbackRecommendations = async (userInterests, certList) => {
  const interestMapping = {
    "데이터분석": ["adsp", "adp", "sqld"],
    "클라우드": ["aws-saa", "aws-sap"],
    "보안": ["cissp", "ceh"],
    "AI/ML": ["tensorflow-cert", "aws-ml"],
    "웹개발": ["aws-developer"],
    "모바일": ["android-dev"],
    "네트워크": ["ccna", "ccnp"],
    "데이터베이스": ["sqld", "oracle-dba"],
    "프로젝트관리": ["pmp", "scrum-master"],
    "디자인": ["adobe-certified"]
  };

  const recommendedIds = new Set();
  userInterests.forEach(interest => {
    if (interestMapping[interest]) {
      interestMapping[interest].forEach(id => recommendedIds.add(id));
    }
  });

  const recommendations = Array.from(recommendedIds).slice(0, 3).map((id, index) => ({
    certId: id,
    reason: `${userInterests.join(', ')} 관심사와 관련된 추천 자격증입니다.`,
    priority: index + 1
  }));

  return response(200, {
    recommendations,
    summary: '관심사 기반 기본 추천입니다.',
    userInterests,
    aiGenerated: false
  });
};

// 사용자 행동 기반 추천 (향후 확장)
exports.getBehaviorBasedRecommendations = async (userId) => {
  try {
    // 사용자의 학습 이력, 완료한 커리큘럼, 관심 표시한 자격증 등 분석
    // 현재는 기본 구조만 제공
    
    return response(200, {
      message: '행동 기반 추천 기능은 준비 중입니다.',
      recommendations: []
    });
  } catch (error) {
    console.error('Behavior-based recommendation error:', error);
    return response(500, { error: 'Failed to get behavior-based recommendations' });
  }
};
