import React from 'react';
import { View, Text, ViewStyle, TextStyle, Image, ImageSourcePropType } from 'react-native';
import { styles } from './EmptyState.styles';

interface EmptyStateProps {
  icon?: string;
  iconImage?: ImageSourcePropType;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
  style?: ViewStyle;
  iconStyle?: TextStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

/**
 * 재사용 가능한 빈 상태 컴포넌트
 * 데이터가 없을 때 표시되는 일관된 UI를 제공
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconImage,
  title,
  description,
  actionButton,
  style,
  iconStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {iconImage ? (
        <Image 
          source={iconImage} 
          style={styles.iconImage} 
          resizeMode="contain" 
          accessibilityLabel={title}
        />
      ) : icon ? (
        <Text style={[styles.icon, iconStyle]}>{icon}</Text>
      ) : null}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      {actionButton && (
        <View style={styles.actionContainer}>
          {actionButton}
        </View>
      )}
    </View>
  );
};

export default EmptyState;
