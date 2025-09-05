const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

exports.list = async (userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.USER_TABLE,
    FilterExpression: 'userId = :userId AND #type = :type',
    ExpressionAttributeNames: { '#type': 'type' },
    ExpressionAttributeValues: {
      ':userId': { S: userId },
      ':type': { S: 'curriculum' }
    }
  }));
  
  return response(200, result.Items || []);
};

exports.create = async (data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const id = uuidv4();
  await dynamodb.send(new PutItemCommand({
    TableName: process.env.USER_TABLE,
    Item: {
      userId: { S: userId },
      type: { S: 'curriculum' },
      id: { S: id },
      title: { S: data.title },
      certId: { S: data.certId || '' },
      status: { S: 'active' },
      createdAt: { S: new Date().toISOString() }
    }
  }));
  
  return response(201, { id });
};

exports.getById = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const result = await dynamodb.send(new GetItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: id }
    }
  }));
  
  return response(200, result.Item || {});
};

exports.update = async (id, data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  await dynamodb.send(new UpdateItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: id }
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': { S: data.status || 'active' } }
  }));
  
  return response(200, { success: true });
};

exports.delete = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  await dynamodb.send(new DeleteItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: id }
    }
  }));
  
  return response(200, { success: true });
};

exports.getProgress = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  // Get all tasks for this curriculum
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.USER_TABLE,
    FilterExpression: 'userId = :userId AND curriculumId = :curriculumId AND #type = :type',
    ExpressionAttributeNames: { '#type': 'type' },
    ExpressionAttributeValues: {
      ':userId': { S: userId },
      ':curriculumId': { S: id },
      ':type': { S: 'task' }
    }
  }));
  
  const tasks = result.Items || [];
  const completed = tasks.filter(task => task.status?.S === 'completed').length;
  
  return response(200, {
    total: tasks.length,
    completed,
    progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
  });
};
