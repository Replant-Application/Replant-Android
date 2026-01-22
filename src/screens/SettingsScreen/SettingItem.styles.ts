/**
 * SettingItem 스타일
 * 설정 아이템 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingItemDanger: {
    borderBottomColor: colors.red[50],
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
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  settingItemTextDanger: {
    ...createTextStyle('base', {
      color: colors.error,
    }),
  },
  arrowIcon: {
    width: 16,
    height: 16,
    opacity: 0.5,
  },
});
