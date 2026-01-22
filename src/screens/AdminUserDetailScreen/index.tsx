/**
 * 유저 상세 조회 화면
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Card, Header, Loading, ErrorBoundary, SectionTitle, Button } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserDetailScreenContainer } from './AdminUserDetailScreen.container';

interface AdminUserDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AdminUserDetail'>;
}

const AdminUserDetailScreen: React.FC<AdminUserDetailScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;

  // 비즈니스 로직은 Container에서 처리
  const { user, loading, error, handleEdit, handleToggleActive } =
    useAdminUserDetailScreenContainer({ userId, navigation });

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Header title="유저 상세" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <Loading text="유저 정보를 불러오는 중..." />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="유저 상세" navigation={navigation} />

      <View style={styles.content}>
        {/* 기본 정보 */}
        <Card style={styles.infoCard}>
          <SectionTitle title="👤 기본 정보" size="lg" marginBottom={spacing[4]} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>닉네임</Text>
            <Text style={styles.infoValue}>{user.nickname}</Text>
          </View>

          {user.username && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>사용자명</Text>
              <Text style={styles.infoValue}>{user.username}</Text>
            </View>
          )}

          {user.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>역할</Text>
            <View style={[
              styles.roleBadge,
              user.role?.toUpperCase() === 'ADMIN' && styles.roleBadgeAdmin
            ]}>
              <Text style={styles.roleText}>{user.role || 'USER'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>상태</Text>
            <View style={[
              styles.statusBadge,
              user.status === 'INACTIVE' && styles.statusBadgeInactive
            ]}>
              <Text style={styles.statusText}>
                {user.status === 'INACTIVE' ? '비활성' : '활성'}
              </Text>
            </View>
          </View>

          {user.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>가입일</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        </Card>

        {/* 액션 버튼 */}
        <View style={styles.actionsContainer}>
          <Button
            title="수정"
            onPress={handleEdit}
            style={styles.editButton}
            size="lg"
          />
          <Button
            title={user.status === 'INACTIVE' ? '활성화' : '비활성화'}
            onPress={handleToggleActive}
            variant={user.status === 'INACTIVE' ? 'primary' : 'outline'}
            style={[
              styles.toggleButton,
              user.status === 'INACTIVE' ? styles.activateButton : null
            ].filter(Boolean) as any}
            size="lg"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    padding: spacing[5],
  },
  infoCard: {
    marginBottom: spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  roleBadgeAdmin: {
    backgroundColor: colors.primary[100],
  },
  roleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[100],
  },
  statusBadgeInactive: {
    backgroundColor: colors.gray[200],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  actionsContainer: {
    gap: spacing[3],
  },
  editButton: {
    marginBottom: spacing[2],
  },
  toggleButton: {
    marginBottom: spacing[2],
  },
  activateButton: {
    backgroundColor: colors.primary[500],
  },
});

export default AdminUserDetailScreen;
