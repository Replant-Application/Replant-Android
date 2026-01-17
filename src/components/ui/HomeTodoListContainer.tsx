/**
 * 홈스크린 전용 투두리스트 컨테이너 컴포넌트
 * 다른 스크린과 독립적으로 스타일 관리
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

export interface HomeTodoListContainerProps {
  title: string;
  count: number;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const HomeTodoListContainer: React.FC<HomeTodoListContainerProps> = ({
  title,
  count,
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image 
            source={require('../../assets/images/list.png')} 
            style={styles.icon} 
            resizeMode="contain" 
            accessibilityLabel="투두리스트 아이콘"
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.count}>
          {count}개 진행중
        </Text>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: '#1565C0',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  arrow: {
    fontSize: typography.fontSize['2xl'],
    color: '#42A5F5',
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    marginTop: spacing[2],
  },
  count: {
    fontSize: typography.fontSize.sm,
    color: '#1976D2',
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});
