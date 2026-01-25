/**
 * MissionProgressCard 스타일
 * 미션 진행률 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA', // 연한 베이지색 배경
    marginBottom: spacing[5],
    borderRadius: borderRadius.base, // 둥근 모서리 줄이기
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  homeIcon: {
    ...createTextStyle('base'),
  },
  progressContainer: {
    alignItems: 'center',
  },
});
