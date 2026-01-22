# 🌱 Replant App

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54.0.30-000020?logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **"쉬었음 청년을 위한 성장 앱"** - 나만의 미션으로 성장하는 캐릭터와 함께하는 심리상담 플랫폼

---

## 📱 주요 기능

**1. 미션을 만들어요!**  
카테고리별 미션을 선택하거나 나만의 맞춤형 미션을 생성해보세요.

**2. 캐릭터와 함께 성장해요!**  
미션을 완료하면 경험치를 얻고, 레벨업하며 변화하는 캐릭터를 만나보세요.

**3. AI 상담사와 대화해요!**  
24시간 언제든지 마음을 나눌 수 있는 심리상담 챗봇과 함께하세요.

**4. 커뮤니티에서 소통해요!**  
다른 사용자들과 미션 인증을 공유하고 서로 응원해요.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App Navigator                         │
│              (Custom State-based Navigation)             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   Screens      │  │   Components   │  │   Services     │
│                │  │                │  │                │
│ - Home         │  │ - UI           │  │ - Auth         │
│ - Mission      │  │ - Specialized  │  │ - API Client   │
│ - Diary        │  │ - Overlays     │  │ - Storage      │
│ - Community    │  │                │  │                │
│ - Chat         │  │                │  │                │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │          Context & Hooks               │
        │                                        │
        │ - UserContext                          │
        │ - OverlayContext                       │
        │ - SseContext                           │
        │ - Custom Hooks                         │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │            API Client                  │
        │                                        │
        │ - RESTful API                          │
        │ - JWT Authentication                   │
        │ - Auto Token Refresh                  │
        └───────────────────────────────────────┘
```

---

## Stack & Libraries

### Core
- **React Native** 0.81.4
- **TypeScript** 5.8.3
- **Expo** 54.0.30
- **React** 19.1.0

### Navigation & State
- Custom Navigation System (State-based)
- React Context API
- Custom Hooks

### UI & Styling
- React Native StyleSheet
- Design Tokens System
- FastImage
- Custom UI Components

### Authentication
- Kakao Login (`@react-native-seoul/kakao-login`)
- Google Sign-In (`@react-native-google-signin/google-signin`)
- JWT Token Management

### Storage & Data
- AsyncStorage (`@react-native-async-storage/async-storage`)
- DataStore Pattern

### Media & Files
- Image Picker (`react-native-image-picker`)
- Camera Roll (`@react-native-camera-roll/camera-roll`)
- View Shot (`react-native-view-shot`)

### Network
- Custom API Client (Retrofit2-like)
- OkHttp3 Pattern
- SSE (`react-native-sse`)

### Location & Services
- Expo Location (`expo-location`)
- Places Search Service

### Development Tools
- ESLint
- Prettier
- Jest
- TypeScript Config

---

## Contributors

<!-- Contributors 섹션은 프로젝트에 기여한 개발자 정보를 추가하세요 -->

---

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
npm install

# iOS 설정 (macOS만)
cd ios && pod install && cd ..
```

### 환경 설정

#### 1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 `.env.example`을 참고하여 다음 내용을 추가하세요:

```env
# 백엔드 API URL
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=10000

# OAuth 설정
KAKAO_APP_KEY=your_kakao_app_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id

# Amplitude Analytics
AMPLITUDE_API_KEY=your_amplitude_api_key_here
```

> **⚠️ 중요**: 실제 API 키 값은 팀 리더에게 문의하거나 보안 채널을 통해 받으세요.

#### 2. Android 키스토어 설정 (릴리즈 빌드용)

`android/local.properties.example` 파일을 복사하여 `android/local.properties`를 생성하세요:

```bash
cp android/local.properties.example android/local.properties
```

그 후 `android/local.properties` 파일을 열어 다음을 설정하세요:
- Android SDK 경로 (자동 감지되거나 Android Studio가 설정)
- 키스토어 비밀번호 (팀 리더에게 문의)

> **⚠️ 중요**: `local.properties` 파일은 Git에 추적되지 않습니다. 각 개발자가 로컬에 생성해야 합니다.

### 실행

```bash
# Metro 서버 시작
npm start

# Android 에뮬레이터
npm run android

# iOS 시뮬레이터 (macOS만)
npm run ios
```

---

## 📁 프로젝트 구조

```
src/
├── api/                # 백엔드 API 연동
│   ├── client.ts       # API 클라이언트 (자동 토큰 갱신)
│   ├── authApi.ts      # 인증 API
│   ├── userApi.ts       # 사용자 API
│   ├── petApi.ts        # 펫 API
│   ├── missionApi.ts    # 미션 API
│   └── ...
├── components/         # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   └── specialized/    # 특화된 컴포넌트
├── screens/            # 화면 컴포넌트
├── navigation/         # 네비게이션 로직
├── services/           # 비즈니스 로직
├── hooks/              # 커스텀 훅
├── contexts/           # React Context
├── utils/              # 유틸리티 함수
└── types/              # TypeScript 타입 정의
```

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

**🌱 함께 성장해요!** - Replant Team
