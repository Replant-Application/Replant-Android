# 🛠️ 개발 가이드

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   └── specialized/    # 특화 컴포넌트
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── navigation/         # 네비게이션
├── screens/            # 화면 컴포넌트
├── services/           # 비즈니스 로직
├── utils/              # 유틸리티 함수
└── data/               # 정적 데이터
```

## 🎨 디자인 시스템

### Design Tokens 사용법

```javascript
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: borderRadius.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
});
```

### 색상 시스템
- `colors.primary.*`: 메인 브랜드 색상
- `colors.text.*`: 텍스트 색상
- `colors.background.*`: 배경 색상
- `colors.emotions.*`: 감정별 색상

### 간격 시스템
- `spacing[0-24]`: 4px 단위로 증가
- `spacing[0] = 0px`, `spacing[1] = 4px`, `spacing[2] = 8px`...

## 🔧 Hook 개발 가이드

### 커스텀 훅 구조

```javascript
/**
 * 훅 설명
 *
 * @param {Type} param - 매개변수 설명
 * @returns {Object} 반환값 설명
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export const useCustomHook = (param) => {
  // 상태 정의
  const [state, setState] = useState(initialValue);

  // 함수 정의 (useCallback으로 최적화)
  const handleAction = useCallback(async () => {
    // 로직 구현
  }, [dependencies]);

  // 반환값 (useMemo로 최적화)
  return useMemo(() => ({
    state,
    handleAction,
  }), [state, handleAction]);
};
```

## 🚨 에러 처리

### 에러 처리 패턴

```javascript
import { executeWithErrorHandling } from '../utils/errorHandler';

// 1. executeWithErrorHandling 사용
const result = await executeWithErrorHandling(
  () => someAsyncFunction(),
  '컨텍스트 설명'
);

if (result.success) {
  // 성공 처리
} else {
  // 에러 처리
}
```

### 로깅 사용법

```javascript
import { logError, logInfo, logUserAction } from '../utils/logger';

// 에러 로깅
logError('에러 메시지', error, { context: '추가 정보' });

// 정보 로깅
logInfo('정보 메시지', { data: '추가 데이터' });

// 사용자 액션 로깅
logUserAction('button_click', { buttonName: 'submit' });
```

## 📱 컴포넌트 개발

### 컴포넌트 구조

```javascript
/**
 * 컴포넌트 설명
 *
 * @param {string} title - 제목
 * @param {Function} onPress - 클릭 핸들러
 * @param {Object} style - 추가 스타일
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../utils/designTokens';

const Component = ({ title, onPress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
});

export default Component;
```

## 🔄 상태 관리

### Context 사용법

```javascript
// Context 생성
const MyContext = createContext();

// Provider 컴포넌트
export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialValue);

  // 메모이제이션된 값
  const value = useMemo(() => ({
    state,
    setState,
  }), [state]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

// Hook 사용
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

## 🧪 테스트

### 테스트 실행

```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm run test:coverage

# 특정 파일 테스트
npm test -- --testPathPattern=Button
```

## 📦 빌드 및 배포

### 개발 빌드

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### 프로덕션 빌드

```bash
# iOS
cd ios && xcodebuild -workspace ReplantMobileApp.xcworkspace -scheme ReplantMobileApp -configuration Release

# Android
cd android && ./gradlew assembleRelease
```

## 🐛 디버깅

### 로그 확인

```bash
# iOS 시뮬레이터 로그
npx react-native log-ios

# Android 에뮬레이터 로그
npx react-native log-android
```

### 성능 모니터링

```javascript
import { measurePerformance } from '../utils/logger';

const result = await measurePerformance(
  'operation_name',
  async () => {
    // 비즈니스 로직
  },
  { additionalData: 'value' }
);
```

## 📋 코딩 컨벤션

### 네이밍 규칙
- **컴포넌트**: PascalCase (`Button`, `UserCard`)
- **함수/변수**: camelCase (`handleClick`, `userName`)
- **상수**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRY`)
- **파일명**: camelCase (`userService.js`, `Button.jsx`)

### 파일 구조
- **컴포넌트**: `ComponentName.jsx`
- **훅**: `useHookName.js`
- **서비스**: `serviceName.js`
- **유틸리티**: `utilityName.js`

### Import 순서
1. React 관련
2. 외부 라이브러리
3. 내부 컴포넌트
4. 유틸리티/서비스
5. 타입 정의

## 🔍 코드 리뷰 체크리스트

- [ ] 디자인 토큰 사용 여부
- [ ] 에러 처리 구현 여부
- [ ] 메모이제이션 적용 여부
- [ ] JSDoc 주석 작성 여부
- [ ] 린터 오류 없음
- [ ] 테스트 케이스 작성
- [ ] 성능 최적화 고려
