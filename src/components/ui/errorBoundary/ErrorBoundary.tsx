import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { styles } from './ErrorBoundary.styles';

interface ErrorBoundaryProps {
  error?: string | Error;
  onRetry?: () => void;
  style?: ViewStyle;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  style
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/images/warning.png')}
        style={styles.iconImage}
        resizeMode="contain"
        accessibilityLabel="오류 경고 아이콘"
      />
      <Text style={styles.title}>오류가 발생했습니다</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          accessibilityHint="오류 발생 후 재시도합니다"
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorBoundary;
