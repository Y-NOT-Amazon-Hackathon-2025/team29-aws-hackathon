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
  
  try {
    // Save to favorites with correct key structure
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.USER_TABLE,
      Item: {
        userId: { S: userId },
        'type#id': { S: `favorite#${certId}` },
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
        'type#id': { S: `favorite#${certId}` }
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
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :type)',
      ExpressionAttributeNames: { '#type': 'type#id' },
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
