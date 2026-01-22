/**
 * 별점 선택 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './RatingSelector.styles';

interface RatingSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({ rating, onRatingChange }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity 
          key={star} 
          onPress={() => onRatingChange(star)} 
          activeOpacity={0.7}
        >
          <Text style={[styles.star, star <= rating && styles.starActive]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RatingSelector;
