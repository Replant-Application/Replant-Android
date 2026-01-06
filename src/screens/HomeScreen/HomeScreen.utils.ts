/**
 * HomeScreen 유틸리티 함수
 */

// 시간대에 따른 배경 결정 (6시~18시: 낮, 18시~6시: 밤)
export const getBackgroundImage = (): 'day' | 'night' => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};

