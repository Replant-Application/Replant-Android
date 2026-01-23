import { TextProps as RNTextProps } from 'react-native';
import { typography } from '../../../utils/designTokens';

export interface TextProps extends RNTextProps {
  /**
   * 폰트 크기 (typography.fontSize의 키 또는 직접 숫자)
   */
  size?: keyof typeof typography.fontSize | number;
  /**
   * 폰트 굵기
   */
  weight?: keyof typeof typography.fontWeight;
  /**
   * lineHeight (자동 계산 또는 직접 지정)
   */
  lineHeight?: number;
}
