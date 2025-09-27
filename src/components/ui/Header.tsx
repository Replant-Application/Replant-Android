import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';

interface HeaderProps {
  title?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showBorder?: boolean;
}

/**
 * 재사용 가능한 헤더 컴포넌트
 * 모든 화면에서 일관된 헤더 스타일을 제공
 */
const Header: React.FC<HeaderProps> = ({
  title,
  leftButton,
  rightButton,
  style,
  titleStyle,
  showBorder = true,
}) => {
  return (
    <View style={[
      styles.header,
      showBorder && styles.headerWithBorder,
      style
    ]}>
      <View style={styles.leftSection}>
        {leftButton}
      </View>

      {title && (
        <View style={styles.centerSection}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        </View>
      )}

      <View style={styles.rightSection}>
        {rightButton}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[5],
    backgroundColor: colors.background.primary,
  },
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});

export default Header;
