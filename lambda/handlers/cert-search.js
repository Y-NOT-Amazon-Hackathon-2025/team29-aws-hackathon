const { DynamoDBClient, ScanCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const Redis = require('ioredis');

const dynamodb = new DynamoDBClient({});
const redis = new Redis(process.env.REDIS_URL);

const response = (statusCode, body) => ({
  statusCode,
  headers: { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

exports.search = async (event) => {
  const { queryStringParameters = {} } = event;
  const { 
    q: query = '', 
    category = '', 
    field = '', 
    level = '',
    page = '1',
    limit = '20'
  } = queryStringParameters;
  
  const cacheKey = `search:${JSON.stringify(queryStringParameters)}`;
  
  try {
    // Redis 캐시 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit');
      return response(200, JSON.parse(cached));
    }
    
    // DynamoDB 검색
    const results = await searchCertifications({
      query: query.toLowerCase(),
      category,
      field,
      level,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    // 캐시 저장 (5분)
    await redis.setex(cacheKey, 300, JSON.stringify(results));
    
    return response(200, results);
  } catch (error) {
    console.error('Search error:', error);
    return response(500, { error: 'Search failed' });
  }
};

async function searchCertifications({ query, category, field, level, page, limit }) {
  let filterExpression = '#type = :type';
  let expressionAttributeNames = { '#type': 'type' };
  let expressionAttributeValues = { ':type': { S: 'certification' } };
  
  // 필터 조건 추가
  if (category) {
    filterExpression += ' AND category = :category';
    expressionAttributeValues[':category'] = { S: category };
  }
  
  if (field) {
    filterExpression += ' AND contains(#field, :field)';
    expressionAttributeNames['#field'] = 'field';
    expressionAttributeValues[':field'] = { S: field };
  }
  
  if (level) {
    filterExpression += ' AND contains(#level, :level)';
    expressionAttributeNames['#level'] = 'level';
    expressionAttributeValues[':level'] = { S: level };
  }
  
  if (query) {
    filterExpression += ' AND (contains(searchKeywords, :query) OR contains(#name, :query))';
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':query'] = { S: query };
  }
  
  const result = await dynamodb.send(new ScanCommand({
    TableName: process.env.CERT_TABLE,
    FilterExpression: filterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }));
  
  const items = result.Items?.map(item => ({
    id: item.id?.S,
    name: item.name?.S,
    category: item.category?.S,
    field: item.field?.S,
    level: item.level?.S,
    description: item.description?.S,
    code: item.code?.S,
    updatedAt: item.updatedAt?.S
  })) || [];
  
  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    },
    filters: {
      categories: [...new Set(items.map(item => item.category))],
      fields: [...new Set(items.map(item => item.field))],
      levels: [...new Set(items.map(item => item.level))]
    }
  };
}

exports.getById = async (event) => {
  const { pathParameters } = event;
  const { id } = pathParameters;
  
  const cacheKey = `cert:${id}`;
  
  try {
    // Redis 캐시 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      return response(200, JSON.parse(cached));
    }
    
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.CERT_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': { S: id }
      }
    }));
    
    if (!result.Items?.length) {
      return response(404, { error: 'Certification not found' });
    }
    
    const item = result.Items[0];
    const certification = {
      id: item.id?.S,
      name: item.name?.S,
      category: item.category?.S,
      field: item.field?.S,
      level: item.level?.S,
      description: item.description?.S,
      code: item.code?.S,
      rawData: JSON.parse(item.rawData?.S || '{}'),
      updatedAt: item.updatedAt?.S
    };
    
    // 캐시 저장 (1시간)
    await redis.setex(cacheKey, 3600, JSON.stringify(certification));
    
    return response(200, certification);
  } catch (error) {
    console.error('Get certification error:', error);
    return response(500, { error: 'Failed to get certification' });
  }
};
