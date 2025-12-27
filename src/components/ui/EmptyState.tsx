import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageSourcePropType } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';

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
        <Image source={iconImage} style={styles.iconImage} resizeMode="contain" />
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

const styles = StyleSheet.create({
  container: {
    padding: spacing[8],
    alignItems: 'center',
  },
  icon: {
    fontSize: typography.fontSize['4xl'],
    marginBottom: spacing[4],
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  actionContainer: {
    marginTop: spacing[2],
  },
});

export default EmptyState;
