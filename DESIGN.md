---
name: Replant Mobile Design System
version: 0.2.0
status: living-document
source:
  primaryTokens: "src/utils/designTokens.ts"
  commonStyles:
    - "src/utils/styles/textStyles.ts"
    - "src/utils/styles/layoutStyles.ts"
    - "src/utils/styles/commonStyles.ts"
    - "src/utils/styles/componentStyles.ts"
  uiComponents: "src/components/ui"
  screenStyles: "src/screens"
tokens:
  colors:
    primary:
      50: "#f0f7f0"
      100: "#e8f4e8"
      200: "#d4ead4"
      300: "#C6E07B"
      400: "#A8D47A"
      500: "#89C17E"
      600: "#65B269"
      700: "#4a9a4e"
      800: "#3a7a3d"
      900: "#2a5a2d"
    gray:
      50: "#f9fafb"
      100: "#f3f4f6"
      200: "#e5e7eb"
      300: "#d1d5db"
      400: "#9ca3af"
      500: "#6b7280"
      600: "#4b5563"
      700: "#374151"
      800: "#1f2937"
      900: "#111827"
    blue:
      50: "#eff6ff"
      100: "#dbeafe"
      200: "#bfdbfe"
      300: "#93c5fd"
      400: "#60a5fa"
      500: "#3b82f6"
      600: "#2563eb"
      700: "#1d4ed8"
      800: "#1e40af"
      900: "#1e3a8a"
    purple:
      50: "#faf5ff"
      100: "#e9d5ff"
      200: "#ddd6fe"
      300: "#c4b5fd"
      400: "#a78bfa"
      500: "#8b5cf6"
      600: "#7c3aed"
      700: "#6d28d9"
      800: "#5b21b6"
      900: "#581c87"
    orange:
      50: "#fff7ed"
      100: "#fed7aa"
      200: "#fdba74"
      300: "#fb923c"
      400: "#f97316"
      500: "#ea580c"
      600: "#dc2626"
      700: "#c2410c"
      800: "#9a3412"
      900: "#7c2d12"
    red:
      50: "#fef2f2"
      100: "#fee2e2"
      200: "#fecaca"
      300: "#fca5a5"
      400: "#f87171"
      500: "#ef4444"
      600: "#dc2626"
      700: "#b91c1c"
      800: "#991b1b"
      900: "#7f1d1d"
    base:
      black: "#000000"
      white: "#ffffff"
    semantic:
      success: "#89C17E"
      warning: "#f59e0b"
      error: "#dc2626"
      info: "#3b82f6"
    background:
      primary: "#ffffff"
      secondary: "#f8f9fa"
      tertiary: "#f3f4f6"
    text:
      primary: "#111827"
      secondary: "#6b7280"
      tertiary: "#9ca3af"
      inverse: "#ffffff"
    border:
      light: "#e5e7eb"
      medium: "#d1d5db"
      dark: "#9ca3af"
      primary: "#89C17E"
    overlay:
      dark: "rgba(0, 0, 0, 0.6)"
      medium: "rgba(0, 0, 0, 0.5)"
      light: "rgba(0, 0, 0, 0.4)"
      whiteHeavy: "rgba(255, 255, 255, 0.95)"
      whiteMedium: "rgba(255, 255, 255, 0.9)"
      whiteLight: "rgba(255, 255, 255, 0.8)"
    brandAccent: "#D4A574"
    emotion:
      happy: "#b45309"
      excited: "#c2410c"
      calm: "#0e7490"
      grateful: "#7c3aed"
      sad: "#6b7280"
      angry: "#dc2626"
      anxious: "#b45309"
      tired: "#64748b"
  typography:
    fontFamily:
      regular: "Neo-Regular"
      bold: "Maplestory Bold"
      light: "Maplestory Light"
    fontSize:
      xs: 12
      sm: 14
      base: 16
      lg: 18
      xl: 20
      xxl: 22
      "2xl": 24
      "3xl": 30
      "4xl": 36
    fontWeight:
      normal: "400"
      medium: "500"
      semibold: "600"
      bold: "700"
    lineHeightFormula: "Math.round(fontSize * 1.35)"
  spacing:
    0: 0
    1: 4
    1.5: 6
    2: 8
    3: 12
    4: 16
    5: 20
    6: 24
    8: 32
    10: 40
    12: 48
    16: 64
    20: 80
    24: 96
  radius:
    none: 0
    sm: 4
    base: 8
    md: 12
    lg: 16
    xl: 20
    full: 9999
  layout:
    globalGutter: 16
    globalGutterLarge: 20
    screenPaddingHorizontal: 16
    screenPaddingVertical: 16
  components:
    button:
      heights:
        sm: 32
        base: 40
        lg: 48
      defaultRadius: 8
      defaultHorizontalPadding:
        sm: 12
        base: 16
        lg: 20
    input:
      heights:
        sm: 32
        base: 40
        lg: 48
      minHeight: 44
      radius: 8
    card:
      radius: 8
      padding:
        sm: 12
        base: 16
        lg: 24
    fab:
      sizes:
        sm: 48
        base: 56
        lg: 64
legacyDirectColors:
  missionTabs:
    background: "#F5F5F0"
    border: "#A68B6F"
    active: "#8B6F47"
    title: "#6B5344"
  todoList:
    cardBorder: "#D4A574"
    progressTrack: "#E8DDD4"
    progressFill: "#4CAF50"
    completedBadgeBg: "#D4EDDA"
    completedBadgeText: "#2E7D32"
    incompleteBadgeBg: "#FFE082"
    incompleteBadgeText: "#E65100"
  social:
    kakao: "#FEE500"
    googleBackground: "#ffffff"
  adminAndStatus:
    materialGreen: "#4CAF50"
    materialBlue: "#2196F3"
    deepBlue: "#1565C0"
    infoBlue: "#1976D2"
    lightBlue: "#E3F2FD"
  expressive:
    coral: "#FF6B6B"
    mint: "#4ECDC4"
    mintLight: "#95E1D3"
    yellow: "#FFE066"
    softRed: "#F38181"
    warmPaper: "#FFF8E7"
    warmCream: "#FFF8F0"
    warmSand: "#F5E6D3"
    warmStone: "#F5F0E8"
    warmBrown: "#8B7355"
    warmTan: "#A68B6F"
    warmCoffee: "#6B5344"
---

# Replant Mobile Design System

이 문서는 Replant Android 앱의 현재 디자인 규격을 정리한 living document입니다. 새 화면이나 컴포넌트를 만들 때는 먼저 `src/utils/designTokens.ts`, `src/utils/styles/*`, `src/components/ui/*`의 기존 규칙을 사용하고, 화면별 직접 색상은 아래 “레거시 직접값” 섹션의 사용처를 확인한 뒤 재사용합니다.

## Product Tone

Replant는 사용자가 작은 일상 미션, 감정 기록, 캐릭터 성장, 커뮤니티 인증을 통해 회복 루틴을 쌓는 앱입니다. 전체 톤은 calm, supportive, routine-friendly, lightly playful입니다.

문장은 짧고 다정하게 씁니다. 실패/미완료 상태에서도 사용자를 압박하지 않고 다음 행동을 자연스럽게 안내합니다. 관리자 화면은 같은 앱 안에 있더라도 더 정보 밀도 높고 실용적으로 구성합니다.

## Token Sources

- 색상, 간격, 폰트, radius, shadow의 1차 기준은 `src/utils/designTokens.ts`입니다.
- 텍스트 스타일 생성은 `src/utils/styles/textStyles.ts`의 `createTextStyle`, `createTitleStyle`, `createBodyStyle`, `createSecondaryTextStyle`, `createErrorTextStyle`, `createButtonTextStyle`을 씁니다.
- 기본 화면 여백은 `layout.globalGutter` 16, 큰 화면 여백은 `layout.globalGutterLarge` 20입니다.
- 공통 버튼/입력/카드/모달/empty/list/section 스타일은 `src/utils/styles/commonStyles.ts`를 우선합니다.
- dropdown, checkbox, tab, filter, badge, mission item, mission tab, loading, header helper는 `src/utils/styles/componentStyles.ts`를 우선합니다.

## Color System

### Primary Green

Primary palette는 Replant의 회복, 성장, 루틴 완성감을 표현합니다.

- `primary.50` `#f0f7f0`: 연한 정보 박스, 선택 배경
- `primary.100` `#e8f4e8`: 칩/아이콘 배경
- `primary.200` `#d4ead4`: 연한 border
- `primary.300` `#C6E07B`: 밝은 보조 강조
- `primary.400` `#A8D47A`: 진행/보조 강조
- `primary.500` `#89C17E`: 기본 브랜드 green, 필터 active, 채팅 bubble, modal button
- `primary.600` `#65B269`: 강조 텍스트, onboarding CTA, 일부 성공/완료 상태
- `primary.700` `#4a9a4e`: primary button 배경. 흰 텍스트 대비를 위해 중요 CTA는 이 값을 선호합니다.
- `primary.800` `#3a7a3d`, `primary.900` `#2a5a2d`: 강한 대비가 필요한 곳에서만 제한적으로 사용합니다.

### Neutral Gray

Gray palette는 텍스트 계층, 경계선, 비활성 상태, 다크 모달에 사용합니다.

- `gray.50` `#f9fafb`, `gray.100` `#f3f4f6`: 옅은 리스트/탭/section 배경
- `gray.200` `#e5e7eb`, `gray.300` `#d1d5db`: border, disabled background, divider
- `gray.400` `#9ca3af`, `gray.500` `#6b7280`: 보조 텍스트, pagination dot
- `gray.600` `#4b5563`, `gray.700` `#374151`: dark surface border/button
- `gray.800` `#1f2937`: alert modal surface
- `gray.900` `#111827`: dark onboarding background, diary input background, primary text

### Semantic Colors

- Success: `#89C17E`
- Warning/rating star: `#f59e0b`
- Error/badge/delete: `#dc2626`
- Info: `#3b82f6`
- Text primary: `#111827`
- Text secondary: `#6b7280`
- Text tertiary: `#9ca3af`
- Border light: `#e5e7eb`

### Brand Accent And Warm Palette

`brandAccent` `#D4A574`는 홈, 투두리스트, 보상/성장, 캐릭터 중심 카드에 쓰이는 따뜻한 강조색입니다. 현재 코드에서는 `TodoListScreen` 카드 border, 홈 채팅 시작 버튼 border, 투두 섹션 border에 반복됩니다.

Mission/Todo 상단 탭과 카드 계열은 아래 직접값을 사용합니다.

- Warm surface: `#F5F5F0`
- Warm border: `#A68B6F`
- Warm active: `#8B6F47`
- Warm title/text: `#6B5344`
- Warm track: `#E8DDD4`
- Warm paper: `#FFF8E7`, `#FFF8F0`
- Warm sand: `#F5E6D3`, `#F5F0E8`

이 값들은 아직 `designTokens.ts`에 정규 토큰으로 승격되지 않은 레거시 직접값입니다. 같은 계열 UI를 추가할 때는 새 hex를 만들지 말고 이 목록을 재사용하거나 토큰 승격을 먼저 합니다.

### Overlay

- Dark overlay: `rgba(0, 0, 0, 0.6)`, modal/dark focus overlay
- Medium overlay: `rgba(0, 0, 0, 0.5)`, bottom sheet overlay
- Light overlay: `rgba(0, 0, 0, 0.4)`, diary slider/search surface
- White heavy: `rgba(255, 255, 255, 0.95)`, home/todo elevated white panel
- White medium: `rgba(255, 255, 255, 0.9)`, modal/button soft white
- White light: `rgba(255, 255, 255, 0.8)`, diary light control surface

### Social Colors

- Kakao: `#FEE500`
- Google social button: white background + `border.light`

## Typography

Android uses custom fonts from `src/assets/fonts`.

- Regular: `Neo-Regular`
- Bold: `Maplestory Bold`
- Light: `Maplestory Light`

Text helpers set Android `fontFamily` to `Neo-Regular`, `includeFontPadding: false`, and default `fontWeight: 500`. iOS keeps the system font unless explicitly overridden.

Font scale:

- `xs`: 12
- `sm`: 14
- `base`: 16
- `lg`: 18
- `xl`: 20
- `xxl`: 22
- `2xl`: 24
- `3xl`: 30
- `4xl`: 36

Line height is calculated as `Math.round(fontSize * 1.35)`. Some screen styles multiply this further for dense Korean copy, especially diary/home speech bubbles and empty states.

Text roles:

- Title: `createTitleStyle`, primary text color, usually medium weight
- Body: `createBodyStyle`, primary text color
- Secondary: `createSecondaryTextStyle`, secondary text color
- Error: `createErrorTextStyle`, semantic error
- Button: `createButtonTextStyle`, inverse text, centered

## Spacing And Layout

Use the 4px-based spacing scale:

- 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

Common layout:

- Default horizontal screen gutter: 16
- Large/detail screen gutter: 20
- Standard section bottom margin: 16
- Standard card padding: 16
- Large card padding: 24
- Long scroll bottom padding often reserves 120-150 for tab bars and bottom sheets.

Avoid inventing arbitrary spacing unless the existing screen already uses responsive calculations, as in `LoginScreen`.

## Radius

- `none`: 0
- `sm`: 4
- `base`: 8. Default for buttons, inputs, cards, mission items.
- `md`: 12. Retry buttons, medium controls.
- `lg`: 16. Bottom-sheet inputs, emotion tags, diary/list cards.
- `xl`: 20. Modals and rounded bottom sheets.
- `full`: 9999. Pills, badges, circular controls.

Existing exceptions:

- Onboarding start button uses radius 12.
- Home bottom sheet uses `borderRadius.xl + 8`, effectively 28.
- Mission/Todo warm tab inner items use radius 6.

## Shadows

Token shadows:

- `sm`: black, y 1, opacity .05, radius 2, elevation 1
- `base`: black, y 2, opacity .1, radius 4, elevation 2
- `lg`: black, y 4, opacity .15, radius 8, elevation 4
- `xl`: black, y 8, opacity .2, radius 16, elevation 8

Component-specific shadows:

- FAB: shadowColor `primary.500`, y 4, opacity .3, radius 8, elevation 8
- Home chat start button: black y 2, opacity .15, radius 4, Android elevation 4
- Onboarding start button: primary.600 y 4, opacity .3, radius 8, Android elevation 4

## Buttons

### Shared Button Component

Source: `src/components/ui/button`.

Variants:

- `primary`: background `primary.700`, inverse text
- `secondary`: background `gray.200`, primary text
- `outline`: transparent, 1px border `primary.500`, text `primary.500`
- `ghost`: transparent, text `primary.500`

Sizes:

- `sm`: height 32, horizontal padding 12, text `sm`
- `base`: height 40, horizontal padding 16, text `base`
- `lg`: height 48, horizontal padding 20, text `lg`

State:

- Disabled background/border `gray.300`, disabled text `text.tertiary`
- Loading indicator is inverse on primary, `primary.500` otherwise
- `sm` gets hitSlop 6, `base` gets hitSlop 2

### Common Button Helpers

`buttonStyles.primary()`:

- background `primary.700`
- radius 8
- vertical padding 12
- horizontal padding 24
- minHeight 48

`buttonStyles.secondary()`:

- background `gray.100`
- border `gray.300`
- radius 8
- minHeight 48

`buttonStyles.small()` still enforces minHeight 48 for accessibility.

### Screen-Specific Buttons

- Login button: full width, responsive height at least 44, background `primary.700`, radius 8.
- Login modal button: full width, responsive height at least 44, background `primary.500`, radius 8.
- Onboarding start button: absolute bottom, width 90%, background `primary.600`, vertical padding 16, radius 12.
- Home chat start button: pill, `whiteHeavy` background, 2px `brandAccent` border, full radius.
- Home bottom sheet retry/create buttons: primary helper, often radius `md`.
- Diary navigation buttons: soft white overlays for cancel/skip/confirm/next/write; dark medium overlay for secondary view; green `green.600` for detail CTA; error red for delete.
- Mission group detail button: `green.500`, vertical padding 12, radius 12.
- Todo create button: whiteHeavy background, dashed 2px `brandAccent` border, radius 8.

## Inputs

Source: `src/components/ui/input` and `inputStyles`.

Base input:

- background `background.primary`
- border 1px `border.light`
- radius 8
- horizontal padding 16
- vertical padding 8
- minHeight 44 in helper, component sizes 32/40/48
- text `base`, color `text.primary`, lineHeight 22, letterSpacing 0, Android `textAlignVertical: center`

States:

- Focus: border `primary.500`, width 2
- Error: border `red.500`
- Disabled: background `gray.100`, opacity .6
- Multiline: height auto, minHeight 40, top aligned

Screen-specific:

- Login inputs use responsive height and letterSpacing 1.
- Diary text input is dark: background `gray.900`, border `gray.700`, text white, height 260.
- Diary search input sits on `overlay.light` with border `gray.700`, text white.
- Reant chat input uses `background.secondary`, radius 16, minHeight 44, maxHeight 100.

## Cards And Panels

Source: `src/components/ui/card`, `cardStyles`, screen styles.

Base card:

- background `background.primary`
- radius 8
- padding 16
- border 1px `border.light`

Padding variants:

- `sm`: 12
- `base`: 16
- `lg`: 24

Common variants:

- Flat: same as base, explicit light border
- Shadow card helper: white background, radius 8, padding 16, black y 2 shadow, opacity .1, radius 4, elevation 3
- Emphasized helper: white background, radius 8, padding 16, 4px `gray.900` border

Product-specific panels:

- Home todo section: `whiteHeavy`, radius 8, padding 16, border 2 `brandAccent`
- Home bottom sheet: white, top radius 28, thick 12px `gray.900` top/side border
- Todo list card: `whiteHeavy`, radius 8, padding 16, border 2 `brandAccent`
- Diary modal: `overlay.dark`, radius 16, shadow lg
- Diary list item: `overlay.dark`, radius 16, border `whiteLight`, opacity .9
- Diary detail signboard: outer `orange.900`, inner `orange.50`
- Alert modal: `gray.800`, width 350, radius 20
- Reant bottom sheet: white, top radius 20, maxHeight 30%

## Tabs And Filters

### Generic Pill Tab

Source: `TabBar.styles.ts`.

- Container: white section with horizontal padding 16, vertical padding 12, bottom border light
- Wrapper: `gray.50` background, radius 8, padding 4
- Tab: flex 1, radius 16, minHeight 40
- Active: `green.500` background + `shadows.sm`
- Text: base, medium, secondary; active white

### Simple Tab

- Container: row, horizontal padding 16, vertical 8, white background, bottom border light
- Tab: radius 12, vertical padding 12, margin horizontal 4
- Active: `primary.500`
- Badge: error background, full radius, horizontal padding 8, vertical 2

### Underline Tab

- Container: row, white background, bottom border light
- Tab: bottom border width 2
- Active line/text: `primary.600`
- Inactive text: `text.tertiary`

### SimpleTabBar Component

Used for compact text tabs.

- Container top padding 8, bottom border `gray.300`
- Active underline: black, width 2
- Text: `sm`, normal `gray.500`; active black medium
- Counts follow the same color/weight as label

### Warm Mission/Todo Tabs

Used in `MissionScreen`, `TodoListScreen`, and shared `missionTabStyles`.

- Container: `#F5F5F0`
- Border: 1px `#A68B6F`
- Radius: 8
- Padding vertical 2.5 or spacing 4 equivalent, horizontal 3, gap 2
- Tab radius: 6
- Active background: `#8B6F47`
- Active text: white
- Inactive text: `text.primary`

### FilterBar

Pill filter:

- Wrapper follows generic tab container
- Item minHeight 40, radius 16, padding vertical 8, horizontal 12
- Active background `primary.500`, shadow sm

Button filter:

- Container row, gap 8, horizontal 16, vertical 12, white background
- Option: gray.100 background, 1px gray.300 border, full radius, horizontal 16, vertical 8
- Active: `primary.500` border/background, white text

## Chips, Badges, And Status

### Removable Chip

- Row, center aligned
- background `primary.100`
- border 1px `primary.500`
- full radius
- horizontal padding 12, vertical 6, gap 4
- text `xs`, medium, `primary.700`

### Notification Badge

- Absolute top/right inside icon
- background `error`
- full radius
- minWidth 20, height 20
- border 2.5 `background.primary`
- text `xs`, medium, white

### Tab Badge

- background `error`
- full radius
- horizontal padding 8, vertical 2
- text `xs`, medium, white

### Todo Status Badges

- Default active: background `primary.500`, white text
- Completed: background `#D4EDDA`, text `#2E7D32`
- Archived: background `gray.200`, text `text.secondary`
- Incomplete: background `#FFE082`, text `#E65100`
- Shape: full radius, vertical padding 4, horizontal padding 16

### Badge Grid Item

From `badgeStyles`:

- Container width 30%, padding 12, background `gray.50`, radius 16
- Icon container 56x56, full radius, background `primary.100`
- Title `xs`, medium, primary text
- Subtitle `xs`, medium, `primary.600`

## Modals And Sheets

### Common Modal

Overlay:

- flex 1
- background `overlay.dark`
- center aligned

Content:

- white background
- radius 20
- padding 20
- width 85%, maxWidth 350
- centered items

Bottom sheet:

- overlay `overlay.medium`
- content white
- top radius 16
- maxHeight 70%

### AlertModal

- Surface `gray.800`
- width 350
- close button 32x32 top/right 12
- title `xl`, white
- icon 160x160
- message base, `gray.300`, centered
- button green.600, radius 20

### ConfirmModal

Follows common modal pattern. Use for destructive or confirmation flows, with primary/secondary buttons matching common button helpers.

### ReantChatBottomSheet

- Overlay `rgba(0,0,0,0.5)`
- Sheet white, top radius 20, maxHeight 30%
- Drag handle 40x4, `gray.300`, full radius
- Header horizontal padding 16, bottom padding 12, bottom border light
- User bubble: maxWidth 75%, `primary.500`, radius 16 with top-right radius 4, padding 16x12
- Reant text bubble uses image background; text primary
- Input row: top border light, white background, padding 16x8
- Send button: `primary.500`, radius 16, horizontal padding 20, vertical 12, minWidth 60

## Navigation And Headers

### AppHeader

- Transparent background
- Top padding 24, bottom 12, left/right 16
- Right section gap 4
- Icon wrapper 52x52
- Icon image 36x36
- Sound icon font size 28
- Notification badge as above

### Header Back Button

- Icon 24x24
- Tint `text.primary`
- Button padding 8

## Progress And Ratings

### ProgressBar Component

- Container width 100%
- Label `sm`, title style, color secondary, bottom margin 8
- Bar flexes inside row, full radius, overflow hidden
- Fill height 100%, full radius
- Percentage text `sm`, medium, `primary.600`
- Remaining text `xs`, secondary, centered, top margin 8

### Todo Progress

- Track height 8, background `#E8DDD4`, full radius
- Fill `#4CAF50`, full radius
- Percent text `sm`, medium, `#6B5344`

### Circular Progress

Use existing `CircularProgressBar` component; keep stroke colors aligned to primary/success unless the component call site has a domain-specific override.

### RatingSelector

- Row gap 8, center aligned
- Star size `2xl` 24
- Inactive `gray.300`
- Active `warning`

## Empty And Loading States

Empty state helper:

- Container centered
- vertical padding 24
- width 100%
- Icon 48x48, bottom margin 12, opacity .5
- Main text base, secondary, centered
- Subtext sm, tertiary, centered

Loading helper:

- flex 1 centered
- vertical padding 24
- Loading text base, secondary, top margin 12

Screen-specific empty states may add extra vertical padding, especially Todo and Home.

## Screen Patterns

### Login

Visual pattern:

- White primary content area on secondary background
- Responsive horizontal padding: min(24, screenWidth * .05)
- Logo size: min(280, screenWidth * .7, screenHeight * .35)
- Inputs at least 44 high, white background, light border, radius 8
- Login CTA primary.700, full width, at least 44 high
- Footer links secondary `sm`, underline for sign-up link
- Social section uses horizontal divider lines and circular providers
- Kakao circle `#FEE500`; Google circle white + light border
- Welcome modal uses white surface, radius 20, responsive width max 350

### Onboarding

Visual pattern:

- Full-screen dark background `gray.900`
- Slide image max width 95% of viewport, max height 50% of viewport
- Text white, `lg`, centered, medium
- Pagination dots 8x8, inactive `gray.400`, active white
- Start button absolute bottom, width 90%, background `primary.600`, radius 12
- Skip button transparent at top-right

### Home

Visual pattern:

- Full background image
- Speech bubble image with centered `lg` medium text
- Character image positioned large and playful
- Chat start pill: whiteHeavy, brandAccent border
- Bottom sheet: white, radius 28 top corners, heavy `gray.900` border on top/sides
- Todo section: whiteHeavy card, 2px brandAccent border
- Mission rows: whiteLight, light border, completed rows gray/opacity
- Empty/completed messages use supportive copy, green success titles

### Diary

Visual pattern:

- Dark overlay modal surfaces with white text
- Welcome modal uses overlay.dark, radius 16, padding 24, shadow lg
- Diary questions `xl`, medium, white
- Emotion tags are rounded `lg`, white text by default, selected state uses thicker border and dark text
- Slider track height 20 with overlay background and white-light border; fill height 16; thumb 22x22 white with shadow
- Text writing area dark `gray.900`, border `gray.700`, white text, height 260
- Voice button 37x37, dark surface, active border primary.500
- Detail signboard uses orange.900 frame and orange.50 paper
- Detail emotion tags use primary.100/primary.300/primary.700
- Detail factor tags use orange.100/orange.300/orange.700

### Mission

Visual pattern:

- Warm segmented tabs for top-level switching
- Page content uses 16 gutter and generous bottom padding
- Group info boxes use primary.50 background, primary.200 border, primary.700 text
- Inline detail card white, radius 16, primary.200 border
- Group CTA green.500, edit button gray.200

### TodoList

Visual pattern:

- Warm white cards on image/soft background
- Create button is dashed brandAccent border, whiteHeavy surface
- Card border 2 brandAccent, radius 8, padding 16
- More menu is vertical dots 4x4
- Progress track warm beige `#E8DDD4`, fill material green `#4CAF50`
- Status badges use warm semantic direct colors listed above
- Info panel whiteMedium, radius 16, brandAccent border

### Community And Mission Sets

Use the same warm mission tab style where the UI switches between mission/verification/community modes. Lists should use existing Card, FilterBar, ReviewCard, MissionSetList patterns before adding new surfaces.

### Admin Screens

Admin screens may use denser layouts and stronger status colors. Existing direct colors include material green `#4CAF50`, material blue `#2196F3`, deep blue `#1565C0`, info blue `#1976D2`, light blue `#E3F2FD`. Keep these contained to admin/status contexts unless promoted to tokens.

## Assets And Imagery

Existing assets live in `src/assets/images` and should be reused before adding new visual language. Notable categories:

- App/logo/loading: `RePlant_Logo.png`, `Replant_Loading.png`, app icons
- Onboarding: `onboarding_1.png` through `onboarding_5.png`
- Navigation/actions: home, settings, notification, search, filter, edit, delete, plus, check, camera, picture
- Social: Kakao and Google logos
- Character/mood/mission imagery: day, evening, night, clean, coffee, health, hospital, book, badge, goal, heart, crying, funny
- Conversation bubble parts: `conversation_top`, `conversation_middle`, `conversation_bottom`, `conversation`

Do not introduce a new illustration style for core flows unless the existing asset set cannot support the feature.

## Accessibility Rules

- Primary CTA should use `primary.700` with white text when text contrast matters.
- Text contrast target: WCAG AA 4.5:1 for body text.
- UI indicator/border contrast target: 3:1.
- Touch target target: 44dp minimum, 48dp preferred for primary actions.
- Small buttons may use smaller visual height only if hitSlop preserves touch area.
- Do not communicate state by color alone; use labels, iconography, or position.
- Korean text must not be clipped inside chips, badges, buttons, and cards. Prefer wrapping or shorter labels.

## Implementation Rules

- Start with `src/utils/designTokens.ts`. Do not add arbitrary hex values when a token already exists.
- If a direct color is reused across more than one screen, promote it into `designTokens.ts` before expanding its use.
- Use `createTextStyle` helpers for React Native text; keep `includeFontPadding: false` on Android text where vertical alignment matters.
- Use common UI components from `src/components/ui` before building a local variant.
- Keep page-level sections un-nested. Cards are for repeated items, dialogs, and contained tools.
- For user-facing mobile UI, prefer calm green/white/warm accent. For admin/status UI, stronger blue/green status colors are acceptable.

## Do

- Reuse existing green, warm, gray, overlay, and semantic palettes.
- Use 16px default gutters and 8px base radius unless a screen pattern says otherwise.
- Keep primary actions visually singular and clear.
- Use warm brandAccent for home/todo/reward surfaces.
- Use dark overlay surfaces for diary recording/reflection flows.

## Do Not

- Do not add new random hex colors for buttons, cards, tabs, or status badges.
- Do not make every element green; reserve primary green for action, progress, success, and selection.
- Do not add nested cards inside cards.
- Do not use long copy inside small chips or segmented tabs.
- Do not change social brand colors.
- Do not use destructive red for non-destructive emphasis.
