const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

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

exports.list = async (userId) => {
  try {
    const effectiveUserId = userId || 'anonymous';
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :type)',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: {
        ':userId': { S: effectiveUserId },
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
  try {
    const effectiveUserId = userId || 'anonymous-' + Date.now();
    const id = uuidv4();
    
    // 먼저 커리큘럼 기본 정보를 저장
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.USER_TABLE,
      Item: {
        userId: { S: effectiveUserId },
        type: { S: `curriculum#${id}` },
        id: { S: id },
        title: { S: data.title || '새 커리큘럼' },
        certId: { S: data.certId || '' },
        status: { S: 'inprogress' },
        progress: { N: '0' },
        timeframe: { N: String(data.timeframe || 12) },
        studyHoursPerWeek: { N: String(data.studyHoursPerWeek || 10) },
        difficulty: { S: data.difficulty || 'intermediate' },
        aiGenerated: { BOOL: true },
        createdAt: { S: new Date().toISOString() }
      }
    }));
    
    // AI 플래너를 호출하여 실제 커리큘럼 생성
    try {
      const plannerHandler = require('./planner');
      const plannerData = {
        certificationId: data.certId,
        planType: 'standard',
        difficulty: data.difficulty || 'intermediate',
        timeframe: data.timeframe || 12,
        studyHoursPerWeek: data.studyHoursPerWeek || 10,
        userLevel: data.difficulty || 'intermediate'
      };
      
      console.log('Generating AI curriculum for:', plannerData);
      const plannerResult = await plannerHandler.generate(plannerData, effectiveUserId);
      
      // AI 생성 성공 시 커리큘럼에 적용
      if (plannerResult.statusCode === 200) {
        const curriculumData = JSON.parse(plannerResult.body);
        console.log('AI curriculum generated successfully, applying...');
        await plannerHandler.apply(id, curriculumData, effectiveUserId);
        
        console.log('AI curriculum applied successfully');
      } else {
        console.error('AI planner failed:', plannerResult);
      }
    } catch (plannerError) {
      console.error('AI planner error:', plannerError);
      // AI 생성 실패해도 기본 커리큘럼은 생성됨
    }
    
    return response(201, { id, message: 'AI 커리큘럼이 생성되었습니다.' });
  } catch (error) {
    console.error('Create curriculum error:', error);
    return response(500, { error: 'Failed to create curriculum' });
  }
};

exports.getById = async (id, userId) => {
  try {
    const effectiveUserId = userId || 'anonymous';
    const result = await dynamodb.send(new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: effectiveUserId },
        type: { S: `curriculum#${id}` }
      }
    }));
    
    if (!result.Item) {
      return response(404, { error: 'Curriculum not found' });
    }
    
    // 태스크 조회
    const tasksResult = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :taskType) AND curriculumId = :curriculumId',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: {
        ':userId': { S: effectiveUserId },
        ':taskType': { S: 'task#' },
        ':curriculumId': { S: id }
      }
    }));
    
    const tasks = tasksResult.Items || [];
    
    // 주차별로 태스크 그룹화
    const weeklyTasks = {};
    tasks.forEach(task => {
      const week = parseInt(task.week?.N || task.week || '1');
      if (!weeklyTasks[week]) {
        weeklyTasks[week] = [];
      }
      weeklyTasks[week].push({
        id: task.id?.S || task.id,
        title: task.title?.S || task.title,
        status: task.status?.S || task.status || 'pending',
        estimatedHours: parseInt(task.estimatedHours?.N || task.estimatedHours || '1'),
        actualHours: parseInt(task.actualHours?.N || task.actualHours || '0'),
        resources: task.resources?.SS || task.resources || [],
        taskType: task.taskType?.S || task.taskType || 'study',
        difficulty: task.difficulty?.S || task.difficulty || 'medium'
      });
    });
    
    // 주차별 데이터 구성
    const weeks = Object.keys(weeklyTasks).sort((a, b) => parseInt(a) - parseInt(b)).map(weekNum => ({
      week: parseInt(weekNum),
      topic: `Week ${weekNum} 학습`,
      tasks: weeklyTasks[weekNum]
    }));
    
    // 진행률 계산
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => 
      (task.status?.S || task.status) === 'completed'
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // DynamoDB 형식을 일반 객체로 변환
    const curriculum = {
      id: result.Item.id?.S || id,
      title: result.Item.title?.S || '',
      certId: result.Item.certId?.S || '',
      status: result.Item.status?.S || 'pending',
      progress,
      aiGenerated: result.Item.aiGenerated?.BOOL || false,
      totalHours: parseInt(result.Item.totalHours?.N || '0'),
      timeframe: parseInt(result.Item.timeframe?.N || '12'),
      studyHoursPerWeek: parseInt(result.Item.studyHoursPerWeek?.N || '10'),
      difficulty: result.Item.difficulty?.S || 'intermediate',
      createdAt: result.Item.createdAt?.S || '',
      weeks
    };
    
    return response(200, curriculum);
  } catch (error) {
    console.error('Get curriculum error:', error);
    return response(500, { error: 'Failed to get curriculum' });
  }
};

exports.update = async (id, data, userId) => {
  try {
    const effectiveUserId = userId || 'anonymous';
    await dynamodb.send(new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: effectiveUserId },
        type: { S: `curriculum#${id}` }
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
  try {
    const effectiveUserId = userId || 'anonymous';
    await dynamodb.send(new DeleteItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: effectiveUserId },
        type: { S: `curriculum#${id}` }
      }
    }));
    
    return response(200, { success: true });
  } catch (error) {
    console.error('Delete curriculum error:', error);
    return response(500, { error: 'Failed to delete curriculum' });
  }
};

exports.getTasks = async (curriculumId, userId) => {
  try {
    const effectiveUserId = userId || 'anonymous';
    const result = await dynamodb.send(new ScanCommand({
      TableName: process.env.USER_TABLE,
      FilterExpression: 'userId = :userId AND begins_with(#type, :taskType) AND curriculumId = :curriculumId',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: {
        ':userId': { S: effectiveUserId },
        ':taskType': { S: 'task#' },
        ':curriculumId': { S: curriculumId }
      }
    }));
    
    return response(200, result.Items || []);
  } catch (error) {
    console.error('Get tasks error:', error);
    return response(500, { error: 'Failed to get tasks' });
  }
};

exports.updateTask = async (curriculumId, taskId, data, userId) => {
  try {
    const effectiveUserId = userId || 'anonymous';
    const updateExpression = [];
    const expressionAttributeValues = {};
    
    if (data.status) {
      updateExpression.push('#status = :status');
      expressionAttributeValues[':status'] = { S: data.status };
    }
    
    if (data.actualHours) {
      updateExpression.push('actualHours = :actualHours');
      expressionAttributeValues[':actualHours'] = { N: String(data.actualHours) };
    }
    
    await dynamodb.send(new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: effectiveUserId },
        type: { S: `task#${taskId}` }
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: expressionAttributeValues
    }));
    
    return response(200, { success: true });
  } catch (error) {
    console.error('Update task error:', error);
    return response(500, { error: 'Failed to update task' });
  }
};
