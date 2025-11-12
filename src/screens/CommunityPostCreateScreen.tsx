/**
 * 커뮤니티 게시글 작성 화면
 * 미션 완료 후 커뮤니티에 공유하는 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button, Header, FormCard } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { useCommunity } from '../hooks/useCommunity';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface CommunityPostCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostCreate'>;
}

const CommunityPostCreateScreen: React.FC<CommunityPostCreateScreenProps> = ({
  navigation,
  route,
}) => {
  const { missionId, missionTitle, missionEmoji, photoUrl } = route.params;
  const { createPost } = useCommunity();
  const [title, setTitle] = useState(missionTitle);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const postData = {
        mission_id: missionId,
        mission_title: missionTitle,
        mission_emoji: missionEmoji,
        title: title.trim() || missionTitle,
        content: content.trim(),
        images: photoUrl ? [photoUrl] : [],
      };

      const result = await createPost(postData);

      if (result.success) {
        Alert.alert(
          '성공!',
          '커뮤니티에 게시글이 등록되었습니다!',
          [
            {
              text: '확인',
              onPress: () => navigation.navigate('Community'),
            },
          ]
        );
      } else {
        Alert.alert('오류', result.error || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title="게시글 작성"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 취소</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <FormCard>
          {/* 미션 정보 표시 */}
          <View style={styles.missionInfo}>
            <Text style={styles.missionEmoji}>{missionEmoji}</Text>
            <View style={styles.missionTextContainer}>
              <Text style={styles.missionLabel}>완료한 미션</Text>
              <Text style={styles.missionTitle}>{missionTitle}</Text>
            </View>
          </View>

          {/* 제목 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>제목 (선택사항)</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={missionTitle}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* 내용 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>내용 *</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="미션을 완료한 소감이나 경험을 공유해주세요..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* 미션 인증 사진 표시 */}
          {photoUrl && (
            <View style={styles.imageSection}>
              <Text style={styles.label}>인증 사진</Text>
              <Image source={{ uri: photoUrl }} style={styles.previewImage} resizeMode="cover" />
            </View>
          )}

          {/* 작성 버튼 */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? '작성 중...' : '게시글 등록'}
              onPress={handleCreatePost}
              disabled={loading || !content.trim()}
              style={styles.submitButton}
            />
          </View>
        </FormCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  missionEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing[3],
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  titleInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  contentInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 150,
  },
  imageSection: {
    marginBottom: spacing[4],
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
  },
});

export default CommunityPostCreateScreen;

