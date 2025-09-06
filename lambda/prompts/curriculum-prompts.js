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
  
  // 사용자 수준별 학습 비율 조정
  const difficultyRatios = {
    beginner: { theory: 60, practice: 25, quiz: 15 },
    intermediate: { theory: 45, practice: 35, quiz: 20 },
    advanced: { theory: 30, practice: 50, quiz: 20 }
  };
  
  const ratio = difficultyRatios[userLevel] || difficultyRatios.intermediate;
  
  return `당신은 ${cert.name} 자격증 전문 강사입니다. 다음 조건에 맞는 개인화된 상세 학습 커리큘럼을 생성해주세요.

**학습자 정보:**
- 자격증: ${cert.name} (certId: ${certId})
- 현재 수준: ${userLevel}
- 목표 난이도: ${difficulty}
- 학습 기간: ${timeframe}주 (총 ${totalHours}시간)
- 주당 학습시간: ${studyHoursPerWeek}시간
- 이론:실습:문제풀이 비율 = ${ratio.theory}:${ratio.practice}:${ratio.quiz}

**시험 정보:**
${cert.domains.length > 0 ? `- 출제 영역: ${cert.domains.join(', ')}` : ''}
${cert.examFormat ? `- 시험 형식: ${cert.examFormat}` : ''}
${cert.passingScore ? `- 합격 점수: ${cert.passingScore}` : ''}

**반드시 포함해야 하는 요소:**
1. 기본 메타데이터: certId, durationWeeks, difficulty
2. **주차별 학습 목표(goal)**: 각 주차별로 구체적인 학습 주제를 정의
3. **세부 학습 활동(activities)**: 교재 학습, 강의 시청, 문제 풀이, 실습 과제
4. **자료 추천(resources)**: 교재 챕터, 강의 영상, 공식 문서, 온라인 문제집 등
5. **체크리스트(checklist)**: 사용자가 반드시 달성해야 할 개념/과제 항목
6. **최종 대비(finalExamPrep)**: 모의고사/기출 문제, 복습 주차

**개인화 요소:**
- ${userLevel} 수준에 맞는 설명 깊이와 실습 강도
- 주차별 점진적 난이도 증가
- 마지막 2주는 복습과 모의고사 중심

**출력 형식 (반드시 유효한 JSON):**
{
  "curriculum": {
    "title": "${cert.name} ${timeframe}주 완성 커리큘럼",
    "certId": "${certId}",
    "durationWeeks": ${timeframe},
    "difficulty": "${difficulty}",
    "userLevel": "${userLevel}",
    "totalHours": ${totalHours},
    "studyRatio": {
      "theory": ${ratio.theory},
      "practice": ${ratio.practice},
      "quiz": ${ratio.quiz}
    },
    "weeks": [
      {
        "week": 1,
        "goal": "구체적인 주차별 학습 목표",
        "activities": [
          {
            "type": "theory",
            "title": "교재 학습",
            "content": "구체적인 학습 내용",
            "hours": ${Math.round(studyHoursPerWeek * ratio.theory / 100)}
          },
          {
            "type": "practice",
            "title": "실습 과제",
            "content": "구체적인 실습 내용",
            "hours": ${Math.round(studyHoursPerWeek * ratio.practice / 100)}
          },
          {
            "type": "quiz",
            "title": "문제 풀이",
            "content": "문제집 범위",
            "hours": ${Math.round(studyHoursPerWeek * ratio.quiz / 100)}
          }
        ],
        "resources": [
          {
            "type": "textbook",
            "title": "교재명",
            "chapters": ["챕터1", "챕터2"]
          },
          {
            "type": "video",
            "title": "강의명",
            "duration": "시간"
          },
          {
            "type": "documentation",
            "title": "공식 문서",
            "url": "링크"
          },
          {
            "type": "practice",
            "title": "온라인 문제집",
            "questions": 50
          }
        ],
        "checklist": [
          "반드시 이해해야 할 개념1",
          "완료해야 할 실습1",
          "달성해야 할 점수"
        ]
      }
    ],
    "finalExamPrep": {
      "mockExams": [
        {
          "week": ${Math.max(1, timeframe - 2)},
          "title": "1차 모의고사",
          "targetScore": 70
        },
        {
          "week": ${timeframe - 1},
          "title": "최종 모의고사",
          "targetScore": 80
        }
      ],
      "reviewWeeks": [${timeframe - 1}, ${timeframe}],
      "criticalTopics": ["핵심 주제1", "핵심 주제2"]
    }
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
