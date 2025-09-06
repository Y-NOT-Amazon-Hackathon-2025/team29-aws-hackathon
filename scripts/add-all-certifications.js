const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// 한국데이터산업진흥원 자격증 정보 (수동 수집)
const certifications = [
  {
    id: { S: 'adsp' },
    name: { S: 'ADsP (데이터분석 준전문가)' },
    fullName: { S: 'Advanced Data Analytics Semi-Professional' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '55,000원' },
    examTime: { S: '100분' },
    passingScore: { S: '60점 이상' },
    subjects: { L: [
      { S: '데이터 이해 (25문항)' },
      { S: '데이터 분석 기획 (25문항)' },
      { S: '데이터 분석 (50문항)' }
    ]},
    difficulty: { S: '초급' },
    studyPeriod: { S: '2-3개월' },
    category: { S: '데이터분석' }
  },
  {
    id: { S: 'adp' },
    name: { S: 'ADP (데이터분석 전문가)' },
    fullName: { S: 'Advanced Data Analytics Professional' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '80,000원' },
    examTime: { S: '1과목 90분, 2과목 100분' },
    passingScore: { S: '각 과목 60점 이상' },
    subjects: { L: [
      { S: '데이터 분석 기획 (필기)' },
      { S: '데이터 분석 (실기 - R/Python/SAS)' }
    ]},
    difficulty: { S: '중급' },
    studyPeriod: { S: '4-6개월' },
    category: { S: '데이터분석' }
  },
  {
    id: { S: 'sqld' },
    name: { S: 'SQLD (SQL 개발자)' },
    fullName: { S: 'SQL Developer' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '50,000원' },
    examTime: { S: '90분' },
    passingScore: { S: '60점 이상' },
    subjects: { L: [
      { S: '데이터 모델링의 이해 (10문항)' },
      { S: 'SQL 기본 및 활용 (40문항)' }
    ]},
    difficulty: { S: '초급' },
    studyPeriod: { S: '1-2개월' },
    category: { S: 'SQL/데이터베이스' }
  },
  {
    id: { S: 'sqlp' },
    name: { S: 'SQLP (SQL 전문가)' },
    fullName: { S: 'SQL Professional' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '70,000원' },
    examTime: { S: '180분' },
    passingScore: { S: '60점 이상' },
    subjects: { L: [
      { S: '데이터 모델링의 이해 (10문항)' },
      { S: 'SQL 기본 및 활용 (20문항)' },
      { S: 'SQL 고급 활용 및 튜닝 (20문항)' }
    ]},
    difficulty: { S: '고급' },
    studyPeriod: { S: '6-8개월' },
    category: { S: 'SQL/데이터베이스' }
  },
  {
    id: { S: 'dap' },
    name: { S: 'DAP (데이터아키텍처 전문가)' },
    fullName: { S: 'Data Architecture Professional' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '80,000원' },
    examTime: { S: '1과목 100분, 2과목 120분' },
    passingScore: { S: '각 과목 60점 이상' },
    subjects: { L: [
      { S: '데이터 아키텍처 일반 (필기)' },
      { S: '데이터 아키텍처 실무 (실기)' }
    ]},
    difficulty: { S: '고급' },
    studyPeriod: { S: '6-12개월' },
    category: { S: '데이터아키텍처' }
  },
  {
    id: { S: 'dasp' },
    name: { S: 'DAsP (데이터아키텍처 준전문가)' },
    fullName: { S: 'Data Architecture Semi-Professional' },
    organization: { S: '한국데이터산업진흥원' },
    examFee: { S: '60,000원' },
    examTime: { S: '100분' },
    passingScore: { S: '60점 이상' },
    subjects: { L: [
      { S: '데이터 모델링의 이해 (30문항)' },
      { S: '데이터 모델과 성능 (20문항)' }
    ]},
    difficulty: { S: '중급' },
    studyPeriod: { S: '3-4개월' },
    category: { S: '데이터아키텍처' }
  }
];

async function addAllCertifications() {
  console.log('🚀 자격증 데이터 추가 시작...');
  
  for (const cert of certifications) {
    try {
      // 공통 필드 추가
      cert.website = { S: 'https://www.dataq.or.kr' };
      cert.examType = { S: 'CBT' };
      cert.examSchedule = { L: [{ S: '연 4회 (3월, 6월, 9월, 12월)' }] };
      cert.createdAt = { S: new Date().toISOString() };
      cert.updatedAt = { S: new Date().toISOString() };

      const command = new PutItemCommand({
        TableName: process.env.CERT_TABLE || 'CertificationStack-CertificationsTable',
        Item: cert
      });

      await dynamodb.send(command);
      console.log(`✅ ${cert.name.S} 추가 완료`);
    } catch (error) {
      console.error(`❌ ${cert.name.S} 추가 실패:`, error);
    }
  }
  
  console.log('🎉 모든 자격증 데이터 추가 완료!');
}

addAllCertifications();
