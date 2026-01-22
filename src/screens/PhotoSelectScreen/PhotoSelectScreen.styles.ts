/**
 * PhotoSelectScreen 스타일
 * 사진 선택 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  instructionContainer: {
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  headerTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  instructionText: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
      textAlign: 'center',
    }),
  },
  optionsContainer: {
    gap: spacing[4],
  },
  optionButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionIconContainer: {
    marginBottom: spacing[3],
  },
  optionIconImage: {
    width: 48,
    height: 48,
  },
  optionTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[2],
    }),
  },
  optionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[5],
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
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  addImageIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.tertiary,
  },
  addImageText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  previewButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  cancelButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: colors.blue[100],
    borderWidth: 1,
    borderColor: colors.blue[300],
  },
  analyzingButton: {
    backgroundColor: colors.blue[200],
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: colors.blue[700],
    fontWeight: typography.fontWeight.medium,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
});
