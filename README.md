# 🎬 The Screen - 영화 예매 플랫폼

> 사용자 친화적인 영화 예매 서비스로, AI 챗봇과 다양한 소셜 로그인을 지원하는 풀스택 웹 애플리케이션

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-green)
![React](https://img.shields.io/badge/React-18-blue)
![MariaDB](https://img.shields.io/badge/MariaDB-10.6-blue)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [주요 구현 사항](#-주요-구현-사항)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [성능 최적화](#-성능-최적화)
- [트러블슈팅](#-트러블슈팅)

## 🎯 프로젝트 소개

**The Screen**은 현대적인 사용자 경험을 제공하는 영화 예매 플랫폼입니다. 실시간 영화 정보, AI 기반 추천 시스템, 그리고 편리한 소셜 로그인을 통해 사용자에게 최적의 영화 예매 서비스를 제공합니다.

### 🌟 특별한 점

- **AI 챗봇**: OpenAI GPT-3.5를 활용한 지능형 고객 지원
- **실시간 데이터**: 영화진흥위원회 API 연동으로 최신 영화 정보 제공
- **소셜 로그인**: 네이버, 카카오, 구글 간편 로그인 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

## ✨ 주요 기능

### 🎬 영화 관련 기능

- **실시간 박스오피스** 순위 조회
- **영화 상세 정보** (장르, 줄거리, 상영시간, 평점)
- **극장별 상영 스케줄** 관리
- **좌석 선택 및 예매** 시스템

### 🤖 AI 챗봇 시스템

- **자연어 처리** 기반 질문 응답
- **FAQ 자동 검색** 및 답변
- **영화 추천** 및 정보 제공
- **극장 찾기** 및 안내

### 👤 사용자 관리

- **소셜 로그인** (네이버, 카카오, 구글)
- **마이페이지** 및 예매 내역 관리
- **SMS 인증** 시스템
- **관리자 페이지** (영화/극장/예매 관리)

### 📱 사용자 경험

- **반응형 웹 디자인**
- **빠른 예매** 시스템
- **실시간 알림** 및 안내
- **직관적인 UI/UX**

## 🛠 기술 스택

### Frontend

- **React 18** - 컴포넌트 기반 UI 라이브러리
- **React Router** - SPA 라우팅
- **CSS3** - 스타일링 및 반응형 디자인
- **JavaScript ES6+** - 모던 JavaScript

### Backend

- **Java 17** - 프로그래밍 언어
- **Spring Boot 3.5.3** - 백엔드 프레임워크
- **Spring Security** - 인증 및 보안
- **Spring Data JPA** - 데이터베이스 연동
- **Gradle** - 의존성/빌드 관리 (Gradle Wrapper 포함)

### Database

- **MariaDB 10.6** - 메인 데이터베이스
- **Redis** - 세션 관리 (선택사항)

### External APIs

- **OpenAI GPT-3.5** - AI 챗봇
- **영화진흥위원회 API** - 영화 정보
- **네이버/카카오/구글** - 소셜 로그인
- **CoolSMS** - SMS 인증

### Infrastructure & DevOps

- **AWS EC2** - 서버 호스팅
- **Linux (Ubuntu)** - 서버 OS
- **systemd** - 서비스 관리
- **cron** - 스케줄링

## 🏗 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (MariaDB)     │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  External APIs  │
         └──────────────►│  - OpenAI       │
                        │  - 영화진흥위원회    │
                        │  - 소셜 로그인      │
                        │  - SMS Service  │
                        └─────────────────┘
```

## 🎯 주요 구현 사항

### 1. AI 챗봇 시스템

```java
@Service
public class ChatBotService {
    // OpenAI API 연동
    // 자연어 처리 및 응답 생성
    // 컨텍스트 기반 대화 관리
}
```

### 2. 소셜 로그인 통합

```java
@Service
public class NaverLoginService {
    // OAuth 2.0 기반 인증
    // JWT 토큰 관리
    // 사용자 정보 동기화
}
```

### 3. 실시간 영화 데이터

```java
@Service
public class MovieService {
    // 영화진흥위원회 API 연동
    // 실시간 박스오피스 데이터
    // 영화 상세 정보 관리
}
```

### 4. 예매 시스템

```java
@Service
public class ReservationService {
    // 좌석 선택 및 예약
    // 결제 시스템 연동
    // 예매 확인 및 취소
}
```

## 🚀 설치 및 실행

### 사전 요구사항

- Java 17+
- Node.js 18+ (LTS 권장)
- MariaDB 10.6+
- Gradle 로컬 설치 불필요(프로젝트에 gradlew/gradlew.bat 포함)

### 1. 저장소 클론

```bash
git clone https://github.com/Leeoc1/thescreenProject.git
cd thescreenProject
```

### 2. 환경 변수 설정

```bash
# 프로젝트 루트에 .env 파일 생성
cp .env.example .env

# API 키 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
OPENAI_API_KEY=your_openai_api_key
# ... 기타 설정
```

### 3. 데이터베이스 설정

```sql
-- MariaDB 데이터베이스 생성
CREATE DATABASE thescreen DEFAULT CHARACTER SET utf8mb4;
CREATE USER 'thescreen_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON thescreen.* TO 'thescreen_user'@'localhost';
```

### 4. 백엔드 실행

운영체제에 따라 Gradle Wrapper를 사용하세요.

```powershell
# Windows PowerShell
cd backend\thescreen
./gradlew.bat bootRun
```

```bash
# macOS/Linux
cd backend/thescreen
./gradlew bootRun
```

### 5. 프론트엔드 실행

```bash
cd front
npm install
npm start
```

### 6. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080

참고: 개발 모드에서는 CRA의 proxy(package.json의 "proxy")가 적용되지만, 프로덕션 빌드에서는 무시됩니다. 운영/스테이징 환경에서는 반드시 `REACT_APP_API_URL` 환경변수로 API 엔드포인트를 지정하세요.

## 📚 API 문서

### 영화 관련 API

```
GET /api/movies/top10        # 박스오피스 TOP 10
GET /api/movies/{id}         # 영화 상세 정보
GET /api/cinemas             # 극장 목록
GET /api/schedules           # 상영 스케줄
```

### 사용자 관리 API

```
POST /api/auth/login         # 로그인
POST /api/auth/logout        # 로그아웃
GET /api/users/profile       # 사용자 프로필
```

### 챗봇 API

```
GET /api/chatbot/ask         # 챗봇 질문
POST /api/chatbot/feedback   # 피드백 등록
```

### 예매 관련 API

```
POST /api/reservations       # 예매 생성
GET /api/reservations/{id}   # 예매 조회
DELETE /api/reservations/{id} # 예매 취소
```

## 🌐 배포

### AWS EC2 배포

```bash
# 서버 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 애플리케이션 배포
sudo systemctl start thescreen-backend
sudo systemctl start thescreen-frontend

# 서비스 상태 확인
sudo systemctl status thescreen-backend
sudo systemctl status thescreen-frontend
```

### 환경별 설정

- **개발환경**: `application-dev.properties`
- **운영환경**: `application-prod.properties`
- **테스트환경**: `application-test.properties`

프론트엔드 환경변수 예시(빌드 시 주입):

```
# front/.env (또는 .env.production)
REACT_APP_API_URL=https://api.example.com
```

백엔드 설정 예시 파일:

```
backend/thescreen/src/main/resources/application-dev.properties.example
backend/thescreen/src/main/resources/application-prod.properties.example
```

## ⚡ 성능 최적화

### JVM 튜닝

```bash
# 최적화된 JVM 옵션
-Xmx320m -Xms150m
-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m
-XX:+UseG1GC -XX:G1HeapRegionSize=16m
```

### 메모리 관리

```bash
# 자동 메모리 정리 (cron job)
0 3,12,21 * * * root sync && sysctl vm.drop_caches=3
```

주의: 운영 환경에서 주기적인 캐시 강제 해제는 일반적으로 권장되지 않습니다. 일시적 진단 목적으로만 사용하고, 근본 원인 분석과 애플리케이션/쿼리 최적화를 우선하세요.

### 데이터베이스 최적화

- 인덱스 최적화
- 쿼리 성능 튜닝
- 커넥션 풀 설정

## 🔧 트러블슈팅

### 자주 발생하는 문제들

#### 1. CORS 오류

```java
// WebConfig.java에서 CORS 설정 확인
@CrossOrigin(origins = "http://localhost:3000")
```

#### 2. 메모리 부족

```bash
# JVM 힙 메모리 확인
jstat -gc $(pgrep java)

# 메모리 사용량 모니터링
free -h
```

#### 3. API 키 오류

```bash
# 환경 변수 확인
echo $OPENAI_API_KEY
echo $NAVER_CLIENT_ID
```

#### 4. 데이터베이스 연결 오류

```yaml
# application.properties 확인
spring.datasource.url=jdbc:mariadb://localhost:3306/thescreen
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 📊 모니터링

### 시스템 모니터링

```bash
# 메모리 사용량
free -h

# CPU 사용량
top -p $(pgrep java)

# 디스크 사용량
df -h
```

### 애플리케이션 로그

```bash
# Spring Boot 로그
tail -f /var/log/thescreen/application.log

# 시스템 로그
sudo journalctl -u thescreen-backend -f
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 개발자

**이채혁** - 풀스택 개발자

- GitHub: [@Leeoc1](https://github.com/Leeoc1)
- Email: lch5752@gmail.com
