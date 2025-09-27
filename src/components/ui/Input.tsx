import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';

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
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[3],
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    textAlign: 'left', // 한글 입력을 위해 명시적으로 설정
  },

  // Sizes
  sm: {
    height: 32,
    paddingVertical: spacing[1],
  },
  base: {
    height: 40,
    paddingVertical: spacing[2],
  },
  lg: {
    height: 48,
    paddingVertical: spacing[3],
  },

  // States
  focused: {
    borderColor: colors.primary[500],
  },

  error: {
    borderColor: colors.error,
  },

  multiline: {
    height: 'auto',
    minHeight: 40,
    textAlignVertical: 'top',
  },

  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing[1],
  },
});

export default Input;
