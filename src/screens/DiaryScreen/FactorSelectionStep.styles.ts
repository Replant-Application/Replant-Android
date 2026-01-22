/**
 * FactorSelectionStep 스타일
 * 요인 선택 단계 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const COLUMNS = 3; // 그리드 열 수
const BUTTON_GAP = spacing[1]; // 버튼 간격
const CONTAINER_PADDING = spacing[3]; // 컨테이너 패딩
// modalContainer의 marginHorizontal (spacing[4]) + padding (spacing[3]) + content의 paddingHorizontal (CONTAINER_PADDING) 모두 고려
const MODAL_MARGIN = spacing[4]; // modalContainer의 marginHorizontal
const MODAL_PADDING = spacing[3]; // modalContainer의 padding
const AVAILABLE_WIDTH = SCREEN_WIDTH - (MODAL_MARGIN * 2) - (MODAL_PADDING * 2) - (CONTAINER_PADDING * 2);
export const BUTTON_WIDTH = (AVAILABLE_WIDTH - BUTTON_GAP * (COLUMNS - 1)) / COLUMNS;

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  factorsContainer: {
    maxHeight: 400,
    marginBottom: spacing[3],
  },
  factorsContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingBottom: spacing[2],
  },
  factorRow: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    marginBottom: BUTTON_GAP,
  },
  factorButton: {
    width: BUTTON_WIDTH,
    minHeight: spacing[8],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorButtonEmpty: {
    width: BUTTON_WIDTH,
  },
  factorButtonText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    }),
  },
  factorButtonTextSelected: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    ...inputStyles.base(),
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    height: 37,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
});
