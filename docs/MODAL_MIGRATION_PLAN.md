# 기본 모달 → 커스텀 모달 마이그레이션 계획

기본 모달(`Alert.alert`) 및 `useErrorHandler`(내부 `Alert.alert`)를  
`AlertModal`, `ConfirmModal`(및 신규 ActionSheet)로 단계적 전환하는 계획.

---

## 0. 전제·의사결정

- **목표**: 앱 전역 알림/확인을 `AlertModal`·`ConfirmModal`(및 필요 시 ActionSheet)로 통일.
- **원칙**: 한 번에 전면 교체보다, **인프라 확장 → 화면 단위 점진 이전**.
- **예외 후보**: 3버튼 이상 선택(예: 사진 추가)은 ActionSheet 도입 전까지 `Alert.alert` 유지 가능.

---

## 1. Phase 0: 인프라 (useErrorHandler 확장)

### 1.1 useErrorHandler 옵션 추가

**파일**: `src/hooks/useErrorHandler.ts`

**변경**:
- `useErrorHandler(options?)` 에 **선택적** 오버라이드 인자 추가.

```ts
interface UseErrorHandlerOverrides {
  onShowError?: (title: string, message: string) => void;
  onShowSuccess?: (title: string, message: string) => void;
  onShowInfo?: (title: string, message: string) => void;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

export const useErrorHandler = (overrides?: UseErrorHandlerOverrides): UseErrorHandlerReturn => {
  // overrides 있을 때: 해당 콜백 사용 (로깅은 기존 유지)
  // overrides 없을 때: 기존대로 Alert.alert
};
```

- `handleApiError`는 내부적으로 `onShowError`(또는 기존 `showError`) 호출로 유지 → **시그니처 불변**.
- `showConfirm`은 `onShowConfirm` 또는 `Alert.alert(취소/확인)`.

**결과**:  
- 기존 `useErrorHandler()` 호출은 **수정 없이** 그대로 `Alert.alert` 사용.  
- 화면에서 `overrides`만 넘기면, 그 화면부터 커스텀 모달로 전환 가능.

### 1.2 (선택) ActionSheet型 컴포넌트

**용도**:  
- `Alert.alert('사진 추가', …, [취소, 카메라, 갤러리])` 같은 **3버튼 이상** 선택.

**옵션**:
- **A)** `ActionSheetModal` 신규: `options: { label, onPress }[]`, `onCancel`.  
  - 바텀 시트 스타일 권장 (일반 모달도 가능).
- **B)** 당분간 해당 1군데(`VerificationPostCreateScreen` 사진 추가)만 `Alert.alert` 유지.

**우선순위**: Phase 2 완료 후, 3버튼 전용 교체 시점에 결정.

---

## 2. Phase 1: useErrorHandler 사용 화면 (8곳)

아래 화면에서  
1) `useErrorHandler(overrides)` 로 오버라이드 전달,  
2) 각 `index`에 `AlertModal` / `ConfirmModal` 렌더,  
3) `overrides`에서 `setAlertTitle` / `setAlertMessage` / `setShowAlert` 등 state 제어.

| # | 화면 | useErrorHandler 사용 | 비고 |
|---|------|----------------------|------|
| 1 | **TodoListCreateScreen** | `handleApiError`, `showError`, `showInfo` | 이미 AlertModal 있음 → overrides로 연동 |
| 2 | **CommunityScreen** | `handleApiError`, `showError`, `showSuccess`, `showInfo` | AlertModal 있음 + `Alert.alert`(확인) → 확인은 ConfirmModal로 |
| 3 | **MissionDetailScreen** | `handleApiError`, `showError`, `showSuccess` | — |
| 4 | **MissionScreen** | `handleApiError`, `showError`, `showSuccess`, `showInfo`, `showConfirm` | ConfirmModal 이미 사용, showConfirm만 커스텀 연동 |
| 5 | **TodoListDetailScreen** | `handleApiError`, `showError`, `showSuccess`, `showInfo` | AlertModal 있음 + `Alert.alert`(보관 확인) → ConfirmModal |
| 6 | **MissionGroupScreen** | `handleApiError`, `showError`, `showSuccess`, `showInfo` | — |
| 7 | **VerificationPostDetailScreen** | `showError`, `showSuccess`, `showInfo` | handleApiError는 이미 showAlertModal로 대체됨 |
| 8 | **VerificationPostCreateScreen** | `showError`, `showInfo` | handleApiError는 이미 setShowErrorModal로 대체됨 |

**작업 패턴 (예: TodoListCreateScreen)**:
- container:  
  - `showAlert`, `alertTitle`, `alertMessage`, `showSuccess`, `successTitle`, `successMessage` 등 state 추가.  
  - `useErrorHandler({ onShowError: (t,m)=> setAlertTitle(t); setAlertMessage(m); setShowAlert(true); ... })`  
  - `handleApiError` / `showError` / `showInfo`는 그대로 사용, 표시만 커스텀으로.
- index:  
  - `AlertModal` (오류·성공·정보용) 및 필요한 경우 `ConfirmModal` 추가.  
  - `showConfirm` 쓰는 화면은 `ConfirmModal`에 `onConfirm` 연동.

**검증**:  
- 각 화면에서 **에러/성공/정보/확인** 발생 시나리오가 `AlertModal`/`ConfirmModal`로만 노출되는지 확인.

---

## 3. Phase 2: useAsyncOperation

**파일**: `src/hooks/useAsyncOperation.ts`

- 내부 `useErrorHandler()`에 **overrides 必**.  
- overrides는 **인자로 받기**:  
  `useAsyncOperation(operation, { ..., errorHandlerOverrides?: UseErrorHandlerOverrides })`.  
- `useAsyncOperation` 사용처가 현재 없음 → **호출부 생길 때** overrides 전달 규칙만 정리해두고, 필요 시 적용.

---

## 4. Phase 3: Alert.alert 직접 사용 – 2버튼(취소/확인·삭제 등)

`Alert.alert( title, message, [ 취소, 확인/삭제 ] )` 형태 → `ConfirmModal`로 교체.

| # | 파일 | 용도 |
|---|------|------|
| 1 | VerificationPostDetailScreen | 인증글 삭제 확인, 댓글 삭제 확인 |
| 2 | RoutineSettingScreen | 삭제 확인, (성공/오류는 1버튼 → AlertModal) |
| 3 | AdminMissionManageScreen | 삭제 확인, (오류/완료 → AlertModal) |
| 4 | CommunityScreen | 공유/삭제 확인 (handleApiError는 Phase 1에서 처리) |
| 5 | MissionSetListScreen | 공유 확인 |
| 6 | TodoListDetailScreen | 보관 확인 (Phase 1과 함께) |
| 7 | MyMissionSetsScreen | 삭제 확인 |
| 8 | AdminDashboardScreen | 유저 삭제 확인 |
| 9 | FindPasswordScreen | 비밀번호 발급 완료 (확인+onPress) → AlertModal `onClose`로 대체 |
| 10 | OAuthCompleteSignUpScreen | 환영 (확인+onPress) → AlertModal |
| 11 | ConnectionsScreen | 수락/거절 확인 |
| 12 | CustomMissionCreateScreen | (제목/설명 검증은 1버튼 → AlertModal; 확인 다이얼로그 있으면 ConfirmModal) |
| 13 | AdminUserDetailScreen | 상태 변경 확인 |
| 14 | ChangePasswordScreen | 비밀번호 변경 확인 |
| 15 | ContributorDashboardScreen | 상담/채팅 등 확인 |

**1버튼(확인만)**  
- `Alert.alert(title, message, [ { text: '확인', onPress } ])`  
  → `AlertModal` + `onClose`에서 `onPress` 실행.

---

## 5. Phase 4: Alert.alert 직접 사용 – 1버튼(오류·성공·알림)

| # | 파일 | 용도 |
|---|------|------|
| 1 | AdminUserEditScreen | 오류(닉네임), 성공, API 오류 |
| 2 | RoutineSettingScreen | 오류(로드/저장/삭제), 성공 |
| 3 | AdminMissionManageScreen | 오류(로드/검증/저장), 완료 |
| 4 | MissionSetListScreen | 공유 완료/실패/오류 |
| 5 | MyMissionSetsScreen | 완료, 오류 |
| 6 | MissionSetDetailScreen | 오류(로드), 리뷰 완료/오류 |
| 7 | MissionSetCreateScreen | 알림(검증), 완료, 오류 |
| 8 | FindPasswordScreen | 인증번호 발송, 인증 완료, 오류 |
| 9 | OAuthCompleteSignUpScreen | 오류 |
| 10 | ConnectionsScreen | 오류 |
| 11 | CustomMissionCreateScreen | 오류, (생성/수정 완료) |
| 12 | AdminUserDetailScreen | 성공, 오류 |
| 13 | ChangePasswordScreen | 오류 |
| 14 | NicknameScreen | 오류 |
| 15 | ContributorDashboardScreen | 완료/알림 |

---

## 6. Phase 5: 3버튼(사진 추가) 및 기타

| # | 파일 | 용도 | 방안 |
|---|------|------|------|
| 1 | VerificationPostCreateScreen | 사진 추가: [취소, 카메라, 갤러리] | ActionSheetModal 도입 후 교체 or 당분간 Alert.alert 유지 |

---

## 7. Phase 6: 훅·컴포넌트 (Alert.alert 사용처)

### 7.1 훅

훅은 직접 `Alert.alert` 호출 대신, **콜백**을 받아 호출하게 변경.

| # | 파일 | 용도 | 방안 |
|---|------|------|------|
| 1 | useCommunityPost | 인증 완료, 좋아요 오류 | `showAlert?: (title, message) => void` 같은 optional 인자 or 훅 반환값에 `bindAlert(showAlert)` 등. 사용처(커뮤니티 관련 화면)에서 `AlertModal` state와 연동해 전달. |
| 2 | useCommunity | 좋아요 오류 | 위와 유사. `useCommunity(postId, { onError?: (title, message) => void })` 형태 확장. |
| 3 | useLocation | GPS 권한 | `onPermissionMessage?: (title, message) => void` 등 optional. `PermissionScreen`/상위에서 `AlertModal` 연동. |

### 7.2 컴포넌트

| # | 파일 | 용도 | 방안 |
|---|------|------|------|
| 1 | PostCard | 삭제/공유 확인 등 | `onRequestConfirm`, `onRequestAlert` 같은 props 추가. 부모(Community 등)에서 `ConfirmModal`/`AlertModal` 열고, 실제 삭제·공유 로직 실행. |
| 2 | CommentCard | 삭제 확인 등 | `onRequestDeleteConfirm` 등. 부모에서 `ConfirmModal` 표시. |
| 3 | MissionVerificationModal | 시간/GPS 인증 실패, 확인 | `onShowError`, `onShowConfirm` props. 부모(MissionScreen 등)에서 `AlertModal`/`ConfirmModal` 연동. |

---

## 8. Phase 7: useErrorHandler·utils/errorHandler 내부 구현 전환

### 8.1 useErrorHandler 기본 구현

- **목표**: overrides 없을 때도 **기본값으로 `AlertModal`/`ConfirmModal`를 쓰지 않고**,  
  여전히 `Alert.alert`를 사용하도록 유지한 뒤,  
  전역 Provider 도입 시에만 “기본도 커스텀”으로 바꾸는 식이 안전함.
- **옵션 (후반)**:
  - **A)** `React Context`로 `UseErrorHandlerOverrides` 제공.  
    - `useErrorHandler()`는 `useContext(ErrorHandlerContext)`의 overrides 사용.  
    - App 루트에서 Context로 커스텀 구현 주입 시, **한 번에** 기본까지 `AlertModal`/`ConfirmModal` 전환 가능.
  - **B)** overrides가 없으면 계속 `Alert.alert` 유지.  
    - 화면 단위 이전이 끝난 뒤, useErrorHandler 사용처가 모두 overrides를 넘기면, 그때 `Alert` import 제거.

### 8.2 utils/errorHandler

- `showErrorAlert`, `showSuccessAlert`, `showConfirmAlert`, `handleAsyncError`(내부 `showErrorAlert`)  
  → 현재 **직접 사용처 없음**.  
  - 새로 쓰이지 않도록 주석/ deprecated 표시.  
  - 필요 시 `useErrorHandler`(또는 Context) 사용으로 점진 대체.  
- `executeWithErrorHandling`: UI 없음 → 변경 없음.

---

## 9. Phase 8: Admin·Contributor (낮은 우선순위)

- AdminUserEditScreen, AdminMissionManageScreen, AdminDashboardScreen, AdminUserDetailScreen  
- ContributorDashboardScreen  
- Phase 3·4 작업 시 **동일 패턴**으로 처리.  
  일정에 따라 Phase 3·4와 합치거나, 마지막에 모아서 진행.

---

## 10. 일정·체크리스트 (예시)

| Phase | 내용 | 예상 규모 |
|-------|------|------------|
| **0** | useErrorHandler overrides, (선택) ActionSheet | 1~2일 |
| **1** | useErrorHandler 8개 화면 | 2~3일 |
| **2** | useAsyncOperation (실사용 생기면) | 0.5일 |
| **3** | 2버튼 Alert.alert → ConfirmModal | 1~2일 |
| **4** | 1버튼 Alert.alert → AlertModal | 1~2일 |
| **5** | 3버튼(사진 추가) | 0.5~1일 (ActionSheet 시) |
| **6** | 훅·컴포넌트 | 1~2일 |
| **7** | useErrorHandler/errorHandler 정리 | 0.5일 |
| **8** | Admin·Contributor (Phase 3·4에 포함 or 별도) | — |

---

## 11. 공통 작업 패턴 (요약)

1. **useErrorHandler overrides**  
   - container에서 `showAlert`/`alertTitle`/`alertMessage`(및 성공/정보용 state) 정의.  
   - `useErrorHandler({ onShowError, onShowSuccess, onShowInfo, onShowConfirm })` 에서 위 state 갱신.  
   - `handleApiError` / `showError` / `showSuccess` / `showInfo` / `showConfirm` 시그니처는 그대로 사용.

2. **Confirm (취소/확인·삭제)**  
   - `Alert.alert(..., [취소, 확인])` 제거.  
   - `showDeleteModal`(또는 `showConfirmModal`) state + `ConfirmModal` 렌더.  
   - `onConfirm`에서 기존 `onPress` 로직 실행.

3. **Alert (1버튼)**  
   - `Alert.alert(title, message)` 또는 `[ { text: '확인', onPress } ]`  
     → `AlertModal` + `onClose`에서 `onPress` 호출.

4. **훅/컴포넌트**  
   - `Alert.alert` 제거.  
   - `onShowError` / `onShowConfirm` 등 콜백을 인자·props로 받아, 부모의 `AlertModal`/`ConfirmModal`과 연동.

---

## 12. 완료 조건

- [ ] `Alert.alert` 사용처: 3버튼(사진 추가) 1곳만 허용, 나머지 0.
- [ ] `useErrorHandler`: overrides 또는 Context 통해 `AlertModal`/`ConfirmModal` 사용.
- [ ] `utils/errorHandler`: `showErrorAlert`/`showSuccessAlert`/`showConfirmAlert` 사용처 0 (또는 deprecated).
- [ ] `useCommunityPost`, `useCommunity`, `useLocation`, `PostCard`, `CommentCard`, `MissionVerificationModal`: `Alert.alert` 제거, 콜백/props로 대체.

---

*문서 버전: 1.0 | 작성: 2025-01*
