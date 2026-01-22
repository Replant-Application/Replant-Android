/**
 * 유저 수정 화면
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Header, Loading, ErrorBoundary, Button, Input } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { RootStackParamList } from '../../types/navigation';
import { useAdminUserEditScreenContainer } from './AdminUserEditScreen.container';

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
              >
                <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>
                  사용자
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                onPress={() => handleRoleChange('admin')}
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  roleButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
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
  backButtonIcon: {
    width: 24,
    height: 24,
  },
});

export default AdminUserEditScreen;
