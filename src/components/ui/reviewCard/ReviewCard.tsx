/**
 * 리뷰 카드 컴포넌트
 * 커뮤니티 게시글과 동일하게 작성자 캐릭터 이미지 표시
 * 본인 후기일 때 삭제 버튼 표시
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MissionReview } from '../../../api/missionApi';
import { formatDateKorean } from '../../../utils/dateUtils';
import { getCharacterImageStatic } from '../../../utils/characterUtils';
import { styles } from './ReviewCard.styles';

interface ReviewCardProps {
  review: MissionReview;
  currentUserId?: number | null;
  onDelete?: (reviewId: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, currentUserId, onDelete }) => {
  const characterLevel = review.userReantLevel != null && review.userReantLevel >= 1
    ? Math.min(review.userReantLevel, 6)
    : 1;
  const isOwnReview = currentUserId != null && review.userId === currentUserId;

  const handleDeletePress = () => {
    if (!onDelete) return;
    Alert.alert(
      '후기 삭제',
      '이 후기를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onDelete(review.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Image
              source={getCharacterImageStatic(characterLevel)}
              style={styles.authorAvatarImage}
              resizeMode="contain"
              accessibilityLabel={`${review.userNickname || '작성자'} 캐릭터`}
            />
          </View>
          <View style={styles.authorNameWrap}>
            <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
              {review.userNickname}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatDateKorean(review.createdAt)}</Text>
          {isOwnReview && onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              accessibilityRole="button"
              accessibilityLabel="후기 삭제"
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.content}>{review.content}</Text>
    </View>
  );
};

export default ReviewCard;
