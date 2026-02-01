/**
 * 유저 수정 화면
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Header, Loading, ErrorBoundary, Button, Input } from '../../components/ui';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserEditScreenContainer } from './AdminUserEditScreen.container';
import { styles } from './AdminUserEditScreen.styles';

interface AdminUserEditScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AdminUserEdit'>;
}

const AdminUserEditScreen: React.FC<AdminUserEditScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;

  // 비즈니스 로직은 Container에서 처리
  const {
    user,
    nickname,
    email,
    role,
    loading,
    error,
    handleNicknameChange,
    handleEmailChange,
    handleRoleChange,
    handleSave,
  } = useAdminUserEditScreenContainer({ userId, navigation });

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Header title="유저 수정" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <Loading text="유저 정보를 불러오는 중..." />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header title="유저 수정" navigation={navigation} />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* 닉네임 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>닉네임 *</Text>
            <Input
              value={nickname}
              onChangeText={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
              style={styles.input}
            />
          </View>

          {/* 이메일 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>이메일</Text>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* 역할 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>역할</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                onPress={() => handleRoleChange('user')}
                accessibilityRole="button"
                accessibilityLabel="사용자"
                accessibilityState={{ selected: role === 'user' }}
              >
                <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>
                  사용자
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                onPress={() => handleRoleChange('admin')}
                accessibilityRole="button"
                accessibilityLabel="관리자"
                accessibilityState={{ selected: role === 'admin' }}
              >
                <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
                  관리자
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="저장"
          onPress={handleSave}
          size="lg"
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdminUserEditScreen;
