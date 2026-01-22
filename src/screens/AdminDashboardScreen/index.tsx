/**
 * 관리자 대시보드 화면
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Header, Loading, ErrorBoundary, SectionTitle } from '../../components/ui';
import { spacing } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { useAdminDashboardScreenContainer } from './AdminDashboardScreen.container';
import { styles } from './AdminDashboardScreen.styles';

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

export default AdminDashboardScreen;
