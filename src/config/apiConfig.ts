/**
 * API 설정
 * 백엔드 API 연동 시 사용할 설정값들
 */

import { API_BASE_URL, API_TIMEOUT } from '@env';

export const API_CONFIG = {
  // 백엔드 API 기본 URL (환경변수에서 읽어옴)
  baseURL: API_BASE_URL || 'http://localhost:8080/api',

  endpoints: {
    // 인증 (Auth)
    auth: {
      login: '/auth/login',
      join: '/auth/join',
      oauthLogin: '/auth/oauth/:provider', // provider: KAKAO, GOOGLE, APPLE, NAVER
      refresh: '/auth/refresh',
      logout: '/auth/logout',
    },

    // 사용자 (User)
    user: {
      me: '/users/me',
      updateMe: '/users/me',
      getUser: '/users/:userId',
    },

    // 펫 (Reant)
    reant: {
      get: '/reant',
      update: '/reant',
    },

    // 시스템 미션 (Mission)
    mission: {
      list: '/missions',
      detail: '/missions/:missionId',
      reviews: '/missions/:missionId/reviews',
      createReview: '/missions/:missionId/reviews',
      qnaList: '/missions/:missionId/qna',
      qnaDetail: '/missions/:missionId/qna/:qnaId',
      createQuestion: '/missions/:missionId/qna',
      createAnswer: '/missions/:missionId/qna/:qnaId/answers',
      acceptAnswer: '/missions/:missionId/qna/:qnaId/answers/:answerId/accept',
    },

    // 커스텀 미션 (CustomMission)
    customMission: {
      list: '/custom-missions',
      detail: '/custom-missions/:customMissionId',
      create: '/custom-missions',
      update: '/custom-missions/:customMissionId',
      delete: '/custom-missions/:customMissionId',
    },

    // 내 미션 (UserMission)
    userMission: {
      list: '/user-missions',
      detail: '/user-missions/:userMissionId',
      add: '/user-missions',
      verify: '/user-missions/:userMissionId/verify',
    },

    // 인증 게시판 (Verification)
    verification: {
      list: '/verifications',
      detail: '/verifications/:verificationId',
      create: '/verifications',
      update: '/verifications/:verificationId',
      delete: '/verifications/:verificationId',
      vote: '/verifications/:verificationId/votes',
    },

    // 자유 게시판 (Post)
    post: {
      list: '/posts',
      detail: '/posts/:postId',
      create: '/posts',
      update: '/posts/:postId',
      delete: '/posts/:postId',
      comments: '/posts/:postId/comments',
      createComment: '/posts/:postId/comments',
      updateComment: '/posts/:postId/comments/:commentId',
      deleteComment: '/posts/:postId/comments/:commentId',
    },

    // 뱃지 (Badge)
    badge: {
      list: '/badges',
      history: '/badges/history',
    },

    // 유저 추천 (Recommendation)
    recommendation: {
      list: '/recommendations',
      accept: '/recommendations/:recommendationId/accept',
      reject: '/recommendations/:recommendationId/reject',
    },

    // 채팅 (Chat)
    chat: {
      rooms: '/chat/rooms',
      roomDetail: '/chat/rooms/:roomId',
      messages: '/chat/rooms/:roomId/messages',
      sendMessage: '/chat/rooms/:roomId/messages',
      readMessages: '/chat/rooms/:roomId/messages/read',
    },

    // 알림 (Notification)
    notification: {
      list: '/notifications',
      read: '/notifications/:notificationId/read',
      readAll: '/notifications/read-all',
    },
  },

  // 요청 타임아웃 (ms) (환경변수에서 읽어옴)
  timeout: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

