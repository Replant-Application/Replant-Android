/**
 * 전체 유저 목록 화면
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, Loading, ErrorBoundary } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserListScreenContainer } from './AdminUserListScreen.container';
import { styles } from './AdminUserListScreen.styles';

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
                        가입: {formatDateKorean(user.createdAt)}
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

export default AdminUserListScreen;
