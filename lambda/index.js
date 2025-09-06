const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const dynamodb = new DynamoDBClient({});
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const authHandler = require('./handlers/auth');
const certificateHandler = require('./handlers/certificates');
const curriculumHandler = require('./handlers/curriculums');
const taskHandler = require('./handlers/tasks');
const plannerHandler = require('./handlers/planner');
const aiSearchHandler = require('./handlers/ai-search');
const aiRecommendationHandler = require('./handlers/ai-recommendations');
const simpleResourcesHandler = require('./handlers/simple-resources');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters = {}, body, headers = {} } = event;
  
  // 헤더 로깅 (민감한 정보 제외)
  console.log('Headers received:', {
    authorization: headers.Authorization ? 'Bearer [TOKEN]' : 'None',
    'content-type': headers['content-type'] || headers['Content-Type'],
    origin: headers.origin || headers.Origin
  });
  
  // CORS preflight 처리
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: ''
    };
  }
  
  const userId = await getUserId(headers);
  console.log('User ID from token:', userId ? 'Valid' : 'Invalid/Missing');
  
  try {
    // Extract path segments
    const pathSegments = path.split('/').filter(segment => segment);
    console.log('Path segments:', pathSegments);
    
    // Auth routes
    if (path === '/login' && httpMethod === 'POST') {
      return await authHandler.login(JSON.parse(body || '{}'));
    }
    
    // AI Search routes
    if (path === '/ai/ask' && httpMethod === 'POST') {
      return await aiSearchHandler.askAI(JSON.parse(body || '{}'));
    }
    
    if (path === '/ai/recommend' && httpMethod === 'POST') {
      return await aiSearchHandler.recommendCertifications(JSON.parse(body || '{}'));
    }
    
    // AI Recommendation routes
    if (path === '/ai/recommendations' && httpMethod === 'GET') {
      if (!userId) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      return await aiRecommendationHandler.getAIRecommendations(userId);
    }
    if (path === '/register' && httpMethod === 'POST') {
      return await authHandler.register(JSON.parse(body || '{}'));
    }
    if (path === '/refresh' && httpMethod === 'POST') {
      return await authHandler.refresh(JSON.parse(body || '{}'));
    }
    
    // Learning Resources routes
    if (pathSegments[0] === 'resources' && pathSegments.length === 2 && httpMethod === 'GET') {
      return await simpleResourcesHandler.getRecommendedResources(pathSegments[1]);
    }
    
    // Certificate routes
    if (path === '/certificates' && httpMethod === 'GET') {
      return await certificateHandler.list();
    }
    if (path === '/certificates/recommended' && httpMethod === 'GET') {
      if (!userId) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      return await certificateHandler.getRecommended(userId);
    }
    if (pathSegments[0] === 'certificates' && pathSegments.length === 2 && httpMethod === 'GET') {
      return await certificateHandler.getById(pathSegments[1]);
    }
    if (pathSegments[0] === 'certificates' && pathSegments.length === 3 && pathSegments[2] === 'save' && httpMethod === 'POST') {
      return await certificateHandler.save(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'certificates' && pathSegments.length === 3 && pathSegments[2] === 'save' && httpMethod === 'DELETE') {
      return await certificateHandler.unsave(pathSegments[1], userId);
    }
    if (path === '/certificates/saved' && httpMethod === 'GET') {
      return await certificateHandler.getSaved(userId);
    }
    
    // Curriculum routes - 인증 필요
    if (path === '/curriculums' && httpMethod === 'GET') {
      const authError = requireAuth(userId);
      if (authError) return authError;
      return await curriculumHandler.list(userId);
    }
    if (path === '/curriculums' && httpMethod === 'POST') {
      const authError = requireAuth(userId);
      if (authError) return authError;
      return await curriculumHandler.create(JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'GET') {
      const authError = requireAuth(userId);
      if (authError) return authError;
      return await curriculumHandler.getById(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'PATCH') {
      const authError = requireAuth(userId);
      if (authError) return authError;
      return await curriculumHandler.update(pathSegments[1], JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'DELETE') {
      const authError = requireAuth(userId);
      if (authError) return authError;
      return await curriculumHandler.delete(pathSegments[1], userId);
    }
    
    // Task routes
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 3 && httpMethod === 'GET') {
      return await curriculumHandler.getTasks(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 3 && httpMethod === 'POST') {
      return await taskHandler.create(pathSegments[1], JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 4 && httpMethod === 'GET') {
      return await taskHandler.getById(pathSegments[1], pathSegments[3], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 4 && httpMethod === 'PATCH') {
      return await curriculumHandler.updateTask(pathSegments[1], pathSegments[3], JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 4 && httpMethod === 'DELETE') {
      return await taskHandler.delete(pathSegments[1], pathSegments[3], userId);
    }
    
    // Progress route
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'progress' && httpMethod === 'GET') {
      return await curriculumHandler.getProgress(pathSegments[1], userId);
    }
    
    // Planner routes
    if (path === '/planner/generate' && httpMethod === 'POST') {
      return await plannerHandler.generate(JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'planner' && pathSegments[2] === 'apply' && httpMethod === 'POST') {
      return await plannerHandler.apply(pathSegments[1], JSON.parse(body || '{}'), userId);
    }
    
    // Notification routes
    if (path === '/notifications' && httpMethod === 'POST') {
      return await createNotification(JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'notifications' && pathSegments.length === 2 && httpMethod === 'DELETE') {
      return await deleteNotification(pathSegments[1], userId);
    }
    
    console.log('No matching route found for:', httpMethod, path);
    return { 
      statusCode: 404, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Not found', path, method: httpMethod }) 
    };
  } catch (error) {
    console.error('Handler error:', error);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};

async function createNotification(data, userId) {
  if (!userId) return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  
  try {
    const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
    const { v4: uuidv4 } = require('uuid');
    
    const notificationId = uuidv4();
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.USER_TABLE,
      Item: {
        userId: { S: userId },
        type: { S: `notification#${notificationId}` },
        id: { S: notificationId },
        certId: { S: data.certId },
        notificationType: { S: data.notificationType || 'exam_reminder' },
        enabled: { BOOL: data.enabled || true },
        createdAt: { S: new Date().toISOString() }
      }
    }));
    
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Failed to create notification' }) };
  }
}

async function deleteNotification(certId, userId) {
  if (!userId) return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  
  try {
    const { DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
    
    await dynamodb.send(new DeleteItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId },
        'type#id': { S: `notification#${certId}` }
      }
    }));
    
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Failed to delete notification' }) };
  }
}

// 인증이 필요한 엔드포인트를 위한 헬퍼 함수
function requireAuth(userId) {
  if (!userId) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Authentication required',
        message: 'Please login to access this resource'
      })
    };
  }
  return null;
}

async function getUserId(headers) {
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) {
    console.log('No authorization header found');
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('No token found in authorization header');
    return null;
  }
  
  // 환경 변수 확인
  if (!process.env.USER_POOL_ID || !process.env.USER_POOL_CLIENT_ID) {
    console.error('Missing required environment variables:', {
      USER_POOL_ID: !!process.env.USER_POOL_ID,
      USER_POOL_CLIENT_ID: !!process.env.USER_POOL_CLIENT_ID
    });
    return null;
  }
  
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.USER_POOL_CLIENT_ID
    });
    
    const payload = await verifier.verify(token);
    console.log('Token verified successfully for user:', payload.sub);
    return payload.sub;
  } catch (error) {
    console.error('Token verification failed:', {
      error: error.message,
      name: error.name,
      userPoolId: process.env.USER_POOL_ID,
      clientId: process.env.USER_POOL_CLIENT_ID,
      tokenLength: token.length
    });
    return null;
  }
}
