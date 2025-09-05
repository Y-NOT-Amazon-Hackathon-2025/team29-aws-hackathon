const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

exports.create = async (curriculumId, data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const taskId = uuidv4();
  await dynamodb.send(new PutItemCommand({
    TableName: process.env.USER_TABLE,
    Item: {
      userId: { S: userId },
      type: { S: 'task' },
      id: { S: taskId },
      curriculumId: { S: curriculumId },
      title: { S: data.title },
      description: { S: data.description || '' },
      status: { S: 'pending' },
      estimatedHours: { N: String(data.estimatedHours || 1) },
      actualHours: { N: '0' },
      createdAt: { S: new Date().toISOString() }
    }
  }));
  
  return response(201, { taskId });
};

exports.list = async (curriculumId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.USER_TABLE,
    FilterExpression: 'userId = :userId AND curriculumId = :curriculumId AND #type = :type',
    ExpressionAttributeNames: { '#type': 'type' },
    ExpressionAttributeValues: {
      ':userId': { S: userId },
      ':curriculumId': { S: curriculumId },
      ':type': { S: 'task' }
    }
  }));
  
  return response(200, result.Items || []);
};

exports.getById = async (curriculumId, taskId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const result = await dynamodb.send(new GetItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: taskId }
    }
  }));
  
  return response(200, result.Item || {});
};

exports.update = async (curriculumId, taskId, data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const updateExpr = [];
  const attrNames = {};
  const attrValues = {};
  
  if (data.status) {
    updateExpr.push('#status = :status');
    attrNames['#status'] = 'status';
    attrValues[':status'] = { S: data.status };
  }
  
  if (data.actualHours !== undefined) {
    updateExpr.push('actualHours = :actualHours');
    attrValues[':actualHours'] = { N: String(data.actualHours) };
  }
  
  if (updateExpr.length === 0) {
    return response(400, { error: 'No fields to update' });
  }
  
  await dynamodb.send(new UpdateItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: taskId }
    },
    UpdateExpression: `SET ${updateExpr.join(', ')}`,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrValues
  }));
  
  return response(200, { success: true });
};

exports.delete = async (curriculumId, taskId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  await dynamodb.send(new DeleteItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: taskId }
    }
  }));
  
  return response(200, { success: true });
};
