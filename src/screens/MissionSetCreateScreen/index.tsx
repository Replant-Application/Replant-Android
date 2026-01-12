/**
 * 미션세트(투두리스트) 생성 화면
 * 새로운 미션세트를 만들고 미션을 추가하는 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createMissionSet } from '../../api/todolistApi';
import { getUserMissions, UserMission } from '../../api/missionApi';
import { logError } from '../../utils/logger';
import { SCREEN_NAMES } from '../../utils/constants';

interface MissionSetCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionSetCreateScreen: React.FC<MissionSetCreateScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMissionIds, setSelectedMissionIds] = useState<number[]>([]);
  const [myMissions, setMyMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 내 미션 목록 로딩
  const loadMyMissions = useCallback(async () => {
    try {
      const result = await getUserMissions({ page: 0, size: 100 });
      if (result.success && result.data) {
        setMyMissions(result.data.content);
      }
    } catch (error) {
      logError('내 미션 로딩 실패', error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyMissions();
  }, [loadMyMissions]);

  // 미션 선택/해제
  const toggleMission = (missionId: number) => {
    setSelectedMissionIds(prev => {
      if (prev.includes(missionId)) {
        return prev.filter(id => id !== missionId);
      } else {
        return [...prev, missionId];
      }
    });
  };

  // 미션세트 생성
  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (selectedMissionIds.length === 0) {
      Alert.alert('알림', '최소 1개 이상의 미션을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createMissionSet({
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
        missionIds: selectedMissionIds,
      });

      if (result.success) {
        Alert.alert('완료', '미션세트가 생성되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', result.error || '미션세트 생성에 실패했습니다.');
      }
    } catch (error) {
      logError('미션세트 생성 실패', error as Error);
      Alert.alert('오류', '미션세트 생성 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 미션 제목 가져오기
  const getMissionTitle = (userMission: UserMission): string => {
    const mission = userMission.mission || userMission.customMission;
    return mission?.title || '제목 없음';
  };

  // 미션 ID 가져오기
  const getMissionId = (userMission: UserMission): number => {
    const mission = userMission.mission || userMission.customMission;
    return mission?.id || 0;
  };

  if (loading) {
    return <Loading text="미션 목록을 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
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
          <View style={{ height: 100 }} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  sectionHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  textInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  textArea: {
    height: 100,
    paddingTop: spacing[3],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  switchDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionList: {
    gap: spacing[2],
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  missionTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  missionTitleSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  emptyMissions: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.5,
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    backgroundColor: 'transparent',
  },
  createButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
});

export default MissionSetCreateScreen;
