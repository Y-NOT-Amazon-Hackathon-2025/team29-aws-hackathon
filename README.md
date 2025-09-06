# [Y-NOT?] : AI 퀄리큘럼

![AWS Hackathon](https://img.shields.io/badge/AWS-Hackathon-orange?logo=amazonaws)
![Status](https://img.shields.io/badge/status-developing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

> **AI 기반 맞춤형 자격증 커리큘럼 생성 서비스**  
> 사용자가 학습 기간과 하루 공부 시간을 입력하면, 난이도(상/중/하)에 따라 최적화된 **AI 학습 플랜**을 제공합니다.  
> AWS Bedrock + Amazon Q Developer Hackathon 2025 출품작 🎉

---

## 📖 어플리케이션 개요

**AI 퀄리큘럼(Y-NOT?)**은 자격증 정보를 한눈에 보고, AI가 자동으로 학습 계획을 짜주는 웹 애플리케이션입니다.

### 🎯 문제의식
- 기존 자격증 사이트는 단순 정보 제공에 그쳐, 개별 학습자 수준·시간에 맞는 커리큘럼이 없음
- 자격증 준비 시 체계적인 학습 계획 수립의 어려움
- 개인별 학습 속도와 가용 시간을 고려한 맞춤형 플랜 부재

### 💡 해결방법
- **AWS Bedrock** 기반 AI가 난이도별(상/중/하) 학습 로드맵과 추천 자료를 자동으로 제안
- **개인화된 커리큘럼**: 학습 기간, 하루 학습 시간, 난이도를 고려한 AI 생성 플랜
- **실시간 진도 관리**: 주차별 학습 진행률 추적 및 관리

---

## 🔑 주요 기능

### 🔐 사용자 인증
- **회원가입/로그인**: Amazon Cognito 기반 안전한 인증
- **프로필 관리**: 관심사 설정을 통한 맞춤형 추천

### 📚 자격증 정보 관리
- **자격증 검색**: 실시간 Q-Net 데이터 연동으로 최신 자격증 정보 제공
- **상세 정보**: 시험 개요, 합격 기준, 과목별 정보, 응시료 등
- **즐겨찾기**: 관심 자격증 저장 및 관리

### 🤖 AI 커리큘럼 생성
- **입력 정보**: 시험명, 학습 기간, 하루 학습 시간, 난이도 선택
- **AI 생성**: AWS Bedrock (Llama 3.1) 기반 맞춤형 주차별 학습계획
- **출력 형태**: 구조화된 JSON 형태의 상세 커리큘럼

### 📖 추천 자료 제공 (RAG 기반)
- **S3 + Knowledge Bases**: Titan Embeddings를 활용한 지능형 검색
- **추천 도서**: 교보문고 연동 관련 서적 자동 매칭
- **영상 강의**: IT다팩트 등 온라인 강의 추천

### 📊 학습 진도 관리
- **나의 학습 계획**: DynamoDB 연동으로 개인별 커리큘럼 저장
- **진행률 추적**: 주차별, 과목별 학습 진도 실시간 확인
- **상태 관리**: 진행중/완료/저장됨 상태별 커리큘럼 분류

### 📅 시험 일정 관리
- **캘린더 뷰**: 자격증 시험 일정 한눈에 확인
- **D-Day 계산**: 시험일까지 남은 기간 자동 계산
- **알림 설정**: 시험 일정 리마인더 기능

### 🛡️ 안전성 보장
- **Guardrails 적용**: 부적절한 답변 및 개인정보 노출 차단
- **에러 핸들링**: 포괄적인 오류 처리 및 폴백 메커니즘

---



## 🏗️ 아키텍처

### Frontend (Next.js)
```
pages/
├── index.tsx          # 메인 페이지 (추천 자격증)
├── certificates.tsx   # 자격증 검색 및 목록
├── curriculums.tsx    # AI 커리큘럼 관리
├── calendar.tsx       # 시험 일정 캘린더
└── my.tsx            # 사용자 프로필 관리

components/
├── Header.tsx                 # 공통 헤더
├── RecommendedCertificates.tsx # 추천 자격증
└── CurriculumModal.tsx        # 커리큘럼 생성 모달
```

### Backend (AWS Serverless)
```
lambda/handlers/
├── certificates.js    # 자격증 CRUD 및 추천
├── curriculums.js     # 커리큘럼 관리
├── planner.js         # AI 커리큘럼 생성 (Bedrock)
├── auth.js           # 사용자 인증 (Cognito)
└── ai-search.js      # AI 기반 검색 및 추천
```

### Infrastructure (AWS CDK)
- **API Gateway**: RESTful API 엔드포인트
- **Lambda**: 서버리스 백엔드 로직
- **DynamoDB**: 사용자 데이터 및 커리큘럼 저장
- **Cognito**: 사용자 인증 및 권한 관리
- **Bedrock**: AI 모델 (Llama 3.1) 호스팅
- **S3 + CloudFront**: 정적 웹사이트 호스팅

---
## 🎥 동영상 데모

👉 [시연 영상 보러가기](https://www.youtube.com/watch?v=qlbrDKzGikE)

![메인페이지](https://i.ibb.co/cK5GwWNd/your-image.png)
## 데모영상
  https://767bx9mwg2.execute-api.us-east-1.amazonaws.com/prod/
---
## 🚀 리소스 배포하기

### 사전 요구사항
- AWS CLI 설치 및 구성
- Node.js 18+ 설치
- AWS CDK CLI 설치: `npm install -g aws-cdk`

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd team29-aws-hackathon
```

### 2. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 파일에서 필요한 환경 변수 설정
```

### 3. 자동 배포 (권장)
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 수동 배포
```bash
# 1. 의존성 설치
npm install
cd lambda && npm install && cd ..
cd infrastructure && npm install && cd ..

# 2. CDK 부트스트랩
cd infrastructure
npx cdk bootstrap

# 3. 인프라 배포
npx cdk deploy CertificationStack --require-approval never

# 4. 프론트엔드 빌드 및 배포
cd ..
npm run build
aws s3 sync out/ s3://[BUCKET_NAME] --delete
```

### 5. 초기 데이터 설정
```bash
# 자격증 데이터 수집 (자동 실행됨)
node scripts/populate-data.js

# 추가 리소스 데이터 (선택사항)
node scripts/add-real-resources.js
```

### 배포 완료 후 확인사항
- ✅ CloudFront URL로 프론트엔드 접근 가능
- ✅ API Gateway 엔드포인트 정상 동작
- ✅ 자격증 데이터 자동 수집 완료 (5-10분 소요)
- ✅ AI 커리큘럼 생성 기능 테스트

### 주요 엔드포인트
- **프론트엔드**: `https://[cloudfront-domain]`
- **API**: `https://[api-gateway-id].execute-api.us-east-1.amazonaws.com/prod`
- **자격증 검색**: `/certificates`
- **AI 커리큘럼**: `/curriculums`
- **추천 시스템**: `/certificates/recommended`

---

## 🔧 개발 환경 실행

```bash
# 로컬 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 빌드 테스트
npm run build
```

---

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**AWS Bedrock + Amazon Q Developer Hackathon 2025** 🏆