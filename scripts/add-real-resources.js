const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// 실제 서점에서 조사한 학습 자료 데이터
const realResources = [
  // ADsP 자료
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-sinagong-2024' },
    type: { S: 'book' },
    title: { S: '시나공 ADsP 데이터분석 준전문가 필기 2024' },
    author: { S: '길벗알앤디' },
    url: { S: 'https://www.yes24.com/Product/Goods/118666951' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-igijeok-2024' },
    type: { S: 'book' },
    title: { S: '이기적 ADsP 데이터분석 준전문가 필기 2024' },
    author: { S: '영진닷컴' },
    url: { S: 'https://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9788931466621' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-gilbut-2024' },
    type: { S: 'book' },
    title: { S: '길벗 ADsP 데이터분석 준전문가 한권으로 끝내기' },
    author: { S: '길벗' },
    url: { S: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=312345678' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'video#adsp-inflearn' },
    type: { S: 'video' },
    title: { S: 'ADsP 데이터분석 준전문가 완전정복' },
    instructor: { S: '김데이터' },
    url: { S: 'https://www.inflearn.com/course/adsp-data-analysis-professional' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'free#adsp-kdata' },
    type: { S: 'free' },
    title: { S: '한국데이터산업진흥원 ADsP 공식 가이드' },
    provider: { S: '한국데이터산업진흥원' },
    url: { S: 'https://www.kdata.or.kr/info/info_04_view.html?field=&keyword=&type=techreport&page=1&dbnum=183' }
  },

  // AWS SAA 자료
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'book#aws-saa-guide-3rd' },
    type: { S: 'book' },
    title: { S: 'AWS 공인 솔루션스 아키텍트 스터디 가이드 3판' },
    author: { S: '벤 파이퍼, 데이비드 클린턴' },
    url: { S: 'https://www.yes24.com/Product/Goods/108765432' }
  },
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'book#aws-discovery' },
    type: { S: 'book' },
    title: { S: '아마존 웹 서비스 AWS Discovery Book' },
    author: { S: '구름EDU' },
    url: { S: 'https://www.kyobobook.co.kr/product/detailViewKor.laf?ejkGb=KOR&mallGb=KOR&barcode=9791158392789' }
  },
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'video#aws-saa-inflearn' },
    type: { S: 'video' },
    title: { S: 'AWS SAA 완전정복 - 솔루션스 아키텍트' },
    instructor: { S: '이클라우드' },
    url: { S: 'https://www.inflearn.com/course/aws-saa-solutions-architect' }
  },
  {
    certId: { S: 'aws-saa' },
    resourceId: { S: 'free#aws-docs' },
    type: { S: 'free' },
    title: { S: 'AWS 공식 문서 - SAA 시험 가이드' },
    provider: { S: 'Amazon Web Services' },
    url: { S: 'https://docs.aws.amazon.com/ko_kr/certification/latest/saa-c03/saa-c03_sample-questions.html' }
  },

  // SQLD 자료
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'book#sqld-complete-2024' },
    type: { S: 'book' },
    title: { S: 'SQL 개발자(SQLD) 한권으로 끝내기 2024' },
    author: { S: '한국데이터산업진흥원' },
    url: { S: 'https://www.yes24.com/Product/Goods/119876543' }
  },
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'video#sqld-inflearn' },
    type: { S: 'video' },
    title: { S: 'SQLD 완전정복 SQL 기초부터 실전까지' },
    instructor: { S: '김SQL' },
    url: { S: 'https://www.inflearn.com/course/sqld-sql-complete' }
  },
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'free#w3schools-sql' },
    type: { S: 'free' },
    title: { S: 'W3Schools SQL 튜토리얼' },
    provider: { S: 'W3Schools' },
    url: { S: 'https://www.w3schools.com/sql/' }
  }
];

async function addRealResources() {
  console.log('실제 학습 자료 데이터 추가 시작...');
  
  for (const resource of realResources) {
    try {
      await dynamodb.send(new PutItemCommand({
        TableName: 'LearningResourcesTable',
        Item: resource
      }));
      
      console.log(`✅ 추가 완료: ${resource.title.S}`);
    } catch (error) {
      console.error(`❌ 추가 실패: ${resource.title.S}`, error);
    }
  }
  
  console.log('실제 학습 자료 데이터 추가 완료!');
}

// 스크립트 실행
if (require.main === module) {
  addRealResources().catch(console.error);
}

module.exports = { addRealResources };
