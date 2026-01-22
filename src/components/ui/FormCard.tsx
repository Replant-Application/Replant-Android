import React from 'react';
import { ViewStyle } from 'react-native';
import Card from './Card';
import { styles } from './FormCard.styles';

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

export default FormCard;
