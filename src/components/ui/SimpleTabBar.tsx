import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

export interface SimpleTabItem {
  key: string;
  label: string;
}

export interface SimpleTabBarProps {
  tabs: SimpleTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: any;
}

/**
 * 간단한 탭 바 컴포넌트
 * 언더라인 스타일의 미니멀한 탭 바
 */
export const SimpleTabBar: React.FC<SimpleTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7', // 책 페이지와 같은 크림색 배경
    borderRadius: borderRadius.base,
    padding: spacing[1],
    marginVertical: spacing[2],
    borderWidth: 2,
    borderColor: '#D4A574', // 책 테두리 색상
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
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: borderRadius.base,
    marginHorizontal: spacing[0.5],
  },
  tabActive: {
    backgroundColor: '#8B6F47', // 활성 탭 배경색 (책 등 색상)
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: '#8B6F47', // 비활성 탭 텍스트 색상
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  tabTextActive: {
    color: '#FFF8E7', // 활성 탭 텍스트 색상 (크림색)
    fontWeight: typography.fontWeight.medium,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  underline: {
    display: 'none', // 언더라인 제거 (배경색으로 구분)
  },
});

