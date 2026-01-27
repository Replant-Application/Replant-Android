/**
 * MyPageScreen 스타일
 * 마이페이지 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, layout } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.globalGutterLarge,
    paddingVertical: layout.globalGutterLarge,
    paddingBottom: spacing[20],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  sectionIcon: {
    width: 25,
    height: 25,
  },
  sectionTitle: {
    ...createTitleStyle('lg'),
  },
  profileCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.brandAccent,
    ...shadows.lg,
  },
  profileInfo: {
    gap: spacing[3],
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  profileLabel: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  profileValue: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  characterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.brandAccent,
    ...shadows.lg,
  },
  characterCardInner: {
    marginBottom: 0,
  },
  statsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.brandAccent,
    ...shadows.lg,
  },
  statsContainer: {
    gap: spacing[4],
  },
  statItem: {
    gap: spacing[2],
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  statValue: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    }),
  },
  barChartContainer: {
    marginTop: spacing[1],
  },
  barChartBackground: {
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barChartFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
