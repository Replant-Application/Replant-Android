/**
 * TodoListScreen 스타일
 * 투두리스트 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createBodyStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { emptyStateStyles } from '../../utils/styles/commonStyles';
import { loadingStyles } from '../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  loadingContainer: {
    ...loadingStyles.container(),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 120,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
    borderStyle: 'dashed',
  },
  createButtonIcon: {
    fontSize: 32,
    color: '#8B6F47',
    marginRight: spacing[3],
    fontWeight: typography.fontWeight.normal,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 32,
  },
  createButtonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  createButtonTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
    fontWeight: typography.fontWeight.medium,
    color: '#6B5344',
    includeFontPadding: false,
    lineHeight: Math.round(typography.fontSize.base * 1.35),
  },
  createButtonSubtitle: {
    ...createSecondaryTextStyle('sm', {
      color: '#8B6F47',
    }),
  },
  todoListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  cardTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      flex: 1,
      marginRight: spacing[2],
    }),
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
  },
  statusBadgeCompleted: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeArchived: {
    backgroundColor: colors.gray[200],
  },
  statusBadgeIncomplete: {
    backgroundColor: '#FFE082',
  },
  statusBadgeText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    }),
  },
  statusBadgeTextCompleted: {
    color: '#2E7D32',
  },
  statusBadgeTextArchived: {
    color: colors.text.secondary,
  },
  statusBadgeTextIncomplete: {
    color: '#E65100',
  },
  cardDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[3],
    }),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8DDD4',
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.full,
  },
  progressFillCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
      minWidth: 40,
      textAlign: 'right',
    }),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  progressPercent: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: '#6B5344',
    }),
  },
  emptyContainer: {
    ...emptyStateStyles.container(),
    paddingVertical: spacing[12],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[4],
  },
  emptyText: {
    ...emptyStateStyles.text(),
    marginBottom: spacing[2],
  },
  emptySubtext: {
    ...emptyStateStyles.subtext(),
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  infoText: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
    }),
  },
});
