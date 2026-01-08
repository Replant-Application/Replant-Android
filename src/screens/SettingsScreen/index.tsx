import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, TextInput, Platform, ImageBackground, Linking, Clipboard } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useCharacter } from '../../hooks/useCharacter';
import { Header, ConfirmModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { clearAllCommunityPosts } from '../../services/storage';
import { SettingsScreenProps } from './SettingsScreen.types';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, OPEN_SOURCE_LICENSE } from './SettingsScreen.constants';
import SettingItem from './SettingItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeys } from '../../services/storage';
import { clearAuthData } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout, updateNickname } = useUser();
  const { deleteAllUsers } = useAdmin();
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    if (newNickname.trim() === user?.nickname) {
      Alert.alert('알림', '현재 닉네임과 동일합니다.');
      return;
    }

    try {
      const result = await updateNickname(newNickname.trim());
      if (result.success) {
        Alert.alert('완료', '닉네임이 변경되었습니다.');
        setShowNicknameForm(false);
        setNewNickname('');
      } else {
        Alert.alert('오류', result.error || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '닉네임 변경 중 오류가 발생했습니다.');
    }
  };

  const openInfoScreen = (title: string, content: string) => {
    if (navigation) {
      navigation.navigate('Info', { title, content });
    }
  };

  const handleClearAllPosts = () => {
    Alert.alert(
      '⚠️ 경고',
      '모든 커뮤니티 게시글과 댓글이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await clearAllCommunityPosts();
              if (result.success) {
                Alert.alert(
                  '✅ 완료',
                  `${result.deletedCount}개의 게시글이 삭제되었습니다.`
                );
              } else {
                Alert.alert('오류', '게시글 삭제에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '게시글 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAllUsers = () => {
    Alert.alert(
      '⚠️ 경고',
      '모든 유저 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 유저를 삭제하시겠습니까?',
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
              } else {
                Alert.alert('오류', result.error || '유저 삭제에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '유저 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleSendFeedback = async () => {
    const email = 'teamsda01@gmail.com';
    const subject = encodeURIComponent('[Replant] 불편신고 및 개선 요청');
    const body = encodeURIComponent(
      `안녕하세요.\n\n불편사항이나 개선 요청사항을 작성해주세요.\n\n\n\n---\n앱 버전: 0.0.26\n기기: ${Platform.OS}`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        // 메일 앱이 없을 경우 이메일 주소를 클립보드에 복사
        try {
          await Clipboard.setString(email);
          Alert.alert(
            '이메일 주소 복사됨',
            `메일 앱을 찾을 수 없습니다.\n\n이메일 주소가 클립보드에 복사되었습니다:\n${email}\n\n원하시는 메일 앱에서 이 주소로 문의해주세요.`,
            [{ text: '확인', style: 'default' }]
          );
        } catch (clipboardError) {
          // 클립보드 복사도 실패한 경우
          Alert.alert(
            '이메일 주소',
            `메일 앱을 열 수 없습니다.\n\n아래 이메일 주소로 문의해주세요:\n\n${email}`,
            [{ text: '확인', style: 'default' }]
          );
        }
      }
    } catch (error) {
      // 메일 앱 열기 실패 시 이메일 주소 복사 시도
      try {
        await Clipboard.setString(email);
        Alert.alert(
          '이메일 주소 복사됨',
          `메일 앱을 여는 중 오류가 발생했습니다.\n\n이메일 주소가 클립보드에 복사되었습니다:\n${email}\n\n원하시는 메일 앱에서 이 주소로 문의해주세요.`,
          [{ text: '확인', style: 'default' }]
        );
      } catch (clipboardError) {
        Alert.alert(
          '이메일 주소',
          `메일 앱을 여는 중 오류가 발생했습니다.\n\n아래 이메일 주소로 문의해주세요:\n\n${email}`,
          [{ text: '확인', style: 'default' }]
        );
      }
    }
  };

  const handleWithdrawal = async () => {
    if (!user?.nickname) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const storageKeys = getStorageKeys(user.nickname);
      const allKeys = await AsyncStorage.getAllKeys();

      // 사용자 관련 모든 데이터 키 수집
      const keysToDelete: string[] = [];

      // 사용자 기본 정보
      if (allKeys.includes(storageKeys.USER)) keysToDelete.push(storageKeys.USER);
      if (allKeys.includes(storageKeys.USER_NICKNAME)) keysToDelete.push(storageKeys.USER_NICKNAME);

      // 사용자별 데이터
      if (allKeys.includes(storageKeys.MISSIONS)) keysToDelete.push(storageKeys.MISSIONS);
      if (allKeys.includes(storageKeys.DIARIES)) keysToDelete.push(storageKeys.DIARIES);
      if (allKeys.includes(storageKeys.CHARACTERS)) keysToDelete.push(storageKeys.CHARACTERS);
      if (allKeys.includes(storageKeys.SETTINGS)) keysToDelete.push(storageKeys.SETTINGS);
      if (allKeys.includes(storageKeys.PREFERENCES)) keysToDelete.push(storageKeys.PREFERENCES);
      if (allKeys.includes(storageKeys.USER_LIKES)) keysToDelete.push(storageKeys.USER_LIKES);
      if (allKeys.includes(storageKeys.USER_SCRAPS)) keysToDelete.push(storageKeys.USER_SCRAPS);
      if (allKeys.includes(storageKeys.CALENDAR_EVENTS)) keysToDelete.push(storageKeys.CALENDAR_EVENTS);
      if (allKeys.includes(storageKeys.AI_ANALYSIS_RESULTS)) keysToDelete.push(storageKeys.AI_ANALYSIS_RESULTS);

      // 기기별 닉네임 키도 삭제
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (deviceId) {
        const oldNicknameKey = `userNickname_${deviceId}`;
        if (allKeys.includes(oldNicknameKey)) keysToDelete.push(oldNicknameKey);
      }

      // 모든 키 삭제
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }

      // API 토큰 및 인증 데이터 삭제
      await clearAuthData();
      apiClient.setAccessToken(null);

      // 로그아웃 처리
      await logout();

      Alert.alert('완료', '회원탈퇴가 완료되었습니다.');
    } catch (error) {
      Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
    }
  };



  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="설정" showBackButton={false} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              {currentCharacter ? (
                <Image
                  source={getCharacterImage(currentCharacter.level || 1, 'default')}
                  style={styles.userIcon}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={require('../../assets/images/home.png')}
                  style={styles.userIcon}
                  resizeMode="contain"
                />
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.nickname || '사용자'}</Text>
                <Text style={styles.userSubtext}>
                  가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '알 수 없음'}
                </Text>
              </View>
            </View>
            
            {showNicknameForm ? (
              <View style={styles.nicknameForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>새 닉네임</Text>
                  <View style={styles.textInputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={newNickname}
                      onChangeText={setNewNickname}
                      placeholder="새 닉네임을 입력하세요"
                      placeholderTextColor={colors.text.tertiary}
                    />
                  </View>
                </View>
                <View style={styles.nicknameActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowNicknameForm(false);
                      setNewNickname('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleNicknameChange}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>변경</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.changeNicknameButton}
                onPress={() => setShowNicknameForm(true)}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.editIcon}
                  resizeMode="contain"
                />
                <Text style={styles.changeNicknameText}>닉네임 변경</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 기능 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기능</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={require('../../assets/images/chat.png')}
              title="상담 서비스"
              onPress={() => navigation?.navigate('CounselingSelect')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/boy.png')}
              title="마이페이지"
              onPress={() => navigation?.navigate('MyPage')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/calendar.png')}
              title="캘린더"
              onPress={() => navigation?.navigate('Calendar')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/search.png')}
              title="통계"
              onPress={() => navigation?.navigate('Statistics')}
            />
          </View>
        </View>

        {/* 관리자 메뉴 */}
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>관리자</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon={require('../../assets/images/alarm.png')}
                title="관리자 대시보드"
                onPress={() => navigation?.navigate('AdminDashboard')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={require('../../assets/images/notes.png')}
                title="전체 유저 목록"
                onPress={() => navigation?.navigate('AdminUserList')}
              />
            </View>
          </View>
        )}

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={require('../../assets/images/notes.png')}
              title="이용약관"
              onPress={() => openInfoScreen('이용약관', TERMS_OF_SERVICE)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/notes.png')}
              title="개인정보처리방침"
              onPress={() => openInfoScreen('개인정보처리방침', PRIVACY_POLICY)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/books.png')}
              title="오픈소스 라이선스"
              onPress={() => openInfoScreen('오픈소스 라이선스', OPEN_SOURCE_LICENSE)}
            />
          </View>
        </View>

        {/* 고객지원 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>고객지원</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={require('../../assets/images/siren.png')}
              title="불편신고 및 개선 요청"
              onPress={handleSendFeedback}
            />
          </View>
        </View>

        {/* 계정 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={require('../../assets/images/door.png')}
              title="로그아웃"
              onPress={() => setShowLogoutModal(true)}
              showArrow={true}
              danger={true}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/withdrawal.png')}
              title="회원탈퇴"
              onPress={() => setShowWithdrawalModal(true)}
              showArrow={true}
              danger={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        visible={showLogoutModal}
        title="로그아웃"
        message="정말로 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmButtonColor={colors.error}
        image={require('../../assets/images/logout.png')}
      />

      {/* 회원탈퇴 확인 모달 */}
      <ConfirmModal
        visible={showWithdrawalModal}
        title="회원탈퇴"
        message="정말로 회원탈퇴를 하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴하기"
        cancelText="취소"
        onConfirm={handleWithdrawal}
        onCancel={() => setShowWithdrawalModal(false)}
        confirmButtonColor={colors.error}
        image={require('../../assets/images/crying.png')}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: 120, // 하단 탭바 높이 + 여유 공간
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  userCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    ...shadows.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  userIcon: {
    width: 48,
    height: 48,
    marginRight: spacing[3],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
  },
  userSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  nicknameForm: {
    marginTop: spacing[2],
  },
  inputContainer: {
    marginBottom: spacing[3],
  },
  inputLabel: {
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
  textInputWrapper: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textInput: {
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
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
  saveButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  changeNicknameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  changeNicknameText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  settingsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
  },
  settingItemDanger: {
    backgroundColor: colors.background.primary,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  settingItemText: {
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
  settingItemTextDanger: {
    color: colors.error,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 24 + spacing[3], // icon width + margin + text margin
  },
});

export default SettingsScreen;
