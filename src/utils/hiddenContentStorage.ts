/**
 * 숨김 컨텐츠 저장소
 * AsyncStorage를 사용하여 숨긴 게시글과 댓글 ID를 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage 키 상수
const STORAGE_KEYS = {
  HIDDEN_POSTS: '@replant:hiddenPosts',
  HIDDEN_COMMENTS: '@replant:hiddenComments',
} as const;

/**
 * 게시글 숨기기
 */
export const hidePost = async (postId: string): Promise<void> => {
  try {
    const hiddenPosts = await getHiddenPosts();
    if (!hiddenPosts.includes(postId)) {
      hiddenPosts.push(postId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.HIDDEN_POSTS,
        JSON.stringify(hiddenPosts)
      );
    }
  } catch (error) {
    console.error('Failed to hide post:', error);
    throw error;
  }
};

/**
 * 게시글 다시 보이기
 */
export const unhidePost = async (postId: string): Promise<void> => {
  try {
    const hiddenPosts = await getHiddenPosts();
    const filtered = hiddenPosts.filter(id => id !== postId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.HIDDEN_POSTS,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Failed to unhide post:', error);
    throw error;
  }
};

/**
 * 숨긴 게시글 ID 목록 조회
 */
export const getHiddenPosts = async (): Promise<string[]> => {
  try {
    const hiddenPostsJson = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_POSTS);
    if (!hiddenPostsJson) {
      return [];
    }
    return JSON.parse(hiddenPostsJson);
  } catch (error) {
    console.error('Failed to get hidden posts:', error);
    return [];
  }
};

/**
 * 게시글이 숨겨져 있는지 확인
 */
export const isPostHidden = async (postId: string): Promise<boolean> => {
  try {
    const hiddenPosts = await getHiddenPosts();
    return hiddenPosts.includes(postId);
  } catch (error) {
    console.error('Failed to check if post is hidden:', error);
    return false;
  }
};

/**
 * 댓글 숨기기
 */
export const hideComment = async (commentId: string): Promise<void> => {
  try {
    const hiddenComments = await getHiddenComments();
    if (!hiddenComments.includes(commentId)) {
      hiddenComments.push(commentId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.HIDDEN_COMMENTS,
        JSON.stringify(hiddenComments)
      );
    }
  } catch (error) {
    console.error('Failed to hide comment:', error);
    throw error;
  }
};

/**
 * 댓글 다시 보이기
 */
export const unhideComment = async (commentId: string): Promise<void> => {
  try {
    const hiddenComments = await getHiddenComments();
    const filtered = hiddenComments.filter(id => id !== commentId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.HIDDEN_COMMENTS,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Failed to unhide comment:', error);
    throw error;
  }
};

/**
 * 숨긴 댓글 ID 목록 조회
 */
export const getHiddenComments = async (): Promise<string[]> => {
  try {
    const hiddenCommentsJson = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_COMMENTS);
    if (!hiddenCommentsJson) {
      return [];
    }
    return JSON.parse(hiddenCommentsJson);
  } catch (error) {
    console.error('Failed to get hidden comments:', error);
    return [];
  }
};

/**
 * 댓글이 숨겨져 있는지 확인
 */
export const isCommentHidden = async (commentId: string): Promise<boolean> => {
  try {
    const hiddenComments = await getHiddenComments();
    return hiddenComments.includes(commentId);
  } catch (error) {
    console.error('Failed to check if comment is hidden:', error);
    return false;
  }
};

/**
 * 모든 숨김 컨텐츠 초기화
 */
export const clearAllHiddenContent = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.HIDDEN_POSTS,
      STORAGE_KEYS.HIDDEN_COMMENTS,
    ]);
  } catch (error) {
    console.error('Failed to clear all hidden content:', error);
    throw error;
  }
};
