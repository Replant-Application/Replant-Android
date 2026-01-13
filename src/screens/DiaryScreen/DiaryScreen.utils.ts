import { colors } from '../../utils/designTokens';
import { EMOTION_CATEGORIES } from './DiaryScreen.constants';

// 감정 카테고리 확인
const getEmotionCategory = (emotion: string): 'positive' | 'neutral' | 'negative' => {
  if (EMOTION_CATEGORIES.positive.includes(emotion)) return 'positive';
  if (EMOTION_CATEGORIES.neutral.includes(emotion)) return 'neutral';
  if (EMOTION_CATEGORIES.negative.includes(emotion)) return 'negative';
  return 'neutral';
};

// 카테고리별 색상 매핑
const getCategoryColor = (category: 'positive' | 'neutral' | 'negative'): string => {
  switch (category) {
    case 'positive':
      return colors.green[500];
    case 'neutral':
      return colors.blue[400];
    case 'negative':
      return colors.orange[600];
    default:
      return colors.gray[500];
  }
};

// 감정별 색상 매핑 (카테고리 기반)
export const getEmotionColor = (emotion: string): string => {
  const category = getEmotionCategory(emotion);
  return getCategoryColor(category);
};

// hex 색상에 투명도 추가
export const addOpacity = (color: string, opacity: number): string => {
  // 이미 rgba 형식인 경우
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  // hex 색상인 경우
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // 기본값 반환
  return color;
};

// getCharacterImage는 이제 src/utils/characterUtils.ts에서 import하여 사용

