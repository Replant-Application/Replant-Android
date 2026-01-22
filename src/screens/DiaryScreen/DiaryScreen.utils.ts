import { colors } from '../../utils/designTokens';
import { EMOTION_CATEGORIES } from '../../constants/screens/diary';

// 감정 카테고리 확인
const getEmotionCategory = (emotion: string): 'positive' | 'neutral' | 'negative' => {
  if (EMOTION_CATEGORIES.positive.includes(emotion)) return 'positive';
  if (EMOTION_CATEGORIES.neutral.includes(emotion)) return 'neutral';
  if (EMOTION_CATEGORIES.negative.includes(emotion)) return 'negative';
  return 'neutral';
};

// 감정별 개별 색상 매핑
export const getEmotionColor = (emotion: string): string => {
  const emotionColorMap: Record<string, string> = {
    // 긍정적 감정
    '행복': colors.orange[300],      // 밝은 노란색/주황색
    '기쁨': colors.orange[200],       // 밝은 노란색
    '사랑': colors.red[400],         // 분홍/빨간색
    '만족': colors.purple[400],      // 보라색
    '감사': colors.green[500],        // 초록색
    '희망': colors.blue[400],         // 하늘색
    '흥분': colors.red[500],          // 빨간색
    '자신감': colors.green[400],      // 연한 초록색
    '열정': colors.orange[500],       // 주황색
    
    // 부정적 감정
    '슬픔': colors.blue[600],         // 파란색
    '우울': colors.blue[800],         // 진한 파란색
    '외로움': colors.purple[600],     // 보라색
    '피곤': colors.gray[600],         // 회색
    '화남': colors.red[600],          // 빨간색
    '짜증': colors.orange[600],       // 주황색
    '불안': colors.orange[400],       // 노란색/주황색
    '걱정': colors.orange[300],       // 노란색
    '스트레스': colors.red[500],      // 빨간색
  };
  
  return emotionColorMap[emotion] || colors.gray[500];
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

