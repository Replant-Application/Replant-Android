# 접근성 개선 페이즈별 작업 계획

## 📋 최종 검토 결과

### ✅ 검토 완료 사항

1. **접근성 속성 사용 적절성**
   - `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` - React Native 공식 지원 ✅
   - `hitSlop` - React Native 공식 지원, 시각적 변경 없이 터치 영역 확대 가능 ✅
   - `accessibilityState` - 상태 정보 전달 적절 ✅

2. **UI 변경 없음 보장**
   - StyleSheet의 `height`, `width`, `color` 등 변경 없음 ✅
   - `hitSlop`은 보이지 않는 터치 영역만 확대 ✅
   - 접근성 속성은 스크린 리더용 메타데이터만 추가 ✅

3. **KS X 3253:2016 준수**
   - 4가지 원칙(인식, 운용, 이해, 견고성) 모두 포함 ✅
   - 최소 터치 영역 44pt 확보 계획 ✅
   - 색상 대비 WCAG AA 기준 준수 ✅

---

## 🎯 페이즈별 작업 계획

### Phase 1: 핵심 컴포넌트 접근성 개선 (1주)

**목표**: 가장 많이 사용되는 기본 컴포넌트에 접근성 속성 추가

#### 작업 항목

1. **Button 컴포넌트 개선**
   - 파일: `src/components/ui/Button.tsx`
   - 작업:
     - `accessibilityRole="button"` 추가
     - `accessibilityLabel={title}` 추가
     - `accessibilityState={{ disabled: disabled || loading }}` 추가
     - `hitSlop` 추가 (sm: 6px, base: 2px, lg: 불필요)
   - 예상 시간: 30분
   - 테스트: VoiceOver/TalkBack으로 버튼 라벨 확인

2. **Input 컴포넌트 개선**
   - 파일: `src/components/ui/Input.tsx`
   - 작업:
     - `accessibilityLabel={label || placeholder}` 추가
     - `accessibilityHint={error ? error : undefined}` 추가
     - `accessibilityLiveRegion="polite"` 추가 (에러 메시지용)
     - `allowFontScaling={true}` 확인/추가
   - 예상 시간: 30분
   - 테스트: 스크린 리더로 입력 필드 라벨 및 에러 메시지 확인

3. **TabBar 컴포넌트 개선**
   - 파일: `src/components/ui/TabBar.tsx`
   - 작업:
     - 각 탭에 `accessibilityRole="tab"` 추가
     - `accessibilityLabel={tab.label}` 추가
     - `accessibilityState={{ selected: activeTab === tab.key }}` 추가
   - 예상 시간: 20분
   - 테스트: 탭 전환 시 스크린 리더 확인

4. **AppNavigator 하단 탭 개선**
   - 파일: `src/navigation/AppNavigator.tsx`
   - 작업:
     - 각 탭 TouchableOpacity에 접근성 속성 추가
     - Image에 `accessibilityLabel` 추가 (또는 `accessibilityElementsHidden={true}`)
     - Text는 이미 있으므로 접근성 라벨로 활용
   - 예상 시간: 30분
   - 테스트: 하단 탭 네비게이션 스크린 리더 확인

**Phase 1 완료 기준**
- [ ] Button 컴포넌트 접근성 속성 추가 완료
- [ ] Input 컴포넌트 접근성 속성 추가 완료
- [ ] TabBar 컴포넌트 접근성 속성 추가 완료
- [ ] AppNavigator 하단 탭 접근성 속성 추가 완료
- [ ] VoiceOver/TalkBack 기본 테스트 완료

**예상 소요 시간**: 2-3시간  
**우선순위**: 최고

---

### Phase 2: 특화 컴포넌트 접근성 개선 (1주)

**목표**: 특화된 컴포넌트들의 접근성 개선

#### 작업 항목

1. **FAB (Floating Action Button) 개선**
   - 파일: `src/components/ui/FAB.tsx`
   - 작업:
     - `accessibilityRole="button"` 추가
     - `accessibilityLabel` 추가 (icon 기반)
     - `hitSlop` 확인 (이미 48px 이상이면 불필요)
   - 예상 시간: 15분

2. **FilterBar 컴포넌트 개선**
   - 파일: `src/components/ui/FilterBar.tsx`
   - 작업:
     - 각 필터 버튼에 `accessibilityRole="button"` 추가
     - `accessibilityLabel={filter.label}` 추가
     - `accessibilityState={{ selected: selectedFilter === filter.key }}` 추가
   - 예상 시간: 20분

3. **MissionCard 컴포넌트 개선**
   - 파일: `src/components/specialized/MissionCard.tsx`
   - 작업:
     - 카드 TouchableOpacity에 `accessibilityRole="button"` 추가
     - `accessibilityLabel` 추가 (미션 제목 기반)
     - 인증 버튼에 접근성 속성 추가
     - 이미지에 `accessibilityLabel` 추가
   - 예상 시간: 30분

4. **PostCard 컴포넌트 개선**
   - 파일: `src/components/specialized/PostCard.tsx`
   - 작업:
     - 카드에 접근성 속성 추가
     - 이미지에 `accessibilityLabel` 추가
     - 좋아요/스크랩 버튼에 접근성 속성 추가
   - 예상 시간: 30분

5. **CharacterCard 컴포넌트 개선**
   - 파일: `src/components/specialized/CharacterCard.tsx`
   - 작업:
     - 카드에 접근성 속성 추가
     - 캐릭터 이미지에 `accessibilityLabel` 추가
   - 예상 시간: 20분

6. **EmotionSelector 컴포넌트 개선**
   - 파일: `src/components/specialized/EmotionSelector.tsx`
   - 작업:
     - 각 감정 버튼에 `accessibilityRole="button"` 추가
     - `accessibilityLabel={emotion.label}` 추가
     - `accessibilityState={{ selected: isSelected(emotion.id) }}` 추가
   - 예상 시간: 20분

**Phase 2 완료 기준**
- [ ] FAB 접근성 속성 추가 완료
- [ ] FilterBar 접근성 속성 추가 완료
- [ ] MissionCard 접근성 속성 추가 완료
- [ ] PostCard 접근성 속성 추가 완료
- [ ] CharacterCard 접근성 속성 추가 완료
- [ ] EmotionSelector 접근성 속성 추가 완료

**예상 소요 시간**: 2-3시간  
**우선순위**: 높음

---

### Phase 3: 화면별 접근성 개선 (1-2주)

**목표**: 주요 화면의 접근성 개선

#### 작업 항목

1. **인증 화면 개선**
   - 파일:
     - `src/screens/LoginScreen/index.tsx`
     - `src/screens/SignUpScreen/index.tsx`
     - `src/screens/FindIdScreen/index.tsx`
     - `src/screens/FindPasswordScreen/index.tsx`
   - 작업:
     - 모든 Input에 접근성 속성 확인 (Phase 1에서 이미 처리됨)
     - 버튼 접근성 속성 확인 (Phase 1에서 이미 처리됨)
     - 에러 메시지 접근성 개선
     - 키보드 네비게이션 순서 확인
   - 예상 시간: 1시간

2. **홈 화면 개선**
   - 파일: `src/screens/HomeScreen/index.tsx`
   - 작업:
     - 모든 인터랙티브 요소 접근성 속성 추가
     - 이미지 접근성 속성 추가
     - 알림 버튼 접근성 속성 추가
   - 예상 시간: 30분

3. **미션 화면 개선**
   - 파일: `src/screens/MissionScreen/index.tsx`
   - 작업:
     - 필터 바 접근성 (Phase 2에서 처리됨)
     - 미션 카드 접근성 (Phase 2에서 처리됨)
     - 추가 버튼 접근성 속성 추가
   - 예상 시간: 30분

4. **커뮤니티 화면 개선**
   - 파일: `src/screens/CommunityScreen/index.tsx`
   - 작업:
     - 탭 바 접근성 (Phase 1에서 처리됨)
     - 게시글 카드 접근성 (Phase 2에서 처리됨)
     - 작성 버튼 접근성 속성 추가
   - 예상 시간: 20분

5. **설정 화면 개선**
   - 파일: `src/screens/SettingsScreen/index.tsx`
   - 작업:
     - 모든 설정 항목 접근성 속성 추가
     - 토글/스위치 접근성 속성 추가
   - 예상 시간: 30분

**Phase 3 완료 기준**
- [ ] 인증 화면 접근성 개선 완료
- [ ] 홈 화면 접근성 개선 완료
- [ ] 미션 화면 접근성 개선 완료
- [ ] 커뮤니티 화면 접근성 개선 완료
- [ ] 설정 화면 접근성 개선 완료

**예상 소요 시간**: 3-4시간  
**우선순위**: 중간

---

### Phase 4: 이미지 접근성 개선 (1주)

**목표**: 모든 이미지에 적절한 접근성 속성 추가

#### 작업 항목

1. **의미 있는 이미지 식별 및 라벨 추가**
   - 작업:
     - 모든 Image 컴포넌트 검토
     - 의미 있는 이미지: `accessibilityLabel` 추가
     - 장식용 이미지: `accessibilityRole="none"`, `accessibilityElementsHidden={true}` 추가
   - 대상 파일:
     - `src/components/ui/AppHeader.tsx`
     - `src/components/overlays/HeaderActions.tsx`
     - `src/components/overlays/NotificationDropdown.tsx`
     - `src/components/specialized/PlaceCard.tsx`
     - 기타 Image 사용 컴포넌트들
   - 예상 시간: 2-3시간

2. **아이콘 버튼 접근성 개선**
   - 작업:
     - 아이콘만 있는 버튼에 `accessibilityLabel` 추가
     - `accessibilityHint` 추가 (필요한 경우)
   - 예상 시간: 1시간

**Phase 4 완료 기준**
- [ ] 모든 의미 있는 이미지에 `accessibilityLabel` 추가 완료
- [ ] 모든 장식용 이미지에 `accessibilityRole="none"` 추가 완료
- [ ] 아이콘 버튼 접근성 속성 추가 완료

**예상 소요 시간**: 3-4시간  
**우선순위**: 높음

---

### Phase 5: 색상 대비 검증 및 개선 (3일)

**목표**: WCAG AA 기준 색상 대비율 확인 및 필요 시 최소 조정

#### 작업 항목

1. **색상 대비율 측정**
   - 파일: `src/utils/designTokens.ts`
   - 작업:
     - 주요 색상 조합 대비율 측정
     - 측정 도구: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
     - 측정 대상:
       - `primary[500]` + `text.inverse`
       - `gray[500]` + `text.primary`
       - `error` + 배경색
       - 모든 텍스트 색상 + 배경색 조합
   - 예상 시간: 1시간

2. **대비율 미달 색상 조정 (필요 시)**
   - 작업:
     - WCAG AA 기준(4.5:1) 미달 시에만 조정
     - 기존 색상 톤 최대한 유지
     - 최소한의 변경만 수행
   - 예상 시간: 1-2시간

**Phase 5 완료 기준**
- [ ] 모든 주요 색상 조합 대비율 측정 완료
- [ ] WCAG AA 기준 미달 색상 조정 완료 (필요 시)
- [ ] 대비율 측정 결과 문서화 완료

**예상 소요 시간**: 2-3시간  
**우선순위**: 높음

---

### Phase 6: 키보드 네비게이션 및 포커스 개선 (3일)

**목표**: 키보드만으로 모든 기능 접근 가능하도록 개선

#### 작업 항목

1. **폼 화면 키보드 네비게이션 개선**
   - 파일:
     - `src/screens/LoginScreen/index.tsx`
     - `src/screens/SignUpScreen/index.tsx`
     - `src/screens/FindIdScreen/index.tsx`
   - 작업:
     - `returnKeyType` 적절히 설정 (이미 설정되어 있음)
     - `blurOnSubmit` 처리 확인
     - 포커스 순서 확인 (`accessibilityFlow` 필요 시 추가)
   - 예상 시간: 1시간

2. **포커스 표시 개선**
   - 작업:
     - 기존 포커스 스타일 유지
     - `accessibilityState`로 상태 전달 확인
   - 예상 시간: 30분

**Phase 6 완료 기준**
- [ ] 폼 화면 키보드 네비게이션 개선 완료
- [ ] 포커스 표시 확인 완료

**예상 소요 시간**: 1-2시간  
**우선순위**: 중간

---

### Phase 7: 에러 메시지 및 힌트 개선 (2일)

**목표**: 에러 메시지와 복잡한 인터랙션에 대한 접근성 개선

#### 작업 항목

1. **에러 메시지 접근성 개선**
   - 파일: `src/components/ui/Input.tsx` (이미 Phase 1에서 처리)
   - 추가 작업:
     - 에러 메시지 Text에 `accessibilityLiveRegion="polite"` 확인
     - 에러 메시지 명확성 검토
   - 예상 시간: 30분

2. **접근성 힌트 추가**
   - 작업:
     - 복잡한 인터랙션 요소에 `accessibilityHint` 추가
     - 아이콘 버튼에 힌트 추가 (필요한 경우)
   - 예상 시간: 1시간

**Phase 7 완료 기준**
- [ ] 에러 메시지 접근성 개선 완료
- [ ] 필요한 요소에 접근성 힌트 추가 완료

**예상 소요 시간**: 1-2시간  
**우선순위**: 낮음

---

### Phase 8: 테스트 및 검증 (1주)

**목표**: 모든 접근성 개선 사항 테스트 및 검증

#### 작업 항목

1. **VoiceOver 테스트 (iOS)**
   - 작업:
     - 모든 화면 VoiceOver로 테스트
     - 모든 버튼, 입력 필드, 이미지 라벨 확인
     - 네비게이션 흐름 확인
   - 예상 시간: 2-3시간

2. **TalkBack 테스트 (Android)**
   - 작업:
     - 모든 화면 TalkBack으로 테스트
     - 모든 버튼, 입력 필드, 이미지 라벨 확인
     - 네비게이션 흐름 확인
   - 예상 시간: 2-3시간

3. **색상 대비 최종 검증**
   - 작업:
     - 실제 앱에서 색상 대비 확인
     - 필요 시 추가 조정
   - 예상 시간: 1시간

4. **터치 영역 검증**
   - 작업:
     - 작은 버튼의 터치 영역 확인
     - `hitSlop`이 제대로 작동하는지 확인
   - 예상 시간: 30분

5. **문서화**
   - 작업:
     - 접근성 개선 사항 문서화
     - 테스트 결과 문서화
     - 향후 유지보수 가이드 작성
   - 예상 시간: 1시간

**Phase 8 완료 기준**
- [ ] VoiceOver 테스트 완료 및 이슈 해결
- [ ] TalkBack 테스트 완료 및 이슈 해결
- [ ] 색상 대비 최종 검증 완료
- [ ] 터치 영역 검증 완료
- [ ] 문서화 완료

**예상 소요 시간**: 6-8시간  
**우선순위**: 최고

---

## 📊 전체 일정 요약

| Phase | 작업 내용 | 예상 시간 | 우선순위 | 기간 |
|-------|----------|----------|---------|------|
| Phase 1 | 핵심 컴포넌트 개선 | 2-3시간 | 최고 | 1주 |
| Phase 2 | 특화 컴포넌트 개선 | 2-3시간 | 높음 | 1주 |
| Phase 3 | 화면별 개선 | 3-4시간 | 중간 | 1-2주 |
| Phase 4 | 이미지 접근성 개선 | 3-4시간 | 높음 | 1주 |
| Phase 5 | 색상 대비 검증 | 2-3시간 | 높음 | 3일 |
| Phase 6 | 키보드 네비게이션 | 1-2시간 | 중간 | 3일 |
| Phase 7 | 에러 메시지/힌트 | 1-2시간 | 낮음 | 2일 |
| Phase 8 | 테스트 및 검증 | 6-8시간 | 최고 | 1주 |
| **총계** | | **20-29시간** | | **6-8주** |

---

## ✅ 각 Phase 시작 전 체크리스트

- [ ] 이전 Phase 완료 확인
- [ ] 관련 파일 백업
- [ ] 테스트 환경 준비 (VoiceOver/TalkBack)
- [ ] 작업 브랜치 확인 (`feat/accessibility`)

## ✅ 각 Phase 완료 후 체크리스트

- [ ] 코드 변경사항 검토
- [ ] UI 시각적 변경 없음 확인
- [ ] 스크린 리더 기본 테스트 완료
- [ ] 커밋 및 푸시
- [ ] 다음 Phase 준비

---

## 🚨 주의사항

1. **UI 변경 금지**: 모든 작업은 접근성 속성 추가만 수행
2. **StyleSheet 변경 금지**: `height`, `width`, `color` 등 변경하지 않음
3. **기능 동작 유지**: 기존 기능이 정상 작동하는지 확인
4. **점진적 개선**: 각 Phase마다 테스트 후 다음 Phase 진행
5. **문서화**: 모든 변경사항 문서화

---

## 📝 작업 예시 템플릿

### Button 컴포넌트 개선 예시

```tsx
// Before
<TouchableOpacity
  style={buttonStyle}
  onPress={onPress}
  disabled={disabled || loading}
  {...props}
>
  <Text>{title}</Text>
</TouchableOpacity>

// After
<TouchableOpacity
  style={buttonStyle}  // 변경 없음
  onPress={onPress}
  disabled={disabled || loading}
  accessibilityRole="button"
  accessibilityLabel={title}
  accessibilityState={{ disabled: disabled || loading }}
  hitSlop={
    size === 'sm' ? { top: 6, bottom: 6, left: 6, right: 6 } :
    size === 'base' ? { top: 2, bottom: 2, left: 2, right: 2 } :
    undefined
  }
  {...props}
>
  <Text>{title}</Text>
</TouchableOpacity>
```

---

**작성일**: 2025-01-XX  
**브랜치**: `feat/accessibility`  
**기준**: KS X 3253:2016 모바일 애플리케이션 콘텐츠 접근성 지침 2.0
