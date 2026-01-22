/**
 * 유저 상세 조회 화면
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Card, Header, Loading, ErrorBoundary, SectionTitle, Button } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserDetailScreenContainer } from './AdminUserDetailScreen.container';
import { styles } from './AdminUserDetailScreen.styles';

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
                {formatDateKorean(user.createdAt)}
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

export default AdminUserDetailScreen;
