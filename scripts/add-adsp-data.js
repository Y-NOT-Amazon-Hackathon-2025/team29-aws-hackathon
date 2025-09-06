const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// 수동으로 수집한 ADSP 정보
const adspData = {
  id: { S: 'adsp' },
  name: { S: 'ADsP (데이터분석 준전문가)' },
  fullName: { S: 'Advanced Data Analytics Semi-Professional' },
  organization: { S: '한국데이터산업진흥원(K-DATA)' },
  website: { S: 'https://www.dataq.or.kr' },
  examFee: { S: '55,000원' },
  examTime: { S: '100분' },
  passingScore: { S: '60점 이상' },
  examType: { S: 'CBT (Computer Based Test)' },
  subjects: { L: [
    { S: '데이터 이해 (25문항, 25점)' },
    { S: '데이터 분석 기획 (25문항, 25점)' },
    { S: '데이터 분석 (50문항, 50점)' }
  ]},
  description: { S: '빅데이터 시대를 맞아 데이터 분석 업무에 대한 이해와 데이터 분석 기획 및 데이터 분석 등의 직무를 수행하는 실무진을 양성하기 위한 자격시험' },
  difficulty: { S: '초급' },
  studyPeriod: { S: '2-3개월' },
  category: { S: '데이터분석' },
  prerequisites: { S: '없음' },
  examSchedule: { L: [
    { S: '연 4회 (3월, 6월, 9월, 12월)' }
  ]},
  createdAt: { S: new Date().toISOString() },
  updatedAt: { S: new Date().toISOString() }
};

async function addADSPData() {
  try {
    const command = new PutItemCommand({
      TableName: process.env.CERT_TABLE || 'CertificationStack-CertificationsTable',
      Item: adspData
    });

    await dynamodb.send(command);
    console.log('✅ ADSP 데이터가 성공적으로 추가되었습니다!');
    console.log('추가된 데이터:', JSON.stringify(adspData, null, 2));
  } catch (error) {
    console.error('❌ 데이터 추가 실패:', error);
  }
}

// 실행
addADSPData();
