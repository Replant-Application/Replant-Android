/**
 * 유저 수정 화면
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useAdmin } from '../hooks/useAdmin';
import { Header, Loading, ErrorBoundary, SectionTitle, Button, Input } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import { UserInfo } from '../api/manageApi';

interface AdminUserEditScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AdminUserEdit'>;
}

const AdminUserEditScreen: React.FC<AdminUserEditScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;
  const { getUserDetail, updateUser, loading, error } = useAdmin();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    const result = await getUserDetail(userId);
    if (result.success && result.data) {
      const userData = result.data;
      setUser(userData);
      setNickname(userData.nickname || '');
      setEmail(userData.email || '');
      setRole(userData.role || 'user');
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    const result = await updateUser(userId, {
      nickname: nickname.trim(),
      email: email.trim() || undefined,
      role: role as any,
    });

    if (result.success) {
      Alert.alert('성공', '유저 정보가 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('오류', result.error || '유저 정보 수정에 실패했습니다.');
    }
  };

  if (error) {
    return <ErrorBoundary error={new Error(error)} />;
  }

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Header title="유저 수정" />
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
      <Header
        title="유저 수정"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 취소</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* 닉네임 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>닉네임 *</Text>
            <Input
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              style={styles.input}
            />
          </View>

          {/* 이메일 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>이메일</Text>
            <Input
              value={email}
              onChangeText={setEmail}
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
                onPress={() => setRole('user')}
              >
                <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>
                  사용자
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                onPress={() => setRole('admin')}
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
    flex: 1,
  },
  formContainer: {
    padding: spacing[5],
  },
  inputSection: {
    marginBottom: spacing[5],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.background.primary,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  roleButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  roleButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  roleButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonContainer: {
    padding: spacing[5],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  saveButton: {
    width: '100%',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
});

export default AdminUserEditScreen;

