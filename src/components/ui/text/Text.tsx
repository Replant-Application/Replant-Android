/**
 * 전역 Text 컴포넌트
 * Neo-Regular 폰트가 기본으로 적용되고 여백이 최적화된 Text 컴포넌트
 */

import React from 'react';
import { Text as RNText } from 'react-native';
import { typography } from '../../../utils/designTokens';
import { styles } from './Text.styles';
import { TextProps } from './Text.types';

/**
 * Neo-Regular 폰트가 적용된 Text 컴포넌트
 * Android의 includeFontPadding이 false로 설정되어 여백 문제가 해결됨
 */
export const Text: React.FC<TextProps> = ({
  style,
  size = 'base',
  weight = 'normal',
  lineHeight,
  children,
  ...props
}) => {
  const fontSize = typeof size === 'number' ? size : typography.fontSize[size];
  const calculatedLineHeight = lineHeight || Math.round(fontSize * 1.35);

  const textStyle = [
    styles.default,
    {
      fontSize,
      fontWeight: typography.fontWeight[weight],
      lineHeight: calculatedLineHeight,
    },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

export default Text;

