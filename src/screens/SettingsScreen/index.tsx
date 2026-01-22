import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Platform, ImageBackground, Linking, Clipboard } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useCharacter } from '../../hooks/useCharacter';
import { Header, ConfirmModal, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { getCharacterImage } from '../../utils/characterUtils';
import { clearAllCommunityPosts } from '../../services/storage';
import { SettingsScreenProps } from '../../types/screens/settings';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, OPEN_SOURCE_LICENSE } from '../../constants/screens/settings';
import SettingItem from './SettingItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeys } from '../../services/storage';
import { clearAuthData } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';
import { deleteMyAccount } from '../../api/userApi';

// 앱 버전 정보 (런타임에서 가져오기)
import { version } from '../../../package.json';
const APP_VERSION = version;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout, updateNickname } = useUser();
  const { deleteAllUsers } = useAdmin();
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showClearPostsModal, setShowClearPostsModal] = useState(false);
  const [showDeleteUsersModal, setShowDeleteUsersModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      setAlertTitle('오류');
      setAlertMessage('닉네임을 입력해주세요.');
      setShowAlert(true);
      return;
    }

    if (newNickname.trim() === user?.nickname) {
      setAlertTitle('알림');
      setAlertMessage('현재 닉네임과 동일합니다.');
      setShowAlert(true);
      return;
    }

    try {
      const result = await updateNickname(newNickname.trim());
      if (result.success) {
        setAlertTitle('완료');
        setAlertMessage('닉네임이 변경되었습니다.');
        setShowAlert(true);
        setShowNicknameForm(false);
        setNewNickname('');
      } else {
        setAlertTitle('오류');
        setAlertMessage(result.error || '닉네임 변경에 실패했습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertTitle('오류');
      setAlertMessage('닉네임 변경 중 오류가 발생했습니다.');
      setShowAlert(true);
    }
  };

  const openInfoScreen = (title: string, content: string) => {
    if (navigation) {
      navigation.navigate('Info', { title, content });
    }
  };

  const handleClearAllPosts = () => {
    setShowClearPostsModal(true);
  };

  const confirmClearAllPosts = async () => {
    setShowClearPostsModal(false);
    try {
      const result = await clearAllCommunityPosts();
      if (result.success) {
        setAlertTitle('✅ 완료');
        setAlertMessage(`${result.deletedCount}개의 게시글이 삭제되었습니다.`);
        setShowAlert(true);
      } else {
        setAlertTitle('오류');
        setAlertMessage('게시글 삭제에 실패했습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertTitle('오류');
      setAlertMessage('게시글 삭제 중 오류가 발생했습니다.');
      setShowAlert(true);
    }
  };

  const handleDeleteAllUsers = () => {
    setShowDeleteUsersModal(true);
  };

  const confirmDeleteAllUsers = async () => {
    setShowDeleteUsersModal(false);
    try {
      const result = await deleteAllUsers();
      if (result.success) {
        setAlertTitle('✅ 완료');
        setAlertMessage(`${result.data?.deletedCount || 0}명의 유저가 삭제되었습니다.`);
        setShowAlert(true);
      } else {
        setAlertTitle('오류');
        setAlertMessage(result.error || '유저 삭제에 실패했습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertTitle('오류');
      setAlertMessage('유저 삭제 중 오류가 발생했습니다.');
      setShowAlert(true);
    }
  };

  const handleSendFeedback = async () => {
    const email = 'teamsda01@gmail.com';
    const subject = '[Replant] 불편신고 및 개선 요청';
    const body = `안녕하세요.

불편사항이나 개선 요청사항을 작성해주세요.



---
앱 버전: ${APP_VERSION}
기기: ${Platform.OS}
사용자: ${user?.nickname || '익명'}`;

    // expo-mail-composer를 선택적으로 로드
    let MailComposer: any = null;
    try {
      MailComposer = require('expo-mail-composer');
    } catch (e) {
      // 패키지가 없으면 null로 유지
    }

    // MailComposer가 있으면 사용
    if (MailComposer && MailComposer.isAvailableAsync && MailComposer.composeAsync) {
      try {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (isAvailable) {
          await MailComposer.composeAsync({
            recipients: [email],
            subject: subject,
            body: body,
          });
          return;
        }
      } catch (error) {
        console.log('MailComposer error:', error);
        // MailComposer 실패 시 fallback으로 진행
      }
    }

    // MailComposer가 없거나 실패한 경우 - Android Intent URI 사용
    try {
      // Android Intent URI를 사용하여 메일 앱 열기
      // 이 방식은 더 안정적이고 크래시를 일으키지 않음
      const subjectEncoded = encodeURIComponent(subject);
      const bodyEncoded = encodeURIComponent(body);
      
      // Intent URI 형식으로 메일 앱 열기
      const intentUri = `intent://send?to=${encodeURIComponent(email)}&subject=${subjectEncoded}&body=${bodyEncoded}#Intent;scheme=mailto;action=android.intent.action.SENDTO;end`;
      
      try {
        await Linking.openURL(intentUri);
      } catch (intentError) {
        // Intent URI 실패 시 일반 mailto 시도
        const mailtoUrl = `mailto:${email}?subject=${subjectEncoded}&body=${bodyEncoded}`;
        await Linking.openURL(mailtoUrl);
      }
    } catch (error) {
      // 모든 방법 실패 시 이메일 정보를 클립보드에 복사
      try {
        const emailInfo = `받는 사람: ${email}\n제목: ${subject}\n\n${body}`;
        await Clipboard.setString(emailInfo);
        setAlertTitle('이메일 정보 복사됨');
        setAlertMessage('메일 앱을 자동으로 열 수 없습니다.\n\n이메일 정보가 클립보드에 복사되었습니다.\n\nGmail 등 메일 앱을 열어서 붙여넣어 사용해주세요.');
        setShowAlert(true);
      } catch (clipboardError) {
        setAlertTitle('이메일 주소');
        setAlertMessage(`아래 이메일 주소로 문의해주세요:\n\n${email}\n\n제목: ${subject}`);
        setShowAlert(true);
      }
    }
  };

  const handleWithdrawal = async () => {
    if (!user?.nickname) {
      setAlertTitle('오류');
      setAlertMessage('사용자 정보를 찾을 수 없습니다.');
      setShowAlert(true);
      return;
    }

    try {
      // 1. API로 회원 탈퇴 요청
      const result = await deleteMyAccount();
      
      if (!result.success) {
        setAlertTitle('오류');
        setAlertMessage(result.error || '회원탈퇴에 실패했습니다.');
        setShowAlert(true);
        return;
      }

      // 2. 로컬 스토리지 데이터 삭제
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

      // 3. API 토큰 및 인증 데이터 삭제
      await clearAuthData();
      apiClient.setAccessToken(null);

      // 4. 로그아웃 처리
      await logout();

      setShowWithdrawalModal(false);
      setAlertTitle('완료');
      setAlertMessage('회원탈퇴가 완료되었습니다.\n탈퇴 후 30일 이내에 계정을 복구할 수 있습니다.');
      setShowAlert(true);
    } catch (error) {
      console.error('[SettingsScreen] 회원탈퇴 오류:', error);
      setAlertTitle('오류');
      setAlertMessage('회원탈퇴 중 오류가 발생했습니다.');
      setShowAlert(true);
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
                  accessibilityLabel={`${currentCharacter.name || '캐릭터'} 이미지`}
                />
              ) : (
                <Image
                  source={require('../../assets/images/home.png')}
                  style={styles.userIcon}
                  resizeMode="contain"
                  accessibilityLabel="사용자 아이콘"
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
                      accessibilityLabel="새 닉네임"
                      accessibilityHint="변경할 닉네임을 입력하세요"
                      allowFontScaling={true}
                      multiline={false}
                      maxLength={20}
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
                    accessibilityRole="button"
                    accessibilityLabel="취소"
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleNicknameChange}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="변경"
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
                accessibilityRole="button"
                accessibilityLabel="닉네임 변경"
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.editIcon}
                  resizeMode="contain"
                  accessibilityElementsHidden={true}
                />
                <Text style={styles.changeNicknameText}>닉네임 변경</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 관리자 메뉴 (기능 섹션 위에 표시) */}
        {(user?.role === 'ADMIN' || user?.role === 'admin') && (
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
              icon={require('../../assets/images/alarm.png')}
              title="사운드"
              onPress={() => navigation?.navigate('SoundSettings' as any)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/surprised_mission.png')}
              title="돌발 미션 설정"
              onPress={() => navigation?.navigate('SpontaneousMissionSetup' as any, { mode: 'edit' })}
            />
          </View>
        </View>

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
              icon={require('../../assets/images/notes.png')}
              title="비밀번호 변경"
              onPress={() => navigation?.navigate('ChangePassword')}
              showArrow={true}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/door.png')}
              title="로그아웃"
              onPress={() => setShowLogoutModal(true)}
              showArrow={true}
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
          {/* 버전 정보 */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
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

      {/* 게시글 삭제 확인 모달 */}
      <ConfirmModal
        visible={showClearPostsModal}
        title="⚠️ 경고"
        message="모든 커뮤니티 게시글과 댓글이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmClearAllPosts}
        onCancel={() => setShowClearPostsModal(false)}
        confirmButtonColor={colors.error}
      />

      {/* 유저 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteUsersModal}
        title="⚠️ 경고"
        message="모든 유저 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 유저를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDeleteAllUsers}
        onCancel={() => setShowDeleteUsersModal(false)}
        confirmButtonColor={colors.error}
      />

      {/* 알림 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
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
    height: 48,
    justifyContent: 'center',
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
    height: 48,
    paddingVertical: 0,
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
  versionContainer: {
    paddingTop: spacing[3],
    paddingHorizontal: spacing[4],
    alignItems: 'flex-start',
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default SettingsScreen;
