# 업데이트 모달(UpdateModal) 수정 계획

## 요약

| 이슈 | 내용 | 성격 |
|------|------|------|
| **1** | 로그인 후 "나중에" 클릭 시 24시간 저장 안 함 | 버그 |
| **2** | FCM APP_UPDATE는 로그인한 사용자만 처리됨 | 설계 불일치 (버전 체크 API는 로그인 무관) |

---

## 1. 로그인 후 "나중에" → 24시간 저장 안 함

### 현상

- **로그인 전** (Auth 화면): `onClose={handleUpdateLater}` → "나중에" 시 `@replant:updateDismissed_${storeUrl}`에 24시간 저장 후 모달 닫힘.
- **로그인 후** (메인 탭): `onClose={() => setUpdateModalVisible(false)}` → 모달만 닫고, **저장 없음** → 같은 조건이면 다시 모달 표시.

### 수정 방향

**로그인 후 UpdateModal의 `onClose`를 `handleUpdateLater`로 통일.**

| 위치 | 파일 | 현재 | 변경 후 |
|------|------|------|---------|
| 로그인 **후** UpdateModal | `AppNavigator.tsx` (로그인 후 렌더 블록) | `onClose={... ? undefined : () => setUpdateModalVisible(false)}` | `onClose={... ? undefined : handleUpdateLater}` |

- `handleUpdateLater`는 이미 존재하고, 선택 업데이트(`!updateInfo.isRequired`)일 때만 AsyncStorage 저장 + `setUpdateModalVisible(false)` 수행.
- 로그인 전 UpdateModal은 이미 `handleUpdateLater` 사용 중 → **추가 변경 없음.**

### 변경 파일

- `src/navigation/AppNavigator.tsx`  
  - 로그인 후 `UpdateModal`의 `onClose` prop 1곳 수정.

---

## 2. FCM APP_UPDATE는 로그인한 사람만 처리

### 현상

- `if (!lastNotification || !isLoggedIn) return;` 때문에 **알림 처리 전체**가 로그인 사용자만 실행.
- **버전 체크 API** (`checkUpdateRequired`): 로그인 무관, 앱 시작 시 항상 실행.
- **FCM APP_UPDATE**: 로그인한 사용자만 업데이트 모달 표시 → 설계가 버전 체크와 다름.

### 수정 방향

**APP_UPDATE만 로그인 여부와 관계없이 처리**하고, 그 외 알림(SPONTANEOUS_WAKE_UP, 투두 등)은 기존처럼 `isLoggedIn` 필요.

### 구현 방법

1. **알림 처리 useEffect 재구성**
   - `lastNotification`이 없으면 early return (유지).
   - **`type === 'APP_UPDATE'`인 경우**  
     - `isLoggedIn` 체크 **하지 않고**  
     - `updateResult` 세팅 + `setUpdateInfo` + `setUpdateModalVisible(true)` + `processedNotificationIdRef` 설정 후 `return`.
   - 그 다음에 `if (!isLoggedIn) return;` 배치.
   - 이어서 SPONTANEOUS_WAKE_UP, 투두리스트 알림 등 **로그인 필요 알림**만 처리.

2. **선택 업데이트일 때 24h 디스미스 (선택 사항)**  
   - `checkUpdateRequired`처럼, FCM APP_UPDATE로 **선택 업데이트**가 들어올 때도 `@replant:updateDismissed_${storeUrl}` 24시간 체크를 할지 결정.
   - 할 경우: APP_UPDATE 분기 안에서 `isRequired === false`일 때만, `AsyncStorage` 조회 후 24시간 이내면 `setUpdateModalVisible` 호출하지 않고 `return`.

### 변경 파일

- `src/navigation/AppNavigator.tsx`  
  - SSE/FCM 알림 처리 `useEffect` 내부:
    - `APP_UPDATE` 분기를 **맨 앞**으로 이동.
    - `APP_UPDATE` 분기: `!lastNotification`만 체크, `isLoggedIn` 미사용.
    - `APP_UPDATE` 처리 후 `return`.
    - 그 다음 `if (!isLoggedIn) return;` 추가.
    - SPONTANEOUS_WAKE_UP, 투두 알림 등은 기존 로직 유지 (로그인 필요).

---

## 3. 수정 후 검증

| 케이스 | 기대 |
|--------|------|
| 로그인 **후** 선택 업데이트 모달에서 "나중에" | 24시간 동안 해당 storeUrl로 업데이트 모달 미표시, 모달 닫힘 |
| 로그인 **전** 선택 업데이트 모달에서 "나중에" | 기존과 동일 (이미 24h 저장 동작) |
| **비로그인** + FCM `APP_UPDATE` 수신 | 업데이트 모달 표시 (선택/강제 모두) |
| **로그인** + FCM `APP_UPDATE` 수신 | 기존과 동일, 업데이트 모달 표시 |
| **비로그인** + SPONTANEOUS_WAKE_UP / 투두 알림 | 모달/라우팅 없음 (기존과 동일) |
| **로그인** + SPONTANEOUS_WAKE_UP / 투두 알림 | 기존과 동일 동작 |

---

## 4. 작업 순서 제안

1. **1번 수정** (로그인 후 `onClose` → `handleUpdateLater`)  
   - 1곳만 변경, 리스크 낮음.
2. **2번 수정** (FCM APP_UPDATE 로그인 무관)  
   - `useEffect` 내 분기 순서 및 `isLoggedIn` 체크 위치 변경.
3. **(선택)** FCM APP_UPDATE 선택 업데이트에 24h 디스미스 적용  
   - `checkUpdateRequired`와 동작 일치시키려면 적용 권장.

---

## 5. 선택 사항: FCM 선택 업데이트도 24h 디스미스

- **현재**  
  - `checkUpdateRequired`: 선택 업데이트 시 `@replant:updateDismissed_${storeUrl}`로 24h 체크 후 표시/비표시.
  - FCM APP_UPDATE: 24h 체크 없이 **항상** 모달 표시.
- **적용 시**  
  - FCM `APP_UPDATE`에서 `isRequired === false`일 때,  
    `AsyncStorage.getItem(@replant:updateDismissed_${storeUrl})`로 24h 이내면 `setUpdateModalVisible(true)` 호출 안 함.
- **효과**  
  - "나중에" 누른 뒤 24시간 이내에 FCM이 또 와도 모달이 다시 뜨지 않음.  
  - `checkUpdateRequired`와 동일한 정책으로 통일.

---

## 6. 적용 범위 요약

| 구분 | 파일 | 변경량 |
|------|------|--------|
| 1번 | `AppNavigator.tsx` | `onClose` 1곳 |
| 2번 | `AppNavigator.tsx` | 알림 `useEffect` 내 분기 순서/체크 |
| 5번(선택) | `AppNavigator.tsx` | APP_UPDATE 분기 안 24h 로직 추가 |

새 컴포넌트/훅 추가 없이, `AppNavigator.tsx`만 수정하면 됨.
