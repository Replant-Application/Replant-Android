/**
 * Replant Mobile Design Tokens
 * React Native용 디자인 시스템
 */

import { Colors, Spacing, Typography, BorderRadius, Shadows, ComponentStyles } from '../types/design';

export const colors: Colors = {
  // Primary brand colors
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // 메인 색상
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Blue colors
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Purple colors
  purple: {
    50: '#faf5ff',
    100: '#e9d5ff',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#581c87',
  },

  // Green colors
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Orange colors
  orange: {
    50: '#fff7ed',
    100: '#fed7aa',
    200: '#fdba74',
    300: '#fb923c',
    400: '#f97316',
    500: '#ea580c',
    600: '#dc2626',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Black and white colors
  black: '#000000',
  white: '#ffffff',

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#f3f4f6',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    primary: '#22c55e',
  },

  // Emotion colors
  emotions: {
    happy: '#b45309',
    excited: '#c2410c',
    calm: '#0e7490',
    grateful: '#7c3aed',
    sad: '#6b7280',
    angry: '#dc2626',
    anxious: '#b45309',
    tired: '#64748b',
  },
};

export const spacing: Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const typography: Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius: BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows: Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const components: ComponentStyles = {
  button: {
    height: {
      sm: 32,
      base: 40,
      lg: 48,
    },
    padding: {
      sm: { horizontal: 12, vertical: 8 },
      base: { horizontal: 16, vertical: 12 },
      lg: { horizontal: 20, vertical: 16 },
    },
  },
  input: {
    height: {
      sm: 32,
      base: 40,
      lg: 48,
    },
    padding: {
      horizontal: 12,
      vertical: 8,
    },
  },
  card: {
    padding: {
      sm: 12,
      base: 16,
      lg: 20,
    },
  },
};
