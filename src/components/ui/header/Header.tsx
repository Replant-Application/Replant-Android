import React from 'react';
import { View, Text, ViewStyle, TextStyle, TouchableOpacity, Image } from 'react-native';
import { styles } from './Header.styles';

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
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
      >
        <Image
          source={require('../../../assets/images/left.png')}
          style={styles.backButtonIcon}
          resizeMode="contain"
          accessibilityLabel="뒤로 가기"
          accessibilityElementsHidden={true}
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

export default Header;
