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
  ImageBackground,
} from 'react-native';
import { useCommunity } from '../../hooks/useCommunity';
import { useCommunityPost } from '../../hooks/useCommunityPost';
import { Button, Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
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

      // 인증글인 경우 제목은 변경하지 않음 (기존 제목 유지)
      const updateTitle = post.category === '인증' ? post.title : (title.trim() || post.mission_title);
      
      const result = await updatePost(post.post_id, {
        title: updateTitle,
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
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Header
            title="게시글 수정"
            navigation={navigation}
            showBorder={false}
            titleStyle={styles.headerTitle}
          />
          <View style={styles.loadingContainer}>
            <Text>로딩 중...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (post.author_nickname !== currentNickname) {
    Alert.alert('오류', '본인의 게시글만 수정할 수 있습니다.');
    navigation.goBack();
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="게시글 수정"
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 미션 정보 표시 (수정 불가) */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionEmoji}>{post.mission_emoji || '🎯'}</Text>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionLabel}>완료한 미션</Text>
            <Text style={styles.missionTitle}>{post.mission_title || '미션'}</Text>
          </View>
        </View>

        {/* 제목 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목</Text>
          {post.category === '인증' ? (
            <>
              <TextInput
                style={[styles.titleInput, styles.titleInputDisabled]}
                value={title}
                editable={false}
                placeholder={post.mission_title || '미션'}
                placeholderTextColor={colors.text.tertiary}
                multiline={false}
              />
              <Text style={styles.disabledNote}>인증글은 제목을 수정할 수 없습니다.</Text>
            </>
          ) : (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={post.mission_title || '미션'}
              placeholderTextColor={colors.text.tertiary}
              multiline={false}
            />
          )}
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
            <Image 
              source={{ uri: post.images[0] }} 
              style={styles.previewImage} 
              resizeMode="cover" 
              accessibilityLabel="인증 사진"
            />
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionTextContainer: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  missionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  label: {
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
  titleInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    height: 48,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  titleInputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.text.secondary,
    borderColor: colors.border.light,
  },
  disabledNote: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
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
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  buttonContainer: {
    marginTop: -spacing[1],
    marginBottom: spacing[4],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
  },
});

export default CommunityPostEditScreen;

