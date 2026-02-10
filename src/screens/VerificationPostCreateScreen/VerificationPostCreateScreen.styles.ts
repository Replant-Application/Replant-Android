/**
 * VerificationPostCreateScreen 스타일
 * 인증글 작성/수정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, modalStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  missionEmoji: {
    fontSize: 24,
  },
  missionEmojiImage: {
    width: 24,
    height: 24,
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginBottom: spacing[1],
    }),
  },
  missionTitle: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  inputLabelNoMargin: {
    marginBottom: 0,
  },
  infoToggleButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoToggleButtonText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontWeight: typography.fontWeight.medium,
      fontSize: 10,
    }),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[2],
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: spacing[2],
    marginTop: 1,
  },
  infoIconImage: {
    width: 18,
    height: 18,
    marginRight: spacing[2],
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    ...createTextStyle('xs', {
      color: colors.primary[700],
    }),
  },
  completionSection: {
    marginBottom: spacing[4],
  },
  completionHeader: {
    marginBottom: spacing[2],
  },
  completionHeaderLabel: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: 0,
    }),
  },
  completionPercent: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  sliderContainer: {
    marginBottom: spacing[1],
  },
  /** 감정일기와 동일: 트랙(배경) */
  sliderTrack: {
    width: '100%',
    height: 20,
    backgroundColor: colors.overlay?.light ?? colors.gray[200],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.overlay?.white?.light ?? colors.gray[300],
    position: 'relative' as const,
    marginTop: 0,
    marginBottom: spacing[3],
    justifyContent: 'center',
  },
  /** 감정일기와 동일: 채워진 구간 (초록) */
  sliderFill: {
    position: 'absolute' as const,
    height: 16,
    borderRadius: borderRadius.sm,
    left: 0,
    top: 0,
  },
  /** 감정일기와 동일: 흰색 원형 썸 */
  sliderThumb: {
    position: 'absolute' as const,
    width: 22,
    height: 22,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginLeft: -10,
    top: -2,
    ...shadows.lg,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[0],
  },
  sliderLabel: {
    ...createTextStyle('sm', {
      color: colors.gray[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  warningBox: {
    backgroundColor: colors.orange[50],
    borderWidth: 1,
    borderColor: colors.orange[200],
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[2],
  },
  warningText: {
    ...createTextStyle('xs', {
      color: colors.orange[700],
      textAlign: 'center',
    }),
  },
  encouragementBox: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
  },
  /** 25% 이하일 때 경고+응원 통합 메시지 박스 스타일 (원래 표시되던 메시지 영역) */
  messageBoxLowCompletion: {
    backgroundColor: colors.orange[50],
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  messageBoxLowCompletionText: {
    color: colors.orange[700],
  },
  encouragementText: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      textAlign: 'center',
    }),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    ...createTitleStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  notebookContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  notebookLines: {
    position: 'absolute',
    top: 0,
    left: -24,
    right: 0,
    bottom: 0,
    paddingLeft: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  notebookLine: {
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: 0,
  },
  notebookLineLast: {
    height: 24,
    marginBottom: 0,
  },
  contentInput: {
    ...inputStyles.base(),
    ...createTextStyle('sm', { color: colors.text.primary }),
    backgroundColor: 'transparent',
    padding: spacing[4],
    paddingTop: spacing[2],
    paddingLeft: spacing[3],
    minHeight: 200,
    textAlignVertical: 'top',
    lineHeight: 24, // notebookLine의 높이(24)와 일치시켜 줄 간격에 맞춤
    includeFontPadding: false, // Android 폰트 패딩 제거
  },
  photoSection: {
    marginBottom: spacing[4],
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  previewImageTouchable: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    ...createTextStyle('lg', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  addPhotoButton: {
    width: '100%',
    height: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  addPhotoButtonWithImages: {
    marginTop: spacing[2],
  },
  addPhotoIcon: {
    width: 32,
    height: 32,
    marginBottom: spacing[2],
  },
  addPhotoText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: '#D4A574',
  },
  buttonBackground: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: colors.primary[700],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    shadowColor: colors.primary[700],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  // 사진 추가 커스텀 모달
  photoOptionsOverlay: {
    ...modalStyles.overlay(),
  },
  photoOptionsModalContainer: {
    ...modalStyles.content(),
    width: '85%',
    maxWidth: 350,
  },
  photoOptionsTitle: {
    ...createTitleStyle('lg', {
      color: colors.text.primary,
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  photoOptionsMessage: {
    ...createTextStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[5],
      textAlign: 'center',
    }),
  },
  photoOptionsButtonRow: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  photoOptionsButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  photoOptionsCancelButton: {
    backgroundColor: colors.gray[200],
  },
  photoOptionsActionButton: {
    backgroundColor: colors.primary[600],
  },
  photoOptionsButtonText: {
    ...createButtonTextStyle('base'),
  },
  photoOptionsCancelButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.secondary,
    }),
  },
});
