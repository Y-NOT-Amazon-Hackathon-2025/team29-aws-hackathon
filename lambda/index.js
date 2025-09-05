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

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters = {}, body, headers = {} } = event;
  const userId = await getUserId(headers);
  
  try {
    // Extract path segments
    const pathSegments = path.split('/').filter(segment => segment);
    console.log('Path segments:', pathSegments);
    
    // Auth routes
    if (path === '/login' && httpMethod === 'POST') {
      return await authHandler.login(JSON.parse(body || '{}'));
    }
    if (path === '/register' && httpMethod === 'POST') {
      return await authHandler.register(JSON.parse(body || '{}'));
    }
    
    // Certificate routes
    if (path === '/certificates' && httpMethod === 'GET') {
      return await certificateHandler.list();
    }
    if (pathSegments[0] === 'certificates' && pathSegments.length === 2 && httpMethod === 'GET') {
      return await certificateHandler.getById(pathSegments[1]);
    }
    if (pathSegments[0] === 'certificates' && pathSegments[2] === 'save' && httpMethod === 'POST') {
      return await certificateHandler.save(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'certificates' && pathSegments[2] === 'save' && httpMethod === 'DELETE') {
      return await certificateHandler.unsave(pathSegments[1], userId);
    }
    if (path === '/certificates/saved' && httpMethod === 'GET') {
      return await certificateHandler.getSaved(userId);
    }
    
    // Curriculum routes
    if (path === '/curriculums' && httpMethod === 'GET') {
      return await curriculumHandler.list(userId);
    }
    if (path === '/curriculums' && httpMethod === 'POST') {
      return await curriculumHandler.create(JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'GET') {
      return await curriculumHandler.getById(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'PATCH') {
      return await curriculumHandler.update(pathSegments[1], JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments.length === 2 && httpMethod === 'DELETE') {
      return await curriculumHandler.delete(pathSegments[1], userId);
    }
    
    // Task routes
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 3 && httpMethod === 'POST') {
      return await taskHandler.create(pathSegments[1], JSON.parse(body || '{}'), userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 3 && httpMethod === 'GET') {
      return await taskHandler.list(pathSegments[1], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 4 && httpMethod === 'GET') {
      return await taskHandler.getById(pathSegments[1], pathSegments[3], userId);
    }
    if (pathSegments[0] === 'curriculums' && pathSegments[2] === 'tasks' && pathSegments.length === 4 && httpMethod === 'PATCH') {
      return await taskHandler.update(pathSegments[1], pathSegments[3], JSON.parse(body || '{}'), userId);
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

async function getUserId(headers) {
  const authHeader = headers.Authorization || headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.USER_POOL_CLIENT_ID
    });
    const payload = await verifier.verify(token);
    return payload.sub;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
