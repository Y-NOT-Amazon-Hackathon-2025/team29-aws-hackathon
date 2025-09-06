# 🚀 Y-NOT AI 쿼리큘럼 배포 가이드

## 📋 사전 준비사항

### 1. AWS 계정 및 자격 증명
- AWS 계정 생성
- IAM 사용자 생성 (AdministratorAccess 권한)
- Access Key ID와 Secret Access Key 발급

### 2. 필요한 도구 설치
```bash
# Node.js 설치 (이미 완료)
node --version

# AWS CLI 설치 (이미 완료)
aws --version

# CDK 설치 (이미 완료)
cdk --version
```

## ⚙️ 환경 설정

### 1. 환경 변수 설정
```bash
# .env.local 파일 편집
cp .env.example .env.local
```

`.env.local` 파일에 실제 값 입력:
```bash
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=실제_액세스_키_ID
AWS_SECRET_ACCESS_KEY=실제_시크릿_액세스_키
AWS_ACCOUNT_ID=실제_계정_ID
```

### 2. AWS CLI 설정
```bash
aws configure
# AWS Access Key ID: 실제_액세스_키_ID
# AWS Secret Access Key: 실제_시크릿_액세스_키
# Default region name: ap-northeast-2
# Default output format: json
```

## 🚀 배포 실행

### 자동 배포 (권장)
```bash
./deploy.sh
```

### 수동 배포
```bash
# 1. 의존성 설치
npm install
cd lambda && npm install && cd ..
cd infrastructure && npm install && cd ..

# 2. 프론트엔드 빌드
npm run build

# 3. 인프라 배포
cd infrastructure
cdk bootstrap
cdk deploy
cd ..

# 4. 샘플 데이터 추가
node scripts/populate-data.js

# 5. 프론트엔드 S3 배포
aws s3 sync out/ s3://버킷이름 --delete
```

## 🔧 배포 후 설정

### 1. Cognito User Pool 설정
- AWS Console → Cognito → User Pools
- 사용자 풀 생성 및 앱 클라이언트 설정
- `.env.local`에 User Pool ID와 Client ID 추가

### 2. Bedrock 모델 활성화
- AWS Console → Bedrock → Model access
- Claude 3 Sonnet 모델 활성화

### 3. Knowledge Base 설정 (선택사항)
- S3 버킷에 학습 자료 업로드
- Bedrock Knowledge Base 생성
- `.env.local`에 Knowledge Base ID 추가

## 🌐 접속 확인

배포 완료 후 출력되는 URL로 접속:
- 프론트엔드: CloudFront URL
- API: API Gateway URL

## 🔍 문제 해결

### 일반적인 오류
1. **AWS 자격 증명 오류**: `.env.local` 파일 확인
2. **권한 오류**: IAM 사용자 권한 확인
3. **리전 오류**: 모든 리소스가 같은 리전에 있는지 확인

### 로그 확인
```bash
# CDK 배포 로그
cdk deploy --verbose

# Lambda 함수 로그
aws logs describe-log-groups
aws logs tail /aws/lambda/함수이름
```

## 🧹 리소스 정리

배포된 리소스 삭제:
```bash
cd infrastructure
cdk destroy
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. AWS 계정 한도 및 권한
2. 리전별 서비스 가용성
3. 네트워크 연결 상태
