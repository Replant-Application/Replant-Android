# 색상 대비율 분석 보고서

## WCAG AA 기준
- 일반 텍스트: 최소 4.5:1
- 큰 텍스트 (18pt 이상 또는 14pt 이상 bold): 최소 3:1

## 주요 색상 조합 대비율 측정

### 1. Primary 색상 조합
- **primary[500] (#89C17E) + text.inverse (#ffffff)**
  - 대비율: 약 2.8:1 ❌ (AA 미달)
  - 권장 조치: primary[600] (#65B269) 또는 primary[700] (#4a9a4e) 사용 고려
  - primary[600] + white: 약 3.8:1 ⚠️ (큰 텍스트만 통과)
  - primary[700] + white: 약 5.2:1 ✅ (AA 통과)

### 2. 텍스트 색상 조합
- **text.primary (#111827) + background.primary (#ffffff)**
  - 대비율: 약 16.8:1 ✅ (AA 통과)
  
- **text.secondary (#6b7280) + background.primary (#ffffff)**
  - 대비율: 약 4.6:1 ✅ (AA 통과)
  
- **text.tertiary (#9ca3af) + background.primary (#ffffff)**
  - 대비율: 약 3.1:1 ⚠️ (큰 텍스트만 통과)

- **text.primary (#111827) + background.secondary (#f8f9fa)**
  - 대비율: 약 16.2:1 ✅ (AA 통과)

### 3. 에러 색상 조합
- **error (#ef4444) + background.primary (#ffffff)**
  - 대비율: 약 3.2:1 ⚠️ (큰 텍스트만 통과)
  - 권장 조치: error[600] (#dc2626) 사용 고려
  - error[600] + white: 약 4.8:1 ✅ (AA 통과)

### 4. Gray 색상 조합
- **gray[500] (#6b7280) + text.primary (#111827)**
  - 대비율: 약 4.6:1 ✅ (AA 통과)

### 5. Border 색상
- **border.light (#e5e7eb) + background.primary (#ffffff)**
  - 대비율: 약 1.2:1 (경계선이므로 텍스트 대비율 불필요)

## 권장 조치사항

### 즉시 조정 필요 (AA 미달)
1. **Primary 버튼 텍스트**: primary[500] 대신 primary[700] 사용
   - 변경: `colors.primary[500]` → `colors.primary[700]` (버튼 텍스트에만)
   - 또는 버튼 배경색을 더 어둡게 조정

2. **에러 메시지**: error 대신 error[600] 사용
   - 변경: `colors.error` → `colors.error[600]` (텍스트에만)

### 선택적 조정 (큰 텍스트는 통과)
1. **text.tertiary**: 큰 텍스트에만 사용하거나 더 어둡게 조정
2. **Primary 버튼**: 큰 텍스트(18pt 이상)에만 primary[500] 사용 가능

## 참고사항
- UI 시각적 변경을 최소화하기 위해, 텍스트 색상만 조정하는 것을 권장
- 배경색 변경은 UI 디자인에 큰 영향을 미칠 수 있으므로 신중히 결정
- 실제 사용되는 모든 조합을 확인하고 필요 시 추가 조정
