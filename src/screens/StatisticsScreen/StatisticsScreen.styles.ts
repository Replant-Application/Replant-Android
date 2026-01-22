/**
 * StatisticsScreen 스타일
 * 통계 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createTitleStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  content: {
    padding: spacing[5],
  },
  mainCard: {
    marginBottom: spacing[6],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    marginBottom: spacing[5],
    marginTop: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
    minHeight: 28,
  },
  tabActive: {
    backgroundColor: '#8B6F47',
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: '#8B6F47',
      letterSpacing: 0.3,
    }),
  },
  tabTextActive: {
    ...createTextStyle('sm', {
      color: '#FFF8E7',
      fontWeight: typography.fontWeight.medium,
      letterSpacing: 0.3,
    }),
  },
  dateSection: {
    marginBottom: spacing[3],
    paddingBottom: 0,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateArrow: {
    padding: spacing[2],
    minWidth: 40,
    alignItems: 'center',
  },
  arrowText: {
    ...createTextStyle('2xl', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  dateText: {
    ...createTitleStyle('xl'),
  },
  filterSection: {
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryScroll: {
    marginBottom: 0,
  },
  categoryContainer: {
    paddingHorizontal: spacing[2],
    gap: spacing[2],
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray[100],
    gap: spacing[2],
  },
  categoryFilterActive: {
    backgroundColor: colors.primary[100],
  },
  categoryIcon: {
    width: 25,
    height: 25,
  },
  categoryFilterText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
  categoryFilterTextActive: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
    }),
  },
  achievementSection: {
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  achievementIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  achievementTitle: {
    ...createTitleStyle('base'),
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0],
  },
  achievementPercentage: {
    ...createTextStyle('2xl', {
      fontWeight: typography.fontWeight.medium,
      color: '#8B6F47',
      minWidth: 45,
    }),
  },
  progressBarContainer: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
  progressBar: {
    height: 16,
    backgroundColor: '#F5E6D3',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4A574',
    ...shadows.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.full,
    ...shadows.sm,
    shadowColor: '#8B6F47',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(139, 111, 71, 0.2)',
    pointerEvents: 'none',
  },
  missionStatsSection: {
    marginTop: spacing[2],
  },
  missionStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  missionStatCard: {
    width: '48%',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  missionStatTitle: {
    ...createTitleStyle('sm', {
      marginBottom: spacing[2],
      minHeight: 36,
    }),
  },
  calendarGrid: {
    marginBottom: spacing[2],
  },
  calendarRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  missionStatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionStatPercentage: {
    ...createTitleStyle('base'),
  },
  missionStatCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  missionStatDays: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
    }),
  },
});
