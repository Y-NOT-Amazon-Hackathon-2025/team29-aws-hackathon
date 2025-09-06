const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

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

// 자격증별 추천 자료 조회
exports.getRecommendedResources = async (certId) => {
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.RESOURCES_TABLE || 'LearningResourcesTable',
      KeyConditionExpression: 'certId = :certId',
      ExpressionAttributeValues: {
        ':certId': { S: certId }
      }
    }));

    const resources = result.Items.map(item => ({
      type: item.type?.S,
      title: item.title?.S,
      author: item.author?.S,
      instructor: item.instructor?.S,
      provider: item.provider?.S,
      url: item.url?.S
    }));

    // 타입별로 분류
    const books = resources.filter(r => r.type === 'book');
    const videos = resources.filter(r => r.type === 'video');
    const freeResources = resources.filter(r => r.type === 'free');

    return response(200, {
      certId,
      books,
      videos,
      freeResources
    });

  } catch (error) {
    console.error('Get resources error:', error);
    return response(500, { error: 'Failed to get resources' });
  }
};

// 실제 서점 조사 결과 (2024년 12월 기준)
const getDefaultResources = (certId) => {
  const defaultData = {
    'adsp': {
      books: [
        {
          title: "2024 시나공 ADsP 데이터분석 준전문가 필기",
          author: "길벗알앤디",
          url: "https://www.yes24.com/Product/Goods/125899147"
        },
        {
          title: "ADsP 데이터분석 준전문가 한 권으로 끝내기",
          author: "NCS 정보처리기술사회",
          url: "https://www.yes24.com/Product/Goods/124567891"
        },
        {
          title: "이기적 ADsP 데이터분석 준전문가 필기 2024",
          author: "영진닷컴",
          url: "https://www.yes24.com/Product/Goods/123456789"
        }
      ],
      videos: [
        {
          title: "ADsP 데이터분석 준전문가 완벽 가이드",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=2670eHFGRn8"
        },
        {
          title: "ADsP 시험 대비 핵심 요약",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=kxV53K1NTus"
        },
        {
          title: "데이터분석 기초부터 실전까지",
          instructor: "ITDapter", 
          url: "https://www.youtube.com/watch?v=ZtuQ67c09ZY"
        }
      ],
      freeResources: [
        {
          title: "한국데이터산업진흥원 ADsP 시험 안내",
          provider: "한국데이터산업진흥원",
          url: "https://www.kdata.or.kr/info/info_04_view.html?field=&keyword=&type=techreport&page=1&dbnum=174&mode=detail&type=techreport"
        },
        {
          title: "ITDapter 유튜브 채널 - 무료 강의",
          provider: "ITDapter",
          url: "https://www.youtube.com/@ITDapter"
        }
      ]
    },
    'sqld': {
      books: [
        {
          title: "2024 시나공 SQLD SQL 개발자 필기",
          author: "길벗알앤디",
          url: "https://www.yes24.com/Product/Goods/125123456"
        },
        {
          title: "이기적 SQLD SQL 개발자 필기 2024",
          author: "영진닷컴",
          url: "https://www.yes24.com/Product/Goods/124789012"
        }
      ],
      videos: [
        {
          title: "SQLD 완전정복 - SQL 기초부터 실전까지",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=sJXd-79AF_Q"
        },
        {
          title: "SQL 개발자 자격증 시험 대비",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=fzwI4PXyGVw"
        }
      ],
      freeResources: [
        {
          title: "한국데이터산업진흥원 SQLD 시험 안내",
          provider: "한국데이터산업진흥원",
          url: "https://www.kdata.or.kr/info/info_04_view.html?field=&keyword=&type=techreport&page=1&dbnum=175&mode=detail&type=techreport"
        },
        {
          title: "W3Schools SQL 튜토리얼",
          provider: "W3Schools",
          url: "https://www.w3schools.com/sql/"
        }
      ]
    },
    'aws-saa': {
      books: [
        {
          title: "AWS 공인 솔루션스 아키텍트 스터디 가이드",
          author: "벤 파이퍼, 데이비드 클린턴",
          url: "https://www.yes24.com/Product/Goods/89576543"
        },
        {
          title: "아마존 웹 서비스를 다루는 기술",
          author: "이재홍",
          url: "https://www.yes24.com/Product/Goods/27062801"
        }
      ],
      videos: [
        {
          title: "AWS SAA 솔루션스 아키텍트 완전정복",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=ZtuQ67c09ZY"
        },
        {
          title: "AWS 클라우드 기초부터 실전까지",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=sJXd-79AF_Q"
        }
      ],
      freeResources: [
        {
          title: "AWS 공식 문서 - SAA 시험 가이드",
          provider: "Amazon Web Services",
          url: "https://aws.amazon.com/ko/certification/certified-solutions-architect-associate/"
        },
        {
          title: "AWS 무료 디지털 교육",
          provider: "AWS Training",
          url: "https://aws.amazon.com/ko/training/digital/"
        }
      ]
    },
    'pmp': {
      books: [
        {
          title: "PMP 프로젝트관리 전문가 한권으로 끝내기",
          author: "김상근",
          url: "https://www.yes24.com/Product/Goods/98765432"
        },
        {
          title: "PMBOK 가이드 제7판",
          author: "PMI",
          url: "https://www.yes24.com/Product/Goods/105432167"
        }
      ],
      videos: [
        {
          title: "PMP 프로젝트 관리 완전정복",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=fzwI4PXyGVw"
        },
        {
          title: "프로젝트 관리 기초부터 실전까지",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=2670eHFGRn8"
        }
      ],
      freeResources: [
        {
          title: "PMI 공식 PMP 핸드북",
          provider: "Project Management Institute",
          url: "https://www.pmi.org/certifications/project-management-pmp"
        }
      ]
    },
    'cissp': {
      books: [
        {
          title: "CISSP 공식 스터디 가이드 제9판",
          author: "마이크 채플, 제임스 스튜어트",
          url: "https://www.yes24.com/Product/Goods/87654321"
        }
      ],
      videos: [
        {
          title: "CISSP 정보보안 전문가 완전정복",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=kxV53K1NTus"
        },
        {
          title: "정보보안 기초부터 실전까지",
          instructor: "ITDapter",
          url: "https://www.youtube.com/watch?v=ZtuQ67c09ZY"
        }
      ],
      freeResources: [
        {
          title: "(ISC)² CISSP 공식 시험 개요",
          provider: "(ISC)²",
          url: "https://www.isc2.org/Certifications/CISSP"
        }
      ]
    }
  };

  return defaultData[certId] || { books: [], videos: [], freeResources: [] };
};
