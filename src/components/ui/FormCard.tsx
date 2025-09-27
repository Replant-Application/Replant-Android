import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../../utils/designTokens';
import Card from './Card';

interface FormCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * 재사용 가능한 폼 카드 컴포넌트
 * 폼 섹션을 위한 일관된 카드 스타일을 제공
 */
const FormCard: React.FC<FormCardProps> = ({
  children,
  style,
}) => {
  const combinedStyle = {
    ...styles.formCard,
    ...style,
  };

  return (
    <Card style={combinedStyle}>
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  formCard: {
    marginBottom: spacing[4],
  },
});

export default FormCard;
