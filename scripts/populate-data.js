const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({});

const certifications = [
  { 
    id: 'aws-saa', 
    name: 'AWS Solutions Architect Associate', 
    category: 'Cloud', 
    difficulty: 'Intermediate',
    description: 'AWS 클라우드 아키텍처 설계 및 구현 능력을 검증하는 자격증',
    examDate: '2024-12-15',
    registrationDeadline: '2024-11-15',
    cost: 150,
    duration: '130분',
    passingScore: 720
  },
  { 
    id: 'cissp', 
    name: 'CISSP', 
    category: 'Security', 
    difficulty: 'Advanced',
    description: '정보보안 전문가를 위한 국제 자격증',
    examDate: '2024-11-20',
    registrationDeadline: '2024-10-20',
    cost: 749,
    duration: '3시간',
    passingScore: 700
  },
  { 
    id: 'pmp', 
    name: 'Project Management Professional', 
    category: 'Management', 
    difficulty: 'Intermediate',
    description: '프로젝트 관리 전문가 자격증',
    examDate: '2024-12-01',
    registrationDeadline: '2024-11-01',
    cost: 555,
    duration: '4시간',
    passingScore: 'Above Target'
  },
  { 
    id: 'cka', 
    name: 'Certified Kubernetes Administrator', 
    category: 'DevOps', 
    difficulty: 'Advanced',
    description: 'Kubernetes 클러스터 관리 능력을 검증하는 자격증',
    examDate: '2024-11-30',
    registrationDeadline: '2024-10-30',
    cost: 395,
    duration: '2시간',
    passingScore: 66
  },
  {
    id: 'aws-dva',
    name: 'AWS Developer Associate',
    category: 'Cloud',
    difficulty: 'Intermediate',
    description: 'AWS 플랫폼에서 애플리케이션 개발 및 배포 능력 검증',
    examDate: '2024-12-20',
    registrationDeadline: '2024-11-20',
    cost: 150,
    duration: '130분',
    passingScore: 720
  },
  {
    id: 'ceh',
    name: 'Certified Ethical Hacker',
    category: 'Security',
    difficulty: 'Intermediate',
    description: '윤리적 해킹 및 침투 테스트 전문가 자격증',
    examDate: '2024-11-25',
    registrationDeadline: '2024-10-25',
    cost: 1199,
    duration: '4시간',
    passingScore: 70
  },
  {
    id: 'ccna',
    name: 'Cisco Certified Network Associate',
    category: 'Network',
    difficulty: 'Intermediate',
    description: '네트워크 기초 및 Cisco 장비 관리 능력 검증',
    examDate: '2024-12-10',
    registrationDeadline: '2024-11-10',
    cost: 300,
    duration: '120분',
    passingScore: 825
  },
  {
    id: 'azure-fundamentals',
    name: 'Microsoft Azure Fundamentals',
    category: 'Cloud',
    difficulty: 'Beginner',
    description: 'Microsoft Azure 클라우드 서비스 기초 지식 검증',
    examDate: '2024-11-15',
    registrationDeadline: '2024-10-15',
    cost: 99,
    duration: '85분',
    passingScore: 700
  }
];

async function populateData() {
  const tableName = process.argv[2];
  if (!tableName) {
    console.log('Usage: node populate-data.js <table-name>');
    return;
  }

  for (const cert of certifications) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: cert.id },
        name: { S: cert.name },
        category: { S: cert.category },
        difficulty: { S: cert.difficulty },
        description: { S: cert.description },
        examDate: { S: cert.examDate },
        registrationDeadline: { S: cert.registrationDeadline },
        cost: { N: String(cert.cost) },
        duration: { S: cert.duration },
        passingScore: { S: String(cert.passingScore) }
      }
    });

    try {
      await client.send(command);
      console.log(`Added: ${cert.name}`);
    } catch (error) {
      console.error(`Error adding ${cert.name}:`, error);
    }
  }
}

populateData();
