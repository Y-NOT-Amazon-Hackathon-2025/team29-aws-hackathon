const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

exports.generate = async (data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const { certificationId, difficulty, timeframe, studyHoursPerWeek } = data;
  
  const prompt = `자격증: ${certificationId}
난이도: ${difficulty}
기간: ${timeframe}주
주당 학습시간: ${studyHoursPerWeek}시간

위 조건에 맞는 상세한 학습 커리큘럼을 JSON 형식으로 생성해주세요. 각 주차별로 구체적인 학습 주제와 할일을 포함해주세요:

{
  "curriculum": {
    "title": "자격증명 학습 계획",
    "totalWeeks": ${timeframe},
    "weeks": [
      {
        "week": 1,
        "topic": "기초 개념 학습",
        "tasks": [
          {"title": "교재 1장 읽기", "estimatedHours": 3, "type": "study"},
          {"title": "기초 개념 정리", "estimatedHours": 2, "type": "practice"}
        ]
      }
    ]
  }
}`;

  const command = new ConverseCommand({
    modelId: 'meta.llama3-1-8b-instruct-v1:0',
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 2000, temperature: 0.7 }
  });

  const aiResponse = await bedrock.send(command);
  const content = aiResponse.output.message.content[0].text;
  
  try {
    const parsed = JSON.parse(content);
    return response(200, parsed);
  } catch {
    return response(200, { curriculum: { raw: content } });
  }
};

exports.apply = async (curriculumId, data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const { curriculum } = data;
  
  // Update curriculum status
  await dynamodb.send(new UpdateItemCommand({
    TableName: process.env.USER_TABLE,
    Key: {
      userId: { S: userId },
      id: { S: curriculumId }
    },
    UpdateExpression: 'SET #status = :status, aiGenerated = :aiGenerated',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': { S: 'active' },
      ':aiGenerated': { BOOL: true }
    }
  }));
  
  // Create tasks from AI curriculum
  if (curriculum.weeks) {
    for (const week of curriculum.weeks) {
      if (week.tasks) {
        for (const task of week.tasks) {
          const taskId = uuidv4();
          await dynamodb.send(new PutItemCommand({
            TableName: process.env.USER_TABLE,
            Item: {
              userId: { S: userId },
              type: { S: 'task' },
              id: { S: taskId },
              curriculumId: { S: curriculumId },
              title: { S: task.title },
              week: { N: String(week.week) },
              estimatedHours: { N: String(task.estimatedHours || 1) },
              taskType: { S: task.type || 'study' },
              status: { S: 'pending' },
              createdAt: { S: new Date().toISOString() }
            }
          }));
        }
      }
    }
  }
  
  return response(200, { success: true });
};
