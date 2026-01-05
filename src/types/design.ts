/**
 * 디자인 토큰 관련 타입 정의
 */

// 색상 팔레트 타입
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// 색상 타입
export interface Colors {
  primary: ColorPalette;
  gray: ColorPalette;
  blue: ColorPalette;
  purple: ColorPalette;
  green: ColorPalette;
  orange: ColorPalette;
  red: ColorPalette;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
    primary: string;
  };
  emotions: {
    happy: string;
    excited: string;
    calm: string;
    grateful: string;
    sad: string;
    angry: string;
    anxious: string;
    tired: string;
  };
  black: string;
  white: string;
}

// 간격 타입
export interface Spacing {
  0: number;
  1: number;
  1.5: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
  16: number;
  20: number;
  24: number;
}

// 타이포그래피 타입
export interface Typography {
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    normal: 'normal' | '400';
    medium: '500';
    semibold: '600';
    bold: 'bold' | '700';
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// 보더 반경 타입
export interface BorderRadius {
  none: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

// 그림자 타입
export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: Shadow;
  base: Shadow;
  lg: Shadow;
  xl: Shadow;
}

// 컴포넌트 스타일 타입
export interface ComponentStyles {
  button: {
    height: {
      sm: number;
      base: number;
      lg: number;
    };
    padding: {
      sm: { horizontal: number; vertical: number };
      base: { horizontal: number; vertical: number };
      lg: { horizontal: number; vertical: number };
    };
  };
  input: {
    height: {
      sm: number;
      base: number;
      lg: number;
    };
    padding: {
      horizontal: number;
      vertical: number;
    };
  };
  card: {
    padding: {
      sm: number;
      base: number;
      lg: number;
    };
  };
}

// 디자인 토큰 전체 타입
export interface DesignTokens {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadows: Shadows;
  components: ComponentStyles;
}
