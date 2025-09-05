# AI 프롬프트 템플릿

## 1. 기본 커리큘럼 생성 프롬프트

```
당신은 전문 자격증 학습 플래너입니다. 다음 조건에 맞는 상세한 학습 커리큘럼을 JSON 형식으로 생성해주세요.

**입력 조건:**
- 자격증: {certificationId}
- 난이도: {difficulty}
- 학습 기간: {timeframe}주
- 주당 학습시간: {studyHoursPerWeek}시간
- 목표 시험일: {targetDate}

**출력 형식 (반드시 JSON):**
```json
{
  "curriculum": {
    "title": "자격증명 {timeframe}주 학습 계획",
    "totalWeeks": {timeframe},
    "totalHours": {totalHours},
    "weeks": [
      {
        "week": 1,
        "topic": "주차별 학습 주제",
        "tasks": [
          {
            "title": "구체적인 학습 과제",
            "estimatedHours": 3,
            "type": "study|hands-on|practice|review",
            "resources": ["교재명", "온라인 강의", "실습 자료"],
            "description": "과제 상세 설명"
          }
        ]
      }
    ]
  }
}
```

**요구사항:**
1. 각 주차는 명확한 학습 목표가 있어야 함
2. 실습과 이론이 균형있게 배치
3. 난이도가 점진적으로 증가
4. 실제 시험 출제 경향 반영
5. 마지막 2주는 복습 및 모의고사 중심

반드시 유효한 JSON 형식으로만 응답하세요.
```

## 2. RAG 기반 맞춤형 프롬프트

```
당신은 자격증 전문가입니다. 제공된 자격증 자료를 바탕으로 맞춤형 학습 계획을 생성하세요.

**검색된 자료:**
{ragContext}

**사용자 정보:**
- 현재 수준: {userLevel}
- 선호 학습 방식: {learningStyle}
- 약점 영역: {weakAreas}
- 강점 영역: {strongAreas}

위 정보를 바탕으로 개인화된 커리큘럼을 JSON 형식으로 생성하세요.

**개인화 요소:**
1. 약점 영역에 더 많은 시간 할당
2. 선호 학습 방식에 맞는 자료 추천
3. 강점 영역은 빠르게 복습
4. 실제 자료 기반 구체적인 리소스 제공

JSON 형식:
{curriculum: {title, weeks: [{week, topic, tasks: [{title, estimatedHours, type, resources, personalizedNote}]}]}}
```

## 3. 진도 조정 프롬프트

```
기존 학습 계획을 사용자의 진행 상황에 맞게 조정해주세요.

**현재 진행 상황:**
- 완료된 주차: {completedWeeks}
- 평균 학습 시간: {avgStudyTime}시간/주
- 어려웠던 주제: {difficultTopics}
- 빠르게 완료한 주제: {easyTopics}

**남은 기간:** {remainingWeeks}주

기존 계획을 조정하여 목표 달성 가능한 현실적인 계획으로 수정해주세요.

JSON 형식으로 조정된 커리큘럼을 제공하세요.
```

## 4. 시험 직전 집중 프롬프트

```
시험 {daysUntilExam}일 전 집중 학습 계획을 생성해주세요.

**현재 상태:**
- 완료 진도: {completionRate}%
- 약점 영역: {weakAreas}
- 모의고사 점수: {mockExamScore}점

**집중 전략:**
1. 고득점 영역 우선 공략
2. 빈출 문제 유형 집중
3. 실전 모의고사 중심
4. 멘탈 관리 포함

JSON 형식의 단기 집중 플랜을 제공하세요.
```
