const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, QueryCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const learningResourcesHandler = require('./learning-resources');
const fs = require('fs');
const path = require('path');

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

// ITDapter 재생목록 데이터 로드
const loadITDapterPlaylists = () => {
  try {
    const playlistPath = path.join(__dirname, '../itdapter-videos.json');
    return JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load ITDapter playlists:', error);
    return [];
  }
};

// 자격증별 ITDapter 재생목록 필터링
const getRelevantPlaylists = (certificationId) => {
  const playlists = loadITDapterPlaylists();
  return playlists.filter(playlist => 
    playlist.certifications.includes(certificationId) ||
    playlist.certifications.some(cert => cert.toLowerCase().includes(certificationId.toLowerCase()))
  );
};

// 실제 자료 DB와 연동된 커리큘럼 생성
exports.generateEnhancedCurriculum = async (data, userId) => {
  const { 
    certificationId, 
    difficulty = 'intermediate', 
    timeframe = 12, 
    studyHoursPerWeek = 10,
    userLevel = 'beginner',
    budget = 100000, // 예산 (원)
    preferredTypes = ['textbook', 'video'] // 선호하는 자료 타입
  } = data;

  try {
    // 1. 해당 자격증의 실제 학습 자료 조회
    const resourcesResponse = await learningResourcesHandler.getResourcesByCert(certificationId);
    const availableResources = JSON.parse(resourcesResponse.body).resources;

    // 2. ITDapter 재생목록 조회
    const itdapterPlaylists = getRelevantPlaylists(certificationId);

    // 3. 예산과 선호도에 맞는 자료 필터링
    const filteredResources = filterResourcesByBudget(availableResources, budget, preferredTypes);

    // 4. AI 프롬프트에 실제 자료 정보 포함
    const enhancedPrompt = generateEnhancedPrompt(
      certificationId, 
      difficulty, 
      timeframe, 
      studyHoursPerWeek, 
      userLevel,
      filteredResources,
      itdapterPlaylists
    );

    // 4. Bedrock AI로 커리큘럼 생성
    const command = new ConverseCommand({
      modelId: 'meta.llama3-1-8b-instruct-v1:0',
      messages: [{
        role: 'user',
        content: [{ text: enhancedPrompt }]
      }]
    });

    const bedrockResponse = await bedrock.send(command);
    const aiResponse = bedrockResponse.output.message.content[0].text;

    // 5. AI 응답 파싱 및 실제 자료 정보 매핑
    let curriculum;
    try {
      curriculum = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('AI response parsing failed:', parseError);
      return response(400, { error: 'Invalid AI response format' });
    }

    // 6. 주차별 실제 자료 링크 추가
    const enhancedCurriculum = await enhanceCurriculumWithRealResources(
      curriculum.curriculum, 
      availableResources,
      certificationId,
      itdapterPlaylists
    );

    return response(200, {
      curriculum: enhancedCurriculum,
      resourcesSummary: {
        totalResources: Object.values(availableResources).flat().length,
        budgetUsed: calculateBudgetUsed(filteredResources),
        freeResourcesCount: availableResources.free?.length || 0
      }
    });

  } catch (error) {
    console.error('Enhanced curriculum generation error:', error);
    return response(500, { error: 'Failed to generate enhanced curriculum' });
  }
};

// 예산과 선호도에 맞는 자료 필터링
const filterResourcesByBudget = (resources, budget, preferredTypes) => {
  const filtered = {};
  let currentBudget = budget;

  preferredTypes.forEach(type => {
    if (resources[type + 's']) { // textbooks, videos 등
      const typeResources = resources[type + 's']
        .filter(resource => resource.price <= currentBudget)
        .sort((a, b) => b.rating - a.rating); // 평점순 정렬

      if (typeResources.length > 0) {
        filtered[type + 's'] = typeResources.slice(0, 2); // 상위 2개만
        currentBudget -= typeResources[0].price; // 최고 평점 자료 예산 차감
      }
    }
  });

  // 무료 자료는 항상 포함
  filtered.free = resources.free || [];

  return filtered;
};

// 실제 자료 정보가 포함된 AI 프롬프트 생성
const generateEnhancedPrompt = (certId, difficulty, timeframe, studyHoursPerWeek, userLevel, resources, itdapterPlaylists) => {
  const resourcesInfo = Object.entries(resources).map(([type, items]) => {
    return `**${type.toUpperCase()}:**\n` + 
      items.map(item => 
        `- ${item.title} (${item.author || item.instructor || item.provider}) - ${item.price}원, 평점 ${item.rating}`
      ).join('\n');
  }).join('\n\n');

  const playlistsInfo = itdapterPlaylists.length > 0 ? 
    `**ITDapter 추천 재생목록:**\n` + 
    itdapterPlaylists.map(playlist => 
      `- ${playlist.title}: ${playlist.description} (${playlist.url})`
    ).join('\n') : '';

  return `${certId} 자격증 ${timeframe}주 커리큘럼을 생성해주세요.

**학습자 정보:**
- 수준: ${userLevel}
- 난이도: ${difficulty}  
- 주당 학습시간: ${studyHoursPerWeek}시간

**실제 이용 가능한 학습 자료:**
${resourcesInfo}

${playlistsInfo}

**요구사항:**
1. 위의 실제 자료들을 주차별로 배정
2. ITDapter 재생목록을 적절한 주차에 배치
3. 각 자료의 구체적인 챕터/섹션 명시
4. 실제 구매 링크나 접근 방법 포함
5. 무료 자료 우선 활용
6. 예산 대비 효율성 고려

**출력 형식:**
{
  "curriculum": {
    "title": "커리큘럼 제목",
    "weeks": [
      {
        "week": 1,
        "goal": "학습 목표",
        "resources": [
          {
            "resourceId": "실제 자료 ID",
            "title": "실제 자료 제목",
            "type": "textbook|playlist|quiz|documentation",
            "chapters": ["구체적 챕터"],
            "hours": 시간,
            "accessInfo": {
              "url": "실제 링크",
              "price": 가격,
              "freeAlternative": "무료 대안"
            }
          }
        ]
      }
    ]
  }
}`;
};

// 커리큘럼에 실제 자료 정보 매핑
const enhanceCurriculumWithRealResources = async (curriculum, availableResources, certId, itdapterPlaylists) => {
  const allResources = Object.values(availableResources).flat();

  for (let week of curriculum.weeks) {
    if (week.resources) {
      week.resources = week.resources.map(resource => {
        // AI가 제안한 자료와 실제 DB 자료 매칭
        const realResource = allResources.find(r => 
          r.title.includes(resource.title) || 
          resource.title.includes(r.title) ||
          r.resourceId === resource.resourceId
        );

        // ITDapter 재생목록 매칭
        const matchingPlaylist = itdapterPlaylists.find(playlist =>
          playlist.title.toLowerCase().includes(resource.title.toLowerCase()) ||
          resource.title.toLowerCase().includes('재생목록') ||
          resource.type === 'playlist'
        );

        let enhancedResource = { ...resource };

        if (realResource) {
          enhancedResource.realResourceData = {
            resourceId: realResource.resourceId,
            actualTitle: realResource.title,
            author: realResource.author || realResource.instructor,
            price: realResource.price,
            discountPrice: realResource.discountPrice,
            rating: realResource.rating,
            purchaseLinks: realResource.purchaseLinks,
            accessUrl: realResource.accessUrl,
            previewUrl: realResource.previewUrl,
            downloadUrl: realResource.downloadUrl
          };
        }

        if (matchingPlaylist) {
          enhancedResource.itdapterPlaylist = {
            playlistId: matchingPlaylist.playlistId,
            title: matchingPlaylist.title,
            url: matchingPlaylist.url,
            description: matchingPlaylist.description,
            category: matchingPlaylist.category
          };
        }

        return enhancedResource;
      });

      // 각 주차에 관련 ITDapter 재생목록 추가
      if (itdapterPlaylists.length > 0 && week.week <= itdapterPlaylists.length) {
        const weekPlaylist = itdapterPlaylists[week.week - 1];
        if (weekPlaylist) {
          week.resources.push({
            resourceId: `itdapter_${weekPlaylist.playlistId}`,
            title: weekPlaylist.title,
            type: 'playlist',
            hours: 3,
            accessInfo: {
              url: weekPlaylist.url,
              price: 0,
              provider: 'ITDapter YouTube'
            },
            itdapterPlaylist: {
              playlistId: weekPlaylist.playlistId,
              title: weekPlaylist.title,
              url: weekPlaylist.url,
              description: weekPlaylist.description,
              category: weekPlaylist.category
            }
          });
        }
      }
    }
  }

  return curriculum;
};

// 사용된 예산 계산
const calculateBudgetUsed = (resources) => {
  return Object.values(resources).flat()
    .reduce((total, resource) => total + (resource.price || 0), 0);
};
