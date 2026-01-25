/**
 * 알림 화면
 * 사용자에게 온 모든 알림을 보여주는 화면
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { type Notification as NotificationType } from '../../api/notificationApi';
import { Loading, EmptyState, Header } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NotificationScreenProps } from '../../types/screens/notification';
import SwipeableNotificationItem from './SwipeableNotificationItem';
import { useNotificationScreenContainer } from './NotificationScreen.container';
import { styles } from './NotificationScreen.styles';

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
      accessibilityElementsHidden={true}
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
                <Text style={styles.markAllReadText} numberOfLines={1}>
                  모두 읽음
                </Text>
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

export default NotificationScreen;
