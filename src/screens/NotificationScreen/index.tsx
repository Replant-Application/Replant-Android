/**
 * 알림 화면
 * 사용자에게 온 모든 알림을 보여주는 화면
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ImageBackground,
} from 'react-native';
import { type Notification as NotificationType } from '../../api/notificationApi';
import { Loading, EmptyState, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NotificationScreenProps } from '../../types/screens/notification';
import SwipeableNotificationItem from './SwipeableNotificationItem';
import { useNotificationScreenContainer } from './NotificationScreen.container';

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    notifications,
    loading,
    refreshing,
    filter,
    unreadCount,
    handleRefresh,
    handleFilterChange,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleNotificationPress,
    keyExtractor,
  } = useNotificationScreenContainer({ navigation });

  /**
   * 알림 아이템 렌더링
   */
  const renderNotification = useCallback(({ item }: { item: NotificationType }) => {
    try {
      return (
        <SwipeableNotificationItem 
          item={item}
          onPress={handleNotificationPress}
          onDelete={handleDeleteNotification}
        />
      );
    } catch (error) {
      console.error('[NotificationScreen] 알림 아이템 렌더링 실패:', error);
      return null;
    }
  }, [handleNotificationPress, handleDeleteNotification]);

  if (loading && notifications.length === 0) {
    return <Loading text="알림을 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* 헤더 섹션 */}
        <Header
          title="알림"
          navigation={navigation}
          titleStyle={styles.headerTitle}
          rightButton={
            unreadCount > 0 ? (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.markAllReadText}>모두 읽음</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* 필터 탭 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => handleFilterChange('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 알림 목록 */}
        <View style={styles.listWrapper}>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary[500]}
                colors={[colors.primary[500]]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                iconImage={require('../../assets/images/notification.png')}
                title="알림이 없습니다"
                description={filter === 'unread'
                  ? "읽지 않은 알림이 없습니다."
                  : "아직 받은 알림이 없어요.\n미션을 수행하면 알림을 받을 수 있어요!"
                }
              />
            }
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  markAllButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  markAllReadText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
    backgroundColor: '#FFF8E7',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D4A574',
    padding: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#8B6F47',
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    padding: spacing[4],
  },
});

export default NotificationScreen;
