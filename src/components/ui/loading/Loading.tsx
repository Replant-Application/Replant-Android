import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../../utils/designTokens';
import { styles } from './Loading.styles';

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

export default Loading;
