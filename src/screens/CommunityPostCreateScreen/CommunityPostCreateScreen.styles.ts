/**
 * CommunityPostCreateScreen 스타일
 * 커뮤니티 게시글 작성 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  missionIcon: {
    width: 32,
    height: 32,
    marginRight: spacing[3],
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginBottom: spacing[1],
      fontFamily: typography.fontFamily.regular,
    }),
  },
  missionTitle: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    }),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    ...createTitleStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[2],
      fontFamily: typography.fontFamily.regular,
    }),
  },
  titleInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    height: 44,
  },
  contentInputWrapper: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    overflow: 'hidden',
  },
  noteLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noteLine: {
    height: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  contentInput: {
    ...inputStyles.base(),
    backgroundColor: 'transparent',
    padding: spacing[3],
    paddingTop: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 168,
    maxHeight: 300,
    textAlignVertical: 'top',
    lineHeight: 28,
    fontFamily: typography.fontFamily.regular,
  },
  mealPhotoContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[3],
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[2],
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  addImageButtonSmall: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: '100%',
    height: 100,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.green[400],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  addImageIcon: {
    width: 36,
    height: 36,
    tintColor: colors.green[500],
  },
  addImageIconSmall: {
    width: 28,
    height: 28,
  },
  addImageText: {
    ...createTextStyle('sm', {
      color: colors.green[600],
      fontWeight: typography.fontWeight.medium,
      fontFamily: typography.fontFamily.regular,
    }),
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  imageSection: {
    marginBottom: spacing[4],
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  mealPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: colors.background.secondary,
  },
  sliderContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sliderHeader: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tasteLabel: {
    ...createTitleStyle('lg', {
      color: colors.text.primary,
      textAlign: 'center',
      fontFamily: typography.fontFamily.regular,
    }),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
  },
  sliderMinLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontFamily: typography.fontFamily.regular,
    }),
  },
  sliderMaxLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontFamily: typography.fontFamily.regular,
    }),
  },
  submitButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  submitButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      fontFamily: typography.fontFamily.regular,
    }),
  },
});
