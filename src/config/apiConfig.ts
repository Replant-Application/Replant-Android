/**
 * API 설정
 * 백엔드 API 연동 시 사용할 설정값들
 */

export const API_CONFIG = {
  // TODO: 백엔드 개발자와 협의하여 실제 baseURL 설정
  baseURL: (() => {
    try {
      // @ts-ignore - process는 런타임에 존재할 수 있음
      return typeof process !== 'undefined' && process.env?.API_BASE_URL ? process.env.API_BASE_URL : 'http://localhost:3000/api';
    } catch {
      return 'http://localhost:3000/api';
    }
  })(),

  endpoints: {
    // 인증
    auth: {
      signup: '/auth/signup',
      signin: '/auth/singin',
      signout: '/auth/signout',
      refresh: '/auth/refresh',
      findUsername: '/auth/find-username',
      resetPassword: '/auth/reset-password',
      resetPasswordConfirm: '/auth/reset-password/confirm',
      me: '/auth/me',
    },

    // 관리자
    manage: {
      updateUser: '/manag/users/:id',
      deactivateUser: '/manag/users/:id',
      getAllUsers: '/manag/users',
      getUserDetail: '/manag/users/:id',
    },

    // 사용자
    user: {
      myPage: '/user',
      changePassword: '/user/password',
      updateProfile: '/user',
      addCalendar: '/user/calendar',
      updateCalendar: '/user/calendar/:id',
    },

    // 미션
    mission: {
      create: '/mission',
      update: '/mission/:id',
      delete: '/mission/:id', // 명세서에 POST로 명시됨
      verify: '/mission/:id/verify',
      checkCompletion: '/mission/:id/completion',
      getDailyMissions: '/mission/daily',
      getCompletedMissions: '/mission/completed',
      saveTodoList: '/mission/todo',
      getTodoList: '/mission/todo',
      // 인증 관련
      verificationStatus: '/mission/:id/verification-status',
      verifyByLikes: '/mission/:id/verify-by-likes',
      verificationRequirements: '/mission/:id/verification-requirements',
      verifyByGPS: '/mission/:id/verify-by-gps',
      weeklyStats: '/mission/weekly-stats',
    },

    // 커뮤니티
    community: {
      createPost: '/community',
      updatePost: '/community/:id',
      deletePost: '/community/:id',
      createComment: '/community/:postId/comments',
      updateComment: '/community/:postId/comments/:id',
      deleteComment: '/community/:postId/comments/:id',
      like: '/community/:id/like',
      unlike: '/community/:id/unlike',
      scrap: '/community/:id/scrap',
      filter: '/community/filter',
      search: '/community/search',
      getPosts: '/community',
      getPost: '/community/:id',
      getComments: '/community/:id/comments',
      // 미션 그룹 관련
      myMissionGroups: '/community/my-mission-groups',
      postsByMission: '/community/mission/:missionId/posts',
    },

    // 펫
    pet: {
      selectName: '/pet',
      evolve: '/pet/evolve',
      downloadImage: '/pet', // 명세서에 POST /pet로 명시됨 (펫 이름 선택과 동일 엔드포인트, body로 구분)
      getImage: '/pet/image',
      getName: '/pet/name',
      saveStats: '/pet/stats',
      getStats: '/pet/stats',
    },

    // 파일
    file: {
      upload: '/file',
      delete: '/file/:id',
      get: '/file/:id',
    },

    // AI
    ai: {
      llmCall: '/ai/llm',
      llmResult: '/ai/llm/result',
      imageAnalysis: '/ai/image',
      analyzeMissions: '/ai/analyze-missions',
      generateMission: '/ai/generate-mission',
    },
  },

  // 요청 타임아웃 (ms)
  timeout: 10000,
} as const;
