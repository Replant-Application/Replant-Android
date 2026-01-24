import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ImageBackground } from 'react-native';
import { Header, ConfirmModal, AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { getCharacterImage } from '../../utils/characterUtils';
import { formatDateKorean } from '../../utils/dateUtils';
import { SettingsScreenProps } from '../../types/screens/settings';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, OPEN_SOURCE_LICENSE } from '../../constants/screens/settings';
import SettingItem from './SettingItem';
import { useSettingsScreenContainer, APP_VERSION } from './SettingsScreen.container';
import { styles } from './SettingsScreen.styles';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    user,
    currentCharacter,
    showNicknameForm,
    newNickname,
    showLogoutModal,
    showWithdrawalModal,
    showClearPostsModal,
    showDeleteUsersModal,
    showAlert,
    alertTitle,
    alertMessage,
    setNewNickname,
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
  } = useSettingsScreenContainer({ navigation });



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
              {currentCharacter && (
                <Image
                  source={getCharacterImage(currentCharacter.level || 1, 'default')}
                  style={styles.userIcon}
                  resizeMode="contain"
                  accessibilityLabel={`${currentCharacter.name || '캐릭터'} 이미지`}
                />
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.nickname || '사용자'}</Text>
                <Text style={styles.userSubtext}>
                  가입일: {user?.createdAt ? formatDateKorean(user.createdAt) : '알 수 없음'}
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
                    onPress={handleCloseNicknameForm}
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
                onPress={handleOpenNicknameForm}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="닉네임 변경"
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.editIcon}
                  resizeMode="contain"
                  accessibilityLabel="닉네임 수정 아이콘"
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
              icon={require('../../assets/images/surprised_mission.png')}
              title="돌발 미션 설정"
              onPress={() => navigation?.navigate('SpontaneousMissionSetup' as any, { mode: 'edit' })}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/alarm.png')}
              title="사운드"
              onPress={() => navigation?.navigate('SoundSettings' as any)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/chat.png')}
              title="상담 서비스"
              onPress={() => navigation?.navigate('CounselingSelect')}
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
              onPress={handleOpenLogoutModal}
              showArrow={true}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../../assets/images/withdrawal.png')}
              title="회원탈퇴"
              onPress={handleOpenWithdrawalModal}
              showArrow={true}
              danger={true}
            />
          </View>
        </View>

        {/* 고객지원 섹션 */}
        <View style={[styles.section, styles.sectionBeforeVersion]}>
          <Text style={styles.sectionTitle}>고객지원</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={require('../../assets/images/siren.png')}
              title="불편신고 및 개선 요청"
              onPress={handleSendFeedback}
            />
          </View>
        </View>

        {/* 버전 정보 (맨 밑) */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v{APP_VERSION}</Text>
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
        onCancel={handleCloseLogoutModal}
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
        onCancel={handleCloseWithdrawalModal}
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
        onCancel={handleCloseClearPostsModal}
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
        onCancel={handleCloseDeleteUsersModal}
        confirmButtonColor={colors.error}
      />

      {/* 알림 모달 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
    </ImageBackground>
  );
};


export default SettingsScreen;
