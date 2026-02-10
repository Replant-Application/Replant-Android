/**
 * EmotionSelectionStep 스타일
 * 감정 선택 단계 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
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
  summaryContainer: {
    marginBottom: spacing[2],
    paddingHorizontal: CONTAINER_PADDING,
  },
  summaryLabel: {
    ...createTextStyle('xs', { color: colors.gray[400], marginBottom: spacing[1] }),
  },
  summaryText: {
    ...createTextStyle('sm', { color: colors.white, fontWeight: typography.fontWeight.medium }),
  },
  emotionsContainer: {
    maxHeight: 400,
    marginBottom: spacing[3],
  },
  emotionsContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingBottom: spacing[2],
  },
  emotionRow: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    marginBottom: BUTTON_GAP,
  },
  emotionTag: {
    width: BUTTON_WIDTH,
    minHeight: spacing[8],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1, // 항상 동일한 borderWidth 유지
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionTagEmpty: {
    width: BUTTON_WIDTH,
  },
  inputContainer: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  textInput: {
    ...inputStyles.base(),
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    height: 37,
    borderWidth: 1,
    borderColor: colors.gray[700],
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF', // 명시적으로 흰색 지정
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false, // Android 폰트 패딩 제거
    flex: 1,
  },
  voiceButton: {
    width: 37,
    height: 37,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.gray[700],
    borderColor: colors.primary[500],
  },
  voiceButtonIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  // 녹음 중 모달
  recordingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingModalContent: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
    minWidth: 200,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  recordingModalIcon: {
    width: 64,
    height: 64,
    marginBottom: spacing[3],
  },
  recordingModalText: {
    ...createTextStyle('lg', {
      color: colors.white,
      fontWeight: typography.fontWeight.semibold,
    }),
    marginBottom: spacing[2],
  },
  recordingModalHint: {
    ...createTextStyle('sm', {
      color: colors.gray[400],
    }),
  },
  recordingModalCancelButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[700],
  },
  recordingModalCancelButtonText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  emotionTagText: {
    ...createTextStyle('xs', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    }),
  },
  emotionTagTextSelected: {
    ...createTextStyle('xs', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  emotionTagSelected: {
    // 동적 스타일은 컴포넌트에서 처리
  },
  emotionTagUnselected: {
    // 동적 스타일은 컴포넌트에서 처리
  },
});
