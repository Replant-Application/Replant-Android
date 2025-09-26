import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../utils/designTokens';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Loading: React.FC<LoadingProps> = ({ 
  text = '로딩 중...', 
  size = 'large', 
  color = colors.primary[500],
  style,
  textStyle 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  
  text: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default Loading;
