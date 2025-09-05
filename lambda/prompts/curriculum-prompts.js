const CERTIFICATION_DETAILS = {
  'aws-saa': {
    name: 'AWS Solutions Architect Associate',
    domains: [
      'Design Resilient Architectures (30%)',
      'Design High-Performing Architectures (28%)', 
      'Design Secure Applications (24%)',
      'Design Cost-Optimized Architectures (18%)'
    ],
    prerequisites: ['Basic AWS knowledge', 'Cloud computing concepts'],
    examFormat: '65 questions, 130 minutes',
    passingScore: '720/1000'
  },
  'cissp': {
    name: 'Certified Information Systems Security Professional',
    domains: [
      'Security and Risk Management (15%)',
      'Asset Security (10%)',
      'Security Architecture and Engineering (13%)',
      'Communication and Network Security (13%)',
      'Identity and Access Management (13%)',
      'Security Assessment and Testing (12%)',
      'Security Operations (13%)',
      'Software Development Security (11%)'
    ],
    prerequisites: ['5 years security experience'],
    examFormat: '100-150 questions, 3 hours',
    passingScore: '700/1000'
  }
};

exports.generateCurriculumPrompt = (certId, difficulty, timeframe, studyHoursPerWeek, userLevel = 'beginner') => {
  const cert = CERTIFICATION_DETAILS[certId] || { name: certId, domains: [] };
  const totalHours = timeframe * studyHoursPerWeek;
  
  return `당신은 ${cert.name} 자격증 전문 강사입니다. 다음 조건에 맞는 실전 중심의 상세한 학습 커리큘럼을 생성해주세요.

**학습자 정보:**
- 자격증: ${cert.name}
- 현재 수준: ${userLevel}
- 목표 난이도: ${difficulty}
- 학습 기간: ${timeframe}주 (총 ${totalHours}시간)
- 주당 학습시간: ${studyHoursPerWeek}시간

**시험 정보:**
${cert.domains.length > 0 ? `- 출제 영역: ${cert.domains.join(', ')}` : ''}
${cert.examFormat ? `- 시험 형식: ${cert.examFormat}` : ''}
${cert.passingScore ? `- 합격 점수: ${cert.passingScore}` : ''}

**커리큘럼 요구사항:**
1. 실제 시험 출제 비중을 반영한 학습 시간 배분
2. 이론 학습 → 실습 → 문제 풀이 → 복습 순서로 구성
3. 주차별 명확한 학습 목표와 성취 기준
4. 구체적인 학습 자료와 실습 과제 제시
5. 마지막 2-3주는 집중 복습 및 모의고사

**출력 형식 (반드시 유효한 JSON):**
{
  "curriculum": {
    "title": "${cert.name} ${timeframe}주 완성 커리큘럼",
    "totalWeeks": ${timeframe},
    "totalHours": ${totalHours},
    "targetLevel": "${difficulty}",
    "studyPlan": {
      "theory": ${Math.round(totalHours * 0.4)},
      "practice": ${Math.round(totalHours * 0.3)},
      "mockExams": ${Math.round(totalHours * 0.2)},
      "review": ${Math.round(totalHours * 0.1)}
    },
    "weeks": [
      {
        "week": 1,
        "phase": "foundation",
        "topic": "구체적인 주차 주제",
        "learningObjectives": ["목표1", "목표2", "목표3"],
        "tasks": [
          {
            "title": "구체적인 학습 과제명",
            "type": "theory|practice|quiz|project|review",
            "estimatedHours": 3,
            "difficulty": "easy|medium|hard",
            "resources": ["구체적인 자료명", "실습 가이드"],
            "deliverables": ["완료해야 할 결과물"],
            "assessmentCriteria": "평가 기준"
          }
        ],
        "weeklyGoal": "이번 주 달성 목표",
        "prerequisites": ["필요한 선행 지식"]
      }
    ],
    "milestones": [
      {
        "week": 4,
        "title": "1차 중간 평가",
        "description": "기초 개념 이해도 점검",
        "assessmentType": "quiz"
      }
    ],
    "resources": {
      "books": ["추천 교재"],
      "onlineCourses": ["온라인 강의"],
      "practiceExams": ["모의고사 사이트"],
      "labs": ["실습 환경"]
    },
    "tips": [
      "학습 효율을 높이는 팁들"
    ]
  }
}

반드시 유효한 JSON만 출력하세요. 다른 텍스트나 설명은 포함하지 마세요.`;
};

exports.generatePersonalizedPrompt = (certId, userProgress, weakAreas, strongAreas, remainingWeeks) => {
  return `현재 학습 진행 상황을 바탕으로 개인화된 학습 계획을 조정해주세요.

**현재 상황:**
- 자격증: ${certId}
- 학습 진도: ${userProgress}%
- 약점 영역: ${weakAreas.join(', ')}
- 강점 영역: ${strongAreas.join(', ')}
- 남은 기간: ${remainingWeeks}주

**조정 방향:**
1. 약점 영역에 추가 시간 할당 (1.5배)
2. 강점 영역은 복습 위주로 단축
3. 실전 문제 풀이 비중 증가
4. 시간 부족 시 우선순위 조정

JSON 형식으로 조정된 커리큘럼을 제공하세요.`;
};

exports.generateIntensivePrompt = (certId, daysUntilExam, currentScore, targetScore) => {
  return `시험 ${daysUntilExam}일 전 집중 학습 계획을 생성해주세요.

**현재 상태:**
- 자격증: ${certId}
- 현재 모의고사 점수: ${currentScore}점
- 목표 점수: ${targetScore}점
- 남은 시간: ${daysUntilExam}일

**집중 전략:**
1. 고득점 영역 우선 공략
2. 빈출 문제 유형 집중 학습
3. 실전 모의고사 중심
4. 오답 노트 정리
5. 멘탈 관리 및 컨디션 조절

일별 상세 학습 계획을 JSON으로 제공하세요.`;
};
