/**
 * SectionHeader
 * 카드/섹션 상단 "아이콘 + 제목" 재사용 컴포넌트
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from './SectionHeader.styles';
import type { SectionHeaderProps } from './SectionHeader.types';

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  iconSource,
  accessibilityLabel,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={iconSource}
        style={styles.icon}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
      />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
};
