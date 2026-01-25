/**
 * MissionProgressCard 스타일 (specialized)
 * 미션 진행률 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.base,
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  header: {
    marginBottom: spacing[5],
  },
  title: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    marginLeft: spacing[4],
  },
  badgeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  badgeIcon: {
    width: 24,
    height: 24,
  },
  badgeButtonText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      flex: 1,
    }),
  },
  badgeArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    marginLeft: spacing[1],
  },
});
