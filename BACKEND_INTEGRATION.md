# 백엔드 연동 가이드

## 개요
이 문서는 Replant 프론트엔드를 백엔드 API와 완전히 연동하는 방법을 설명합니다.

## 목차
1. [환경 설정](#환경-설정)
2. [필수 패키지 설치](#필수-패키지-설치)
3. [환경변수 설정](#환경변수-설정)
4. [API 클라이언트 구조](#api-클라이언트-구조)
5. [OAuth 로그인 연동](#oauth-로그인-연동)
6. [토큰 관리](#토큰-관리)
7. [API 사용 예제](#api-사용-예제)
8. [문제 해결](#문제-해결)

---

## 환경 설정

### 필수 패키지 설치

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```bash
npm install react-native-dotenv
```

패키지가 이미 설치되어 있는지 확인:
```bash
npm list @react-native-async-storage/async-storage
```

---

## 환경변수 설정

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일이 생성되어 있습니다. 필요에 따라 수정하세요:

```env
# 개발 환경 - 실제 서버
API_BASE_URL=http://113.198.66.75:13150/api

# 또는 로컬 서버 사용 시
# API_BASE_URL=http://localhost:8080/api

# API 타임아웃 (밀리초)
API_TIMEOUT=10000
```

### 2. 환경별 설정

- **개발 환경**: `.env` 파일 사용
- **프로덕션**: `.env.production` 파일 생성 (별도 설정 필요)

---

## API 클라이언트 구조

### 파일 구조

```
src/
├── api/
│   ├── client.ts              # API 클라이언트 (자동 토큰 갱신 포함)
│   ├── authApi.ts             # 인증 API
│   ├── userApi.ts             # 사용자 API
│   ├── petApi.ts              # 펫 API
│   ├── missionApi.ts          # 미션 API (시스템/커스텀/내미션/인증)
│   ├── communityApi.ts        # 커뮤니티 API (자유게시판)
│   ├── badgeApi.ts            # 뱃지 API
│   ├── recommendationApi.ts   # 유저 추천 API
│   ├── chatApi.ts             # 채팅 API
│   ├── notificationApi.ts     # 알림 API
│   └── index.ts               # API 통합 export
├── config/
│   └── apiConfig.ts           # API 설정 (baseURL, endpoints)
├── services/
│   └── authService.ts         # 인증 서비스 (OAuth 로그인)
└── utils/
    └── tokenStorage.ts        # 토큰 저장소 (AsyncStorage)
```

### API 클라이언트 특징

1. **자동 토큰 관리**:
   - Access Token 자동 로드
   - 401 에러 시 자동 토큰 갱신
   - 갱신 실패 시 자동 로그아웃

2. **타입 안정성**: TypeScript로 모든 API 타입 정의

3. **에러 처리**: 일관된 에러 응답 형식

---

## OAuth 로그인 연동

### 지원하는 OAuth Provider

- Kakao
- Google
- Naver
- Apple

### 로그인 플로우

```typescript
import { loginWithOAuth } from '../services/authService';

// 1. OAuth Provider에서 Access Token 획득 (각 SDK 사용)
const providerAccessToken = 'oauth_provider_access_token';

// 2. 백엔드 로그인 API 호출
const result = await loginWithOAuth('KAKAO', providerAccessToken);

if (result.success && result.data) {
  const { user, isNewUser } = result.data;

  // 3. 신규 회원 여부 확인
  if (isNewUser) {
    // 신규 회원 온보딩 화면으로 이동
    navigation.navigate('Onboarding');
  } else {
    // 기존 회원 메인 화면으로 이동
    navigation.navigate('MainTabs');
  }
} else {
  // 로그인 실패 처리
  console.error('Login failed:', result.error);
}
```

### 자동 로그인

앱 시작 시 저장된 토큰으로 자동 로그인:

```typescript
import { initializeAuth, getCurrentUser } from '../services/authService';

// App.tsx 또는 초기 화면에서
useEffect(() => {
  const checkAuth = async () => {
    const isLoggedIn = await initializeAuth();

    if (isLoggedIn) {
      const user = await getCurrentUser();
      console.log('Logged in as:', user?.nickname);
      // 메인 화면으로 이동
    } else {
      // 로그인 화면으로 이동
    }
  };

  checkAuth();
}, []);
```

---

## 토큰 관리

### 토큰 저장소 (tokenStorage.ts)

AsyncStorage를 사용하여 토큰을 안전하게 저장합니다:

```typescript
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthData,
  isLoggedIn,
} from '../utils/tokenStorage';

// 토큰 저장
await saveTokens(accessToken, refreshToken);

// 토큰 조회
const accessToken = await getAccessToken();
const refreshToken = await getRefreshToken();

// 로그인 상태 확인
const loggedIn = await isLoggedIn();

// 로그아웃 (토큰 삭제)
await clearAuthData();
```

### 자동 토큰 갱신

API 클라이언트가 자동으로 처리:
- 401 Unauthorized 응답 시 자동으로 Refresh Token으로 토큰 갱신
- 갱신된 토큰으로 원래 요청 재시도
- 갱신 실패 시 자동 로그아웃 처리

---

## API 사용 예제

### 1. 사용자 정보 조회

```typescript
import { getMyInfo } from '../api/userApi';

const fetchUserInfo = async () => {
  const result = await getMyInfo();

  if (result.success && result.data) {
    console.log('User info:', result.data);
  } else {
    console.error('Failed to fetch user info:', result.error);
  }
};
```

### 2. 내 펫 조회

```typescript
import { getMyReant } from '../api/petApi';

const fetchMyPet = async () => {
  const result = await getMyReant();

  if (result.success && result.data) {
    console.log('My pet:', result.data);
  }
};
```

### 3. 시스템 미션 목록 조회

```typescript
import { getSystemMissions } from '../api/missionApi';

const fetchMissions = async () => {
  const result = await getSystemMissions({
    type: 'DAILY',
    page: 0,
    size: 20,
  });

  if (result.success && result.data) {
    console.log('Missions:', result.data.content);
  }
};
```

### 4. 미션 인증 (GPS)

```typescript
import { verifyUserMission } from '../api/missionApi';

const verifyMission = async (userMissionId: number) => {
  const result = await verifyUserMission(userMissionId, {
    type: 'GPS',
    latitude: 37.5665,
    longitude: 126.9780,
  });

  if (result.success && result.data) {
    console.log('Verification result:', result.data);
    console.log('Rewards:', result.data.rewards);
  }
};
```

### 5. 게시글 작성

```typescript
import { createPost } from '../api/communityApi';

const writePost = async () => {
  const result = await createPost({
    missionId: 15, // 미션 태그 (선택)
    title: '오늘 산책 후기',
    content: '공원이 너무 좋았어요!',
    imageUrls: ['https://...'],
  });

  if (result.success && result.data) {
    console.log('Post created:', result.data);
  }
};
```

### 6. 채팅 메시지 전송

```typescript
import { sendMessage } from '../api/chatApi';

const sendChatMessage = async (roomId: number, message: string) => {
  const result = await sendMessage(roomId, {
    content: message,
  });

  if (result.success && result.data) {
    console.log('Message sent:', result.data);
  }
};
```

---

## 백엔드 API 명세 확인

전체 API 명세는 다음 파일에서 확인할 수 있습니다:
- **백엔드 API 명세**: `../Replant-be/API_SPEC.md`

---

## 문제 해결

### 1. 환경변수가 인식되지 않을 때

```bash
# 캐시 삭제
npm start -- --reset-cache

# Metro Bundler 재시작
npx react-native start --reset-cache
```

### 2. TypeScript 에러 발생 시

```bash
# TypeScript 캐시 삭제
rm -rf node_modules/.cache

# 다시 빌드
npm run android  # 또는 npm run ios
```

### 3. AsyncStorage 관련 에러

```bash
# iOS
cd ios && pod install && cd ..

# Android - 캐시 삭제 후 재빌드
cd android && ./gradlew clean && cd ..
npm run android
```

### 4. 네트워크 연결 오류

- Android 에뮬레이터에서 localhost 접근 시:
  ```
  API_BASE_URL=http://10.0.2.2:8080/api
  ```

- iOS 시뮬레이터에서는 localhost 사용 가능:
  ```
  API_BASE_URL=http://localhost:8080/api
  ```

### 5. CORS 에러

백엔드에서 CORS 설정 확인 필요. React Native는 브라우저가 아니므로 일반적으로 CORS 문제가 발생하지 않지만, 개발 서버 설정을 확인하세요.

---

## 추가 참고 자료

- [React Native AsyncStorage 문서](https://react-native-async-storage.github.io/async-storage/)
- [React Native Dotenv 문서](https://github.com/goatandsheep/react-native-dotenv)
- [프로젝트 개발 가이드](./DEVELOPMENT.md)

---

## 연락처

문제가 발생하거나 질문이 있으면 백엔드 팀에 문의하세요.
