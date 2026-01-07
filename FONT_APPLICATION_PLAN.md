# fontFamily 적용 변경 계획서

## 📊 전체 현황
- **총 파일 수**: 60개
- **총 누락된 스타일 수**: 420개
- **평균 파일당 스타일 수**: 7.0개

---

## 🎯 우선순위별 작업 계획

### Phase 1: 부분 적용 파일 수정 (우선순위: 최고) - 5개 파일

#### 1.1 `src/components/ui/Button.tsx` (3개 누락)
**현재 상태:**
- ✅ `text` 스타일에는 fontFamily 적용됨
- ❌ `smText`, `baseText`, `lgText` 스타일에 fontFamily 누락

**필요한 변경:**
```typescript
// 현재 (146-157줄)
smText: {
  fontSize: typography.fontSize.sm,
  lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
},
baseText: {
  fontSize: typography.fontSize.base,
  lineHeight: getOptimizedLineHeight(typography.fontSize.base),
},
lgText: {
  fontSize: typography.fontSize.lg,
  lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
},

// 변경 후
smText: {
  fontSize: typography.fontSize.sm,
  lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  fontFamily: Platform.select({
    ios: typography.fontFamily.regular,
    android: typography.fontFamily.regular,
  }),
  includeFontPadding: false,
},
baseText: {
  fontSize: typography.fontSize.base,
  lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  fontFamily: Platform.select({
    ios: typography.fontFamily.regular,
    android: typography.fontFamily.regular,
  }),
  includeFontPadding: false,
},
lgText: {
  fontSize: typography.fontSize.lg,
  lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  fontFamily: Platform.select({
    ios: typography.fontFamily.regular,
    android: typography.fontFamily.regular,
  }),
  includeFontPadding: false,
},
```

**확인사항:**
- ✅ Platform 이미 import됨
- ✅ getOptimizedLineHeight 이미 import됨

**예상 작업 시간**: 5분

---

#### 1.2 `src/components/specialized/MissionCard.tsx` (1개 누락)
**누락된 스타일:**
- `categoryEmoji`

**필요한 변경:**
- `categoryEmoji` 스타일에 fontFamily 추가
- Platform import 확인 필요

**예상 작업 시간**: 3분

---

#### 1.3 `src/screens/LoginScreen/index.tsx` (2개 누락)
**누락된 스타일:**
- `title`
- `findPasswordText`

**필요한 변경:**
- 두 스타일에 fontFamily 추가
- Platform import 확인 필요

**예상 작업 시간**: 5분

---

#### 1.4 `src/screens/SignUpScreen/index.tsx` (1개 누락)
**누락된 스타일:**
- `inputText`

**필요한 변경:**
- `inputText` 스타일에 fontFamily 추가
- Platform import 확인 필요

**예상 작업 시간**: 3분

---

#### 1.5 `src/screens/VerificationPostCreateScreen/index.tsx` (8개 누락)
**누락된 스타일:**
- `addPhotoText`
- `changePhotoText`
- `contentInput`
- `infoText`
- `label`
- `missionLabel`
- `missionTitle`
- `submitButtonText`

**필요한 변경:**
- 8개 스타일에 fontFamily 추가
- Platform import 확인 필요
- getOptimizedLineHeight import 확인 필요

**예상 작업 시간**: 10분

---

### Phase 2: 주요 화면 적용 (우선순위: 높음) - 10개 파일

#### 2.1 `src/screens/CommunityScreen/index.tsx` (7개 누락)
**누락된 스타일:**
- `headerTitle`
- `searchInput`
- `filterSelectorText`
- `filterSelectorIcon`
- `modalTitle`
- `filterOptionText`
- `filterOptionCheck`

**필요한 변경:**
1. Platform import 추가 (없는 경우)
2. getOptimizedLineHeight import 추가 (없는 경우)
3. 7개 스타일에 fontFamily 및 includeFontPadding 추가

**예상 작업 시간**: 10분

---

#### 2.2 `src/screens/MissionScreen/index.tsx` (9개 누락)
**누락된 스타일:**
- `title`
- `createButtonTopText`
- `badgeSectionTitle`
- `badgeToggleText`
- `badgeLoadingText`
- `noBadgeText`
- `badgeTitle`
- `badgeRemaining`
- `badgeExpiredText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 9개 스타일에 fontFamily 추가

**예상 작업 시간**: 12분

---

#### 2.3 `src/screens/ChatRoomScreen/index.tsx` (8개 누락)
**누락된 스타일:**
- `avatarInitial`
- `dateDividerText`
- `emptyDescription`
- `emptyTitle`
- `input`
- `messageText`
- `missionBannerText`
- `sendButtonText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 8개 스타일에 fontFamily 추가
4. `input`은 TextInput이므로 `textAlignVertical: 'top'`도 추가

**예상 작업 시간**: 12분

---

#### 2.4 `src/screens/CommunityPostDetailScreen/index.tsx` (22개 누락)
**누락된 스타일:**
- `headerTitle`, `authorAvatarText`, `authorName`, `categoryText`, `date`
- `missionEmoji`, `missionTitle`, `verifiedIcon`, `verifiedText`
- `pendingIcon`, `pendingText`, `title`, `contentText`
- `actionIcon`, `actionText`, `commentsTitle`
- `commentInput`, `editCommentInput`, `editCommentButtonText`
- `replyingToText`, `cancelReplyText`, `submitButtonText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 22개 스타일에 fontFamily 추가
4. TextInput 스타일(`commentInput`, `editCommentInput`)에는 `textAlignVertical` 추가

**예상 작업 시간**: 25분

---

#### 2.5 `src/screens/CommunityPostCreateScreen/index.tsx` (6개 누락)
**누락된 스타일:**
- `missionLabel`, `missionTitle`, `label`
- `titleInput`, `contentInput`, `submitButtonText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 6개 스타일에 fontFamily 추가
4. TextInput 스타일에는 `textAlignVertical` 추가

**예상 작업 시간**: 10분

---

#### 2.6 `src/screens/CommunityPostEditScreen/index.tsx` (7개 누락)
**누락된 스타일:**
- `missionEmoji`, `missionLabel`, `missionTitle`
- `label`, `titleInput`, `contentInput`, `imageNote`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 7개 스타일에 fontFamily 추가

**예상 작업 시간**: 10분

---

#### 2.7 `src/screens/MissionGroupScreen/index.tsx` (24개 누락)
**누락된 스타일:**
- `sectionTitle`, `sectionSubtitle`, `infoText`
- `missionTitle`, `missionTypeText`, `missionDescription`
- `missionVerificationText`, `statText`
- `detailTitle`, `detailLabel`, `detailValue`
- `detailButtonText`, `writeReviewButtonText`
- `reviewHint`, `reviewAvatarText`, `reviewAuthor`
- `reviewDate`, `reviewContent`
- `modalTitle`, `modalCloseText`, `modalMissionTitle`
- `reviewInput`, `cancelButtonText`, `submitButtonText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 24개 스타일에 fontFamily 추가
4. TextInput 스타일(`reviewInput`)에는 `textAlignVertical` 추가

**예상 작업 시간**: 30분

---

#### 2.8 `src/screens/MissionDetailScreen/index.tsx` (19개 누락)
**누락된 스타일:**
- `missionTitle`, `missionType`, `difficultyText`
- `missionExp`, `missionDescription`
- `statValue`, `statLabel`
- `verificationLabel`, `verificationValue`
- `sectionTitle`, `loginPromptText`, `noBadgeText`
- `reviewInput`, `submitButtonText`
- `reviewAuthorImageText`, `reviewAuthor`
- `reviewDate`, `reviewContent`, `loadMoreText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 19개 스타일에 fontFamily 추가
4. TextInput 스타일(`reviewInput`)에는 `textAlignVertical` 추가

**예상 작업 시간**: 25분

---

#### 2.9 `src/screens/SettingsScreen/index.tsx` (9개 누락)
**누락된 스타일:**
- `sectionTitle`, `userName`, `userSubtext`
- `inputLabel`, `textInput`
- `cancelButtonText`, `saveButtonText`
- `changeNicknameText`, `settingItemText`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 9개 스타일에 fontFamily 추가
4. TextInput 스타일(`textInput`)에는 `textAlignVertical` 추가

**예상 작업 시간**: 12분

---

#### 2.10 `src/screens/MyPageScreen/index.tsx` (4개 누락)
**누락된 스타일:**
- `profileLabel`, `profileValue`
- `statLabel`, `statValue`

**필요한 변경:**
1. Platform import 추가
2. getOptimizedLineHeight import 추가
3. 4개 스타일에 fontFamily 추가

**예상 작업 시간**: 8분

---

### Phase 3: UI 컴포넌트 적용 (우선순위: 중간) - 13개 파일

#### 3.1 `src/components/ui/TabBar.tsx` (4개 누락)
**누락된 스타일:**
- `pillTabText`, `simpleTabText`, `tabBadgeText`, `underlineTabText`

**예상 작업 시간**: 8분

---

#### 3.2 `src/components/ui/SectionTitle.tsx` (4개 누락)
**누락된 스타일:**
- `sm`, `base`, `lg`, `xl`

**예상 작업 시간**: 8분

---

#### 3.3 `src/components/ui/Loading.tsx` (1개 누락)
**누락된 스타일:**
- `text`

**예상 작업 시간**: 3분

---

#### 3.4 `src/components/ui/EmptyState.tsx` (3개 누락)
**누락된 스타일:**
- `icon`, `title`, `description`

**예상 작업 시간**: 5분

---

#### 3.5 `src/components/ui/ConfirmModal.tsx` (4개 누락)
**누락된 스타일:**
- `title`, `message`, `cancelButtonText`, `confirmButtonText`

**예상 작업 시간**: 8분

---

#### 3.6 `src/components/ui/AlertModal.tsx` (3개 누락)
**누락된 스타일:**
- `title`, `message`, `buttonText`

**예상 작업 시간**: 5분

---

#### 3.7 `src/components/ui/ErrorBoundary.tsx` (4개 누락)
**누락된 스타일:**
- `icon`, `title`, `message`, `retryText`

**예상 작업 시간**: 8분

---

#### 3.8 `src/components/ui/ProgressBar.tsx` (4개 누락)
**누락된 스타일:**
- `label`, `progressText`, `percentageText`, `remainingText`

**예상 작업 시간**: 8분

---

#### 3.9 `src/components/ui/CircularProgressBar.tsx` (4개 누락)
**누락된 스타일:**
- `countText`, `totalText`, `labelText`, `percentage`

**예상 작업 시간**: 8분

---

#### 3.10 `src/components/ui/AppHeader.tsx` (3개 누락)
**누락된 스타일:**
- `iconText`, `badgeText`, `profileIcon`

**예상 작업 시간**: 5분

---

#### 3.11 `src/components/ui/FAB.tsx` (3개 누락)
**누락된 스타일:**
- `baseIcon`, `smIcon`, `lgIcon`

**예상 작업 시간**: 5분

---

#### 3.12 `src/components/ui/FilterBar.tsx` (2개 누락)
**누락된 스타일:**
- `pillFilterText`, `buttonFilterText`

**예상 작업 시간**: 5분

---

#### 3.13 `src/components/ui/MissionProgressCard.tsx` (2개 누락)
**누락된 스타일:**
- `homeIcon`, `title`

**예상 작업 시간**: 5분

---

### Phase 4: 특화 컴포넌트 적용 (우선순위: 중간) - 8개 파일

#### 4.1 `src/components/specialized/PostCard.tsx` (18개 누락)
**누락된 스타일:**
- `authorAvatarText`, `authorName`, `categoryText`, `date`
- `menuIcon`, `menuItemIcon`, `menuItemText`
- `missionEmoji`, `missionTitle`
- `verifiedIcon`, `verifiedText`, `pendingIcon`, `pendingText`
- `title`, `text`, `tagText`
- `statIcon`, `statText`

**예상 작업 시간**: 25분

---

#### 4.2 `src/components/specialized/CommentCard.tsx` (8개 누락)
**누락된 스타일:**
- `authorName`, `authorBadgeText`, `date`
- `text`, `editedText`
- `editText`, `deleteText`, `replyText`

**예상 작업 시간**: 12분

---

#### 4.3 `src/components/specialized/PlaceCard.tsx` (7개 누락)
**누락된 스타일:**
- `name`, `rating`, `ratingCount`
- `address`, `phone`, `openStatus`, `buttonText`

**예상 작업 시간**: 10분

---

#### 4.4 `src/components/specialized/DiaryCard.tsx` (6개 누락)
**누락된 스타일:**
- `emotionEmoji`, `emotionName`, `date`
- `text`, `editText`, `deleteText`

**예상 작업 시간**: 10분

---

#### 4.5 `src/components/specialized/MissionVerificationModal.tsx` (10개 누락)
**누락된 스타일:**
- `title`, `subtitle`
- `requirementLabel`, `requirementValue`
- `currentTime`, `resultText`
- `optionIcon`, `optionTitle`, `optionDescription`
- `cancelButtonText`

**예상 작업 시간**: 15분

---

#### 4.6 `src/components/specialized/EmotionSelector.tsx` (3개 누락)
**누락된 스타일:**
- `title`, `emoji`, `label`

**예상 작업 시간**: 5분

---

#### 4.7 `src/components/specialized/MissionProgressCard.tsx` (1개 누락)
**누락된 스타일:**
- `title`

**예상 작업 시간**: 3분

---

#### 4.8 `src/components/specialized/MissionFilterBar.tsx` (1개 누락)
**누락된 스타일:**
- `filterText`

**예상 작업 시간**: 3분

---

### Phase 5: 오버레이 컴포넌트 적용 (우선순위: 낮음) - 2개 파일

#### 5.1 `src/components/overlays/ChatDropdown.tsx` (10개 누락)
**예상 작업 시간**: 15분

---

#### 5.2 `src/components/overlays/NotificationDropdown.tsx` (7개 누락)
**예상 작업 시간**: 12분

---

### Phase 6: 기타 화면 적용 (우선순위: 낮음) - 22개 파일

나머지 화면들 (Admin, Statistics, Calendar 등)은 사용 빈도가 낮으므로 마지막에 적용

---

## 📋 공통 작업 패턴

### 각 파일마다 수행할 작업:

1. **Import 확인 및 추가**
   ```typescript
   import { Platform } from 'react-native';
   import { getOptimizedLineHeight } from '../../utils/textStyles';
   ```

2. **각 스타일에 추가할 코드**
   ```typescript
   fontFamily: Platform.select({
     ios: typography.fontFamily.regular,
     android: typography.fontFamily.regular,
   }),
   includeFontPadding: false,
   ```

3. **TextInput 스타일인 경우 추가**
   ```typescript
   textAlignVertical: 'top', // 또는 'center'
   ```

4. **lineHeight 최적화 (선택사항)**
   ```typescript
   lineHeight: getOptimizedLineHeight(typography.fontSize.xxx),
   ```

---

## ⏱️ 총 예상 작업 시간

- **Phase 1**: 26분 (5개 파일)
- **Phase 2**: 152분 (10개 파일)
- **Phase 3**: 89분 (13개 파일)
- **Phase 4**: 83분 (8개 파일)
- **Phase 5**: 27분 (2개 파일)
- **Phase 6**: 약 200분 (22개 파일)

**총 예상 시간**: 약 577분 (약 9.6시간)

---

## 🎯 권장 작업 순서

1. **Phase 1 완료** (부분 적용 파일 수정) - 가장 우선
2. **Phase 2의 주요 화면 3-4개** (CommunityScreen, MissionScreen, ChatRoomScreen)
3. **Phase 3의 핵심 UI 컴포넌트** (TabBar, SectionTitle, Loading 등)
4. **Phase 4의 주요 특화 컴포넌트** (PostCard, CommentCard)
5. 나머지 순차적으로 진행

---

## ✅ 체크리스트

각 파일 작업 후 확인:
- [ ] Platform import 확인
- [ ] getOptimizedLineHeight import 확인 (필요한 경우)
- [ ] 모든 누락된 스타일에 fontFamily 추가
- [ ] includeFontPadding: false 추가
- [ ] TextInput 스타일에는 textAlignVertical 추가
- [ ] Linter 에러 확인
- [ ] 코드 포맷팅 확인

