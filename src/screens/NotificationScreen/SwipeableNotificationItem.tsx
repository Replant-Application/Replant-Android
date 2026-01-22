import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SwipeableNotificationItemProps } from '../../types/screens/notification';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { formatTimeAgo } from '../../utils/dateUtils';
import ConfirmModal from '../../components/ui/ConfirmModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -70; // 삭제 버튼이 나타나는 슬라이드 거리
const MAX_SWIPE_DISTANCE = -80; // 최대 슬라이드 거리 제한

const SwipeableNotificationItem: React.FC<SwipeableNotificationItemProps> = ({ 
  item, 
  onPress, 
  onDelete 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // 오른쪽으로 스와이프만 허용 (음수 = 왼쪽)
        if (gestureState.dx < 0) {
          // 최대 슬라이드 거리 제한
          const limitedDx = Math.max(gestureState.dx, MAX_SWIPE_DISTANCE);
          translateX.setValue(limitedDx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // 삭제 버튼 표시
          Animated.spring(translateX, {
            toValue: SWIPE_THRESHOLD,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        } else {
          // 원래 위치로 복귀
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(item.id);
    });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    // 원래 위치로 복귀
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  if (isDeleting) {
    return null;
  }

  return (
    <View style={styles.swipeContainer}>
      {/* 삭제 버튼 (배경) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/trash.png')}
            style={styles.deleteButtonIcon}
            resizeMode="contain"
            accessibilityLabel="삭제"
          />
        </TouchableOpacity>
      </View>

      {/* 알림 카드 (앞면) */}
      <Animated.View
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => onPress(item)}
          activeOpacity={0.7}
          style={styles.cardTouchable}
        >
          <View style={styles.contentContainer}>
            <Image
              source={require('../../assets/images/funny.png')}
              style={styles.characterImage}
              resizeMode="contain"
              accessibilityLabel="캐릭터 이미지"
            />
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
              </View>
              <Text style={styles.content} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteModal}
        title="알림 삭제"
        message="이 알림을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonColor={colors.error[500]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginBottom: spacing[3],
    overflow: 'visible',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 95,
    backgroundColor: '#FF0003',
    borderWidth: 2,
    borderColor: '#0E0F37',
    borderTopRightRadius: borderRadius.base,
    borderBottomRightRadius: borderRadius.base,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
  },
  deleteButtonIcon: {
    width: 30,
    height: 30,
  },
  notificationCard: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: '#0E0F37',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  cardTouchable: {
    flex: 1,
  },
  unreadCard: {
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text.primary,
    marginRight: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  content: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  time: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
});

export default SwipeableNotificationItem;

