/**
 * TabBar 컴포넌트
 * 범용 탭 바 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { styles } from './TabBar.styles';

export interface TabItem {
  key: string;
  label: string;
  badge?: number;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'pill' | 'underline' | 'simple';
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pill',
  containerStyle,
  style,
}) => {
  const renderPillVariant = () => (
    <View style={[styles.pillContainer, containerStyle]}>
      <View style={styles.pillWrapper}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.pillTab,
              activeTab === tab.key && styles.pillTabActive,
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.pillTabText,
                activeTab === tab.key && styles.pillTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSimpleVariant = () => (
    <View style={[styles.simpleContainer, containerStyle]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.simpleTab,
            activeTab === tab.key && styles.simpleTabActive,
          ]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel={tab.badge !== undefined && tab.badge > 0 
            ? `${tab.label}, 알림 ${tab.badge}개`
            : tab.label}
          accessibilityState={{ selected: activeTab === tab.key }}
        >
          <Text
            style={[
              styles.simpleTabText,
              activeTab === tab.key && styles.simpleTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
          {tab.badge !== undefined && tab.badge > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUnderlineVariant = () => (
    <View style={[styles.underlineContainer, containerStyle]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.underlineTab,
            activeTab === tab.key && styles.underlineTabActive,
          ]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: activeTab === tab.key }}
        >
          <Text
            style={[
              styles.underlineTabText,
              activeTab === tab.key && styles.underlineTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  switch (variant) {
    case 'pill':
      return renderPillVariant();
    case 'simple':
      return renderSimpleVariant();
    case 'underline':
      return renderUnderlineVariant();
    default:
      return renderPillVariant();
  }
};

