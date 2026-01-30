/**
 * SettingsScreen 스타일
 * 설정 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: 120, // 하단 탭바 높이 + 여유 공간
  },
  section: {
    marginBottom: spacing[5],
  },
  /** 사용자 정보 섹션: 아래 여백 축소 */
  userSection: {
    marginBottom: spacing[3],
  },
  /** 버전 바로 위 섹션(고객지원): 아래 여백 축소 */
  sectionBeforeVersion: {
    marginBottom: spacing[2],
  },
  sectionTitle: {
    ...createTitleStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[3],
      paddingHorizontal: spacing[2],
    }),
  },
  userCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[5],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  userIcon: {
    width: 48,
    height: 48,
    marginRight: spacing[3],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...createTitleStyle('xl', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  userSubtext: {
    ...createSecondaryTextStyle('sm'),
  },
  nicknameForm: {
    marginTop: spacing[2],
  },
  inputContainer: {
    marginBottom: spacing[3],
  },
  inputLabel: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginBottom: spacing[2],
    }),
  },
  textInputWrapper: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    ...inputStyles.base(),
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlignVertical: 'center',
    height: 48,
    paddingVertical: 0,
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  saveButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  /** 닉네임 변경 버튼 (고대비: 짙은 배경 + 흰색 텍스트/아이콘) */
  changeNicknameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  changeNicknameEditIcon: {
    tintColor: colors.white,
  },
  changeNicknameText: {
    ...createBodyStyle('base', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  settingsCard: {
    ...cardStyles.base(),
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
  },
  settingItemDanger: {
    backgroundColor: colors.background.primary,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  settingItemText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  settingItemTextDanger: {
    color: colors.error,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 22 + spacing[2], // icon width + icon margin (left padding 0)
  },
  versionContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[4],
    alignItems: 'flex-start',
  },
  versionText: {
    ...createTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
});
