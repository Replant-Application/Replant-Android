/**
 * VerificationPostCreateScreen 스타일
 * 인증글 작성/수정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  sliderContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing[1],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
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
    fontSize: typography.fontSize.xs,
    color: colors.orange[700],
    textAlign: 'center',
  },
  encouragementBox: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
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
    paddingLeft: spacing[6],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
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
    paddingTop: spacing[5],
    paddingLeft: spacing[6],
    minHeight: 200,
    textAlignVertical: 'top',
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
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
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
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    shadowColor: colors.primary[500],
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
});
