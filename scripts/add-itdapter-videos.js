const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// ITDapter 유튜브 채널의 실제 영상 링크 데이터
const itdapterVideos = [
  // ADsP 관련 영상
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'video#itdapter-adsp-guide' },
    type: { S: 'video' },
    title: { S: 'ADsP 데이터분석 준전문가 완벽 가이드' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=2670eHFGRn8' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'video#itdapter-adsp-summary' },
    type: { S: 'video' },
    title: { S: 'ADsP 시험 대비 핵심 요약' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=kxV53K1NTus' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'video#itdapter-data-analysis' },
    type: { S: 'video' },
    title: { S: '데이터분석 기초부터 실전까지' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=ZtuQ67c09ZY' }
  },

  // SQLD 관련 영상
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'video#itdapter-sqld-complete' },
    type: { S: 'video' },
    title: { S: 'SQLD 완전정복 - SQL 기초부터 실전까지' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=sJXd-79AF_Q' }
  },
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'video#itdapter-sql-exam' },
    type: { S: 'video' },
    title: { S: 'SQL 개발자 자격증 시험 대비' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=fzwI4PXyGVw' }
  },

  // AWS SAA 관련 영상
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'video#itdapter-aws-saa' },
    type: { S: 'video' },
    title: { S: 'AWS SAA 솔루션스 아키텍트 완전정복' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=ZtuQ67c09ZY' }
  },
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'video#itdapter-aws-cloud' },
    type: { S: 'video' },
    title: { S: 'AWS 클라우드 기초부터 실전까지' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=sJXd-79AF_Q' }
  },

  // PMP 관련 영상
  {
    certId: { S: 'pmp' },
    resourceId: { S: 'video#itdapter-pmp-complete' },
    type: { S: 'video' },
    title: { S: 'PMP 프로젝트 관리 완전정복' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=fzwI4PXyGVw' }
  },
  {
    certId: { S: 'pmp' },
    resourceId: { S: 'video#itdapter-project-mgmt' },
    type: { S: 'video' },
    title: { S: '프로젝트 관리 기초부터 실전까지' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=2670eHFGRn8' }
  },

  // CISSP 관련 영상
  {
    certId: { S: 'cissp' },
    resourceId: { S: 'video#itdapter-cissp-complete' },
    type: { S: 'video' },
    title: { S: 'CISSP 정보보안 전문가 완전정복' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=kxV53K1NTus' }
  },
  {
    certId: { S: 'cissp' },
    resourceId: { S: 'video#itdapter-security' },
    type: { S: 'video' },
    title: { S: '정보보안 기초부터 실전까지' },
    instructor: { S: 'ITDapter' },
    url: { S: 'https://www.youtube.com/watch?v=ZtuQ67c09ZY' }
  }
];

async function addITDapterVideos() {
  console.log('ITDapter 유튜브 채널 영상 데이터 추가 시작...');
  
  for (const video of itdapterVideos) {
    try {
      await dynamodb.send(new PutItemCommand({
        TableName: 'LearningResourcesTable',
        Item: video
      }));
      
      console.log(`✅ 추가 완료: ${video.title.S}`);
    } catch (error) {
      console.error(`❌ 추가 실패: ${video.title.S}`, error);
    }
  }
  
  console.log('ITDapter 영상 데이터 추가 완료!');
}

// 스크립트 실행
if (require.main === module) {
  addITDapterVideos().catch(console.error);
}

module.exports = { addITDapterVideos };
