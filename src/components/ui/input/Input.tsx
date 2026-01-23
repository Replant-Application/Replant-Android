import React, { useState } from 'react';
import { TextInput, View, Text, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors } from '../../../utils/designTokens';
import { styles } from './Input.styles';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  size?: 'sm' | 'base' | 'lg';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  size = 'base',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  const inputStyleCombined = [
    styles.input,
    styles[size],
    multiline && styles.multiline,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={inputStyleCombined}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={colors.gray[500]}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        returnKeyType="done"
        accessibilityLabel={label || placeholder}
        accessibilityHint={error ? error : undefined}
        accessibilityLiveRegion={error ? "polite" : undefined}
        allowFontScaling={true}
        {...(Platform.OS === 'android' && { includeFontPadding: false })}
        {...props}
      />
      {error && (
        <Text 
          style={styles.errorText}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
