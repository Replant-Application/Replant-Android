/**
 * 리뷰 카드 컴포넌트
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { MissionReview } from '../../../api/missionApi';
import { formatDateKorean } from '../../../utils/dateUtils';
import { RatingStars } from '../';
import { styles } from './ReviewCard.styles';

interface ReviewCardProps {
  review: MissionReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {review.userProfileImg ? (
            <Image
              source={{ uri: review.userProfileImg }}
              style={styles.authorImage}
              accessibilityLabel={`${review.userNickname || '사용자'} 프로필 이미지`}
            />
          ) : (
            <View style={styles.authorImagePlaceholder}>
              <Text style={styles.authorImageText}>
                {review.userNickname?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.author}>{review.userNickname}</Text>
            {review.rating && <RatingStars rating={review.rating} />}
          </View>
        </View>
        <Text style={styles.date}>{formatDateKorean(review.createdAt)}</Text>
      </View>
      <Text style={styles.content}>{review.content}</Text>
    </View>
  );
};

export default ReviewCard;
