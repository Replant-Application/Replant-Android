/**
 * 커뮤니티 서비스
 * 게시글 및 댓글 CRUD 기능 제공
 */

import { getData, setData, getStorageKeys } from './storage';
import { logError } from '../utils/logger';
import { CommunityPost, CommunityComment, CommunityPostData, ServiceResult } from '../types';

/**
 * 게시글 생성
 */
export const createPost = async (
  postData: CommunityPostData,
  nickname: string
): Promise<ServiceResult<CommunityPost>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    // 새로운 게시글 ID 생성
    const newId = posts.length + 1;
    const postId = `post_${Date.now()}_${newId}`;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      post_id: postId,
      mission_id: postData.mission_id,
      mission_title: postData.mission_title,
      mission_emoji: postData.mission_emoji,
      title: postData.title || postData.mission_title, // 제목이 없으면 미션 제목 사용
      content: postData.content,
      author: nickname,
      author_nickname: nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      scrap_count: 0,
      images: postData.images || [],
      tags: postData.tags || [],
      category: postData.category,
    };

    const updatedPosts: CommunityPost[] = [...posts, newPost];
    await setData(storageKeys.COMMUNITY_POSTS, updatedPosts);

    return {
      success: true,
      data: newPost
    };
  } catch (error) {
    logError('게시글 생성 실패', error as Error, { postData, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 수정
 */
export const updatePost = async (
  postId: string,
  updateDataParam: Partial<CommunityPostData>,
  nickname: string
): Promise<ServiceResult<CommunityPost>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    const postIndex = posts.findIndex(p => p.post_id === postId);
    if (postIndex === -1) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const post = posts[postIndex];
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (post.author !== nickname) {
      throw new Error('본인의 게시글만 수정할 수 있습니다.');
    }

    const updatedPost: CommunityPost = {
      ...post,
      title: updateDataParam.title ?? post.title,
      content: updateDataParam.content ?? post.content,
      images: updateDataParam.images ?? post.images,
      tags: updateDataParam.tags ?? post.tags,
      category: updateDataParam.category ?? post.category,
      updated_at: new Date().toISOString(),
      // mission 관련 필드는 수정 불가
    };

    posts[postIndex] = updatedPost;
    await setData(storageKeys.COMMUNITY_POSTS, posts);

    return {
      success: true,
      data: updatedPost
    };
  } catch (error) {
    logError('게시글 수정 실패', error as Error, { postId, updateData: updateDataParam, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (
  postId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    const post = posts.find(p => p.post_id === postId);
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (post.author !== nickname) {
      throw new Error('본인의 게시글만 삭제할 수 있습니다.');
    }

    const filteredPosts = posts.filter(p => p.post_id !== postId);
    await setData(storageKeys.COMMUNITY_POSTS, filteredPosts);

    // 관련 댓글도 삭제
    const comments: CommunityComment[] = await getData(storageKeys.COMMUNITY_COMMENTS) || [];
    const filteredComments = comments.filter(c => c.post_id !== postId);
    await setData(storageKeys.COMMUNITY_COMMENTS, filteredComments);

    return {
      success: true
    };
  } catch (error) {
    logError('게시글 삭제 실패', error as Error, { postId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 게시글 목록 조회
 */
export const getPosts = async (nickname: string): Promise<CommunityPost[]> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    // 사용자의 좋아요 정보 가져오기
    const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];

    // 좋아요 상태 추가
    return posts.map(post => ({
      ...post,
      is_liked: userLikes.includes(post.post_id),
    }));
  } catch (error) {
    logError('게시글 목록 조회 실패', error as Error, { nickname });
    return [];
  }
};

/**
 * 게시글 상세 조회
 */
export const getPost = async (
  postId: string,
  nickname: string
): Promise<CommunityPost | null> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];
    const post = posts.find(p => p.post_id === postId);

    if (!post) {
      return null;
    }

    // 사용자의 좋아요 정보 가져오기
    const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];

    return {
      ...post,
      is_liked: userLikes.includes(post.post_id),
    };
  } catch (error) {
    logError('게시글 상세 조회 실패', error as Error, { postId, nickname });
    return null;
  }
};

/**
 * 댓글 생성
 */
export const createComment = async (
  postId: string,
  content: string,
  nickname: string,
  parentCommentId?: string
): Promise<ServiceResult<CommunityComment>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const comments: CommunityComment[] = await getData(storageKeys.COMMUNITY_COMMENTS) || [];
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    // 게시글 존재 확인
    const post = posts.find(p => p.post_id === postId);
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const newId = comments.length + 1;
    const commentId = `comment_${Date.now()}_${newId}`;

    const newComment: CommunityComment = {
      id: Date.now().toString(),
      comment_id: commentId,
      post_id: postId,
      content: content.trim(),
      author: nickname,
      author_nickname: nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_comment_id: parentCommentId,
    };

    const updatedComments = [...comments, newComment];
    await setData(storageKeys.COMMUNITY_COMMENTS, updatedComments);

    // 게시글의 댓글 수 증가
    const postIndex = posts.findIndex(p => p.post_id === postId);
    if (postIndex !== -1 && posts[postIndex]) {
      posts[postIndex].comment_count += 1;
      await setData(storageKeys.COMMUNITY_POSTS, posts);
    }

    return {
      success: true,
      data: newComment
    };
  } catch (error) {
    logError('댓글 생성 실패', error as Error, { postId, content, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 수정
 */
export const updateComment = async (
  commentId: string,
  content: string,
  nickname: string
): Promise<ServiceResult<CommunityComment>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const comments: CommunityComment[] = await getData(storageKeys.COMMUNITY_COMMENTS) || [];

    const commentIndex = comments.findIndex(c => c.comment_id === commentId);
    if (commentIndex === -1) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    const comment = comments[commentIndex];
    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.author !== nickname) {
      throw new Error('본인의 댓글만 수정할 수 있습니다.');
    }

    const updatedComment: CommunityComment = {
      ...comment,
      content: content.trim(),
      updated_at: new Date().toISOString(),
    };

    comments[commentIndex] = updatedComment;
    await setData(storageKeys.COMMUNITY_COMMENTS, comments);

    return {
      success: true,
      data: updatedComment
    };
  } catch (error) {
    logError('댓글 수정 실패', error as Error, { commentId, content, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (
  commentId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const comments: CommunityComment[] = await getData(storageKeys.COMMUNITY_COMMENTS) || [];
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];

    const comment = comments.find(c => c.comment_id === commentId);
    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.author !== nickname) {
      throw new Error('본인의 댓글만 삭제할 수 있습니다.');
    }

    const filteredComments = comments.filter(c => c.comment_id !== commentId);
    await setData(storageKeys.COMMUNITY_COMMENTS, filteredComments);

    // 게시글의 댓글 수 감소
    const postIndex = posts.findIndex(p => p.post_id === comment.post_id);
    if (postIndex !== -1 && posts[postIndex]) {
      posts[postIndex].comment_count = Math.max(0, posts[postIndex].comment_count - 1);
      await setData(storageKeys.COMMUNITY_POSTS, posts);
    }

    return {
      success: true
    };
  } catch (error) {
    logError('댓글 삭제 실패', error as Error, { commentId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

/**
 * 댓글 목록 조회
 */
export const getComments = async (
  postId: string,
  nickname: string
): Promise<CommunityComment[]> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const comments: CommunityComment[] = await getData(storageKeys.COMMUNITY_COMMENTS) || [];
    return comments
      .filter(c => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    logError('댓글 목록 조회 실패', error as Error, { postId, nickname });
    return [];
  }
};

/**
 * 좋아요 토글
 */
export const toggleLike = async (
  postId: string,
  nickname: string
): Promise<ServiceResult<void>> => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const posts: CommunityPost[] = await getData(storageKeys.COMMUNITY_POSTS) || [];
    const userLikes: string[] = await getData(storageKeys.USER_LIKES) || [];

    const postIndex = posts.findIndex(p => p.post_id === postId);
    if (postIndex === -1) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const post = posts[postIndex];
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const isLiked = userLikes.includes(postId);

    if (isLiked) {
      // 좋아요 취소
      const filteredLikes = userLikes.filter(id => id !== postId);
      await setData(storageKeys.USER_LIKES, filteredLikes);
      post.like_count = Math.max(0, post.like_count - 1);
    } else {
      // 좋아요 추가
      await setData(storageKeys.USER_LIKES, [...userLikes, postId]);
      post.like_count += 1;
    }

    posts[postIndex] = post;
    await setData(storageKeys.COMMUNITY_POSTS, posts);

    return {
      success: true
    };
  } catch (error) {
    logError('좋아요 토글 실패', error as Error, { postId, nickname });
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
