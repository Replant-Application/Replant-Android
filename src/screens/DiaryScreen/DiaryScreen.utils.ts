import { colors } from '../../utils/designTokens';

// 감정별 색상 매핑
export const getEmotionColor = (emotion: string): string => {
  const colorMap: { [key: string]: string } = {
    '행복': colors.orange[400],
    '기쁨': colors.orange[300],
    '사랑': colors.purple[400],
    '만족': colors.green[400],
    '감사': colors.purple[300],
    '희망': colors.blue[400],
    '흥분': colors.orange[500],
    '자신감': colors.blue[500],
    '열정': colors.orange[600],
    '평화': colors.blue[300],
    '자유': colors.purple[500],
    '용기': colors.blue[600],
    '긍정': colors.green[500],
    '평온': colors.blue[200],
    '슬픔': colors.gray[400],
    '우울': colors.gray[500],
    '외로움': colors.gray[600],
    '피곤': colors.gray[500],
    '지루함': colors.gray[400],
    '무관심': colors.gray[300],
    '중립': colors.gray[400],
    '화남': colors.error,
    '짜증': colors.orange[700],
    '불만': colors.orange[600],
    '부정': colors.gray[700],
    '불안': colors.orange[500],
    '걱정': colors.orange[400],
    '스트레스': colors.orange[600],
    '혼란': colors.purple[400],
    '당황': colors.orange[500],
    '후회': colors.gray[600],
    '죄책감': colors.gray[700],
    '부끄러움': colors.purple[500],
    '놀람': colors.blue[400],
  };
  return colorMap[emotion] || colors.gray[500];
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

