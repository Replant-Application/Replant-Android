/**
 * Amplitude Session Replay Masking Component
 * 민감한 데이터를 마스킹하기 위한 컴포넌트
 */

import React from 'react';
import { ViewProps } from 'react-native';
import { AmpMaskView as AmplitudeAmpMaskView } from '@amplitude/plugin-session-replay-react-native';

interface AmpMaskViewProps extends ViewProps {
  /**
   * 마스킹 옵션
   * - "amp-mask": 뷰를 마스킹 (민감한 데이터 숨김)
   * - "amp-unmask": 마스킹 해제 (웹뷰 등 추적 가능한 뷰)
   */
  mask?: 'amp-mask' | 'amp-unmask';
  children: React.ReactNode;
}

/**
 * Amplitude Session Replay용 마스킹 뷰 컴포넌트
 * 
 * 사용 예시:
 * ```tsx
 * // 민감한 데이터 마스킹
 * <AmpMaskView mask="amp-mask">
 *   <TextInput value={password} />
 * </AmpMaskView>
 * 
 * // 웹뷰 추적 활성화
 * <AmpMaskView mask="amp-unmask" style={{ flex: 1 }}>
 *   <WebView source={{ uri: 'https://example.com' }} />
 * </AmpMaskView>
 * ```
 */
export const AmpMaskView: React.FC<AmpMaskViewProps> = ({
  mask = 'amp-mask',
  children,
  style,
  ...props
}) => {
  return (
    <AmplitudeAmpMaskView mask={mask} style={style} {...props}>
      {children}
    </AmplitudeAmpMaskView>
  );
};
