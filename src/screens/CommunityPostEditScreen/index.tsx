/**
 * 커뮤니티 게시글 수정 화면
 */

import React, { useState, useEffect } from 'react';
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
import { useCommunity } from '../../hooks/useCommunity';
import { useCommunityPost } from '../../hooks/useCommunityPost';
import { Button, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';

interface CommunityPostEditScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'CommunityPostEdit'>;
}

const CommunityPostEditScreen: React.FC<CommunityPostEditScreenProps> = ({
  navigation,
  route,
}) => {
  const { postId } = route.params;
  const { currentNickname } = useUser();
  const { post, loading } = useCommunityPost(postId);
  const { updatePost } = useCommunity();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const handleUpdatePost = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    if (!post) return;

    try {
      setSaving(true);

      const result = await updatePost(post.post_id, {
        title: title.trim() || post.mission_title,
        content: content.trim(),
      });

      if (result.success) {
        Alert.alert(
          '성공!',
          '게시글이 수정되었습니다!',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('오류', result.error || '게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.container}>
        <Header
          title="게시글 수정"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <Text>로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (post.author !== currentNickname) {
    Alert.alert('오류', '본인의 게시글만 수정할 수 있습니다.');
    navigation.goBack();
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title="게시글 수정"
        leftButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 취소</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 미션 정보 표시 (수정 불가) */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionEmoji}>{post.mission_emoji}</Text>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>완료한 미션</Text>
            <Text style={styles.missionTitle}>{post.mission_title}</Text>
          </View>
        </View>

        {/* 제목 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={post.mission_title}
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
            placeholder="내용을 입력하세요..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* 미션 인증 사진 표시 (수정 불가) */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.label}>인증 사진</Text>
            <Image source={{ uri: post.images[0] }} style={styles.previewImage} resizeMode="cover" />
            <Text style={styles.imageNote}>인증 사진은 수정할 수 없습니다.</Text>
          </View>
        )}

        {/* 수정 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? '수정 중...' : '수정 완료'}
            onPress={handleUpdatePost}
            disabled={saving || !content.trim()}
            style={styles.submitButton}
          />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    width: 24,
    height: 24,
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
    marginBottom: spacing[2],
  },
  imageNote: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
  },
});

export default CommunityPostEditScreen;

