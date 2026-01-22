/**
 * 전체 유저 목록 화면
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, Loading, ErrorBoundary } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserListScreenContainer } from './AdminUserListScreen.container';

interface AdminUserListScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AdminUserListScreen: React.FC<AdminUserListScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    filteredUsers,
    searchQuery,
    filter,
    loading,
    error,
    handleSearchChange,
    handleFilterChange,
    handleUserPress,
  } = useAdminUserListScreenContainer({ navigation });

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  return (
    <View style={styles.container}>
      <Header title="전체 유저 목록" navigation={navigation} />

      <View style={styles.content}>
        {/* 검색 및 필터 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="닉네임, 이메일로 검색..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              활성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'inactive' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('inactive')}
          >
            <Text style={[styles.filterText, filter === 'inactive' && styles.filterTextActive]}>
              비활성
            </Text>
          </TouchableOpacity>
        </View>

        {/* 유저 목록 */}
        {loading ? (
          <Loading text="유저 목록을 불러오는 중..." />
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>유저가 없습니다.</Text>
          </View>
        ) : (
          <ScrollView style={styles.userList}>
            {filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => handleUserPress(user.id)}
              >
                <View style={styles.userCardContent}>
                  <View style={styles.userCardHeader}>
                    <Text style={styles.userCardNickname}>{user.nickname}</Text>
                    <View style={[
                      styles.statusBadge,
                      user.status === 'INACTIVE' && styles.statusBadgeInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {user.status === 'INACTIVE' ? '비활성' : '활성'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userCardEmail}>{user.email || '이메일 없음'}</Text>
                  <View style={styles.userCardFooter}>
                    <Text style={styles.userCardRole}>역할: {user.role || 'USER'}</Text>
                    {user.createdAt && (
                      <Text style={styles.userCardDate}>
                        가입: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  searchContainer: {
    marginBottom: spacing[4],
  },
  searchInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  userList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    ...shadows.base,
  },
  userCardContent: {
    padding: spacing[4],
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  userCardNickname: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[100],
  },
  statusBadgeInactive: {
    backgroundColor: colors.gray[200],
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  userCardEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  userCardRole: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  userCardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default AdminUserListScreen;
