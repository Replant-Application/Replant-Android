import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './SimpleTabBar.styles';

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

