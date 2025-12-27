import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Header, ConfirmModal } from '../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const TERMS_OF_SERVICE = `Replant 이용약관

본 약관은 Replant(이하 "회사") 서비스 이용과 관련된 회사와 이용자 간의 권리, 의무 및 책임사항을 규정합니다.


제1조 (목적)

본 약관은 Replant 서비스의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.


제2조 (용어의 정의)

① "서비스"란 회사가 제공하는 모든 온라인 서비스를 의미합니다.

② "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.


제3조 (약관의 효력 및 변경)

① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.

② 회사는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 화면에 공지함으로써 효력을 발생합니다.

③ 이용자는 정기적으로 본 약관의 내용을 확인하여야 하며, 변경된 약관에 대한 정보를 확인하지 않아 발생하는 손해에 대해 회사는 책임을 지지 않습니다.


제4조 (서비스의 제공)

회사는 다음과 같은 서비스를 제공합니다:

• 미션 관리 서비스
• 캐릭터 성장 시스템
• 일기 작성 기능
• 기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 모든 서비스


제5조 (서비스의 중단)

① 회사는 다음의 경우 서비스 제공을 일시적으로 중단할 수 있습니다:

  - 컴퓨터 등 정보통신설비의 보수점검·교체·고장 발생
  - 통신의 두절
  - 천재지변 등 불가항력적 사유
  - 기타 기술적 장애 발생

② 제1항에 의한 서비스 중단의 경우, 회사는 사전에 공지하며 불가피한 경우 사후에 공지할 수 있습니다.


제6조 (이용자의 의무)

이용자는 다음 행위를 하여서는 안 됩니다:

• 신청 또는 변경 시 허위 내용의 등록
• 타인의 정보 도용
• 회사가 게시한 정보의 무단 변경
• 회사가 정한 정보 이외의 정보의 송신 또는 게시
• 회사 및 제3자의 저작권 등 지적재산권 침해
• 회사 및 제3자의 명예 손상 또는 업무 방해 행위
• 외설적·폭력적 메시지, 화상, 음성 등 공서양속에 반하는 정보의 공개 또는 게시
• 기타 관련 법령에 위배되는 행위


시행일자: 2024년 1월 1일`;

const PRIVACY_POLICY = `Replant 개인정보처리방침

회사는 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다.
본 방침은 정보통신망법 및 개인정보 보호법에 따라 수집·보유·이용되는 개인정보의 처리에 관한 사항을 안내합니다.


제1조 (개인정보의 처리 목적)

회사는 다음의 목적을 위하여 개인정보를 처리합니다:

• 서비스 제공에 관한 계약 이행
• 회원 관리 (회원 식별, 가입의사 확인, 본인 확인)
• 서비스 개선 및 신규 서비스 개발
• 통계 및 분석을 통한 서비스 품질 향상


제2조 (개인정보의 처리 및 보유기간)

① 회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 동의를 받은 기간 내에서 개인정보를 처리·보유합니다.

② 각 개인정보 항목별 보유기간:

  • 회원 가입 및 관리: 회원 탈퇴 시까지
  • 서비스 제공 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)


제3조 (처리하는 개인정보의 항목)

회사는 다음의 개인정보를 처리합니다:

① 회원 정보
  • 필수항목: 닉네임, 가입일
  • 선택항목: 없음

② 서비스 이용 과정에서 자동 수집되는 정보
  • IP 주소, 쿠키, 접속 로그, 기기 정보


제4조 (개인정보의 제3자 제공)

회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 다음의 경우를 제외하고는 제3자에게 제공하지 않습니다:

• 이용자의 명시적 동의가 있는 경우
• 법률의 특별한 규정에 의한 경우
• 개인정보 보호법 제17조 및 제18조에 해당하는 경우


제5조 (개인정보처리의 위탁)

현재 회사는 개인정보 처리업무를 외부에 위탁하고 있지 않습니다.

향후 위탁이 필요한 경우, 관련 법령에 따라 사전에 공지하며 이용자의 동의를 받겠습니다.


제6조 (정보주체의 권리·의무 및 행사방법)

이용자는 언제든지 다음의 권리를 행사할 수 있습니다:

• 개인정보 열람요구
• 개인정보 정정·삭제요구
• 개인정보 처리정지 요구

권리 행사 방법: 앱 내 설정 화면 또는 고객센터를 통해 요청하실 수 있습니다.


제7조 (개인정보의 파기)

회사는 다음의 경우 개인정보를 지체 없이 파기합니다:

• 보유기간의 경과
• 처리 목적 달성 등 개인정보가 불필요하게 된 경우
• 이용자 요청에 따른 삭제

파기 방법: 전자적 파일 형태는 복구 및 재생되지 않도록 안전하게 삭제하며, 기록물은 분쇄하거나 소각합니다.


시행일자: 2024년 1월 1일`;

const OPEN_SOURCE_LICENSE = `본 프로젝트는 다음과 같은 오픈소스 라이선스 하에 배포됩니다:

MIT License

Copyright (c) 2024 Replant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

사용된 오픈소스 라이브러리:

React Native
- 라이선스: MIT
- 링크: https://github.com/facebook/react-native

React Navigation
- 라이선스: MIT
- 링크: https://github.com/react-navigation/react-navigation

AsyncStorage
- 라이선스: MIT
- 링크: https://github.com/react-native-async-storage/async-storage

기타 사용된 오픈소스 라이브러리들은 각각의 라이선스를 따릅니다.`;

interface SettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

interface SettingItemProps {
  icon: any;
  title: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  onPress, 
  showArrow = true,
  danger = false 
}) => (
  <TouchableOpacity
    style={[styles.settingItem, danger && styles.settingItemDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingItemLeft}>
      <Image source={icon} style={styles.settingIcon} resizeMode="contain" />
      <Text style={[styles.settingItemText, danger && styles.settingItemTextDanger]}>
        {title}
      </Text>
    </View>
    {showArrow && (
      <Image
        source={require('../assets/images/left.png')}
        style={[styles.arrowIcon, { transform: [{ rotate: '180deg' }] }]}
        resizeMode="contain"
      />
    )}
  </TouchableOpacity>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout, updateNickname } = useUser();
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Image
                source={require('../assets/images/home.png')}
                style={styles.userIcon}
                resizeMode="contain"
              />
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
                  source={require('../assets/images/pencil.png')}
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
              icon={require('../assets/images/chat.png')}
              title="상담 서비스"
              onPress={() => navigation?.navigate('CounselingSelect')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../assets/images/home.png')}
              title="마이페이지"
              onPress={() => navigation?.navigate('MyPage')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../assets/images/day.png')}
              title="캘린더"
              onPress={() => navigation?.navigate('Calendar')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../assets/images/search.png')}
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
                icon={require('../assets/images/alarm.png')}
                title="관리자 대시보드"
                onPress={() => navigation?.navigate('AdminDashboard')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={require('../assets/images/notes.png')}
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
              icon={require('../assets/images/notes.png')}
              title="이용약관"
              onPress={() => openInfoScreen('이용약관', TERMS_OF_SERVICE)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../assets/images/notes.png')}
              title="개인정보처리방침"
              onPress={() => openInfoScreen('개인정보처리방침', PRIVACY_POLICY)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={require('../assets/images/books.png')}
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
              icon={require('../assets/images/left.png')}
              title="로그아웃"
              onPress={() => setShowLogoutModal(true)}
              showArrow={false}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  userSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
    fontWeight: typography.fontWeight.semibold,
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
