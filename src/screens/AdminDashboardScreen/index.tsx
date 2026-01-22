/**
 * 관리자 대시보드 화면
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, ErrorBoundary, SectionTitle } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useAdminDashboardScreenContainer } from './AdminDashboardScreen.container';

interface AdminDashboardScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const { stats, recentUsers, loading, error, handleUserPress } =
    useAdminDashboardScreenContainer({ navigation });

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="관리자 대시보드" navigation={navigation} />

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
                    onPress={() => handleUserPress(user.id)}
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['3xl']),
  },
  activeStat: {
    color: colors.primary[600],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['3xl']),
  },
  inactiveStat: {
    color: colors.gray[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['3xl']),
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default AdminDashboardScreen;
