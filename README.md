# 🌱 Replant - 청년을 위한 성장 앱

> **"쉬었음 청년을 위한 성장 앱"** - 나만의 미션으로 성장하는 캐릭터와 함께하는 심리상담 플랫폼

## 📱 앱 소개

Replant는 청년들이 자신만의 미션을 만들고 수행하며 성장할 수 있는 모바일 앱입니다.
완료한 미션으로 경험치를 얻어 캐릭터를 레벨업시키고, 심리상담 챗봇과 함께 마음의 건강도 챙겨보세요.

## ✨ 주요 기능

### 🎯 미션 시스템
- **카테고리별 미션**: 자기관리, 소통관리, 커리어관리
- **나만의 미션**: 사용자가 직접 만드는 맞춤형 미션
- **경험치 시스템**: 미션 완료로 캐릭터 레벨업

### 🤖 심리상담 챗봇
- **AI 상담사**: 24시간 언제든지 마음을 나눌 수 있는 챗봇
- **감정별 응답**: 따뜻함, 공감, 위로, 격려, 지지 등 다양한 감정 표현
- **빠른 응답**: 자주 사용하는 문구로 빠른 대화 시작

### 📖 다이어리 & 캐릭터
- **성장 기록**: 미션 수행 과정을 다이어리로 기록
- **캐릭터 도감**: 레벨업하며 변화하는 캐릭터 수집
- **개인화**: 나만의 닉네임과 성장 스토리

## 🛠️ 기술 스택

- **Frontend**: React Native
- **Backend API**: RESTful API with JWT Authentication
- **Navigation**: Custom Navigation System
- **State Management**: React Context API
- **Storage**: AsyncStorage (Token & User Data)
- **Styling**: StyleSheet with Design Tokens
- **Environment**: react-native-dotenv

## 📁 프로젝트 구조

```
src/
├── api/                # 백엔드 API 연동
│   ├── client.ts       # API 클라이언트 (자동 토큰 갱신)
│   ├── authApi.ts      # 인증 API
│   ├── userApi.ts      # 사용자 API
│   ├── petApi.ts       # 펫 API
│   ├── missionApi.ts   # 미션 API
│   ├── communityApi.ts # 커뮤니티 API
│   └── ...            # 기타 API
├── components/         # 재사용 가능한 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트
│   └── specialized/   # 특화된 컴포넌트
├── config/            # 설정 파일
│   └── apiConfig.ts   # API 엔드포인트 설정
├── screens/           # 화면 컴포넌트
├── navigation/        # 네비게이션 로직
├── services/          # 비즈니스 로직
│   └── authService.ts # OAuth 인증 서비스
├── hooks/             # 커스텀 훅
├── contexts/          # React Context
├── utils/             # 유틸리티 함수
│   └── tokenStorage.ts # 토큰 저장소
└── data/              # 정적 데이터
```

## 🚀 시작하기

### 설치
```bash
# 의존성 설치
npm install

# react-native-dotenv 설치 (환경변수 관리)
npm install react-native-dotenv

# iOS 설정 (macOS만)
cd ios && pod install && cd ..
```

### 환경 설정

1. `.env` 파일에서 백엔드 API URL 설정:
```env
API_BASE_URL=http://113.198.66.75:13150/api
API_TIMEOUT=10000
```

2. 자세한 백엔드 연동 가이드는 [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) 참고

### 실행
```bash
# Metro 서버 시작
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android
```

## 🎨 디자인 시스템

- **색상**: 파스텔 톤의 감정별 색상 팔레트
- **타이포그래피**: 일관된 폰트 크기와 가중치
- **간격**: 8px 기준의 일관된 간격 시스템
- **컴포넌트**: 재사용 가능한 UI 컴포넌트

## 📱 주요 화면

- **홈**: 캐릭터 상태와 오늘의 미션
- **미션**: 카테고리별 미션 목록 및 나만의 미션 생성
- **다이어리**: 성장 기록 및 감정 기록
- **상담**: AI 심리상담 챗봇
- **도감**: 캐릭터 컬렉션
- **설정**: 앱 설정 및 개인정보

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- **프로젝트 링크**: [https://github.com/SDA-REPLANT/Replant-FE](https://github.com/SDA-REPLANT/Replant-FE)
- **이슈 리포트**: [Issues](https://github.com/SDA-REPLANT/Replant-FE/issues)

---

**🌱 함께 성장해요!** - Replant Team
