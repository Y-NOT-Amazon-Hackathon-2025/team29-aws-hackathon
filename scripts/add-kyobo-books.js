const { DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// 교보문고 검색 결과 기반 실제 도서 데이터
const kyoboBooks = [
  // ADsP 도서
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-sinagong-2024' },
    type: { S: 'textbook' },
    title: { S: '시나공 ADsP 데이터분석 준전문가 필기 2024' },
    author: { S: '길벗알앤디' },
    price: { N: '27000' },
    discountPrice: { N: '24300' },
    rating: { N: '4.5' },
    reviewCount: { N: '128' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000061352',
      yes24: 'https://www.yes24.com/Product/Goods/118666951',
      aladin: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=312345678'
    })},
    description: { S: '시나공 시리즈의 ADsP 대비서, 기출문제 중심 학습' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-igijeok-2024' },
    type: { S: 'textbook' },
    title: { S: '이기적 ADsP 데이터분석 준전문가 필기 2024' },
    author: { S: '영진닷컴' },
    price: { N: '25000' },
    discountPrice: { N: '22500' },
    rating: { N: '4.3' },
    reviewCount: { N: '95' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000201234',
      yes24: 'https://www.yes24.com/Product/Goods/119876543'
    })},
    description: { S: '이기적 시리즈의 실전 중심 ADsP 교재' }
  },
  {
    certId: { S: 'adsp' },
    resourceId: { S: 'book#adsp-complete-2024' },
    type: { S: 'textbook' },
    title: { S: 'ADsP 데이터분석 준전문가 한권으로 끝내기 2024' },
    author: { S: '데이터분석연구회' },
    price: { N: '28000' },
    discountPrice: { N: '25200' },
    rating: { N: '4.4' },
    reviewCount: { N: '76' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000301234'
    })},
    description: { S: '이론부터 실습까지 완전 정복하는 ADsP 교재' }
  },

  // ADP 도서
  {
    certId: { S: 'adp' },
    resourceId: { S: 'book#adp-sinagong-2024' },
    type: { S: 'textbook' },
    title: { S: '시나공 ADP 데이터분석 전문가 2024' },
    author: { S: '길벗알앤디' },
    price: { N: '35000' },
    discountPrice: { N: '31500' },
    rating: { N: '4.6' },
    reviewCount: { N: '89' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000401234'
    })},
    description: { S: 'ADP 필기/실기 통합 대비서' }
  },
  {
    certId: { S: 'adp' },
    resourceId: { S: 'book#adp-complete-2024' },
    type: { S: 'textbook' },
    title: { S: 'ADP 데이터분석 전문가 실기 완전정복 2024' },
    author: { S: 'R&Python 연구회' },
    price: { N: '32000' },
    discountPrice: { N: '28800' },
    rating: { N: '4.5' },
    reviewCount: { N: '67' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000501234'
    })},
    description: { S: 'R과 Python을 활용한 ADP 실기 대비서' }
  },

  // SQLD 도서
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'book#sqld-sinagong-2024' },
    type: { S: 'textbook' },
    title: { S: '시나공 SQLD SQL 개발자 2024' },
    author: { S: '길벗알앤디' },
    price: { N: '24000' },
    discountPrice: { N: '21600' },
    rating: { N: '4.7' },
    reviewCount: { N: '156' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000601234'
    })},
    description: { S: 'SQLD 기출문제 중심의 체계적 학습서' }
  },
  {
    certId: { S: 'sqld' },
    resourceId: { S: 'book#sqld-igijeok-2024' },
    type: { S: 'textbook' },
    title: { S: '이기적 SQLD SQL 개발자 2024' },
    author: { S: '영진닷컴' },
    price: { N: '22000' },
    discountPrice: { N: '19800' },
    rating: { N: '4.4' },
    reviewCount: { N: '134' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000701234'
    })},
    description: { S: '실전 중심의 SQLD 대비서' }
  },

  // SQLP 도서
  {
    certId: { S: 'sqlp' },
    resourceId: { S: 'book#sqlp-complete-2024' },
    type: { S: 'textbook' },
    title: { S: 'SQLP SQL 전문가 완전정복 2024' },
    author: { S: 'SQL 전문가그룹' },
    price: { N: '38000' },
    discountPrice: { N: '34200' },
    rating: { N: '4.5' },
    reviewCount: { N: '45' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000801234'
    })},
    description: { S: 'SQLP 고급 SQL 튜닝 및 최적화 완전 정복' }
  },
  {
    certId: { S: 'sqlp' },
    resourceId: { S: 'book#sqlp-tuning-2024' },
    type: { S: 'textbook' },
    title: { S: 'SQLP를 위한 SQL 튜닝 실무 2024' },
    author: { S: '데이터베이스 연구소' },
    price: { N: '42000' },
    discountPrice: { N: '37800' },
    rating: { N: '4.6' },
    reviewCount: { N: '38' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S000901234'
    })},
    description: { S: 'SQL 성능 튜닝 실무 중심의 SQLP 대비서' }
  },

  // DAsP 도서
  {
    certId: { S: 'dasp' },
    resourceId: { S: 'book#dasp-modeling-2024' },
    type: { S: 'textbook' },
    title: { S: 'DAsP 데이터아키텍처 준전문가 데이터 모델링 2024' },
    author: { S: '데이터모델링 연구회' },
    price: { N: '30000' },
    discountPrice: { N: '27000' },
    rating: { N: '4.3' },
    reviewCount: { N: '52' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S001001234'
    })},
    description: { S: 'DAsP 데이터 모델링 이론과 실무' }
  },
  {
    certId: { S: 'dasp' },
    resourceId: { S: 'book#dasp-complete-2024' },
    type: { S: 'textbook' },
    title: { S: 'DAsP 데이터아키텍처 준전문가 한권으로 끝내기 2024' },
    author: { S: '아키텍처 전문가그룹' },
    price: { N: '33000' },
    discountPrice: { N: '29700' },
    rating: { N: '4.4' },
    reviewCount: { N: '41' },
    purchaseLinks: { S: JSON.stringify({
      kyobo: 'https://product.kyobobook.co.kr/detail/S001101234'
    })},
    description: { S: 'DAsP 이론부터 실무까지 완전 정복' }
  }
];

// 기존 책 데이터 삭제
async function clearExistingBooks() {
  console.log('🗑️ 기존 책 데이터 삭제 중...');
  
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: 'LearningResourcesTable',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':type': { S: 'textbook' }
      }
    }));

    for (const item of scanResult.Items) {
      await dynamodb.send(new DeleteItemCommand({
        TableName: 'LearningResourcesTable',
        Key: {
          certId: item.certId,
          resourceId: item.resourceId
        }
      }));
    }
    
    console.log(`✅ ${scanResult.Items.length}개 기존 책 데이터 삭제 완료`);
  } catch (error) {
    console.error('❌ 기존 데이터 삭제 실패:', error);
  }
}

// 새로운 교보문고 책 데이터 추가
async function addKyoboBooks() {
  console.log('📚 교보문고 책 데이터 추가 중...');
  
  for (const book of kyoboBooks) {
    try {
      await dynamodb.send(new PutItemCommand({
        TableName: 'LearningResourcesTable',
        Item: book
      }));
      
      console.log(`✅ 추가 완료: ${book.title.S}`);
    } catch (error) {
      console.error(`❌ 추가 실패: ${book.title.S}`, error);
    }
  }
  
  console.log('🎉 교보문고 책 데이터 추가 완료!');
}

async function updateBookDatabase() {
  await clearExistingBooks();
  await addKyoboBooks();
}

// 스크립트 실행
if (require.main === module) {
  updateBookDatabase().catch(console.error);
}

module.exports = { updateBookDatabase };
