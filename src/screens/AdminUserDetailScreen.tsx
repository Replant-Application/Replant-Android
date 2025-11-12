/**
 * 유저 상세 조회 화면
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useAdmin } from '../hooks/useAdmin';
import { Card, Header, Loading, ErrorBoundary, SectionTitle, Button } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { UserInfo } from '../api/manageApi';

interface AdminUserDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AdminUserDetail'>;
}

const AdminUserDetailScreen: React.FC<AdminUserDetailScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;
  const { getUserDetail, deactivateUser, activateUser, loading, error } = useAdmin();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    const result = await getUserDetail(userId);
    if (result.success && result.data) {
      setUser(result.data);
    }
  };

  const handleEdit = () => {
    if (user) {
      navigation.navigate('AdminUserEdit', { userId: user.id });
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;

    const action = user.isActive === false ? '활성화' : '비활성화';
    Alert.alert(
      `유저 ${action}`,
      `이 유저를 ${action}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: action,
          style: user.isActive === false ? 'default' : 'destructive',
          onPress: async () => {
            const result = user.isActive === false
              ? await activateUser(user.id)
              : await deactivateUser(user.id);
            
            if (result.success) {
              Alert.alert('성공', `유저가 ${action}되었습니다.`);
              loadUserDetail();
            } else {
              Alert.alert('오류', result.error || `${action}에 실패했습니다.`);
            }
          },
        },
      ]
    );
  };

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Header title="유저 상세" />
        <View style={styles.loadingContainer}>
          <Loading text="유저 정보를 불러오는 중..." />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="유저 상세" />
      
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
              user.role === 'admin' && styles.roleBadgeAdmin
            ]}>
              <Text style={styles.roleText}>{user.role || 'user'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>상태</Text>
            <View style={[
              styles.statusBadge,
              user.isActive === false && styles.statusBadgeInactive
            ]}>
              <Text style={styles.statusText}>
                {user.isActive === false ? '비활성' : '활성'}
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
            title={user.isActive === false ? '활성화' : '비활성화'}
            onPress={handleToggleActive}
            variant={user.isActive === false ? 'primary' : 'outline'}
            style={[
              styles.toggleButton,
              user.isActive === false && styles.activateButton
            ]}
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
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
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

