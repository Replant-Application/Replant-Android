/**
 * CalendarScreen 스타일
 * 캘린더 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

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
  content: {
    padding: spacing[5],
  },
  calendarCard: {
    marginBottom: spacing[6],
  },
  missionsListContainer: {
    marginTop: spacing[1],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    paddingHorizontal: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    marginHorizontal: -spacing[4],
  },
  missionsListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  missionsListIcon: {
    width: 20,
    height: 20,
  },
  missionsListTitle: {
    ...createTitleStyle('base', {
      letterSpacing: -0.5,
      flex: 1,
    }),
  },
  emptyStateContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  monthButton: {
    padding: spacing[2],
    minWidth: 40,
    alignItems: 'center',
  },
  monthButtonText: {
    ...createTextStyle('2xl', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  monthYearText: {
    ...createTitleStyle('xl'),
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  weekDayText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  calendarDayOtherMonth: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
  calendarDayToday: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
  },
  calendarDaySelected: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[600],
  },
  calendarDayText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  calendarDayTextOtherMonth: {
    color: colors.text.secondary,
  },
  calendarDayTextToday: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  missionCountBadge: {
    marginTop: 2,
    backgroundColor: colors.primary[500],
    minWidth: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  missionCountText: {
    fontSize: 8,
    color: colors.background.primary,
    fontWeight: typography.fontWeight.bold as any,
    fontFamily: Platform.select({
      ios: undefined, // iOS는 기본 시스템 폰트 사용
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: 12,
    textAlign: 'center',
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.background.primary,
  },
  missionNumber: {
    ...createTitleStyle('base', {
      color: colors.text.secondary,
      marginRight: spacing[2],
      minWidth: 20,
    }),
  },
  missionContent: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  missionTitle: {
    ...createTitleStyle('base', {
      flex: 1,
    }),
  },
  completedBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  completedText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
      color: colors.green[700],
    }),
  },
  emptyText: {
    ...createSecondaryTextStyle('base', {
      textAlign: 'center',
      padding: spacing[6],
    }),
  },
  /** 게시글 모달 래퍼·하단 탭 바 (캘린더에서 게시글 보기 시) */
  modalPostDetailWrap: {
    flex: 1,
  },
  modalPostDetailContent: {
    flex: 1,
  },
  modalTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === 'android' ? spacing[12] : spacing[5],
    paddingTop: spacing[2],
    paddingHorizontal: spacing[2],
  },
  modalTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  modalTabActive: {
    backgroundColor: colors.green[50],
  },
  modalTabIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
    opacity: 0.6,
  },
  modalTabIconActive: {
    opacity: 1,
  },
  modalTabLabel: {
    ...createSecondaryTextStyle('xs'),
    color: colors.text.secondary,
  },
  modalTabLabelActive: {
    color: colors.green[600],
  },
});
