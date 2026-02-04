/**
 * HomeTodoListContainer 스타일
 * 홈스크린 전용 투두리스트 컨테이너 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle } from '../../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.base,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: '#42A5F5',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: spacing[2],
  },
  title: {
    ...createTitleStyle('lg', {
      color: '#1565C0',
    }),
  },
  arrow: {
    ...createTextStyle('2xl', {
      color: '#42A5F5',
      fontWeight: typography.fontWeight.medium,
    }),
  },
  content: {
    marginTop: spacing[2],
  },
  count: {
    ...createTextStyle('sm', {
      color: '#1976D2',
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
});
