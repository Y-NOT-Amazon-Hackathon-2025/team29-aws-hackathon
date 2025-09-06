const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

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

// 관심사별 자격증 매핑
const interestToCertMapping = {
  "데이터분석": ["adsp", "adp", "sqld"],
  "클라우드": ["aws-saa", "aws-sap", "azure-fundamentals"],
  "보안": ["cissp", "ceh", "security-plus"],
  "AI/ML": ["tensorflow-cert", "aws-ml", "google-ml"],
  "웹개발": ["aws-developer", "google-cloud-dev"],
  "모바일": ["android-dev", "ios-dev"],
  "네트워크": ["ccna", "ccnp", "network-plus"],
  "데이터베이스": ["sqld", "sqlp", "oracle-dba"],
  "프로젝트관리": ["pmp", "scrum-master"],
  "디자인": ["adobe-certified", "ux-cert"]
};

exports.list = async () => {
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.CERT_TABLE
  }));
  return response(200, result.Items || []);
};

exports.getById = async (id) => {
  const result = await dynamodb.send(new GetItemCommand({
    TableName: process.env.CERT_TABLE,
    Key: { id: { S: id } }
  }));
  return response(200, result.Item || {});
};

exports.getRecommended = async (userId) => {
  try {
    let userInterests = [];
    
    // 사용자 프로필에서 관심사 가져오기 (실패해도 계속 진행)
    if (userId && userId !== 'anonymous') {
      try {
        const userProfile = await dynamodb.send(new GetItemCommand({
          TableName: process.env.USER_TABLE,
          Key: { 
            userId: { S: userId }
          }
        }));

        if (userProfile.Item && userProfile.Item.interests) {
          userInterests = userProfile.Item.interests.L.map(item => item.S);
        }
      } catch (profileError) {
        console.log('Failed to get user profile, using default recommendations');
      }
    }

    // 관심사가 없으면 기본 추천 제공
    if (userInterests.length === 0) {
      userInterests = ['데이터분석', '클라우드', 'AI/ML'];
    }
    
    // 관심사 기반 추천 자격증 ID 수집
    const recommendedCertIds = new Set();
    userInterests.forEach(interest => {
      if (interestToCertMapping[interest]) {
        interestToCertMapping[interest].forEach(certId => {
          recommendedCertIds.add(certId);
        });
      }
    });

    // 추천 자격증 정보 가져오기
    const recommendedCerts = [];
    for (const certId of recommendedCertIds) {
      try {
        const certResult = await dynamodb.send(new GetItemCommand({
          TableName: process.env.CERT_TABLE,
          Key: { id: { S: certId } }
        }));
        if (certResult.Item) {
          recommendedCerts.push(certResult.Item);
        }
      } catch (error) {
        console.log(`Certificate ${certId} not found`);
      }
    }

    // 자격증을 찾지 못한 경우 기본 데이터 제공
    if (recommendedCerts.length === 0) {
      return response(200, [
        {
          id: { S: 'adsp' },
          name: { S: 'ADsP' },
          fullName: { S: '데이터분석 준전문가' },
          organization: { S: '한국데이터산업진흥원' },
          difficulty: { S: '중급' },
          studyPeriod: { S: '2-3개월' },
          examFee: { S: '60,000원' }
        },
        {
          id: { S: 'aws-saa' },
          name: { S: 'AWS SAA' },
          fullName: { S: 'AWS Solutions Architect Associate' },
          organization: { S: 'Amazon Web Services' },
          difficulty: { S: '중급' },
          studyPeriod: { S: '3-4개월' },
          examFee: { S: '$150' }
        },
        {
          id: { S: 'sqld' },
          name: { S: 'SQLD' },
          fullName: { S: 'SQL 개발자' },
          organization: { S: '한국데이터산업진흥원' },
          difficulty: { S: '초급' },
          studyPeriod: { S: '1-2개월' },
          examFee: { S: '50,000원' }
        }
      ]);
    }

    return response(200, recommendedCerts);
  } catch (error) {
    console.error('Get recommended certificates error:', error);
    // 완전 실패 시에도 기본 데이터 반환
    return response(200, [
      {
        id: { S: 'default' },
        name: { S: '추천 자격증' },
        fullName: { S: '기본 추천 자격증' },
        organization: { S: '기본 기관' },
        difficulty: { S: '중급' },
        studyPeriod: { S: '2-3개월' },
        examFee: { S: '문의' }
      }
    ]);
  }
};

exports.save = async (certId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    // Save to favorites with correct key structure
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.USER_TABLE,
      Item: {
        userId: { S: userId },
        type: { S: `favorite#${certId}` },
        certId: { S: certId },
        createdAt: { S: new Date().toISOString() }
      }
    }));
    
    return response(200, { success: true, message: 'Certificate saved to favorites' });
  } catch (error) {
    console.error('Save certificate error:', error);
    return response(500, { error: 'Failed to save certificate' });
  }
};

exports.unsave = async (certId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    await dynamodb.send(new DeleteItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId },
        type: { S: `favorite#${certId}` }
      }
    }));
    
    return response(200, { success: true, message: 'Certificate removed from favorites' });
  } catch (error) {
    console.error('Unsave certificate error:', error);
    return response(500, { error: 'Failed to remove certificate' });
  }
};

exports.getSaved = async (userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.USER_TABLE,
      KeyConditionExpression: 'userId = :userId AND begins_with(#type, :type)',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':type': { S: 'favorite#' }
      }
    }));
    
    return response(200, result.Items || []);
  } catch (error) {
    console.error('Get saved certificates error:', error);
    return response(500, { error: 'Failed to get saved certificates' });
  }
};
