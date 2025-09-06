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

## GSI (Global Secondary Index)

### GSI1: category-difficulty-index
- **Partition Key**: `category`
- **Sort Key**: `difficulty`
- 용도: 카테고리별 자격증 검색

### GSI2: user-status-index  
- **Partition Key**: `userId`
- **Sort Key**: `status`
- 용도: 사용자별 활성 커리큘럼 조회
