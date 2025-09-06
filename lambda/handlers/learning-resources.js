const { DynamoDBClient, QueryCommand, ScanCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');

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

// 자격증별 학습 자료 조회
exports.getResourcesByCert = async (certId) => {
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.RESOURCES_TABLE || 'LearningResourcesTable',
      KeyConditionExpression: 'certId = :certId',
      ExpressionAttributeValues: {
        ':certId': { S: certId }
      }
    }));

    const resources = result.Items.map(item => ({
      resourceId: item.resourceId?.S,
      type: item.type?.S,
      title: item.title?.S,
      author: item.author?.S,
      instructor: item.instructor?.S,
      platform: item.platform?.S,
      provider: item.provider?.S,
      duration: item.duration?.S,
      price: parseInt(item.price?.N || '0'),
      discountPrice: parseInt(item.discountPrice?.N || '0'),
      rating: parseFloat(item.rating?.N || '0'),
      reviewCount: parseInt(item.reviewCount?.N || '0'),
      studentCount: parseInt(item.studentCount?.N || '0'),
      questionCount: parseInt(item.questionCount?.N || '0'),
      purchaseLinks: item.purchaseLinks ? JSON.parse(item.purchaseLinks.S) : {},
      videoUrl: item.videoUrl?.S,
      previewUrl: item.previewUrl?.S,
      accessUrl: item.accessUrl?.S,
      downloadUrl: item.downloadUrl?.S,
      chapters: item.chapters?.L?.map(ch => ch.S) || [],
      curriculum: item.curriculum?.L?.map(cur => cur.S) || [],
      features: item.features?.L?.map(feat => feat.S) || [],
      difficulty: item.difficulty?.S,
      recommendedWeeks: item.recommendedWeeks?.L?.map(week => parseInt(week.N)) || [],
      description: item.description?.S,
      fileSize: item.fileSize?.S,
      lastUpdated: item.lastUpdated?.S
    }));

    // 타입별로 그룹화
    const groupedResources = {
      textbooks: resources.filter(r => r.type === 'textbook'),
      videos: resources.filter(r => r.type === 'video'),
      quizzes: resources.filter(r => r.type === 'quiz'),
      documentation: resources.filter(r => r.type === 'documentation'),
      free: resources.filter(r => r.price === 0)
    };

    return response(200, {
      certId,
      resources: groupedResources,
      totalCount: resources.length
    });

  } catch (error) {
    console.error('Get resources error:', error);
    return response(500, { error: 'Failed to get learning resources' });
  }
};

// 주차별 추천 자료 조회
exports.getResourcesByWeek = async (certId, week) => {
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.RESOURCES_TABLE || 'LearningResourcesTable',
      KeyConditionExpression: 'certId = :certId',
      FilterExpression: 'contains(recommendedWeeks, :week)',
      ExpressionAttributeValues: {
        ':certId': { S: certId },
        ':week': { N: week.toString() }
      }
    }));

    const weeklyResources = result.Items.map(item => ({
      resourceId: item.resourceId?.S,
      type: item.type?.S,
      title: item.title?.S,
      price: parseInt(item.price?.N || '0'),
      rating: parseFloat(item.rating?.N || '0'),
      accessUrl: item.accessUrl?.S,
      chapters: item.chapters?.L?.map(ch => ch.S) || [],
      description: item.description?.S
    }));

    return response(200, {
      certId,
      week: parseInt(week),
      resources: weeklyResources
    });

  } catch (error) {
    console.error('Get weekly resources error:', error);
    return response(500, { error: 'Failed to get weekly resources' });
  }
};

// 자료 타입별 조회 (교재, 동영상, 문제집 등)
exports.getResourcesByType = async (certId, type) => {
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.RESOURCES_TABLE || 'LearningResourcesTable',
      KeyConditionExpression: 'certId = :certId',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':certId': { S: certId },
        ':type': { S: type }
      }
    }));

    const resources = result.Items.map(item => ({
      resourceId: item.resourceId?.S,
      title: item.title?.S,
      author: item.author?.S,
      instructor: item.instructor?.S,
      price: parseInt(item.price?.N || '0'),
      discountPrice: parseInt(item.discountPrice?.N || '0'),
      rating: parseFloat(item.rating?.N || '0'),
      reviewCount: parseInt(item.reviewCount?.N || '0'),
      purchaseLinks: item.purchaseLinks ? JSON.parse(item.purchaseLinks.S) : {},
      accessUrl: item.accessUrl?.S,
      previewUrl: item.previewUrl?.S
    }));

    return response(200, {
      certId,
      type,
      resources: resources.sort((a, b) => b.rating - a.rating) // 평점순 정렬
    });

  } catch (error) {
    console.error('Get resources by type error:', error);
    return response(500, { error: 'Failed to get resources by type' });
  }
};

// 무료 자료만 조회
exports.getFreeResources = async (certId) => {
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.RESOURCES_TABLE || 'LearningResourcesTable',
      KeyConditionExpression: 'certId = :certId',
      FilterExpression: 'price = :price',
      ExpressionAttributeValues: {
        ':certId': { S: certId },
        ':price': { N: '0' }
      }
    }));

    const freeResources = result.Items.map(item => ({
      resourceId: item.resourceId?.S,
      type: item.type?.S,
      title: item.title?.S,
      provider: item.provider?.S,
      accessUrl: item.accessUrl?.S,
      downloadUrl: item.downloadUrl?.S,
      description: item.description?.S,
      fileSize: item.fileSize?.S,
      lastUpdated: item.lastUpdated?.S
    }));

    return response(200, {
      certId,
      freeResources
    });

  } catch (error) {
    console.error('Get free resources error:', error);
    return response(500, { error: 'Failed to get free resources' });
  }
};
