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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  /** 나의 미션/미션 도감과 동일한 탭 스타일 */
  missionTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A68B6F',
    paddingVertical: 2.5,
    paddingHorizontal: 3,
    gap: 2,
    marginBottom: spacing[2],
  },
  missionTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  missionTabActive: {
    backgroundColor: '#8B6F47',
  },
  missionTabText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionTabTextActive: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
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
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
    borderStyle: 'dashed',
  },
  createButtonDisabled: {
    opacity: 0.5,
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
    alignItems: 'flex-start',
  },
  /** + 아이콘과 제목을 같은 라인에 */
  createButtonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonTitle: {
    flex: 1,
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
  /** 버튼 안 설명 (하루 1회 제한) */
  createButtonSubtitle: {
    marginTop: spacing[3],
    textAlign: 'left',
    alignSelf: 'stretch',
    ...createSecondaryTextStyle('xs', {
      color: '#8B6F47',
    }),
    includeFontPadding: false,
  },
  /** @deprecated 안내 문구는 버튼 안으로 이동 */
  createNotice: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
    ...createSecondaryTextStyle('xs', {
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
  /** 제목과 ⋯ 버튼이 같은 가로선에 오도록 상단 정렬 + 동일 줄높이 */
  cardHeader: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  cardTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      flex: 1,
      minWidth: 0,
      marginRight: spacing[2],
      lineHeight: 24,
    }),
  },
  menuButton: {
    flexShrink: 0,
    width: 32,
    height: 24,
    marginRight: -spacing[2],
    marginTop: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** 세로로 쌓인 점 세 개 (⋮) */
  verticalDots: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 14,
  },
  verticalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.secondary,
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
    backgroundColor: '#4CAF50',
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
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing[4],
  },
  emptyText: {
    ...emptyStateStyles.text(),
    marginBottom: spacing[2],
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  },
  emptySubtext: {
    ...emptyStateStyles.subtext(),
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
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
