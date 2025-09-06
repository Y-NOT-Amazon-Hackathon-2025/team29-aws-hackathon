# DynamoDB 스키마 설계

## 1. CertificationsTable
**Partition Key**: `id` (String)

```json
{
  "id": "aws-saa",
  "name": "AWS Solutions Architect Associate",
  "category": "Cloud",
  "difficulty": "Intermediate",
  "description": "AWS 클라우드 아키텍처 설계 자격증",
  "examDate": "2024-12-15",
  "registrationDeadline": "2024-11-15",
  "cost": 150,
  "duration": "130분",
  "passingScore": 720,
  "syllabus": [
    "Design Resilient Architectures (30%)",
    "Design High-Performing Architectures (28%)"
  ],
  "resources": [
    "AWS 공식 문서",
    "A Cloud Guru 강의"
  ],
  "tags": ["aws", "cloud", "architecture"],
  "createdAt": "2024-09-05T07:00:00Z"
}
```

## 2. UsersTable
**Partition Key**: `userId` (String)  
**Sort Key**: `type#id` (String)

### 사용자 프로필
```json
{
  "userId": "user-1234",
  "type#id": "profile",
  "email": "user@example.com",
  "name": "홍길동",
  "interests": ["데이터분석", "클라우드", "보안", "AI/ML", "웹개발"],
  "createdAt": "2024-09-05T07:00:00Z"
}
```

### 즐겨찾기
```json
{
  "userId": "user-1234",
  "type#id": "favorite#aws-saa",
  "certId": "aws-saa",
  "createdAt": "2024-09-05T07:00:00Z"
}
```

### 커리큘럼
```json
{
  "userId": "user-1234",
  "type#id": "curriculum#uuid-5678",
  "id": "uuid-5678",
  "title": "AWS SAA 학습 계획",
  "certId": "aws-saa",
  "status": "active",
  "targetDate": "2024-12-15",
  "studyHoursPerWeek": 10,
  "aiGenerated": true,
  "createdAt": "2024-09-05T07:00:00Z"
}
```

### 할일/태스크
```json
{
  "userId": "user-1234",
  "type#id": "task#task-1",
  "id": "task-1",
  "curriculumId": "uuid-5678",
  "title": "AWS 계정 생성 및 IAM 학습",
  "description": "AWS 계정을 생성하고 IAM 기본 개념을 학습합니다",
  "week": 1,
  "status": "completed",
  "estimatedHours": 4,
  "actualHours": 3,
  "taskType": "hands-on",
  "resources": ["AWS 공식 문서", "실습 가이드"],
  "dueDate": "2024-09-12",
  "completedAt": "2024-09-10T15:30:00Z",
  "createdAt": "2024-09-05T07:00:00Z"
}
```

### 알림 설정
```json
{
  "userId": "user-1234",
  "type#id": "notification#notif-1",
  "id": "notif-1",
  "certId": "aws-saa",
  "notificationType": "exam_reminder",
  "triggerDate": "2024-12-08",
  "message": "AWS SAA 시험이 7일 후입니다!",
  "status": "pending",
  "createdAt": "2024-09-05T07:00:00Z"
}
```

## 3. LearningResourcesTable
**Partition Key**: `certId` (String)  
**Sort Key**: `resourceId` (String)

### 교재 정보
```json
{
  "certId": "adsp",
  "resourceId": "textbook#adsp-guide-2024",
  "type": "textbook",
  "title": "ADsP 데이터분석 준전문가 완벽가이드 2024",
  "author": "김데이터",
  "publisher": "데이터출판사",
  "isbn": "979-11-123456-78-9",
  "price": 28000,
  "rating": 4.5,
  "reviewCount": 1250,
  "purchaseLinks": {
    "yes24": "https://www.yes24.com/...",
    "kyobo": "https://www.kyobobook.co.kr/...",
    "aladin": "https://www.aladin.co.kr/..."
  },
  "chapters": [
    "1장. 데이터 이해",
    "2장. 데이터 분석 기획",
    "3장. 데이터 분석"
  ],
  "difficulty": "초급",
  "recommendedWeeks": [1, 2, 3, 4]
}
```

### 동영상 강의 정보
```json
{
  "certId": "adsp",
  "resourceId": "video#fastcampus-adsp",
  "type": "video",
  "title": "패스트캠퍼스 ADsP 완주반",
  "instructor": "박강사",
  "platform": "패스트캠퍼스",
  "duration": "20시간",
  "price": 150000,
  "discountPrice": 99000,
  "rating": 4.8,
  "studentCount": 3500,
  "videoUrl": "https://fastcampus.co.kr/...",
  "previewUrl": "https://youtube.com/watch?v=...",
  "curriculum": [
    "데이터 이해 기초 (3시간)",
    "통계 분석 실습 (5시간)",
    "R/Python 활용 (8시간)",
    "모의고사 해설 (4시간)"
  ],
  "difficulty": "초급",
  "recommendedWeeks": [1, 2, 3, 4, 5]
}
```

### 온라인 문제집
```json
{
  "certId": "adsp",
  "resourceId": "quiz#adsp-bank-2024",
  "type": "quiz",
  "title": "ADsP 기출문제 1000제",
  "provider": "시나공",
  "questionCount": 1000,
  "price": 19900,
  "accessUrl": "https://sinagong.co.kr/...",
  "features": [
    "최신 기출문제 반영",
    "상세 해설 제공",
    "오답노트 기능",
    "모의고사 10회"
  ],
  "difficulty": "전체",
  "recommendedWeeks": [3, 4, 5, 6]
}
```

### 무료 자료
```json
{
  "certId": "adsp",
  "resourceId": "free#kdata-guide",
  "type": "documentation",
  "title": "한국데이터산업진흥원 공식 가이드",
  "provider": "한국데이터산업진흥원",
  "price": 0,
  "accessUrl": "https://www.kdata.or.kr/...",
  "downloadUrl": "https://www.kdata.or.kr/.../guide.pdf",
  "description": "공식 출제기관에서 제공하는 시험 가이드",
  "fileSize": "2.5MB",
  "lastUpdated": "2024-08-01"
}
```
