import React from 'react';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { colors } from '../../../utils/designTokens';

interface SkipNextIconProps {
  size?: number;
  color?: string;
}

/**
 * Skip Next 아이콘 (삼각형 + 세로 막대)
 * 투명 배경, 온보딩 Skip 버튼 등에 사용
 */
export const SkipNextIcon: React.FC<SkipNextIconProps> = ({
  size = 28,
  color = colors.black,
}) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    {/* 오른쪽 삼각형 (재생/다음) */}
    <Polygon points="4,4 4,24 16,14" fill={color} />
    {/* 세로 막대 (스킵) */}
    <Rect x={20} y={6} width={4} height={16} fill={color} />
  </Svg>
);
