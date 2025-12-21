# OAuth 설정 가이드

## Google OAuth 설정 완료 사항

### 1. 프론트엔드 설정

#### 패키지 설치
```bash
npm install @react-native-google-signin/google-signin react-native-dotenv
```

#### 환경 변수 (.env)
```
GOOGLE_CLIENT_ID=510040827110-acav8fnv5ctrssmfuc0fng3hrkba54j2.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=510040827110-acav8fnv5ctrssmfuc0fng3hrkba54j2.apps.googleusercontent.com
```

#### 구현된 기능
- `src/services/googleSignIn.ts`: Google Sign-In 서비스
- `src/services/authService.ts`: OAuth 로그인 통합 서비스
- `src/screens/StartScreen.tsx`: Google 로그인 버튼 및 로직
- `App.tsx`: Google Sign-In 초기화

### 2. Android 설정 필요사항

#### SHA-1 인증서 지문 등록
Google Cloud Console에 다음 SHA-1 지문을 등록해야 합니다:

```bash
# Debug 키스토어 SHA-1 확인
cd android
./gradlew signingReport
```

#### google-services.json (필요시)
Firebase를 사용하는 경우 `android/app/google-services.json` 파일 추가 필요

### 3. 백엔드 OAuth API

#### 필요한 엔드포인트
- `POST /api/auth/oauth/GOOGLE`: Google OAuth 로그인/회원가입
- `POST /api/auth/refresh`: 토큰 갱신
- `POST /api/auth/logout`: 로그아웃

#### 요청 형식
```json
{
  "accessToken": "Google Access Token from Google Sign-In"
}
```

#### 응답 형식
```json
{
  "accessToken": "JWT Access Token",
  "refreshToken": "JWT Refresh Token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "사용자",
    "profileImg": "https://..."
  },
  "isNewUser": false
}
```

### 4. 보안 설정

#### 데이터 암호화
- 모든 토큰은 AsyncStorage에 안전하게 저장
- HTTPS 통신 필수
- 민감한 정보는 .env 파일로 관리 (.gitignore에 추가)

#### 권장 사항
- 프로덕션 환경에서는 별도의 keystore 사용
- API 키는 환경별로 분리 관리
- 백엔드 CORS 설정 확인

### 5. 테스트

#### 로컬 테스트
1. 백엔드 서버 실행: `http://localhost:8080`
2. React Native 앱 실행: `npm run android`
3. Google 로그인 버튼 클릭
4. Google 계정 선택 및 로그인
5. 백엔드 API 응답 확인

#### 프로덕션 배포 전 체크리스트
- [ ] Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
- [ ] SHA-1 인증서 지문 등록
- [ ] 백엔드 OAuth API 구현 및 테스트
- [ ] 프로덕션 keystore 생성 및 적용
- [ ] .env 파일에 프로덕션 환경 변수 설정
- [ ] Google Play Console에 앱 등록

## 문제 해결

### Google Sign-In 실패
- SHA-1 인증서가 Google Cloud Console에 등록되어 있는지 확인
- GOOGLE_WEB_CLIENT_ID가 올바른지 확인
- Google Play Services가 설치되어 있는지 확인 (실제 기기 또는 에뮬레이터)

### 백엔드 연결 실패
- API_BASE_URL이 올바른지 확인
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인 (백엔드)
- 네트워크 연결 확인

### 토큰 저장/불러오기 실패
- AsyncStorage 권한 확인
- AndroidManifest.xml에 필요한 권한 추가
