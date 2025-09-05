const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

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

exports.save = async (certId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  // Save to favorites
  await dynamodb.send(new PutItemCommand({
    TableName: process.env.USER_TABLE,
    Item: {
      userId: { S: userId },
      type: { S: 'favorite' },
      certId: { S: certId },
      createdAt: { S: new Date().toISOString() }
    }
  }));
  
  // Create skeleton curriculum
  const curriculumId = uuidv4();
  await dynamodb.send(new PutItemCommand({
    TableName: process.env.USER_TABLE,
    Item: {
      userId: { S: userId },
      type: { S: 'curriculum' },
      id: { S: curriculumId },
      certId: { S: certId },
      title: { S: `${certId} 학습 계획` },
      status: { S: 'skeleton' },
      createdAt: { S: new Date().toISOString() }
    }
  }));
  
  return response(200, { curriculumId });
};

exports.unsave = async (certId, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  await dynamodb.send(new DeleteItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      type: { S: 'favorite' },
      certId: { S: certId }
    }
  }));
  
  return response(200, { success: true });
};

exports.getSaved = async (userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.USER_TABLE,
    FilterExpression: 'userId = :userId AND #type = :type',
    ExpressionAttributeNames: { '#type': 'type' },
    ExpressionAttributeValues: {
      ':userId': { S: userId },
      ':type': { S: 'favorite' }
    }
  }));
  
  return response(200, result.Items || []);
};
