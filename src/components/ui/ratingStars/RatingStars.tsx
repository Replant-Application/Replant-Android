/**
 * 별점 표시 컴포넌트
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './RatingStars.styles';

interface RatingStarsProps {
  rating: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={styles.star}>
        {star <= rating ? '★' : '☆'}
      </Text>
    ))}
  </View>
);

export default RatingStars;
