/**
 * AdminUserDetailScreen 스타일
 * 유저 상세 조회 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    padding: spacing[5],
  },
  infoCard: {
    marginBottom: spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  infoValue: {
    ...createTitleStyle('base'),
  },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  roleBadgeAdmin: {
    backgroundColor: colors.primary[100],
  },
  roleText: {
    ...createTitleStyle('sm'),
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[100],
  },
  statusBadgeInactive: {
    backgroundColor: colors.gray[200],
  },
  statusText: {
    ...createTitleStyle('sm'),
  },
  actionsContainer: {
    gap: spacing[3],
  },
  editButton: {
    marginBottom: spacing[2],
  },
  toggleButton: {
    marginBottom: spacing[2],
  },
  activateButton: {
    backgroundColor: colors.primary[500],
  },
});
