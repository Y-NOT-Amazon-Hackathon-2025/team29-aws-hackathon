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
  
  try {
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :type)',
      ExpressionAttributeNames: { '#type': 'type#id' },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':type': { S: 'curriculum#' }
      }
    }));
    
    return response(200, result.Items || []);
  } catch (error) {
    console.error('List curriculums error:', error);
    return response(500, { error: 'Failed to list curriculums' });
  }
};

exports.create = async (data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    const id = uuidv4();
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.USER_TABLE,
      Item: {
        userId: { S: userId },
        'type#id': { S: `curriculum#${id}` },
        id: { S: id },
        title: { S: data.title },
        certId: { S: data.certId || '' },
        status: { S: 'skeleton' },
        timeframe: { N: String(data.timeframe || 12) },
        studyHoursPerWeek: { N: String(data.studyHoursPerWeek || 10) },
        difficulty: { S: data.difficulty || 'intermediate' },
        createdAt: { S: new Date().toISOString() }
      }
    }));
    
    return response(201, { id });
  } catch (error) {
    console.error('Create curriculum error:', error);
    return response(500, { error: 'Failed to create curriculum' });
  }
};

exports.getById = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    const result = await dynamodb.send(new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId },
        'type#id': { S: `curriculum#${id}` }
      }
    }));
    
    if (!result.Item) {
      return response(404, { error: 'Curriculum not found' });
    }
    
    // DynamoDB 형식을 일반 객체로 변환
    const curriculum = {
      id: result.Item.id?.S || id,
      title: result.Item.title?.S || '',
      certId: result.Item.certId?.S || '',
      status: result.Item.status?.S || 'pending',
      progress: 0,
      aiGenerated: result.Item.aiGenerated?.BOOL || false,
      totalHours: parseInt(result.Item.totalHours?.N || '0'),
      timeframe: parseInt(result.Item.timeframe?.N || '12'),
      studyHoursPerWeek: parseInt(result.Item.studyHoursPerWeek?.N || '10'),
      difficulty: result.Item.difficulty?.S || 'intermediate',
      createdAt: result.Item.createdAt?.S || '',
      weeks: []
    };
    
    // 관련 태스크들 조회
    try {
      const tasksResult = await dynamodb.send(new ScanCommand({
        TableName: process.env.USER_TABLE,
        FilterExpression: 'userId = :userId AND begins_with(#type, :taskType) AND curriculumId = :curriculumId',
        ExpressionAttributeNames: { '#type': 'type#id' },
        ExpressionAttributeValues: {
          ':userId': { S: userId },
          ':taskType': { S: 'task#' },
          ':curriculumId': { S: id }
        }
      }));
      
      // 태스크를 주차별로 그룹화
      const tasksByWeek = {};
      let completedTasks = 0;
      
      (tasksResult.Items || []).forEach(item => {
        const task = {
          id: item.id?.S || '',
          title: item.title?.S || '',
          status: item.status?.S || 'pending',
          estimatedHours: parseInt(item.estimatedHours?.N || '1'),
          actualHours: parseInt(item.actualHours?.N || '0'),
          taskType: item.taskType?.S || 'study',
          difficulty: item.difficulty?.S || 'medium',
          resources: item.resources?.SS || [],
          deliverables: item.deliverables?.SS || [],
          week: parseInt(item.week?.N || '1')
        };
        
        if (task.status === 'completed') completedTasks++;
        
        if (!tasksByWeek[task.week]) {
          tasksByWeek[task.week] = {
            week: task.week,
            topic: `Week ${task.week}`,
            tasks: []
          };
        }
        tasksByWeek[task.week].tasks.push(task);
      });
      
      // 주차별 정렬
      curriculum.weeks = Object.values(tasksByWeek).sort((a, b) => a.week - b.week);
      
      // 진행률 계산
      const totalTasks = tasksResult.Items?.length || 0;
      curriculum.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } catch (taskError) {
      console.error('Error fetching tasks:', taskError);
      // 태스크 조회 실패해도 커리큘럼은 반환
    }
    
    return response(200, curriculum);
  } catch (error) {
    console.error('Get curriculum error:', error);
    return response(500, { error: 'Failed to get curriculum' });
  }
};

exports.update = async (id, data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    await dynamodb.send(new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId },
        'type#id': { S: `curriculum#${id}` }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': { S: data.status || 'active' } }
    }));
    
    return response(200, { success: true });
  } catch (error) {
    console.error('Update curriculum error:', error);
    return response(500, { error: 'Failed to update curriculum' });
  }
};

exports.delete = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    await dynamodb.send(new DeleteItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId },
        'type#id': { S: `curriculum#${id}` }
      }
    }));
    
    return response(200, { success: true });
  } catch (error) {
    console.error('Delete curriculum error:', error);
    return response(500, { error: 'Failed to delete curriculum' });
  }
};

exports.getProgress = async (id, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    // Get all tasks for this curriculum
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :taskType) AND curriculumId = :curriculumId',
      ExpressionAttributeNames: { '#type': 'type#id' },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':taskType': { S: 'task#' },
        ':curriculumId': { S: id }
      }
    }));
    
    const tasks = result.Items || [];
    const completed = tasks.filter(task => task.status?.S === 'completed').length;
    
    return response(200, {
      total: tasks.length,
      completed,
      progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return response(500, { error: 'Failed to get progress' });
  }
};
