/**
 * FactorSelectionStep 비즈니스 로직
 * 요인 선택 단계: 요인 색상 매핑, 그리드 렌더링 로직
 */

import { useMemo, useCallback } from 'react';
import { colors } from '../../utils/designTokens';
import { FACTOR_OPTIONS } from '../../constants/screens/diary';
import { addOpacity } from './DiaryScreen.utils';

interface FactorSelectionStepContainerProps {
  selectedFactors: string[];
  customFactor: string;
  onToggleFactor: (factor: string) => void;
  onCustomFactorChange: (text: string) => void;
}

export const useFactorSelectionStepContainer = ({
  selectedFactors,
  customFactor,
  onToggleFactor,
  onCustomFactorChange,
}: FactorSelectionStepContainerProps) => {
  /**
   * 요인별 색상 매핑
   */
  const getFactorColor = useCallback((factor: string): string => {
    const factorColorMap: Record<string, string> = {
      // 생활/일상
      '공부': colors.blue[500],
      '학업': colors.blue[600],
      '일': colors.blue[400],
      '취업': colors.purple[500],
      // 관계
      '가족': colors.green[500],
      '친구': colors.green[400],
      '연인': colors.red[400],
      '인간관계': colors.purple[400],
      // 건강/여가
      '운동': colors.green[600],
      '건강': colors.green[300],
      '취미생활': colors.orange[400],
      '게임': colors.purple[500],
      '여행': colors.blue[300],
      // 물질/시간
      '돈': colors.orange[600],
      '음식': colors.orange[500],
      '잠': colors.blue[800],
      // 시간
      '미래': colors.purple[300],
      '과거': colors.gray[500],
    };

    return factorColorMap[factor] || colors.gray[500];
  }, []);

  /**
   * 요인 버튼 스타일 계산
   */
  const getFactorButtonStyle = useCallback(
    (factor: string) => {
      const isSelected = selectedFactors.includes(factor);
      const factorColor = getFactorColor(factor);
      return {
        backgroundColor: isSelected ? addOpacity(factorColor, 0.3) : 'rgba(255, 255, 255, 0.1)',
        borderColor: isSelected ? addOpacity(factorColor, 0.5) : 'rgba(255, 255, 255, 0.3)',
      };
    },
    [selectedFactors, getFactorColor]
  );

  /**
   * 요인이 선택되었는지 확인
   */
  const isFactorSelected = useCallback(
    (factor: string) => {
      return selectedFactors.includes(factor);
    },
    [selectedFactors]
  );

  return {
    // State
    selectedFactors,
    customFactor,
    // Handlers
    onToggleFactor,
    onCustomFactorChange,
    // Utils
    getFactorColor,
    getFactorButtonStyle,
    isFactorSelected,
    // Constants
    factorOptions: FACTOR_OPTIONS,
  };
};
