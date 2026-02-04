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
import { Loading, EmptyState, Header, AlertModal, ConfirmModal } from '../../components/ui';
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
    selectedIds,
    isAllSelected,
    isSelectionModeActive,
    showDeleteConfirmModal,
    showAlert,
    alertTitle,
    alertMessage,
    handleRefresh,
    handleFilterChange,
    handleMarkAllAsRead,
    handleToggleSelect,
    handleSelectAll,
    handleExitSelectionMode,
    handleDeleteSelected,
    handleConfirmDeleteSelected,
    handleCancelDeleteSelected,
    handleNotificationPress,
    handleAlertClose,
    keyExtractor,
  } = useNotificationScreenContainer({ navigation });

  /** 선택 모드 여부: 롱프레스로 진입 후, 취소 버튼으로만 종료 */
  const isSelectionMode = isSelectionModeActive;

  /**
   * 알림 아이템 렌더링
   * 선택 모드일 때는 클릭 시 해당 알림으로 이동하지 않고 선택/해제만 함
   */
  const renderNotification = useCallback(({ item }: { item: NotificationType }) => {
    try {
      return (
        <SwipeableNotificationItem
          item={item}
          selected={selectedIds.has(item.id)}
          onPress={
            isSelectionMode
              ? () => handleToggleSelect(item.id)
              : () => handleNotificationPress(item)
          }
          onLongPress={() => handleToggleSelect(item.id)}
        />
      );
    } catch (error) {
      console.error('[NotificationScreen] 알림 아이템 렌더링 실패:', error);
      return null;
    }
  }, [selectedIds, isSelectionMode, handleNotificationPress, handleToggleSelect]);

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
                accessibilityRole="button"
                accessibilityLabel="모두 읽음"
              >
                <Text style={styles.markAllReadText} numberOfLines={1}>
                  읽음
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
            accessibilityRole="tab"
            accessibilityLabel={filter === 'all' ? '전체, 선택됨' : '전체'}
            accessibilityState={{ selected: filter === 'all' }}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => handleFilterChange('unread')}
            accessibilityRole="tab"
            accessibilityLabel={filter === 'unread' ? `읽지 않음, 선택됨${unreadCount > 0 ? ` ${unreadCount}건` : ''}` : `읽지 않음${unreadCount > 0 ? ` ${unreadCount}건` : ''}`}
            accessibilityState={{ selected: filter === 'unread' }}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 선택 바: 롱프레스로 진입, 취소로만 종료 (전체 해제해도 바 유지) */}
        {notifications.length > 0 && isSelectionModeActive && (
          <View style={styles.selectionBar}>
            <TouchableOpacity
              style={styles.selectAllRow}
              onPress={() => handleSelectAll(notifications)}
              accessibilityRole="checkbox"
              accessibilityLabel={isAllSelected ? '전체 선택 해제' : '전체 선택'}
              accessibilityState={{ checked: isAllSelected }}
            >
              <View style={[styles.checkbox, isAllSelected && styles.checkboxChecked]}>
                {isAllSelected && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
              <Text style={styles.selectAllText}>전체 선택</Text>
            </TouchableOpacity>
            <View style={styles.selectionBarRight}>
              <TouchableOpacity
                style={[styles.deleteButton, selectedIds.size === 0 && styles.deleteButtonDisabled]}
                onPress={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                accessibilityRole="button"
                accessibilityLabel="선택한 항목 삭제"
              >
                <Text style={[styles.deleteButtonText, selectedIds.size === 0 && styles.deleteButtonTextDisabled]}>
                  삭제
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleExitSelectionMode}
                accessibilityRole="button"
                accessibilityLabel="선택 모드 취소"
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                  : "아직 받은 알림이 없어요."
                }
              />
            }
          />
        </View>
      </View>

      {/* 선택 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteConfirmModal}
        title="알림 삭제"
        message={
          isAllSelected
            ? '모든 알림을 삭제하시겠습니까?'
            : `선택한 ${selectedIds.size}개 알림을 삭제하시겠습니까?`
        }
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDeleteSelected}
        onCancel={handleCancelDeleteSelected}
        confirmButtonColor={colors.error[500]}
      />

      {/* 오류 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="확인"
        onClose={handleAlertClose}
      />
    </ImageBackground>
  );
};

export default NotificationScreen;
