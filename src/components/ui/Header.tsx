import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity, Image, Platform } from 'react-native';
import { spacing, colors, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

interface HeaderProps {
  title?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showBorder?: boolean;
  showBackButton?: boolean;
  navigation?: {
    goBack?: () => void;
  };
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
  showBackButton = true,
  navigation,
}) => {
  // 뒤로가기 버튼 렌더링
  const renderBackButton = () => {
    if (!showBackButton) return null;
    if (leftButton) return leftButton;

    if (!navigation?.goBack) return null;

    return (
      <TouchableOpacity
        onPress={() => navigation?.goBack?.()}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/images/left.png')}
          style={styles.backButtonIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.header,
      showBorder && styles.headerWithBorder,
      style
    ]}>
      <View style={styles.leftSection}>
        {renderBackButton()}
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
    backgroundColor: 'transparent',
  },
  headerWithBorder: {
    // 테두리 스타일 제거
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
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
});

export default Header;
