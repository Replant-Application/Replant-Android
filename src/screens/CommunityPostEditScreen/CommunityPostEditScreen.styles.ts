/**
 * CommunityPostEditScreen 스타일
 * 커뮤니티 게시글 수정 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createBodyStyle } from '../../utils/styles/textStyles';
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
  content: {
    flex: 1,
    padding: spacing[4],
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  backButtonText: {
    ...createBodyStyle('base'),
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  missionEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing[3],
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privateCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  privateCheckbox: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  privateCheckboxSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  privateCheckmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 14,
  },
  privateCheckboxLabel: {
    ...createTextStyle('xs', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  label: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing[2],
    }),
  },
  titleInput: {
    ...inputStyles.base(),
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    height: 48,
    textAlignVertical: 'center',
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  titleInputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.text.secondary,
    borderColor: colors.border.light,
  },
  disabledNote: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginTop: spacing[1],
      fontStyle: 'italic',
    }),
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
    height: 154,
    maxHeight: 300,
    textAlignVertical: 'top',
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  imageSection: {
    marginBottom: spacing[4],
  },
  previewImageLarge: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing[2],
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
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  previewImageTouchable: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  addImageButton: {
    width: '100%',
    minHeight: 120,
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  addImageIcon: {
    width: 24,
    height: 24,
  },
  addImageText: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
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
  imageNote: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontStyle: 'italic',
    }),
  },
  buttonContainer: {
    marginTop: -spacing[1],
    marginBottom: spacing[4],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
  },
});
