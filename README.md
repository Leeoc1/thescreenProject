# 🎬 TheScreen Project

영화 예매 시스템 웹 애플리케이션

## 🛠 기술 스택

### Frontend

- **React.js**: 사용자 인터페이스 구축
- **JavaScript ES6+**: 모던 JavaScript 활용
- **CSS3**: 스타일링 및 반응형 디자인
- **Axios**: HTTP 클라이언트 라이브러리

### Backend

- **Spring Boot**: Java 기반 백엔드 프레임워크
- **MariaDB**: 주 데이터베이스 (사용자, 영화, 예매 등)
- **Redis**: 세션 관리 및 SMS 인증 캐싱
- **JPA/Hibernate**: ORM (Object-Relational Mapping)
- **Gradle**: 빌드 도구

## 📁 프로젝트 구조

```
thescreenProject/
├── backend/
│   └── thescreen/
│       ├── src/main/java/com/          # Java 소스 코드
│       ├── src/main/resources/         # 리소스 파일
│       │   ├── application.properties  # 애플리케이션 설정
│       │   ├── data.sql               # 초기 데이터
│       │   └── schema.sql             # 데이터베이스 스키마
│       └── build.gradle               # Gradle 빌드 설정
└── front/
    ├── public/                        # 정적 파일
    ├── src/
    │   ├── components/                # 재사용 가능한 컴포넌트
    │   ├── pages/                     # 페이지 컴포넌트
    │   │   ├── HomePage/              # 메인 페이지
    │   │   ├── LoginPage/             # 로그인 페이지
    │   │   ├── RegisterPage/          # 회원가입 페이지
    │   │   ├── MoviePage/             # 영화 목록 페이지
    │   │   ├── MovieInfoPage/         # 영화 상세 정보
    │   │   ├── reservation/           # 예매 관련 페이지
    │   │   ├── MyPage/                # 마이페이지
    │   │   ├── AdminPage/             # 관리자 페이지
    │   │   ├── TheaterPage/           # 극장 정보 페이지
    │   │   ├── EventPage/             # 이벤트 페이지
    │   │   └── NoticePage/            # 공지사항 페이지
    │   ├── api/                       # API 통신 모듈
    │   ├── shared/                    # 공통 컴포넌트
    │   └── utils/                     # 유틸리티 함수
    └── package.json                   # npm 패키지 설정
```

## 🌟 주요 기능

### 👤 사용자 기능

- **회원가입/로그인**: 이메일 및 소셜 로그인 (네이버, 카카오, 구글)
- **영화 조회**: 현재 상영작 및 예정작 정보 확인
- **영화 예매**: 극장, 날짜, 시간, 좌석 선택
- **예매 내역 관리**: 예매 확인, 취소, 변경
- **마이페이지**: 개인정보 수정, 예매 내역 확인
- **쿠폰 관리**: 할인 쿠폰 사용 및 관리
- **알림 서비스**: SMS를 통한 예매 확인 알림

### 👨‍💼 관리자 기능

- **영화 관리**: 영화 등록, 수정, 삭제
- **극장 관리**: 극장 및 상영관 정보 관리
- **상영 스케줄 관리**: 영화 상영 시간표 설정
- **사용자 관리**: 회원 정보 조회 및 관리
- **예매 현황 분석**: 통계 및 리포트
- **쿠폰 발행**: 할인 쿠폰 생성 및 관리
- **공지사항 관리**: 사이트 공지사항 작성

## 📱 페이지 구성

1. **메인 페이지**: 추천 영화, 이벤트 배너, 빠른 예매
2. **영화 페이지**: 현재 상영작/예정작 목록
3. **영화 상세**: 영화 정보, 트레일러, 리뷰, 예매하기
4. **예매 페이지**: 극장 → 날짜/시간 → 좌석 선택 → 결제
5. **로그인/회원가입**: 일반 및 소셜 로그인
6. **마이페이지**: 예매 내역, 개인정보 수정
7. **극장 페이지**: 극장 위치, 시설 안내
8. **이벤트/공지**: 진행중인 이벤트 및 공지사항
9. **관리자 페이지**: 시스템 전체 관리

## 🚀 설치 방법

### 1. MariaDB 설치 및 설정

#### Windows

```powershell
# Chocolatey를 통한 설치 (권장)
choco install mariadb

# 또는 공식 사이트에서 MSI 설치 프로그램 다운로드
# https://mariadb.org/download/
```

#### macOS

```bash
# Homebrew를 통한 설치
brew install mariadb
brew services start mariadb
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 2. 데이터베이스 생성

```sql
-- MariaDB 접속
mysql -u root -p

-- 데이터베이스 생성
CREATE DATABASE thescreen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 부여 (선택사항)
CREATE USER 'thescreen_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON thescreen.* TO 'thescreen_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Redis 설치 (SMS 기능 사용 시)

#### Docker를 이용한 Redis 설치 (권장)

```powershell
# Docker Desktop 설치 후
docker pull redis:latest
docker run -d -p 6379:6379 --name redis-server redis:latest

# Redis 컨테이너 상태 확인
docker ps
```

#### Windows (직접 설치)

```powershell
# Chocolatey를 통한 설치
choco install redis-64
```

### 4. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_NAME=thescreen
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# 외부 API 키
OPENAI_API_KEY=your_openai_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
COOLSMS_API_KEY=your_coolsms_api_key
COOLSMS_API_SECRET=your_coolsms_api_secret
KOBIS_API_KEY=your_kobis_api_key
KMDB_API_KEY=your_kmdb_api_key
KAKAO_MAP_API_KEY=your_kakao_map_api_key

# 기타 설정
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### 5. 애플리케이션 실행

#### Backend 실행

```powershell
cd backend/thescreen
./gradlew bootRun
# 또는 IDE에서 ThescreenApplication 실행
```

#### Frontend 실행

```powershell
cd front
npm install
npm start
```

## 🗄 데이터베이스 정보

### 주요 테이블

- **Users**: 사용자 정보 (일반/소셜 로그인)
- **Movies**: 영화 정보 및 메타데이터
- **Cinemas**: 극장 및 상영관 정보
- **Showtimes**: 상영 스케줄
- **Reservations**: 예매 정보
- **Seats**: 좌석 정보 및 예매 상태
- **Coupons**: 쿠폰 및 할인 정보
- **Reviews**: 영화 리뷰
- **Notices**: 공지사항
- **Events**: 이벤트 정보

### Vector Database

- AI 챗봇 기능을 위한 임베딩 데이터 저장
- OpenAI Embeddings API 연동

## 🔗 외부 API 연동

### 🔐 소셜 로그인

- **Naver Login API**: 네이버 계정 연동
- **Kakao Login API**: 카카오 계정 연동
- **Google OAuth 2.0**: 구글 계정 연동

### 🎬 영화 데이터

- **KOBIS API**: 영화진흥위원회 박스오피스 정보
- **KMDB API**: 한국영화데이터베이스 상세 정보

### 🤖 AI 서비스

- **OpenAI GPT API**: 챗봇 대화 생성
- **OpenAI Embeddings API**: 텍스트 임베딩 벡터화

### 📱 알림 및 통신

- **CoolSMS API**: SMS 발송 서비스

### 🗺 위치 및 지도

- **Kakao Map API**: 극장 위치 표시 및 길찾기

## 📡 API 구조

프론트엔드는 다음과 같은 API 모듈로 구성되어 있습니다:

- **adminApi.js**: 관리자 기능 API
- **movieApi.js**: 영화 정보 API
- **reservationApi.js**: 예매 관련 API
- **userApi.js**: 사용자 관리 API
- **cinemaApi.js**: 극장 관련 API
- **couponApi.js**: 쿠폰 관리 API
- **smsApi.js**: SMS 알림 API

## 🎨 UI/UX 특징

- 반응형 디자인으로 모바일 및 데스크톱 환경 지원
- 직관적인 네비게이션과 사용자 친화적 인터페이스
- Toast 알림 시스템으로 사용자 피드백 제공
- 모달을 통한 백 네비게이션 처리

## 🔧 개발 진행 사항

현재 프로젝트는 개발 중이며, 다음과 같은 기능들이 구현되어 있습니다:

- ✅ 기본적인 CRUD 기능
- ✅ 사용자 인증 시스템
- ✅ 예매 시스템 기초 구조
- 🔄 결제 시스템 (카카오페이 템플릿 포함)
- 🔄 관리자 페이지 고도화

## 📞 문의 사항

프로젝트에 대한 문의 사항이 있으시면 GitHub 이슈를 통해 연락해주세요.
