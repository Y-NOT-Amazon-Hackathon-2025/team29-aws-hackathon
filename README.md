

![AWS Hackathon](https://img.shields.io/badge/AWS-Hackathon-orange?logo=amazonaws)
![Status](https://img.shields.io/badge/status-developing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

> **AI 기반 맞춤형 자격증 커리큘럼 생성 서비스**  
> 사용자가 학습 기간과 하루 공부 시간을 입력하면, 난이도(상/중/하)에 따라 최적화된 **AI 학습 플랜**을 제공합니다.  
> AWS Bedrock + Amazon Q Developer Hackathon 2025 출품작 🎉

---

## 📖 어플리케이션 개요

**AI 쿼리큘럼(Y-NOT?)**은 자격증 정보를 한눈에 보고, AI가 자동으로 학습 계획을 짜주는 웹 애플리케이션입니다.  
- **문제의식**: 기존 자격증 사이트는 단순 정보 제공에 그쳐, 개별 학습자 수준·시간에 맞는 커리큘럼이 없음  
- **해결방법**: AWS Bedrock 기반 AI가 난이도별(상/중/하) 학습 로드맵과 추천 자료를 자동으로 제안  

---

## 🔑 주요 기능

- **회원가입/로그인** : Amazon Cognito 인증
- **자격증 정보 확인** : 시험 개요, 합격 기준, 과목별 정보 제공
- **AI 커리큘럼 생성**  
  - 입력: 시험명, 학습 기간, 하루 학습 시간  
  - 출력: 난이도별(상/중/하) 주차별 학습계획(JSON)
- **추천 자료 제공 (RAG 기반)**  
  - S3 + Knowledge Bases → Titan Embeddings 검색  
  - 추천 도서 / 영상 강의 자동 매칭
- **나의 학습 계획 저장** : DynamoDB 연동, 재확인 가능
- **안전성** : Guardrails 적용 (부적절 답변/개인정보 차단)

---
