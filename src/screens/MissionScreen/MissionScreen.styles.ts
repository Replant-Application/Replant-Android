/**
 * MissionScreen 스타일
 * 미션 화면의 모든 스타일 정의
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, borderRadius, layout, typography } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { loadingStyles } from '../../utils/styles/componentStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  topTabBar: {
    marginBottom: 0,
  },
  missionTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A68B6F',
    paddingVertical: 2.5,
    paddingHorizontal: 3,
    gap: 2,
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
  title: {
    ...createTitleStyle('2xl', {
      marginBottom: spacing[4],
    }),
  },
  tabBar: {
    marginBottom: spacing[4],
  },
  filterTabWrapper: {
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.globalGutter,
    paddingVertical: layout.globalGutter,
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  missionList: {
    gap: spacing[1],
  },
  // 페이지네이션 관련 스타일
  missionPageContainer: {
    width: SCREEN_WIDTH - spacing[8],
    gap: spacing[1],
  },
  // 미션 도감 관련 스타일
  groupTabContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[1],
    paddingBottom: 0,
  },
  groupTabBar: {
    marginBottom: 0,
  },
  groupLoadingContainer: {
    ...loadingStyles.container(),
    padding: spacing[8],
  },
  groupLoadingText: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[3],
    }),
  },
  groupInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[4],
  },
  groupLogoIcon: {
    width: 24,
    height: 24,
  },
  groupInfoText: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.primary[700],
    }),
  },
  groupInlineDetailContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    marginLeft: spacing[2],
    paddingLeft: spacing[3],
  },
  groupInlineDetailCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  groupDetailTitle: {
    ...createTitleStyle('lg', {
      marginBottom: spacing[4],
    }),
  },
  groupDetailRow: {
    marginBottom: spacing[3],
  },
  groupDetailLabel: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[1],
    }),
  },
  groupDetailValue: {
    ...createBodyStyle('base'),
  },
  groupDetailButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  groupDetailButtonText: {
    ...createButtonTextStyle('base'),
  },
  groupDetailButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  editMissionButton: {
    backgroundColor: colors.gray[200],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editMissionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.gray[600],
  },
});
