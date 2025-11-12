import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Card, Input, Header, SectionTitle } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
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

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout, updateNickname } = useUser();
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <Header />

      <View style={styles.content}>
        {/* 사용자 정보 */}
        <Card style={styles.userCard}>
          <Text style={styles.userTitle}>👤 사용자 정보</Text>
          <Text style={styles.userInfo}>닉네임: {user?.nickname}</Text>
          <Text style={styles.userInfo}>가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '알 수 없음'}</Text>

          {showNicknameForm ? (
            <View style={styles.nicknameForm}>
              <Input
                label="새 닉네임"
                placeholder="새 닉네임을 입력하세요"
                value={newNickname}
                onChangeText={setNewNickname}
                style={styles.nicknameInput}
              />
              <View style={styles.nicknameActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowNicknameForm(false);
                    setNewNickname('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleNicknameChange}
                >
                  <Text style={styles.saveButtonText}>변경</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.changeNicknameButton}
              onPress={() => setShowNicknameForm(true)}
            >
              <Text style={styles.changeNicknameText}>✏️ 닉네임 변경</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* 기능 */}
        <Card style={styles.featuresCard}>
          <SectionTitle title="✨ 기능" size="lg" marginBottom={spacing[3]} />
          <TouchableOpacity
            style={styles.infoOption}
            onPress={() => navigation?.navigate('MyPage')}
          >
            <Text style={styles.infoOptionText}>👤 마이페이지</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoOption}
            onPress={() => navigation?.navigate('Calendar')}
          >
            <Text style={styles.infoOptionText}>📅 캘린더</Text>
          </TouchableOpacity>
        </Card>

        {/* 관리자 메뉴 */}
        {user?.role === 'admin' && (
          <Card style={styles.adminCard}>
            <SectionTitle title="👨‍💼 관리자" size="lg" marginBottom={spacing[3]} />
            <TouchableOpacity
              style={styles.infoOption}
              onPress={() => navigation?.navigate('AdminDashboard')}
            >
              <Text style={styles.infoOptionText}>📊 관리자 대시보드</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoOption}
              onPress={() => navigation?.navigate('AdminUserList')}
            >
              <Text style={styles.infoOptionText}>👥 전체 유저 목록</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* 정보 */}
        <Card style={styles.infoCard}>
          <SectionTitle title="ℹ️ 정보" size="lg" marginBottom={spacing[3]} />
          <TouchableOpacity
            style={styles.infoOption}
            onPress={() => openInfoScreen('이용약관', TERMS_OF_SERVICE)}
          >
            <Text style={styles.infoOptionText}>📄 이용약관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoOption}
            onPress={() => openInfoScreen('개인정보처리방침', PRIVACY_POLICY)}
          >
            <Text style={styles.infoOptionText}>🔒 개인정보처리방침</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoOption}
            onPress={() => openInfoScreen('오픈소스 라이선스', OPEN_SOURCE_LICENSE)}
          >
            <Text style={styles.infoOptionText}>📚 오픈소스 라이선스</Text>
          </TouchableOpacity>
        </Card>

        {/* 계정 설정 */}
        <Card style={styles.accountCard}>
          <SectionTitle title="🔐 계정" size="lg" marginBottom={spacing[3]} />
          <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 로그아웃</Text>
          </TouchableOpacity>
        </Card>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing[5],
  },
  userCard: {
    marginBottom: spacing[6],
  },
  userTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  userInfo: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  themeCard: {
    marginBottom: spacing[6],
  },
  featuresCard: {
    marginBottom: spacing[6],
  },
  adminCard: {
    marginBottom: spacing[6],
  },
  infoCard: {
    marginBottom: spacing[6],
  },
  accountCard: {
    marginBottom: spacing[6],
  },
  option: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  infoOption: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[2],
  },
  infoOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  logoutOption: {
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  nicknameForm: {
    marginTop: spacing[4],
  },
  nicknameInput: {
    marginBottom: spacing[3],
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: borderRadius.base,
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
    backgroundColor: colors.primary[500],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  changeNicknameButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing[3],
    alignItems: 'center',
  },
  changeNicknameText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});

export default SettingsScreen;
