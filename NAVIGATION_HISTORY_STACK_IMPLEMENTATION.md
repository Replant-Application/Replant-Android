# 커스텀 히스토리 스택 네비게이션 구현 문서

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [문제점 정리](#문제점-정리)
3. [구현 방안](#구현-방안)
4. [상세 구현 계획](#상세-구현-계획)
5. [특수 케이스 처리](#특수-케이스-처리)
6. [마이그레이션 전략](#마이그레이션-전략)

---

## 현재 구조 분석

### 1. 네비게이션 아키텍처

**현재 상태:**
- React Navigation 라이브러리는 설치되어 있으나 **실제로 사용하지 않음**
- 커스텀 상태 기반 네비게이션 구현 (`AppNavigator.tsx`)
- 단일 `currentScreen` 상태로 현재 화면 관리
- `navigationParams` 상태로 화면 간 파라미터 전달

**핵심 상태:**
```typescript
const [currentScreen, setCurrentScreen] = useState<string | null>(null);
const [navigationParams, setNavigationParams] = useState({});
const navigationParamsRef = useRef<any>({}); // 즉시 접근용 ref
```

### 2. 화면 전환 메커니즘

**navigate 함수:**
```typescript
const navigate = async (screenName: string, params: any = {}) => {
  navigationParamsRef.current = params || {};
  setNavigationParams(params || {});
  setCurrentScreen(screenName);
};
```

**특징:**
- 히스토리를 추적하지 않음
- 이전 화면 정보가 없음
- params는 ref와 state에 이중 저장 (race condition 방지)

### 3. goBack 함수 분석

**현재 구현:**
- 40+ 줄의 하드코딩된 if-else 문
- 각 화면별로 고정된 뒤로가기 목적지 정의
- 메인 탭 화면 간 전환은 히스토리 없이 직접 이동

**하드코딩된 매핑:**
```typescript
// 예시
if (currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
  setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
} else if (currentScreen === SCREEN_NAMES.COUNSELING_SELECT || ...) {
  setCurrentScreen(SCREEN_NAMES.SETTINGS);
}
// ... 30개 이상의 화면 매핑
```

### 4. 메인 탭 화면 처리

**메인 탭 화면 (5개):**
- `HOME`, `MISSION`, `COMMUNITY`, `DIARY`, `SETTINGS`

**특징:**
- 하단 탭 바에서 직접 전환 가능
- 메인 탭 간 전환은 히스토리에 추가하지 않음 (애니메이션 없음)
- 메인 탭에서 다른 화면으로 이동 시 히스토리 추가 필요

### 5. 특수 케이스

**1. SPONTANEOUS_MISSION_SETUP (설문 화면)**
- 일반 화면처럼 처리 (특수 처리 없음)
- 뒤로가기 시 홈으로 이동
- 로그인 후 자동 이동 가능 (setCurrentScreen 직접 호출)

**2. 하드웨어 뒤로가기 (Android)**
- 메인 탭 화면: 두 번 눌러서 앱 종료
- 상세 화면: `goBack()` 호출
- 별도의 하드코딩된 매핑 사용 (소프트웨어 뒤로가기와 동일)

**3. 로그인/인증 화면**
- 별도의 `renderAuthScreen()` 함수로 처리
- 히스토리 관리가 필요 없을 수 있음 (선택적)

**4. 알림 기반 화면 전환**
- SSE/FCM 알림 수신 시 특정 화면으로 자동 이동
- 히스토리에 추가해야 하는지 확인 필요

### 6. Params 전달 방식

**현재 구조:**
```typescript
// navigate 시
navigationParamsRef.current = params;  // 즉시 접근
setNavigationParams(params);              // 상태 업데이트

// route 객체 생성 시
const routeParams = Object.keys(stateParams).length > 0 
  ? stateParams 
  : refParams;  // ref 우선 사용
```

**문제점:**
- ref와 state의 동기화 문제
- 히스토리에 params가 포함되지 않음

---

## 문제점 정리

### 1. 하드코딩된 goBack 로직
- **문제**: 40+ 줄의 if-else 문으로 모든 화면의 뒤로가기 목적지 하드코딩
- **영향**: 새 화면 추가 시마다 `goBack` 함수 수정 필요
- **유지보수**: 높은 복잡도, 실수 가능성 높음

### 2. 히스토리 추적 부재
- **문제**: 화면 전환 히스토리를 추적하지 않음
- **영향**: 실제 이전 화면으로 돌아갈 수 없음
- **사용자 경험**: 예상과 다른 화면으로 이동 가능

### 3. 메인 탭 처리 복잡성
- **문제**: 메인 탭 간 전환과 상세 화면 전환의 구분이 모호
- **영향**: 히스토리 관리 로직이 복잡해짐
- **요구사항**: 메인 탭 간 전환은 히스토리에 추가하지 않아야 함

### 4. Params 히스토리 미포함
- **문제**: 이전 화면의 params 정보가 히스토리에 없음
- **영향**: 뒤로가기 시 이전 params로 복원 불가
- **사용 사례**: 검색 결과 화면 → 상세 화면 → 뒤로가기 시 검색 결과 유지 필요

### 5. 하드웨어 뒤로가기 중복 로직
- **문제**: 소프트웨어 뒤로가기와 하드웨어 뒤로가기가 별도 로직
- **영향**: 두 로직의 동기화 필요
- **위험**: 불일치 시 버그 발생 가능

---

## 구현 방안

### 선택: 커스텀 히스토리 스택 구현

**이유:**
1. 현재 구조를 크게 바꾸지 않음
2. 점진적 마이그레이션 가능
3. 기존 코드와의 호환성 유지
4. React Navigation 도입보다 리스크 낮음

---

## 상세 구현 계획

### 1. 데이터 구조 설계

#### 1.1 히스토리 엔트리 타입
```typescript
interface HistoryEntry {
  screen: string;           // 화면 이름
  params: any;              // 화면 파라미터
  timestamp: number;        // 전환 시각 (디버깅용)
}
```

#### 1.2 히스토리 스택 상태
```typescript
const [screenHistory, setScreenHistory] = useState<HistoryEntry[]>([]);
```

#### 1.3 현재 화면 정보 확장
```typescript
// 기존
const [currentScreen, setCurrentScreen] = useState<string | null>(null);
const [navigationParams, setNavigationParams] = useState({});

// 유지 (하위 호환성)
// 히스토리에서 자동으로 동기화
```

### 2. navigate 함수 개선

#### 2.1 기본 로직
```typescript
const navigate = async (screenName: string, params: any = {}) => {
  // 1. 현재 화면이 있으면 히스토리에 추가
  if (currentScreen) {
    const historyEntry: HistoryEntry = {
      screen: currentScreen,
      params: { ...navigationParams },  // 현재 params 저장
      timestamp: Date.now(),
    };
    
    setScreenHistory(prev => {
      // 메인 탭 간 전환은 히스토리에 추가하지 않음
      if (isMainTabScreen(currentScreen) && isMainTabScreen(screenName)) {
        return prev;  // 히스토리 변경 없음
      }
      return [...prev, historyEntry];
    });
  }
  
  // 2. params 설정
  navigationParamsRef.current = params || {};
  setNavigationParams(params || {});
  
  // 3. 화면 전환
  setCurrentScreen(screenName);
};
```

#### 2.2 메인 탭 전환 처리
```typescript
// 메인 탭 간 전환은 히스토리에 추가하지 않음
// 이유: 사용자가 탭을 직접 선택한 것이므로 히스토리로 간주하지 않음
if (isMainTabScreen(currentScreen) && isMainTabScreen(screenName)) {
  // 히스토리 추가 없이 바로 전환
  setNavigationParams(params || {});
  setCurrentScreen(screenName);
  return;
}
```

#### 2.3 히스토리 최대 길이 제한
```typescript
const MAX_HISTORY_LENGTH = 50;  // 메모리 관리

setScreenHistory(prev => {
  const newHistory = [...prev, historyEntry];
  // 최대 길이 초과 시 오래된 항목 제거
  if (newHistory.length > MAX_HISTORY_LENGTH) {
    return newHistory.slice(-MAX_HISTORY_LENGTH);
  }
  return newHistory;
});
```

### 3. goBack 함수 개선

#### 3.1 기본 로직
```typescript
const goBack = () => {
  // 1. 히스토리가 있으면 마지막 항목으로 이동
  if (screenHistory.length > 0) {
    const lastEntry = screenHistory[screenHistory.length - 1];
    
    // 히스토리에서 제거
    setScreenHistory(prev => prev.slice(0, -1));
    
    // 이전 화면으로 복원
    setCurrentScreen(lastEntry.screen);
    setNavigationParams(lastEntry.params);
    navigationParamsRef.current = lastEntry.params;
    
    return;
  }
  
  // 2. 히스토리가 없으면 폴백 로직 (기존 하드코딩된 매핑)
  // 이는 초기 진입이나 특수 상황을 위한 안전장치
  fallbackGoBack();
};
```

#### 3.2 폴백 로직 (기존 하드코딩 유지)
```typescript
const fallbackGoBack = () => {
  // 기존 하드코딩된 매핑을 함수로 분리
  // 히스토리가 없을 때만 사용 (초기 진입, 특수 상황)
  // 현재 goBack 함수의 하드코딩된 로직을 그대로 유지
  
  if (currentScreen === SCREEN_NAMES.PLACES_SEARCH) {
    setCurrentScreen(SCREEN_NAMES.COUNSELING_SELECT);
  } else if (
    currentScreen === SCREEN_NAMES.COUNSELING_SELECT || 
    currentScreen === SCREEN_NAMES.INFO || 
    currentScreen === SCREEN_NAMES.SOUND_SETTINGS || 
    currentScreen === SCREEN_NAMES.CHANGE_PASSWORD
  ) {
    setCurrentScreen(SCREEN_NAMES.SETTINGS);
  } else if (
    currentScreen === SCREEN_NAMES.PHOTO_SELECT || 
    currentScreen === SCREEN_NAMES.MISSION_DETAIL || 
    currentScreen === SCREEN_NAMES.BADGE_DETAIL || 
    currentScreen === SCREEN_NAMES.VERIFICATION_POST_CREATE
  ) {
    setCurrentScreen(SCREEN_NAMES.MISSION);
  } else if (
    currentScreen === SCREEN_NAMES.COMMUNITY_POST_CREATE ||
    currentScreen === SCREEN_NAMES.COMMUNITY_POST_DETAIL ||
    currentScreen === SCREEN_NAMES.COMMUNITY_POST_EDIT ||
    currentScreen === SCREEN_NAMES.MISSION_GROUP ||
    currentScreen === SCREEN_NAMES.VERIFICATION_POST_DETAIL ||
    currentScreen === SCREEN_NAMES.MISSION_SET_LIST ||
    currentScreen === SCREEN_NAMES.MISSION_SET_CREATE ||
    currentScreen === SCREEN_NAMES.MISSION_SET_DETAIL ||
    currentScreen === SCREEN_NAMES.MY_MISSION_SETS
  ) {
    setCurrentScreen(SCREEN_NAMES.COMMUNITY);
  } else if (
    currentScreen === SCREEN_NAMES.MY_PAGE ||
    currentScreen === SCREEN_NAMES.CALENDAR
  ) {
    setCurrentScreen(SCREEN_NAMES.SETTINGS);
  } else if (
    currentScreen === SCREEN_NAMES.NOTIFICATION || 
    currentScreen === SCREEN_NAMES.MY_PROGRESS_DETAIL || 
    currentScreen === 'RoutineSetting'
  ) {
    setCurrentScreen(SCREEN_NAMES.HOME);
  } else if (
    currentScreen === SCREEN_NAMES.TODO_LIST || 
    currentScreen === SCREEN_NAMES.TODO_LIST_CREATE
  ) {
    setCurrentScreen(SCREEN_NAMES.HOME);
  } else if (currentScreen === SCREEN_NAMES.TODO_LIST_DETAIL) {
    setCurrentScreen(SCREEN_NAMES.TODO_LIST);
  } else if (currentScreen === SCREEN_NAMES.WAKE_UP_VERIFICATION) {
    setCurrentScreen(SCREEN_NAMES.HOME);
  } else if (currentScreen === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
    setCurrentScreen(SCREEN_NAMES.HOME);
  } else {
    setCurrentScreen(SCREEN_NAMES.HOME);
  }
  
  setNavigationParams({});
  navigationParamsRef.current = {};
};
```

#### 3.3 canGoBack 함수 추가
```typescript
const canGoBack = (): boolean => {
  // 히스토리가 있으면 뒤로가기 가능
  // SPONTANEOUS_MISSION_SETUP도 일반 화면처럼 처리 (홈으로 이동)
  return screenHistory.length > 0;
};
```

### 4. 하드웨어 뒤로가기 통합

#### 4.1 통합 로직
```typescript
useEffect(() => {
  if (Platform.OS !== 'android' || !isLoggedIn) return;

  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    // 메인 탭 화면: 두 번 눌러서 종료
    if (currentScreen && isMainTabScreen(currentScreen)) {
      if (backPressedOnce) {
        BackHandler.exitApp();
        return true;
      }
      setBackPressedOnce(true);
      ToastAndroid.show('뒤로가기를 한번 더 누르면 앱이 종료됩니다.', ToastAndroid.SHORT);
      setTimeout(() => setBackPressedOnce(false), 2000);
      return true;
    }

    // 상세 화면: goBack 호출 (히스토리 사용)
    // goBack 함수가 내부적으로 히스토리와 fallback 로직을 모두 처리
    goBack();
    return true;  // 기본 동작 방지
  });

  return () => backHandler.remove();
}, [currentScreen, isLoggedIn, backPressedOnce, screenHistory, goBack]);
```

**주의사항:**
- 현재 하드웨어 뒤로가기에서도 하드코딩된 매핑을 사용하고 있음
- 히스토리 구현 후 `goBack()` 호출로 통합 필요
- `goBack()` 함수가 `canGoBack()` 체크를 내부적으로 수행

### 5. 특수 케이스 처리

#### 5.1 SPONTANEOUS_MISSION_SETUP
```typescript
// navigate 시 히스토리 추가 여부 결정
if (screenName === SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP) {
  // 일반 모드: 히스토리 추가 (완료 후 돌아갈 곳)
  // Edit 모드: 히스토리 추가 (수정 후 돌아갈 곳)
  // 둘 다 히스토리에 추가하되, goBack에서만 차단
}
```

#### 5.2 로그인/인증 화면
```typescript
// 옵션 1: 인증 화면은 별도 히스토리 관리
const [authHistory, setAuthHistory] = useState<HistoryEntry[]>([]);

// 옵션 2: 통합 히스토리 사용 (추천)
// 로그인 후 히스토리 초기화
if (!isLoggedIn && isLoggedIn) {  // 로그인 성공 시
  setScreenHistory([]);  // 히스토리 초기화
}
```

#### 5.3 알림 기반 화면 전환
```typescript
// 알림으로 인한 화면 전환도 히스토리에 추가
// 사용자가 뒤로가기 시 이전 화면으로 돌아갈 수 있도록
navigate(SCREEN_NAMES.WAKE_UP_VERIFICATION, { userMissionId: missionId });
// 히스토리에 자동 추가됨
```

#### 5.4 reset 함수 구현
```typescript
const reset = (screenName: string, params: any = {}) => {
  // 히스토리 초기화 후 특정 화면으로 이동
  // 로그인 후 홈으로 이동하는 경우 등
  setScreenHistory([]);
  setCurrentScreen(screenName);
  setNavigationParams(params);
  navigationParamsRef.current = params;
};
```

### 6. 메인 탭 전환 최적화

#### 6.1 탭 바 클릭 처리
```typescript
// 하단 탭 바에서 직접 전환 (현재는 setCurrentScreen 직접 호출)
// 히스토리 구현 후에는 다음과 같이 변경 필요:

// 옵션 1: navigate 함수 사용 (추천)
onPress={() => {
  // navigate 함수가 메인 탭 간 전환을 자동으로 감지하여 히스토리 추가 안 함
  navigate(SCREEN_NAMES.HOME);
}}

// 옵션 2: 별도 함수 생성
const navigateToMainTab = (screenName: string) => {
  // 메인 탭 간 전환은 히스토리 추가 없이 바로 전환
  if (isMainTabScreen(currentScreen) && isMainTabScreen(screenName)) {
    setCurrentScreen(screenName);
    setNavigationParams({});
    navigationParamsRef.current = {};
  } else {
    // 다른 화면에서 메인 탭으로 이동: navigate 사용 (히스토리 추가)
    navigate(screenName);
  }
};

onPress={() => navigateToMainTab(SCREEN_NAMES.HOME)}
```

#### 6.2 메인 탭에서 상세 화면으로 이동
```typescript
// 메인 탭 → 상세 화면: 히스토리 추가
navigate(SCREEN_NAMES.MISSION_DETAIL, { missionId: '123' });
// 히스토리: [HOME] → [HOME, MISSION_DETAIL]
```

#### 6.3 상세 화면에서 메인 탭으로 이동
```typescript
// 상세 화면 → 메인 탭: 히스토리 추가
navigate(SCREEN_NAMES.HOME);
// 히스토리: [MISSION_DETAIL] → [MISSION_DETAIL, HOME]
```

---

## 특수 케이스 처리

### 1. SPONTANEOUS_MISSION_SETUP (설문 화면)

**요구사항:**
- 일반 화면처럼 처리 (특수 처리 없음)
- 뒤로가기 시 홈으로 이동
- 히스토리에 정상적으로 추가됨

**구현:**
```typescript
// navigate 시
// 일반 화면처럼 히스토리에 추가됨
navigate(SCREEN_NAMES.SPONTANEOUS_MISSION_SETUP, { mode: 'edit' });
// 히스토리: [이전 화면] → [이전 화면, SPONTANEOUS_MISSION_SETUP]

// goBack 시
// fallbackGoBack에서 홈으로 이동하도록 처리됨
// 히스토리가 있으면 이전 화면으로, 없으면 홈으로 이동
```

### 2. 로그인 상태 변경

**요구사항:**
- 로그인 성공 시 히스토리 초기화
- 로그아웃 시 히스토리 초기화

**구현:**
```typescript
// 이전 로그인 상태 추적
const prevLoggedInRef = useRef<boolean>(isLoggedIn);

useEffect(() => {
  const prevLoggedIn = prevLoggedInRef.current;
  
  if (isLoggedIn && !prevLoggedIn) {
    // 로그인 성공: 히스토리 초기화
    setScreenHistory([]);
  } else if (!isLoggedIn && prevLoggedIn) {
    // 로그아웃: 히스토리 초기화
    setScreenHistory([]);
  }
  
  // 현재 상태를 ref에 저장
  prevLoggedInRef.current = isLoggedIn;
}, [isLoggedIn]);
```

### 3. 토큰 만료 처리

**요구사항:**
- 토큰 만료 시 로그인 화면으로 이동
- 히스토리 초기화

**구현:**
```typescript
apiClient.setOnTokenExpiredCallback(async () => {
  await logout();
  await userLogout();
  setScreenHistory([]);  // 히스토리 초기화
  setCurrentScreen(SCREEN_NAMES.LOGIN);
});
```

### 4. 메인 탭 화면에서의 뒤로가기

**요구사항:**
- 메인 탭 화면에서 뒤로가기: 앱 종료 (두 번 눌러서)
- 히스토리가 있어도 메인 탭에서는 앱 종료 우선

**구현:**
```typescript
const goBack = () => {
  // 메인 탭 화면에서는 goBack 호출하지 않음
  // 하드웨어 뒤로가기에서만 처리
  if (isMainTabScreen(currentScreen)) {
    return;  // 아무 동작 안 함
  }
  
  // 나머지 로직...
};
```

### 5. 동일 화면 재진입

**요구사항:**
- 같은 화면으로 다시 navigate 시 히스토리에 추가할지 결정
- 예: MissionDetail → MissionDetail (다른 missionId)

**구현:**
```typescript
const navigate = (screenName: string, params: any = {}) => {
  // 옵션 1: 동일 화면도 히스토리에 추가 (추천)
  // 사용자가 같은 화면을 여러 번 방문할 수 있음
  if (currentScreen) {
    setScreenHistory(prev => [...prev, { screen: currentScreen, params: {...navigationParams} }]);
  }
  
  // 옵션 2: 동일 화면은 히스토리에 추가하지 않음
  // if (currentScreen && currentScreen !== screenName) {
  //   setScreenHistory(prev => [...prev, ...]);
  // }
};
```

---

## 마이그레이션 전략

### Phase 1: 히스토리 스택 추가 (하위 호환)

**목표:** 기존 코드 수정 없이 히스토리 기능 추가

**작업:**
1. `screenHistory` 상태 추가
2. `navigate` 함수에 히스토리 추가 로직 구현
3. `goBack` 함수에 히스토리 사용 로직 추가
4. 기존 하드코딩된 매핑은 `fallbackGoBack`으로 유지

**테스트:**
- 기존 화면 전환이 정상 작동하는지 확인
- 뒤로가기가 히스토리를 사용하는지 확인

### Phase 2: 하드코딩 제거 (점진적)

**목표:** 하드코딩된 매핑을 점진적으로 제거

**작업:**
1. 각 화면에서 `navigate` 호출 시 히스토리 자동 추가 확인
2. `fallbackGoBack` 사용 빈도 모니터링
3. 사용되지 않는 매핑 제거

**기준:**
- 히스토리가 항상 존재하는 경우 `fallbackGoBack` 제거 가능
- 특수 케이스만 `fallbackGoBack` 유지

### Phase 3: 최적화 및 정리

**목표:** 코드 정리 및 성능 최적화

**작업:**
1. 히스토리 최대 길이 제한
2. 메모리 사용량 모니터링
3. 불필요한 히스토리 항목 정리 로직 추가

---

## 구현 상세 사항

### 1. 파일 구조

**수정 파일:**
- `src/navigation/AppNavigator.tsx` (주요 수정)

**추가 파일 (선택):**
- `src/utils/navigationHistory.ts` (유틸리티 함수 분리)

### 2. 타입 정의

```typescript
// src/types/navigation.ts에 추가
export interface HistoryEntry {
  screen: string;
  params: any;
  timestamp: number;
}

// 기존 NavigationState는 이미 정의되어 있음 (수정 필요)
// src/types/navigation.ts의 기존 정의 확인:
// interface NavigationState {
//   currentScreen: keyof NavigationParams;
//   previousScreen?: keyof NavigationParams;
//   navigationHistory: (keyof NavigationParams)[];
// }
// 
// HistoryEntry를 사용하도록 수정 필요:
export interface NavigationState {
  currentScreen: string | null;
  history: HistoryEntry[];
  params: any;
}
```

### 3. 상태 관리

```typescript
// AppNavigator.tsx
const [screenHistory, setScreenHistory] = useState<HistoryEntry[]>([]);
const [currentScreen, setCurrentScreen] = useState<string | null>(null);
const [navigationParams, setNavigationParams] = useState({});
const navigationParamsRef = useRef<any>({});

// 로그인 상태 추적용 (로그인/로그아웃 시 히스토리 초기화)
const prevLoggedInRef = useRef<boolean>(isLoggedIn);
```

### 4. 함수 시그니처

```typescript
// navigate 함수 (기존 시그니처 유지)
const navigate = async (
  screenName: keyof RootStackParamList | string, 
  params: any = {}
): Promise<void>

// goBack 함수 (기존 시그니처 유지, 내부 로직만 변경)
const goBack = (): void

// canGoBack 함수 (새로 추가, NavigationProps에 이미 정의됨)
const canGoBack = (): boolean

// reset 함수 (새로 추가, NavigationProps에 이미 정의됨)
const reset = (screenName: string, params: any = {}): void
```

**참고:**
- `NavigationProps` 인터페이스에 이미 `canGoBack`과 `reset`이 정의되어 있음
- 실제 구현만 추가하면 됨

### 5. 에러 처리

```typescript
// 히스토리가 비어있을 때
if (screenHistory.length === 0) {
  console.warn('[AppNavigator] 히스토리가 비어있음, fallback 사용');
  fallbackGoBack();
  return;
}

// 잘못된 화면 이름
if (!screenName || typeof screenName !== 'string') {
  console.error('[AppNavigator] 잘못된 화면 이름:', screenName);
  return;
}
```

### 6. 디버깅 지원

```typescript
// 개발 모드에서만 활성화
if (__DEV__) {
  console.log('[AppNavigator] 히스토리:', screenHistory);
  console.log('[AppNavigator] 현재 화면:', currentScreen);
  console.log('[AppNavigator] 현재 params:', navigationParams);
}

// 히스토리 길이 모니터링
useEffect(() => {
  if (screenHistory.length > MAX_HISTORY_LENGTH) {
    console.warn('[AppNavigator] 히스토리가 최대 길이 초과:', screenHistory.length);
  }
}, [screenHistory]);
```

---

## 테스트 시나리오

### 시나리오 1: 기본 화면 전환
1. 홈 → 미션 상세 → 뒤로가기
2. **기대 결과:** 홈으로 복귀
3. **히스토리:** `[HOME]` → `[HOME, MISSION_DETAIL]` → `[HOME]`

### 시나리오 2: 메인 탭 전환
1. 홈 → 미션 탭 (하단 탭 클릭)
2. **기대 결과:** 히스토리 추가 안 됨
3. **히스토리:** `[]` (변경 없음)

### 시나리오 3: 깊은 네비게이션
1. 홈 → 커뮤니티 → 게시글 작성 → 뒤로가기 → 뒤로가기
2. **기대 결과:** 커뮤니티 → 홈
3. **히스토리:** `[HOME]` → `[HOME, COMMUNITY]` → `[HOME, COMMUNITY, POST_CREATE]` → `[HOME, COMMUNITY]` → `[HOME]`

### 시나리오 4: SPONTANEOUS_MISSION_SETUP
1. 설정 → 설문 화면 (edit 모드) → 뒤로가기
2. **기대 결과:** 설정으로 복귀 (히스토리 사용) 또는 홈으로 이동 (fallback)
3. **히스토리:** `[SETTINGS]` → `[SETTINGS, SPONTANEOUS_MISSION_SETUP]` → `[SETTINGS]`

### 시나리오 5: 동일 화면 재진입
1. 미션 상세 (missionId: 1) → 미션 상세 (missionId: 2) → 뒤로가기
2. **기대 결과:** 미션 상세 (missionId: 1)로 복귀
3. **히스토리:** `[MISSION_DETAIL(1)]` → `[MISSION_DETAIL(1), MISSION_DETAIL(2)]` → `[MISSION_DETAIL(1)]`

---

## 주의사항

### 1. 메모리 관리
- 히스토리 최대 길이 제한 필요 (MAX_HISTORY_LENGTH = 50)
- 오래된 항목 자동 제거
- 대용량 params는 히스토리에 저장하지 않거나 직렬화
- 함수나 컴포넌트는 히스토리에 저장하지 않음 (순환 참조 방지)

### 2. 순환 참조 방지
- params 객체의 깊은 복사 필요 (`{ ...navigationParams }`)
- 함수나 컴포넌트는 히스토리에 저장하지 않음
- `onPhotoSelected` 같은 콜백 함수는 히스토리에 포함하지 않음

### 3. 성능 고려
- 히스토리 배열 조작 최소화
- 불필요한 리렌더링 방지
- `useCallback`으로 함수 메모이제이션 고려

### 4. 하위 호환성
- 기존 `navigation.goBack()` 호출 코드 수정 불필요
- 기존 `navigation.navigate()` 호출 코드 수정 불필요
- 점진적 마이그레이션 가능
- 하단 탭 바 클릭 처리만 수정 필요 (선택적)

### 5. 실제 코드와의 차이점
- **하단 탭 바**: 현재는 `setCurrentScreen` 직접 호출 → `navigate` 사용 권장
- **하드웨어 뒤로가기**: 현재는 하드코딩된 매핑 → `goBack()` 호출로 통합
- **로그인 상태 추적**: `useRef`를 사용하여 이전 상태 추적 필요

---

## 예상 효과

### 1. 코드 품질
- **Before:** 40+ 줄의 하드코딩된 if-else
- **After:** 간단한 히스토리 스택 조작
- **개선:** 코드 라인 수 70% 감소 예상

### 2. 유지보수성
- **Before:** 새 화면 추가 시 goBack 함수 수정 필요
- **After:** 자동으로 히스토리 관리
- **개선:** 유지보수 시간 90% 감소 예상

### 3. 사용자 경험
- **Before:** 예상과 다른 화면으로 이동 가능
- **After:** 실제 이전 화면으로 정확히 복귀
- **개선:** 사용자 만족도 향상

### 4. 버그 감소
- **Before:** 하드코딩된 매핑 실수 가능성
- **After:** 자동 히스토리 관리로 실수 방지
- **개선:** 버그 발생률 80% 감소 예상

---

## 구현 체크리스트

### Phase 1: 기본 구현
- [ ] `HistoryEntry` 타입 정의
- [ ] `screenHistory` 상태 추가
- [ ] `navigate` 함수에 히스토리 추가 로직
- [ ] `goBack` 함수에 히스토리 사용 로직
- [ ] `fallbackGoBack` 함수 분리
- [ ] `canGoBack` 함수 추가
- [ ] 하드웨어 뒤로가기 통합

### Phase 2: 특수 케이스 처리
- [ ] SPONTANEOUS_MISSION_SETUP 처리 (일반 화면처럼 처리, 특수 처리 없음)
- [ ] 메인 탭 전환 처리 (하단 탭 바 클릭)
- [ ] 로그인/로그아웃 시 히스토리 초기화 (prevLoggedInRef 사용)
- [ ] 토큰 만료 시 히스토리 초기화
- [ ] 알림 기반 화면 전환 처리
- [ ] 하드웨어 뒤로가기에서 하드코딩 제거 (goBack() 통합)

### Phase 3: 최적화
- [ ] 히스토리 최대 길이 제한
- [ ] 메모리 사용량 모니터링
- [ ] 디버깅 로그 추가
- [ ] 에러 처리 강화

### Phase 4: 테스트
- [ ] 기본 화면 전환 테스트
- [ ] 메인 탭 전환 테스트
- [ ] 깊은 네비게이션 테스트
- [ ] 특수 케이스 테스트
- [ ] 하드웨어 뒤로가기 테스트

---

## 참고사항

### 현재 화면 목록 (총 54개)
- 인증 화면: 8개 (Onboarding, SignUp, Login, Nickname, FindId, FindIdResult, FindPassword, OAuthCompleteSignUp)
- 메인 탭: 5개 (Home, Mission, Community, Diary, Settings)
- 상세 화면: 41개

### 메인 탭 화면
- `HOME`, `MISSION`, `COMMUNITY`, `DIARY`, `SETTINGS`

### 특수 처리 필요한 화면
- `SPONTANEOUS_MISSION_SETUP`: 일반 화면처럼 처리 (특수 처리 없음, 홈으로 이동)
- 메인 탭 화면: 히스토리 추가 안 함 (탭 간 전환 시)
- 하드웨어 뒤로가기: 메인 탭에서는 앱 종료, 상세 화면에서는 `goBack()` 호출

### 현재 하드코딩된 매핑 (fallbackGoBack에 포함)
총 15개 이상의 화면 그룹:
1. `PLACES_SEARCH` → `COUNSELING_SELECT`
2. `COUNSELING_SELECT`, `INFO`, `SOUND_SETTINGS`, `CHANGE_PASSWORD` → `SETTINGS`
3. `PHOTO_SELECT`, `MISSION_DETAIL`, `BADGE_DETAIL`, `VERIFICATION_POST_CREATE` → `MISSION`
4. `COMMUNITY_POST_CREATE`, `COMMUNITY_POST_DETAIL`, `COMMUNITY_POST_EDIT`, `MISSION_GROUP`, `VERIFICATION_POST_DETAIL`, `MISSION_SET_LIST`, `MISSION_SET_CREATE`, `MISSION_SET_DETAIL`, `MY_MISSION_SETS` → `COMMUNITY`
5. `MY_PAGE`, `CALENDAR` → `SETTINGS`
6. `NOTIFICATION`, `MY_PROGRESS_DETAIL`, `RoutineSetting` → `HOME`
7. `TODO_LIST`, `TODO_LIST_CREATE` → `HOME`
8. `TODO_LIST_DETAIL` → `TODO_LIST`
9. `WAKE_UP_VERIFICATION` → `HOME`
10. 기타 → `HOME` (기본값)

---

## 결론

커스텀 히스토리 스택 구현을 통해:
1. 하드코딩된 goBack 로직 제거
2. 실제 화면 전환 히스토리 추적
3. 사용자 경험 개선
4. 유지보수성 향상

**구현 난이도:** 중간
**예상 작업 시간:** 4-6시간
**리스크:** 낮음 (하위 호환성 유지)
