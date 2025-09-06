// 간단한 커리큘럼 프롬프트 (실제 자료 연동)
exports.generateSimpleCurriculumPrompt = (certId, difficulty, timeframe, studyHoursPerWeek, resources) => {
  const booksInfo = resources.books.map(book => 
    `- ${book.title} (${book.author}) - ${book.url}`
  ).join('\n');
  
  const videosInfo = resources.videos.map(video => 
    `- ${video.title} (${video.instructor}) - ${video.url}`
  ).join('\n');
  
  const freeInfo = resources.freeResources.map(free => 
    `- ${free.title} (${free.provider}) - ${free.url}`
  ).join('\n');

  return `${certId} 자격증 ${timeframe}주 학습 커리큘럼을 생성해주세요.

**학습 조건:**
- 난이도: ${difficulty}
- 학습 기간: ${timeframe}주
- 주당 학습시간: ${studyHoursPerWeek}시간

**추천 교재:**
${booksInfo}

**추천 동영상 강의:**
${videosInfo}

**무료 자료:**
${freeInfo}

**요구사항:**
1. 위의 실제 자료들을 주차별로 배정
2. 각 자료의 구체적인 학습 범위 명시
3. 실제 링크 포함

**출력 형식 (JSON):**
{
  "curriculum": {
    "title": "${certId} ${timeframe}주 완성 커리큘럼",
    "weeks": [
      {
        "week": 1,
        "goal": "주차별 학습 목표",
        "resources": [
          {
            "type": "book",
            "title": "실제 교재명",
            "chapters": ["1장", "2장"],
            "url": "실제 구매 링크",
            "hours": 시간
          },
          {
            "type": "video", 
            "title": "실제 강의명",
            "sections": ["섹션1", "섹션2"],
            "url": "실제 강의 링크",
            "hours": 시간
          },
          {
            "type": "free",
            "title": "무료 자료명", 
            "content": "학습할 내용",
            "url": "실제 링크",
            "hours": 시간
          }
        ]
      }
    ]
  }
}

반드시 유효한 JSON만 출력하세요.`;
};
