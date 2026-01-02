/**
 * API 설정
 * 백엔드 API 연동 시 사용할 설정값들
 */

import { API_BASE_URL, API_TIMEOUT } from '@env';

// 백엔드 기본 URL: localhost:8080
const getBaseURL = () => {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  // 기본값: localhost:8080
  // 참고: Android 에뮬레이터에서는 localhost가 에뮬레이터 자체를 가리키므로
  // 호스트 머신의 백엔드에 접근하려면 환경변수로 10.0.2.2:8080을 설정하거나
  // 실제 Android 기기에서는 호스트 머신의 IP 주소를 사용해야 합니다.
  return 'http://localhost:8080/api';
};

export const API_CONFIG = {
  // 백엔드 API 기본 URL (환경변수에서 읽어옴)
  baseURL: getBaseURL(),

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

    // 파일 업로드 (File)
    file: {
      upload: '/files/upload',
      uploadMissionVerify: '/files/upload/mission-verify',
      uploadToFolder: '/files/upload/:folder',
      delete: '/files/:fileName',
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

    // SSE (Server-Sent Events)
    sse: {
      connect: '/sse/connect',
    },

    // 다이어리 (Diary)
    diary: {
      list: '/diaries',
      detail: '/diaries/:diaryId',
      create: '/diaries',
      update: '/diaries/:diaryId',
      delete: '/diaries/:diaryId',
      byDate: '/diaries/by-date',
      range: '/diaries/range',
      stats: '/diaries/stats',
    },
  },

  // 요청 타임아웃 (ms) (환경변수에서 읽어옴)
  timeout: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

