# Replant-Android ESLint 수정 계획

`npm run lint` 기준 남은 에러/경고 정리 및 수정 순서 제안.

---

## 1. no-unused-vars (미사용 변수/import)

| 파일 | 라인 | 내용 | 수정 제안 |
|------|------|------|-----------|
| `components/overlays/NotificationDropdown.tsx` | 24 | `getUserMission` 미사용 | import/변수 제거 또는 `_getUserMission` |
| `components/ui/fullScreenImageViewer/FullScreenImageViewer.tsx` | 7 | `View` 미사용 | import에서 View 제거 |
| `screens/CommunityPostCreateScreen/CommunityPostCreateScreen.container.tsx` | 32 | `mealLogId` 미사용 | 제거 또는 `_mealLogId` |
| `screens/CustomMissionCreateScreen/index.tsx` | 20 | `MISSION_CATEGORY_OPTIONS` 미사용 | import 제거 또는 사용처 추가 |
| `screens/HomeScreen/HomeScreen.container.tsx` | 79 | `isHeroCollapsed` 미사용 | `_isHeroCollapsed` 로 변경 |
| `screens/HomeScreen/index.tsx` | 44 | `evolutionFadeAnim` 미사용 | 제거 또는 `_evolutionFadeAnim` |
| `screens/MissionScreen/MissionScreen.container.tsx` | 73 | `uncompleteMission` 미사용 | `_uncompleteMission` 또는 제거 |
| `screens/MissionScreen/MissionScreen.container.tsx` | 559 | `page` 미사용 | `_page` 또는 제거 |
| `screens/NotificationScreen/NotificationScreen.container.tsx` | 14 | `getUserMission` 미사용 | import 제거 또는 `_getUserMission` |
| `screens/ReantChatScreen/index.tsx` | 27 | `SCREEN_HEIGHT` 미사용 | 제거 또는 `_SCREEN_HEIGHT` |
| `screens/ReantChatScreen/index.tsx` | 49 | `reantName` 미사용 | `_reantName` 또는 제거 |
| `screens/TodoListCreateScreen/index.tsx` | 66 | `setShowCreateForm` 미사용 | `_setShowCreateForm` 또는 제거 |
| `screens/TodoListCreateScreen/index.tsx` | 85 | `handleSetDefaultTimeForAll` 미사용 | `_handleSetDefaultTimeForAll` 또는 제거 |

---

## 2. react-hooks/exhaustive-deps

| 파일 | 라인 | 내용 | 수정 제안 |
|------|------|------|-----------|
| `navigation/AppNavigator.tsx` | 326 | useEffect 의존성에 `user` 누락 | dependency array에 `user` 추가 또는 eslint-disable 주석 |
| `screens/MissionScreen/MissionScreen.container.tsx` | 448 | useCallback 불필요 의존성 `showInfo`, `showSuccess` | 배열에서 제거 |
| `screens/MissionScreen/MissionScreen.container.tsx` | 551 | useCallback 불필요 의존성 `uncompleteCustomMission` | 제거 |
| `screens/MissionScreen/MissionScreen.container.tsx` | 665 | useCallback 의존성에 `missionSortBy` 누락 | 추가 |
| `screens/MissionScreen/MissionScreen.container.tsx` | 688 | useCallback 불필요 의존성 `currentClientPage` | 제거 |
| `screens/TodoListCreateScreen/TodoListCreateScreen.container.tsx` | 183 | useEffect 의존성 `route?.params` 누락·복잡 표현 | `const params = route?.params` 추출 후 의존성에 params |
| `screens/TodoListCreateScreen/TodoListCreateScreen.container.tsx` | 377 | useCallback 불필요 의존성 `showInfo` | 제거 |
| `screens/TodoListDetailScreen/TodoListDetailScreen.container.tsx` | 298 | useCallback 불필요 의존성 `showInfo`, `showSuccess` | 제거 |

---

## 3. no-catch-shadow / no-shadow

| 파일 | 라인 | 내용 | 수정 제안 |
|------|------|------|-----------|
| `screens/CommunityScreen/CommunityScreen.container.tsx` | 563 | catch 블록 `error`가 상위 스코프와 충돌 | catch (err) 또는 catch (e) 로 이름 변경 |

---

## 4. @typescript-eslint/no-shadow (CustomMissionCreateScreen)

| 파일 | 라인 | 내용 | 수정 제안 |
|------|------|------|-----------|
| `screens/CustomMissionCreateScreen/index.tsx` | 44 | `MISSION_CATEGORY_OPTIONS` 상위 스코프와 중복 선언 | 내부 변수 이름 변경 또는 상위 것 사용 |

---

## 5. react-native/no-inline-styles (경고)

| 파일 | 라인 | 내용 | 수정 제안 |
|------|------|------|-----------|
| `screens/CategorySelectScreen/index.tsx` | 78 | `{ backgroundColor: 'transparent' }` | StyleSheet로 추출 |
| `screens/TodoListCreateScreen/index.tsx` | 731, 749 | `{ width: 24, height: 24 }` | styles에 iconSize 등 정의 후 사용 |

---

## 작업 순서 제안

1. **1단계**: no-unused-vars 전부 수정 (import/변수 제거 또는 `_` prefix)
2. **2단계**: no-catch-shadow, no-shadow 수정 (CommunityScreen, CustomMissionCreateScreen)
3. **3단계**: react-hooks/exhaustive-deps 수정 (의존성 배열 정리)
4. **4단계**: react-native/no-inline-styles 경고 해소 (선택, 스타일 시트로 이동)

완료 후 `npm run lint` 로 0 errors 확인.
