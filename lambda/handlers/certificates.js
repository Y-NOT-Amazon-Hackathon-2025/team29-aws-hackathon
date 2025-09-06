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
    // 사용자 프로필에서 관심사 가져오기
    const userProfile = await dynamodb.send(new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: { 
        userId: { S: userId },
        'type#id': { S: 'profile' }
      }
    }));

    if (!userProfile.Item || !userProfile.Item.interests) {
      return response(200, []);
    }

    const userInterests = userProfile.Item.interests.L.map(item => item.S);
    
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

    return response(200, recommendedCerts);
  } catch (error) {
    console.error('Get recommended certificates error:', error);
    return response(500, { error: 'Failed to get recommended certificates' });
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
