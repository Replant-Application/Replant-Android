/**
 * MissionSetList 스타일
 * 미션세트 목록 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../../utils/styles/textStyles';
import { cardStyles } from '../../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.background.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
    tintColor: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  missionSetList: {
    padding: spacing[4],
  },
  dateGroup: {
    marginBottom: spacing[6],
  },
  dateHeader: {
    marginBottom: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[400], // 더 진한 색상으로 변경
  },
  dateHeaderText: {
    ...createTitleStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.semibold,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  missionSetCard: {
    backgroundColor: '#F5F0E8', // 따뜻한 베이지색
    borderRadius: borderRadius.base,
    padding: spacing[3],
    borderWidth: 1,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderColor: '#8B7355', // 진한 갈색 테두리
    borderTopColor: '#8B7355',
    borderBottomColor: '#8B7355',
    borderLeftColor: '#8B7355',
    borderRightColor: '#8B7355',
    // 자연스러운 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  missionSetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  headerInfo: {
    flex: 1,
    gap: spacing[1],
  },
  headerDate: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionSetTitle: {
    ...createTitleStyle('base', {
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
      marginBottom: 0,
    }),
  },
  nameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[400], // 연한 초록색 테두리
    backgroundColor: colors.white,
  },
  nameBadgeText: {
    ...createTextStyle('xs', {
      color: colors.primary[600], // 초록색 텍스트
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  deleteIcon: {
    width: 14,
    height: 14,
    tintColor: colors.red[600],
  },
  deleteText: {
    ...createTextStyle('xs', {
      color: colors.red[600],
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionSetDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
      marginTop: spacing[2],
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      lineHeight: typography.fontSize.sm * 1.5,
    }),
  },
  missionSetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  metaText: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
      fontWeight: typography.fontWeight.medium,
    }),
  },
  metaDot: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginHorizontal: spacing[1.5],
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  missionSetFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  likeIcon: {
    width: 18,
    height: 18,
    tintColor: colors.red[500],
  },
  likeIconActive: {
    tintColor: colors.red[600],
  },
  likeCount: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  likeCountActive: {
    color: colors.red[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: undefined,
      android: typography.fontFamily.regular,
    }),
  },
});
