/**
 * 홈스크린 전용 투두리스트 컨테이너 컴포넌트
 * 다른 스크린과 독립적으로 스타일 관리
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './HomeTodoListContainer.styles';
import { HomeTodoListContainerProps } from './HomeTodoListContainer.types';

export const HomeTodoListContainer: React.FC<HomeTodoListContainerProps> = ({
  title,
  count,
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image 
            source={require('../../../assets/images/list.png')} 
            style={styles.icon} 
            resizeMode="contain" 
            accessibilityLabel="투두리스트 아이콘"
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.count}>
          {count}개 진행중
        </Text>
        {children}
      </View>
    </TouchableOpacity>
  );
};
