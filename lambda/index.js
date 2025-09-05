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
  const { httpMethod, path, pathParameters, body, headers } = event;
  const userId = await getUserId(headers);
  
  try {
    // Auth routes
    if (path === '/login' && httpMethod === 'POST') return authHandler.login(JSON.parse(body));
    if (path === '/register' && httpMethod === 'POST') return authHandler.register(JSON.parse(body));
    
    // Certificate routes
    if (path === '/certificates' && httpMethod === 'GET') return certificateHandler.list();
    if (path.match(/^\/certificates\/[^\/]+$/) && httpMethod === 'GET') return certificateHandler.getById(pathParameters.id);
    if (path.match(/^\/certificates\/[^\/]+\/save$/) && httpMethod === 'POST') return certificateHandler.save(pathParameters.id, userId);
    if (path.match(/^\/certificates\/[^\/]+\/save$/) && httpMethod === 'DELETE') return certificateHandler.unsave(pathParameters.id, userId);
    if (path === '/certificates/saved' && httpMethod === 'GET') return certificateHandler.getSaved(userId);
    
    // Curriculum routes
    if (path === '/curriculums' && httpMethod === 'GET') return curriculumHandler.list(userId);
    if (path === '/curriculums' && httpMethod === 'POST') return curriculumHandler.create(JSON.parse(body), userId);
    if (path.match(/^\/curriculums\/[^\/]+$/) && httpMethod === 'GET') return curriculumHandler.getById(pathParameters.id, userId);
    if (path.match(/^\/curriculums\/[^\/]+$/) && httpMethod === 'PATCH') return curriculumHandler.update(pathParameters.id, JSON.parse(body), userId);
    if (path.match(/^\/curriculums\/[^\/]+$/) && httpMethod === 'DELETE') return curriculumHandler.delete(pathParameters.id, userId);
    
    // Task routes
    if (path.match(/^\/curriculums\/[^\/]+\/tasks$/) && httpMethod === 'POST') return taskHandler.create(pathParameters.id, JSON.parse(body), userId);
    if (path.match(/^\/curriculums\/[^\/]+\/tasks$/) && httpMethod === 'GET') return taskHandler.list(pathParameters.id, userId);
    if (path.match(/^\/curriculums\/[^\/]+\/tasks\/[^\/]+$/) && httpMethod === 'GET') return taskHandler.getById(pathParameters.id, pathParameters.taskId, userId);
    if (path.match(/^\/curriculums\/[^\/]+\/tasks\/[^\/]+$/) && httpMethod === 'PATCH') return taskHandler.update(pathParameters.id, pathParameters.taskId, JSON.parse(body), userId);
    if (path.match(/^\/curriculums\/[^\/]+\/tasks\/[^\/]+$/) && httpMethod === 'DELETE') return taskHandler.delete(pathParameters.id, pathParameters.taskId, userId);
    
    // Progress route
    if (path.match(/^\/curriculums\/[^\/]+\/progress$/) && httpMethod === 'GET') return curriculumHandler.getProgress(pathParameters.id, userId);
    
    // Planner routes
    if (path === '/planner/generate' && httpMethod === 'POST') return plannerHandler.generate(JSON.parse(body), userId);
    if (path.match(/^\/planner\/[^\/]+\/apply$/) && httpMethod === 'POST') return plannerHandler.apply(pathParameters.curriculumId, JSON.parse(body), userId);
    
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getUserId(headers) {
  const token = headers.Authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.USER_POOL_CLIENT_ID
    });
    const payload = await verifier.verify(token);
    return payload.sub;
  } catch {
    return null;
  }
}
