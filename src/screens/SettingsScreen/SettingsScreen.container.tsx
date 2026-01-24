/**
 * SettingsScreen 비즈니스 로직
 * 설정 화면: 닉네임 변경, 로그아웃, 회원탈퇴, 피드백 전송, 관리자 기능
 */

import { useState, useCallback } from 'react';
import { Platform, Linking, Clipboard } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useCharacter } from '../../hooks/useCharacter';
import { clearAllCommunityPosts } from '../../services/storage';
import { getStorageKeys } from '../../services/storage';
import { clearAuthData } from '../../utils/tokenStorage';
import { apiClient } from '../../api/client';
import { deleteMyAccount } from '../../api/userApi';
import { SCREEN_NAMES } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 앱 버전 정보 (런타임에서 가져오기)
import { version } from '../../../package.json';
export const APP_VERSION = version;

interface SettingsScreenContainerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const useSettingsScreenContainer = ({ navigation }: SettingsScreenContainerProps) => {
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

  /**
   * 로그아웃 처리
   */
  const handleLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  /**
   * 닉네임 변경
   */
  const handleNicknameChange = useCallback(async () => {
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
  }, [newNickname, user?.nickname, updateNickname]);

  /**
   * 닉네임 변경 폼 열기
   */
  const handleOpenNicknameForm = useCallback(() => {
    setShowNicknameForm(true);
  }, []);

  /**
   * 닉네임 변경 폼 닫기
   */
  const handleCloseNicknameForm = useCallback(() => {
    setShowNicknameForm(false);
    setNewNickname('');
  }, []);

  /**
   * 정보 화면 열기
   */
  const openInfoScreen = useCallback(
    (title: string, content: string) => {
      if (navigation) {
        navigation.navigate(SCREEN_NAMES.INFO as any, { title, content });
      }
    },
    [navigation]
  );

  /**
   * 게시글 삭제 모달 열기
   */
  const handleClearAllPosts = useCallback(() => {
    setShowClearPostsModal(true);
  }, []);

  /**
   * 게시글 삭제 확인
   */
  const confirmClearAllPosts = useCallback(async () => {
    setShowClearPostsModal(false);
    try {
      const result = await clearAllCommunityPosts();
      if (result.success) {
        setAlertTitle('완료');
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
  }, []);

  /**
   * 유저 삭제 모달 열기
   */
  const handleDeleteAllUsers = useCallback(() => {
    setShowDeleteUsersModal(true);
  }, []);

  /**
   * 유저 삭제 확인
   */
  const confirmDeleteAllUsers = useCallback(async () => {
    setShowDeleteUsersModal(false);
    try {
      const result = await deleteAllUsers();
      if (result.success) {
        setAlertTitle('완료');
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
  }, [deleteAllUsers]);

  /**
   * 피드백 전송 (이메일)
   */
  const handleSendFeedback = useCallback(async () => {
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
        setAlertMessage(
          '메일 앱을 자동으로 열 수 없습니다.\n\n이메일 정보가 클립보드에 복사되었습니다.\n\nGmail 등 메일 앱을 열어서 붙여넣어 사용해주세요.'
        );
        setShowAlert(true);
      } catch (clipboardError) {
        setAlertTitle('이메일 주소');
        setAlertMessage(`아래 이메일 주소로 문의해주세요:\n\n${email}\n\n제목: ${subject}`);
        setShowAlert(true);
      }
    }
  }, [user?.nickname]);

  /**
   * 회원탈퇴 처리
   */
  const handleWithdrawal = useCallback(async () => {
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
  }, [user?.nickname, logout]);

  /**
   * 로그아웃 모달 열기
   */
  const handleOpenLogoutModal = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  /**
   * 로그아웃 모달 닫기
   */
  const handleCloseLogoutModal = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  /**
   * 회원탈퇴 모달 열기
   */
  const handleOpenWithdrawalModal = useCallback(() => {
    setShowWithdrawalModal(true);
  }, []);

  /**
   * 회원탈퇴 모달 닫기
   */
  const handleCloseWithdrawalModal = useCallback(() => {
    setShowWithdrawalModal(false);
  }, []);

  /**
   * 게시글 삭제 모달 닫기
   */
  const handleCloseClearPostsModal = useCallback(() => {
    setShowClearPostsModal(false);
  }, []);

  /**
   * 유저 삭제 모달 닫기
   */
  const handleCloseDeleteUsersModal = useCallback(() => {
    setShowDeleteUsersModal(false);
  }, []);

  /**
   * Alert 모달 닫기
   */
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  return {
    // Data
    user,
    currentCharacter,
    APP_VERSION,
    // State
    showNicknameForm,
    newNickname,
    showLogoutModal,
    showWithdrawalModal,
    showClearPostsModal,
    showDeleteUsersModal,
    showAlert,
    alertTitle,
    alertMessage,
    // Setters
    setNewNickname,
    // Handlers
    handleLogout,
    handleNicknameChange,
    handleOpenNicknameForm,
    handleCloseNicknameForm,
    openInfoScreen,
    handleClearAllPosts,
    confirmClearAllPosts,
    handleDeleteAllUsers,
    confirmDeleteAllUsers,
    handleSendFeedback,
    handleWithdrawal,
    handleOpenLogoutModal,
    handleCloseLogoutModal,
    handleOpenWithdrawalModal,
    handleCloseWithdrawalModal,
    handleCloseClearPostsModal,
    handleCloseDeleteUsersModal,
    handleCloseAlert,
  };
};
