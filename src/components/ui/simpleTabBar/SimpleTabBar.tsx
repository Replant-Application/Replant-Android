import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './SimpleTabBar.styles';
import { SimpleTabBarProps } from './SimpleTabBar.types';

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
            accessibilityRole="tab"
            accessibilityLabel={tab.count !== undefined ? `${tab.label}, ${tab.count}개` : tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <Text
                  style={[
                    styles.tabCount,
                    isActive && styles.tabCountActive,
                  ]}
                >
                  ({tab.count})
                </Text>
              )}
            </View>
            {isActive && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

