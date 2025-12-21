# Replant 프론트엔드 API 구현 상태

## 전체 요약
✅ **모든 백엔드 API 엔드포인트에 대응하는 프론트엔드 함수가 구현되어 있습니다.**

## 구현된 API 목록

### 1. 인증 (Auth) - `src/api/authApi.ts` ✅
- ✅ `oauthLogin()` - OAuth 로그인/회원가입 (KAKAO, GOOGLE, APPLE, NAVER)
- ✅ `refreshToken()` - Access Token 갱신
- ✅ `logout()` - 로그아웃

**Google OAuth 통합 완료:**
- ✅ `src/services/googleSignIn.ts` - Google Sign-In 서비스
- ✅ `src/services/authService.ts` - OAuth 로그인 통합 서비스
- ✅ `src/screens/StartScreen.tsx` - Google 로그인 UI 구현
- ✅ Google Sign-In 패키지 설치 및 설정 완료

### 2. 사용자 (User) - `src/api/userApi.ts` ✅
- ✅ `getMyInfo()` - 내 정보 조회
- ✅ `updateMyInfo()` - 내 정보 수정
- ✅ `getUserProfile()` - 다른 유저 프로필 조회

### 3. 펫 (Reant) - `src/api/petApi.ts` ✅
- ✅ `getMyReant()` - 내 펫 조회
- ✅ `updateReant()` - 펫 정보 수정

### 4. 시스템 미션 (Mission) - `src/api/missionApi.ts` ✅
- ✅ `getSystemMissions()` - 미션 목록 조회
- ✅ `getSystemMission()` - 미션 상세 조회

**미션 리뷰:**
- ✅ `getMissionReviews()` - 리뷰 목록 조회
- ✅ `createMissionReview()` - 리뷰 작성

**미션 QnA:**
- ✅ `getMissionQnAs()` - QnA 목록 조회
- ✅ `getMissionQnADetail()` - QnA 상세 조회
- ✅ `createMissionQuestion()` - QnA 질문 작성
- ✅ `createMissionAnswer()` - QnA 답변 작성
- ✅ `acceptMissionAnswer()` - QnA 답변 채택

### 5. 커스텀 미션 (CustomMission) - `src/api/missionApi.ts` ✅
- ✅ `getCustomMissions()` - 커스텀 미션 목록 조회
- ✅ `getCustomMission()` - 커스텀 미션 상세 조회
- ✅ `createCustomMission()` - 커스텀 미션 생성
- ✅ `updateCustomMission()` - 커스텀 미션 수정
- ✅ `deleteCustomMission()` - 커스텀 미션 삭제

### 6. 내 미션 (UserMission) - `src/api/missionApi.ts` ✅
- ✅ `getUserMissions()` - 내 미션 목록 조회
- ✅ `getUserMission()` - 내 미션 상세 조회
- ✅ `addCustomMissionToMyMissions()` - 커스텀 미션 추가
- ✅ `verifyUserMission()` - GPS/TIME 인증 처리

### 7. 인증 게시판 (Verification) - `src/api/missionApi.ts` ✅
- ✅ `getVerifications()` - 인증글 목록 조회
- ✅ `getVerification()` - 인증글 상세 조회
- ✅ `createVerification()` - COMMUNITY 인증글 작성
- ✅ `updateVerification()` - 인증글 수정
- ✅ `deleteVerification()` - 인증글 삭제
- ✅ `voteVerification()` - 인증 투표

### 8. 자유 게시판 (Post/Community) - `src/api/communityApi.ts` ✅
**게시글:**
- ✅ `getPosts()` - 게시글 목록 조회
- ✅ `getPost()` - 게시글 상세 조회
- ✅ `createPost()` - 게시글 작성
- ✅ `updatePost()` - 게시글 수정
- ✅ `deletePost()` - 게시글 삭제

**댓글:**
- ✅ `getComments()` - 댓글 목록 조회
- ✅ `createComment()` - 댓글 작성
- ✅ `updateComment()` - 댓글 수정
- ✅ `deleteComment()` - 댓글 삭제

### 9. 뱃지 (Badge) - `src/api/badgeApi.ts` ✅
- ✅ `getMyBadges()` - 유효 뱃지 목록 조회
- ✅ `getBadgeHistory()` - 뱃지 히스토리 조회

### 10. 유저 추천 (Recommendation) - `src/api/recommendationApi.ts` ✅
- ✅ `getRecommendations()` - 추천 목록 조회
- ✅ `acceptRecommendation()` - 추천 수락 (채팅방 자동 생성)
- ✅ `rejectRecommendation()` - 추천 거절

### 11. 채팅 (Chat) - `src/api/chatApi.ts` ✅
- ✅ `getChatRooms()` - 채팅방 목록 조회
- ✅ `getChatRoom()` - 채팅방 상세 조회
- ✅ `getChatMessages()` - 메시지 목록 조회 (커서 기반)
- ✅ `sendMessage()` - 메시지 전송
- ✅ `markMessagesAsRead()` - 메시지 읽음 처리

### 12. 알림 (Notification) - `src/api/notificationApi.ts` ✅
- ✅ `getNotifications()` - 알림 목록 조회
- ✅ `markNotificationAsRead()` - 알림 읽음 처리
- ✅ `markAllNotificationsAsRead()` - 전체 알림 읽음 처리

## API 클라이언트 설정

### 환경 설정 - `.env`
```
API_BASE_URL=http://113.198.66.75:13150/api
GOOGLE_CLIENT_ID=510040827110-acav8fnv5ctrssmfuc0fng3hrkba54j2.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=510040827110-acav8fnv5ctrssmfuc0fng3hrkba54j2.apps.googleusercontent.com
API_TIMEOUT=10000
```

### API 클라이언트 - `src/api/client.ts`
- ✅ Axios 기반 HTTP 클라이언트
- ✅ 자동 토큰 관리 (AsyncStorage)
- ✅ 요청/응답 인터셉터
- ✅ 자동 토큰 갱신 (401 에러 시)
- ✅ 에러 핸들링

### 토큰 관리 - `src/utils/tokenStorage.ts`
- ✅ AsyncStorage를 통한 안전한 토큰 저장
- ✅ Access Token / Refresh Token 관리
- ✅ 사용자 정보 캐싱

## TypeScript 타입 정의

모든 API 요청/응답에 대한 TypeScript 인터페이스가 정의되어 있습니다:
- Request DTO 타입
- Response DTO 타입
- Enum 타입 (MissionType, VerificationType, UserMissionStatus 등)
- 페이지네이션 응답 타입

## 추가 구현 사항

### 파일 업로드 API - `src/api/fileApi.ts`
- ✅ 이미지 업로드 (S3)
- ✅ Base64 인코딩 지원

### 관리자 API - `src/api/manageApi.ts`
- ✅ 관리자 기능 (사용자 관리, 통계 등)

## 보안 기능

### 데이터 암호화 및 보안
- ✅ 모든 API 통신 HTTPS (프로덕션)
- ✅ JWT 토큰 기반 인증
- ✅ AsyncStorage를 통한 안전한 토큰 저장
- ✅ 자동 토큰 갱신
- ✅ 요청 타임아웃 설정 (10초)

### OAuth 보안
- ✅ Google OAuth 2.0 통합
- ✅ 환경 변수로 민감 정보 관리
- ✅ .gitignore에 .env 파일 등록

## 다음 단계

### 1. 백엔드 서버 실행
```bash
cd Replant-be
./gradlew clean bootJar
java -jar build/libs/Replant-BE-0.0.1-SNAPSHOT.jar
```

### 2. 프론트엔드 실행
```bash
cd Replant
npm install
npm run android
```

### 3. Android 빌드
```bash
cd android
./gradlew assembleRelease
```

### 4. 테스트 체크리스트
- [ ] Google OAuth 로그인 테스트
- [ ] 사용자 정보 조회/수정 테스트
- [ ] 미션 목록 조회 테스트
- [ ] 미션 인증 테스트
- [ ] 게시글 작성/조회 테스트
- [ ] 채팅 기능 테스트
- [ ] 알림 기능 테스트

## 참고 문서
- `BACKEND_INTEGRATION.md` - 백엔드 연동 가이드
- `OAUTH_SETUP.md` - OAuth 설정 가이드
- `API_USAGE_EXAMPLES.md` - API 사용 예제
- `DEVELOPMENT.md` - 개발 가이드
