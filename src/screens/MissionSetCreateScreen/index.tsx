/**
 * 미션세트(투두리스트) 생성 화면
 * 새로운 미션세트를 만들고 미션을 추가하는 화면
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { useMissionSetCreateScreenContainer } from './MissionSetCreateScreen.container';
import { styles } from './MissionSetCreateScreen.styles';

interface MissionSetCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionSetCreateScreen: React.FC<MissionSetCreateScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    myMissions,
    title,
    description,
    isPublic,
    selectedMissionIds,
    loading,
    submitting,
    setTitle,
    setDescription,
    setIsPublic,
    toggleMission,
    handleCreate,
    getMissionTitle,
    getMissionId,
  } = useMissionSetCreateScreenContainer({ navigation });

  if (loading) {
    return <Loading text="미션 목록을 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <Header title="투두리스트 만들기" showBackButton={true} navigation={navigation} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 제목 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제목 *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="투두리스트 제목을 입력하세요"
              placeholderTextColor={colors.text.tertiary}
              maxLength={50}
            />
          </View>

          {/* 설명 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>설명</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="투두리스트에 대한 설명을 입력하세요 (선택)"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
          </View>

          {/* 공개 설정 */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.sectionTitle}>공개 설정</Text>
                <Text style={styles.switchDescription}>
                  {isPublic ? '다른 사용자들이 이 투두리스트를 볼 수 있습니다' : '나만 볼 수 있습니다'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                thumbColor={isPublic ? colors.primary[500] : colors.gray[100]}
              />
            </View>
          </View>

          {/* 미션 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              미션 선택 * ({selectedMissionIds.length}개 선택됨)
            </Text>
            <Text style={styles.sectionHint}>
              투두리스트에 포함할 미션을 선택하세요
            </Text>

            {myMissions.length === 0 ? (
              <View style={styles.emptyMissions}>
                <Text style={styles.emptyText}>
                  진행 중인 미션이 없습니다.{'\n'}
                  미션을 먼저 추가해주세요.
                </Text>
              </View>
            ) : (
              <View style={styles.missionList}>
                {myMissions.map(userMission => {
                  const missionId = getMissionId(userMission);
                  const isSelected = selectedMissionIds.includes(missionId);

                  return (
                    <TouchableOpacity
                      key={userMission.id}
                      style={[
                        styles.missionItem,
                        isSelected && styles.missionItemSelected,
                      ]}
                      onPress={() => toggleMission(missionId)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.missionTitle,
                          isSelected && styles.missionTitleSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {getMissionTitle(userMission)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 여백 */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* 생성 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!title.trim() || selectedMissionIds.length === 0 || submitting) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || selectedMissionIds.length === 0 || submitting}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>
              {submitting ? '생성 중...' : '투두리스트 만들기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};


export default MissionSetCreateScreen;
