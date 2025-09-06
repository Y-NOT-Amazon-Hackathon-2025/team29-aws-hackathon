const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { generateCurriculumPrompt, generatePersonalizedPrompt, generateIntensivePrompt } = require('../prompts/curriculum-prompts');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
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

exports.generate = async (data, userId) => {
  // Allow anonymous users to generate curriculums
  const effectiveUserId = userId || 'anonymous';
  
  const { 
    certificationId, 
    difficulty = 'intermediate', 
    timeframe = 12, 
    studyHoursPerWeek = 10,
    userLevel = 'beginner',
    planType = 'standard' // standard, personalized, intensive
  } = data;
  
  let prompt;
  
  switch (planType) {
    case 'personalized':
      const { userProgress, weakAreas, strongAreas, remainingWeeks } = data;
      prompt = generatePersonalizedPrompt(certificationId, userProgress, weakAreas, strongAreas, remainingWeeks);
      break;
    case 'intensive':
      const { daysUntilExam, currentScore, targetScore } = data;
      prompt = generateIntensivePrompt(certificationId, daysUntilExam, currentScore, targetScore);
      break;
    default:
      prompt = generateCurriculumPrompt(certificationId, difficulty, timeframe, studyHoursPerWeek, userLevel);
  }

  try {
    console.log('Generating curriculum with Bedrock...');
    
    const command = new ConverseCommand({
      modelId: 'meta.llama3-1-8b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { 
        maxTokens: 4000, 
        temperature: 0.7,
        topP: 0.9
      }
    });

    const aiResponse = await bedrock.send(command);
    const content = aiResponse.output.message.content[0].text;
    
    console.log('AI Response received, parsing...');
    
    // JSON 파싱 시도
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/\{[\s\S]*\}/) ||
                       [null, content];
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr.trim());
      
      // 응답 검증 및 보완
      if (parsed.curriculum && parsed.curriculum.weeks) {
        // 추가 메타데이터 보강
        parsed.curriculum.generatedAt = new Date().toISOString();
        parsed.curriculum.generatedBy = 'AI';
        parsed.curriculum.certificationId = certificationId;
        parsed.curriculum.planType = planType;
        
        // 주차별 ID 추가
        parsed.curriculum.weeks.forEach((week, index) => {
          week.id = `week-${index + 1}`;
          week.tasks?.forEach((task, taskIndex) => {
            task.id = `task-${index + 1}-${taskIndex + 1}`;
          });
        });
        
        return response(200, parsed);
      } else {
        throw new Error('Invalid curriculum structure');
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw content:', content);
      
      // 파싱 실패 시 향상된 기본 템플릿 반환
      const fallbackCurriculum = generateEnhancedFallback(certificationId, timeframe, studyHoursPerWeek, difficulty);
      return response(200, { curriculum: fallbackCurriculum });
    }
  } catch (error) {
    console.error('Bedrock Error:', error);
    
    // Bedrock 실패 시 향상된 기본 템플릿 반환
    const fallbackCurriculum = generateEnhancedFallback(certificationId, timeframe, studyHoursPerWeek, difficulty);
    return response(200, { curriculum: fallbackCurriculum });
  }
};

function generateEnhancedFallback(certificationId, timeframe, studyHoursPerWeek, difficulty) {
  const totalHours = timeframe * studyHoursPerWeek;
  const weeks = [];
  
  // 학습 단계별 비율
  const phases = {
    foundation: Math.ceil(timeframe * 0.3),
    intermediate: Math.ceil(timeframe * 0.4),
    advanced: Math.ceil(timeframe * 0.2),
    review: Math.floor(timeframe * 0.1)
  };
  
  let currentWeek = 1;
  
  // 기초 단계
  for (let i = 0; i < phases.foundation; i++) {
    weeks.push({
      week: currentWeek++,
      phase: 'foundation',
      topic: `${certificationId} 기초 개념 ${i + 1}`,
      learningObjectives: [
        '핵심 개념 이해',
        '기본 용어 숙지',
        '기초 실습 완료'
      ],
      tasks: [
        {
          id: `task-${currentWeek-1}-1`,
          title: '이론 학습 및 개념 정리',
          type: 'theory',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.5),
          difficulty: 'easy',
          resources: ['공식 문서', '기초 교재'],
          deliverables: ['개념 정리 노트']
        },
        {
          id: `task-${currentWeek-1}-2`,
          title: '기초 실습 및 연습',
          type: 'practice',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.3),
          difficulty: 'easy',
          resources: ['실습 가이드', '온라인 랩'],
          deliverables: ['실습 완료 인증']
        },
        {
          id: `task-${currentWeek-1}-3`,
          title: '기초 문제 풀이',
          type: 'quiz',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.2),
          difficulty: 'easy',
          resources: ['기초 문제집'],
          deliverables: ['문제 풀이 결과']
        }
      ],
      weeklyGoal: '기초 개념 완전 이해',
      prerequisites: i === 0 ? [] : [`Week ${currentWeek-2} 완료`]
    });
  }
  
  // 중급 단계
  for (let i = 0; i < phases.intermediate; i++) {
    weeks.push({
      week: currentWeek++,
      phase: 'intermediate',
      topic: `${certificationId} 심화 학습 ${i + 1}`,
      learningObjectives: [
        '심화 개념 적용',
        '실전 시나리오 해결',
        '통합적 사고 개발'
      ],
      tasks: [
        {
          id: `task-${currentWeek-1}-1`,
          title: '심화 이론 및 사례 연구',
          type: 'theory',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.4),
          difficulty: 'medium',
          resources: ['심화 교재', '사례 연구'],
          deliverables: ['사례 분석 보고서']
        },
        {
          id: `task-${currentWeek-1}-2`,
          title: '프로젝트 기반 실습',
          type: 'project',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.4),
          difficulty: 'medium',
          resources: ['프로젝트 가이드', '실습 환경'],
          deliverables: ['프로젝트 완성품']
        },
        {
          id: `task-${currentWeek-1}-3`,
          title: '중급 문제 풀이',
          type: 'quiz',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.2),
          difficulty: 'medium',
          resources: ['중급 문제집', '모의고사'],
          deliverables: ['성적 향상 확인']
        }
      ],
      weeklyGoal: '실전 적용 능력 개발',
      prerequisites: [`Week ${currentWeek-2} 완료`]
    });
  }
  
  // 고급 단계
  for (let i = 0; i < phases.advanced; i++) {
    weeks.push({
      week: currentWeek++,
      phase: 'advanced',
      topic: `${certificationId} 고급 응용 ${i + 1}`,
      learningObjectives: [
        '고급 기법 마스터',
        '복합 문제 해결',
        '최적화 전략 수립'
      ],
      tasks: [
        {
          id: `task-${currentWeek-1}-1`,
          title: '고급 주제 심화 학습',
          type: 'theory',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.3),
          difficulty: 'hard',
          resources: ['고급 교재', '전문 문서'],
          deliverables: ['고급 개념 정리']
        },
        {
          id: `task-${currentWeek-1}-2`,
          title: '실전 모의고사',
          type: 'quiz',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.5),
          difficulty: 'hard',
          resources: ['실전 모의고사', '기출문제'],
          deliverables: ['목표 점수 달성']
        },
        {
          id: `task-${currentWeek-1}-3`,
          title: '오답 분석 및 보완',
          type: 'review',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.2),
          difficulty: 'medium',
          resources: ['오답 노트', '보충 자료'],
          deliverables: ['약점 보완 완료']
        }
      ],
      weeklyGoal: '시험 준비 완성',
      prerequisites: [`Week ${currentWeek-2} 완료`]
    });
  }
  
  // 최종 복습 단계
  for (let i = 0; i < phases.review; i++) {
    weeks.push({
      week: currentWeek++,
      phase: 'review',
      topic: `최종 점검 및 시험 준비 ${i + 1}`,
      learningObjectives: [
        '전체 내용 복습',
        '실전 감각 유지',
        '멘탈 관리'
      ],
      tasks: [
        {
          id: `task-${currentWeek-1}-1`,
          title: '전체 내용 총정리',
          type: 'review',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.3),
          difficulty: 'medium',
          resources: ['요약 노트', '핵심 정리'],
          deliverables: ['최종 정리 완료']
        },
        {
          id: `task-${currentWeek-1}-2`,
          title: '최종 모의고사',
          type: 'quiz',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.5),
          difficulty: 'hard',
          resources: ['최신 모의고사'],
          deliverables: ['합격 점수 달성']
        },
        {
          id: `task-${currentWeek-1}-3`,
          title: '컨디션 관리',
          type: 'review',
          estimatedHours: Math.floor(studyHoursPerWeek * 0.2),
          difficulty: 'easy',
          resources: ['휴식', '가벼운 복습'],
          deliverables: ['최적 컨디션 유지']
        }
      ],
      weeklyGoal: '시험 최종 준비',
      prerequisites: [`Week ${currentWeek-2} 완료`]
    });
  }
  
  return {
    title: `${certificationId} ${timeframe}주 완성 커리큘럼`,
    totalWeeks: timeframe,
    totalHours: totalHours,
    targetLevel: difficulty,
    studyPlan: {
      theory: Math.round(totalHours * 0.4),
      practice: Math.round(totalHours * 0.3),
      mockExams: Math.round(totalHours * 0.2),
      review: Math.round(totalHours * 0.1)
    },
    weeks,
    milestones: [
      { week: phases.foundation, title: '기초 완성', description: '기본 개념 마스터', assessmentType: 'quiz' },
      { week: phases.foundation + phases.intermediate, title: '중급 완성', description: '실전 적용 능력 확보', assessmentType: 'project' },
      { week: timeframe - 1, title: '최종 점검', description: '시험 준비 완료', assessmentType: 'mock_exam' }
    ],
    resources: {
      books: [`${certificationId} 공식 가이드`, `${certificationId} 실습서`],
      onlineCourses: [`${certificationId} 온라인 강의`, '실습 중심 코스'],
      practiceExams: ['공식 모의고사', '서드파티 문제집'],
      labs: ['온라인 실습 환경', '가상 랩']
    },
    tips: [
      '매일 일정한 시간에 학습하세요',
      '이론과 실습의 균형을 맞추세요',
      '정기적으로 모의고사를 보세요',
      '약점 영역을 집중 공략하세요',
      '충분한 휴식을 취하세요'
    ],
    generatedAt: new Date().toISOString(),
    generatedBy: 'Fallback',
    certificationId,
    planType: 'standard'
  };
}

exports.apply = async (curriculumId, data, userId) => {
  // Allow anonymous users to apply curriculum plans
  const effectiveUserId = userId || 'anonymous';
  
  const { curriculum } = data;
  
  try {
    // Update curriculum status with enhanced metadata
    await dynamodb.send(new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: effectiveUserId },
        type: { S: `curriculum#${curriculumId}` }
      },
      UpdateExpression: 'SET #status = :status, aiGenerated = :aiGenerated, updatedAt = :updatedAt, planType = :planType, totalHours = :totalHours',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': { S: 'active' },
        ':aiGenerated': { BOOL: true },
        ':updatedAt': { S: new Date().toISOString() },
        ':planType': { S: curriculum.planType || 'standard' },
        ':totalHours': { N: String(curriculum.totalHours || 0) }
      }
    }));
    
    // Create enhanced tasks from AI curriculum
    if (curriculum.weeks) {
      for (const week of curriculum.weeks) {
        if (week.tasks) {
          for (const task of week.tasks) {
            const taskId = uuidv4();
            await dynamodb.send(new PutItemCommand({
              TableName: process.env.USER_TABLE,
              Item: {
                userId: { S: effectiveUserId },
                type: { S: `task#${taskId}` },
                id: { S: taskId },
                curriculumId: { S: curriculumId },
                title: { S: task.title },
                description: { S: task.deliverables?.join(', ') || '' },
                week: { N: String(week.week) },
                phase: { S: week.phase || 'general' },
                estimatedHours: { N: String(task.estimatedHours || 1) },
                taskType: { S: task.type || 'study' },
                difficulty: { S: task.difficulty || 'medium' },
                resources: { SS: task.resources || ['기본 자료'] },
                deliverables: { SS: task.deliverables || ['학습 완료'] },
                status: { S: 'pending' },
                priority: { S: task.difficulty === 'hard' ? 'high' : task.difficulty === 'easy' ? 'low' : 'medium' },
                createdAt: { S: new Date().toISOString() }
              }
            }));
          }
        }
      }
    }
    
    // Create milestones
    if (curriculum.milestones) {
      for (const milestone of curriculum.milestones) {
        const milestoneId = uuidv4();
        await dynamodb.send(new PutItemCommand({
          TableName: process.env.USER_TABLE,
          Item: {
            userId: { S: effectiveUserId },
            type: { S: `milestone#${milestoneId}` },
            id: { S: milestoneId },
            curriculumId: { S: curriculumId },
            title: { S: milestone.title },
            description: { S: milestone.description },
            week: { N: String(milestone.week) },
            assessmentType: { S: milestone.assessmentType },
            status: { S: 'pending' },
            createdAt: { S: new Date().toISOString() }
          }
        }));
      }
    }
    
    return response(200, { 
      success: true, 
      message: 'AI 커리큘럼이 성공적으로 적용되었습니다.',
      stats: {
        totalWeeks: curriculum.totalWeeks,
        totalHours: curriculum.totalHours,
        totalTasks: curriculum.weeks?.reduce((sum, week) => sum + (week.tasks?.length || 0), 0) || 0,
        milestones: curriculum.milestones?.length || 0
      }
    });
  } catch (error) {
    console.error('Apply curriculum error:', error);
    return response(500, { error: 'Failed to apply curriculum' });
  }
};
