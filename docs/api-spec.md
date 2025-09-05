# API 명세서

## 인증 헤더
```
Authorization: Bearer <JWT_TOKEN>
```

## 1. 인증/회원

### POST /login
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid-1234",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

### POST /register
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}

// Response (201)
{
  "userId": "uuid-1234",
  "message": "회원가입 완료"
}
```

## 2. 자격증 검색

### GET /certificates?search=AWS&category=Cloud
```json
// Response (200)
{
  "certificates": [
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
      "passingScore": 720
    }
  ],
  "total": 1
}
```

### GET /certificates/{id}
```json
// Response (200)
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
    "Design High-Performing Architectures (28%)",
    "Design Secure Applications (24%)",
    "Design Cost-Optimized Architectures (18%)"
  ],
  "resources": [
    "AWS 공식 문서",
    "A Cloud Guru 강의",
    "AWS Practice Exams"
  ]
}
```

### POST /certificates/{id}/save
```json
// Response (200)
{
  "message": "즐겨찾기 추가 완료",
  "curriculumId": "uuid-5678"
}
```

## 3. 커리큘럼

### GET /curriculums
```json
// Response (200)
{
  "curriculums": [
    {
      "id": "uuid-5678",
      "title": "AWS SAA 학습 계획",
      "certId": "aws-saa",
      "status": "active",
      "progress": 45,
      "createdAt": "2024-09-05T07:00:00Z",
      "targetDate": "2024-12-15"
    }
  ]
}
```

### POST /curriculums
```json
// Request
{
  "title": "AWS SAA 학습 계획",
  "certId": "aws-saa",
  "targetDate": "2024-12-15",
  "studyHoursPerWeek": 10
}

// Response (201)
{
  "id": "uuid-5678",
  "message": "커리큘럼 생성 완료"
}
```

### GET /curriculums/{id}
```json
// Response (200)
{
  "id": "uuid-5678",
  "title": "AWS SAA 학습 계획",
  "certId": "aws-saa",
  "status": "active",
  "progress": 45,
  "weeks": [
    {
      "week": 1,
      "topic": "AWS 기초 개념",
      "tasks": [
        {
          "id": "task-1",
          "title": "AWS 계정 생성 및 IAM 학습",
          "status": "completed",
          "estimatedHours": 4,
          "actualHours": 3
        }
      ]
    }
  ]
}
```

## 4. AI 플래너

### POST /planner/generate
```json
// Request
{
  "certificationId": "aws-saa",
  "difficulty": "intermediate",
  "timeframe": 12,
  "studyHoursPerWeek": 10,
  "targetDate": "2024-12-15"
}

// Response (200)
{
  "curriculum": {
    "title": "AWS SAA 12주 학습 계획",
    "totalWeeks": 12,
    "totalHours": 120,
    "weeks": [
      {
        "week": 1,
        "topic": "AWS 기초 및 IAM",
        "tasks": [
          {
            "title": "AWS 계정 생성 및 기본 설정",
            "estimatedHours": 2,
            "type": "hands-on",
            "resources": ["AWS 공식 문서", "실습 가이드"]
          },
          {
            "title": "IAM 사용자, 그룹, 정책 학습",
            "estimatedHours": 3,
            "type": "study",
            "resources": ["AWS IAM 문서", "A Cloud Guru 강의"]
          }
        ]
      }
    ]
  }
}
```

## 5. 진행률

### GET /curriculums/{id}/progress
```json
// Response (200)
{
  "total": 24,
  "completed": 11,
  "progress": 45,
  "weeklyProgress": [
    {"week": 1, "completed": 4, "total": 4},
    {"week": 2, "completed": 3, "total": 4},
    {"week": 3, "completed": 2, "total": 4}
  ],
  "timeSpent": 32,
  "estimatedTime": 120
}
```
