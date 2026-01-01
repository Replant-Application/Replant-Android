/**
 * API 인터페이스 모음
 * 모든 API 함수를 한 곳에서 export
 */

// 인증 API
export * from './authApi';

// 사용자 API
export * from './userApi';

// 펫 (Reant) API
export * from './petApi';

// 미션 API (시스템 미션, 커스텀 미션, 내 미션, 인증 게시판)
export * from './missionApi';

// 커뮤니티 API (자유 게시판)
export * from './communityApi';

// 뱃지 API
export * from './badgeApi';

// 유저 추천 API
export * from './recommendationApi';

// 채팅 API
export * from './chatApi';

// 알림 API
export * from './notificationApi';

// 파일 API (프론트엔드 전용)
export * from './fileApi';

// AI API (프론트엔드 전용)
export * from './aiApi';

// 관리자 API (프론트엔드 전용)
export * from './manageApi';

// API 클라이언트
export { apiClient, ApiClient } from './client';

