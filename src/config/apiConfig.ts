/**
 * API 설정
 * 백엔드 API 연동 시 사용할 설정값들
 */

import { Platform } from 'react-native';
import { API_BASE_URL, API_TIMEOUT } from '@env';

// .env 미주입 시(릴리즈 빌드 등) 사용할 프로덕션 기본 URL (실기기/에뮬 모두 동일)
const PRODUCTION_API_BASE_URL =
  'http://ec2-15-165-38-6.ap-northeast-2.compute.amazonaws.com:8080/api';

// 백엔드 기본 URL 설정
const getBaseURL = (): string => {
  const raw = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : undefined;
  const isEmpty =
    raw === undefined ||
    raw === null ||
    (typeof raw === 'string' && !raw.trim());
  const source = isEmpty ? 'PRODUCTION (fallback)' : '.env (API_BASE_URL)';

  let url: string;
  if (!isEmpty && raw && raw.trim()) {
    // 환경변수에 localhost가 포함되어 있고 Android인 경우 자동 변환 (에뮬레이터용)
    if (Platform.OS === 'android' && raw.includes('localhost')) {
      url = raw.replace('localhost', '10.0.2.2');
    } else {
      url = raw.trim();
    }
  } else {
    // 기본값: .env가 없을 때 프로덕션 URL 사용 (실기기/릴리즈 빌드 대응)
    url = PRODUCTION_API_BASE_URL;
  }

  if (__DEV__) {
    console.log('[API_CONFIG] @env API_BASE_URL:', {
      raw: raw ?? '(undefined)',
      type: typeof raw,
      isEmpty,
      source,
    });
    console.log('[API_CONFIG] 최종 baseURL:', url);
    console.log('[API] 현재 요청이 나가는 서버:', url);
  }
  return url;
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
      // 비밀번호 찾기/재설정
      genPw: '/auth/genPw', // 임시 비밀번호 발급
      resetPw: '/auth/resetPw', // 비밀번호 변경
      // 아이디 찾기
      searchId: '/auth/searchId', // 아이디 찾기
      // 이메일 인증
      sendVerification: '/auth/send-verification', // 이메일 인증번호 발송
      verifyEmail: '/auth/verify-email', // 이메일 인증번호 확인
    },

    // 사용자 (User)
    user: {
      me: '/users/me',
      updateMe: '/users/me',
      deleteMe: '/users/me', // 회원 탈퇴
      restoreMe: '/users/me/restore', // 계정 복구
      getUser: '/users/:userId',
    },

    // 시스템 미션 (Mission)
    mission: {
      list: '/missions',
      filtered: '/missions/filtered',
      collection: '/missions/collection', // 미션 도감 조회 (사용자가 수행한 미션만)
      detail: '/missions/:missionId',
      reviews: '/missions/:missionId/reviews',
      createReview: '/missions/:missionId/reviews',
      deleteReview: '/missions/:missionId/reviews/:reviewId',
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
      completeCustom: '/missions/my/complete-custom/:missionId',
      cancelCustom: '/missions/my/cancel-custom/:missionId',
      verify: '/missions/my/:userMissionId/verify',
      history: '/missions/my/history',
      // 캘린더 조회
      calendarDate: '/missions/my/calendar/date', // 특정 날짜 미션 조회
      calendarRange: '/missions/my/calendar/range', // 날짜 범위 미션 조회
      // 기상 미션 설정
      wakeupSettings: '/missions/my/wakeup/settings',
      wakeupSettingDetail: '/missions/my/wakeup/settings/:settingId',
      wakeupCurrentWeek: '/missions/my/wakeup/settings/current',
      wakeupNextWeekInfo: '/missions/my/wakeup/settings/next-week-info',
      wakeupVerifyTime: '/missions/my/wakeup/verify-time',
      wakeupCurrent: '/missions/my/wakeup/current', // 현재 활성화된 기상 미션 조회
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
      like: '/community/posts/:postId/like',
    },

    // 배지 (Badge)
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

    // 알림 (Notification)
    notification: {
      list: '/notifications',
      read: '/notifications/:notificationId/read',
      readAll: '/notifications/read-all',
      delete: '/notifications/:notificationId',
      deleteAll: '/notifications/all',
      registerFcmToken: '/notifications/fcm/token',
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

    // 돌발 미션 (Spontaneous Mission)
    spontaneousMission: {
      setup: '/spontaneous-missions/setup',
      verify: '/spontaneous-missions/:missionId/verify',
      wakeupCurrent: '/missions/my/wakeup/current', // 백엔드 UserMissionController 경로와 일치
      wakeupVerify: '/missions/my/wakeup/verify-time',
      current: '/spontaneous-missions/current',
      byDate: '/spontaneous-missions/date',
    },

    // 버전 체크 (Version)
    version: {
      check: '/v1/version/check',
    },
  },

  // 요청 타임아웃 (ms) (환경변수에서 읽어옴)
  timeout: API_TIMEOUT ? parseInt(API_TIMEOUT, 10) : 10000,
} as const;

