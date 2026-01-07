/**
 * API 설정
 * 백엔드 API 연동 시 사용할 설정값들
 */

import { Platform } from 'react-native';
import { API_BASE_URL, API_TIMEOUT } from '@env';

// 백엔드 기본 URL 설정
const getBaseURL = () => {
  if (API_BASE_URL) {
    // 환경변수에 localhost가 포함되어 있고 Android인 경우 자동 변환
    if (Platform.OS === 'android' && API_BASE_URL.includes('localhost')) {
      return API_BASE_URL.replace('localhost', '10.0.2.2');
    }
    return API_BASE_URL;
  }
  // 기본값: Platform에 따라 자동 설정
  if (Platform.OS === 'android') {
    // Android 에뮬레이터에서는 10.0.2.2를 사용
    return 'http://10.0.2.2:3000/api';
  }
  // iOS 시뮬레이터나 실제 기기에서는 localhost 사용
  return 'http://localhost:3000/api';
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

    // 시스템 미션 (Mission)
    mission: {
      list: '/missions',
      filtered: '/missions/filtered',
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
      list: '/missions/custom',
      detail: '/missions/custom/:customMissionId',
      create: '/missions/custom',
      update: '/missions/custom/:customMissionId',
      delete: '/missions/custom/:customMissionId',
    },

    // 내 미션 (UserMission)
    userMission: {
      list: '/missions/my',
      detail: '/missions/my/:userMissionId',
      add: '/missions/my',
      addCustom: '/missions/my/custom',
      verify: '/missions/my/:userMissionId/verify',
      history: '/missions/my/history',
      // 기상 미션 설정
      wakeupSettings: '/missions/my/wakeup/settings',
      wakeupSettingDetail: '/missions/my/wakeup/settings/:settingId',
      wakeupCurrentWeek: '/missions/my/wakeup/settings/current',
      wakeupNextWeekInfo: '/missions/my/wakeup/settings/next-week-info',
      wakeupVerifyTime: '/missions/my/wakeup/verify-time',
    },

    // 인증 게시판 (Verification)
    verification: {
      list: '/verifications',
      detail: '/verifications/:verificationId',
      create: '/verifications',
      update: '/verifications/:verificationId',
      delete: '/verifications/:verificationId',
      vote: '/verifications/:verificationId/votes',
      gps: '/verifications/gps',
      time: '/verifications/time',
    },

    // 자유 게시판 (Post) - /api/community/posts
    post: {
      list: '/community/posts',
      detail: '/community/posts/:postId',
      create: '/community/posts',
      update: '/community/posts/:postId',
      delete: '/community/posts/:postId',
      comments: '/community/posts/:postId/comments',
      createComment: '/community/posts/:postId/comments',
      updateComment: '/community/posts/:postId/comments/:commentId',
      deleteComment: '/community/posts/:postId/comments/:commentId',
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
      delete: '/notifications/:notificationId',
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

    // 관리자 (Admin/Manage) - manageApi.ts에서 사용
    manage: {
      getAllUsers: '/admin/members',
      getUserDetail: '/admin/members/:id',
      updateUser: '/admin/members/:id',
      deactivateUser: '/admin/members/:id/deactivate',
      activateUser: '/admin/members/:id/activate',
    },

    // 관리자 (Admin) - adminApi.ts에서 사용
    admin: {
      members: '/admin/members',
      memberDetail: '/admin/members/:memberId',
      cards: '/admin/card',
      sendCustomNotification: '/admin/send/custom',
      sendDiaryNotification: '/admin/send/diary',
      sendReportNotification: '/admin/send/report',
    },
  },

  // 요청 타임아웃 (ms) (환경변수에서 읽어옴)
  timeout: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

