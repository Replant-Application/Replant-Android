/**
 * 관리자 대시보드 화면
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, Header, Loading, ErrorBoundary, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { UserInfo } from '../../api/manageApi';

interface AdminDashboardScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { getAllUsers, deleteAllUsers, loading, error } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserInfo[]>([]);

  const loadDashboardData = useCallback(async () => {
    const result = await getAllUsers({ page: 1, limit: 100 });
    if (result.success && result.data) {
      const users = result.data;
      const activeUsers = users.filter(u => u.isActive !== false).length;
      const inactiveUsers = users.filter(u => u.isActive === false).length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
      });

      // 최근 가입 유저 (최근 5명)
      const sorted = [...users].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRecentUsers(sorted.slice(0, 5));
    }
  }, [getAllUsers]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDeleteAllUsers = () => {
    Alert.alert(
      '⚠️ 경고',
      `모든 유저 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 유저를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAllUsers();
              if (result.success) {
                Alert.alert(
                  '✅ 완료',
                  `${result.data?.deletedCount || 0}명의 유저가 삭제되었습니다.`
                );
                // 데이터 새로고침
                loadDashboardData();
              } else {
                Alert.alert('오류', result.error || '유저 삭제에 실패했습니다.');
              }
            } catch (err) {
              Alert.alert('오류', '유저 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="관리자 대시보드" />

      <View style={styles.content}>
        {loading ? (
          <Loading text="데이터를 불러오는 중..." />
        ) : (
          <>
            {/* 통계 카드 */}
            <Card style={styles.statsCard}>
              <SectionTitle title="📊 통계" size="lg" marginBottom={spacing[4]} />
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>전체 유저</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.activeStat]}>
                    {stats.activeUsers}
                  </Text>
                  <Text style={styles.statLabel}>활성 유저</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.inactiveStat]}>
                    {stats.inactiveUsers}
                  </Text>
                  <Text style={styles.statLabel}>비활성 유저</Text>
                </View>
              </View>
            </Card>

            {/* 최근 가입 유저 */}
            {recentUsers.length > 0 && (
              <Card style={styles.recentUsersCard}>
                <SectionTitle title="🆕 최근 가입 유저" size="lg" marginBottom={spacing[4]} />
                {recentUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => navigation.navigate('AdminUserDetail', { userId: user.id })}
                  >
                    <View style={styles.userInfo}>
                      <Text style={styles.userNickname}>{user.nickname}</Text>
                      <Text style={styles.userEmail}>{user.email || '이메일 없음'}</Text>
                    </View>
                    <Text style={styles.userRole}>{user.role || 'user'}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            )}

          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[5],
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  activeStat: {
    color: colors.primary[600],
  },
  inactiveStat: {
    color: colors.gray[500],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  recentUsersCard: {
    marginBottom: spacing[6],
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
  userInfo: {
    flex: 1,
  },
  userNickname: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  actionsCard: {
    marginBottom: spacing[6],
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  dangerButton: {
    backgroundColor: colors.error,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[3],
  },
  dangerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});

export default AdminDashboardScreen;
