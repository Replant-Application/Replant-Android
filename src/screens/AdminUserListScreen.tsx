/**
 * 전체 유저 목록 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAdmin } from '../hooks/useAdmin';
import { Card, Header, Loading, ErrorBoundary, SectionTitle } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { UserInfo } from '../api/manageApi';

interface AdminUserListScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type FilterType = 'all' | 'active' | 'inactive';

const AdminUserListScreen: React.FC<AdminUserListScreenProps> = ({ navigation }) => {
  const { getAllUsers, loading, error } = useAdmin();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page, filter]);

  const loadUsers = async () => {
    const result = await getAllUsers({ page, limit });
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  // 필터링된 유저 목록
  const filteredUsers = users.filter(user => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        user.nickname.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.username && user.username.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filter === 'active') {
      return user.isActive !== false;
    }
    if (filter === 'inactive') {
      return user.isActive === false;
    }

    return true;
  });

  const handleUserPress = (userId: number) => {
    navigation.navigate('AdminUserDetail', { userId });
  };

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  return (
    <View style={styles.container}>
      <Header title="전체 유저 목록" />
      
      <View style={styles.content}>
        {/* 검색 및 필터 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="닉네임, 이메일로 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              활성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'inactive' && styles.filterButtonActive]}
            onPress={() => setFilter('inactive')}
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
                      user.isActive === false && styles.statusBadgeInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {user.isActive === false ? '비활성' : '활성'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userCardEmail}>{user.email || '이메일 없음'}</Text>
                  <View style={styles.userCardFooter}>
                    <Text style={styles.userCardRole}>역할: {user.role || 'user'}</Text>
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
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
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
  },
  userCardEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  userCardRole: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  userCardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
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
  },
});

export default AdminUserListScreen;

