/**
 * SectionHeader (아이콘 + 제목) 스타일
 */

import { StyleSheet } from 'react-native';
import { spacing } from '../../../utils/designTokens';
import { createTitleStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  icon: {
    width: 25,
    height: 25,
  },
  title: {
    ...createTitleStyle('lg'),
  },
});
