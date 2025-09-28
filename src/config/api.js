/**
 * API 설정 파일
 * 실제 배포 시에는 환경변수로 관리해야 합니다.
 */

// 카카오맵 API 키
export const KAKAO_MAP_API_KEY =
  process.env.KAKAO_MAP_API_KEY || 'f94a71dffa5ef5f8b9e839d918b860cc';

// API 키가 설정되었는지 확인
export const HAS_KAKAO_API_KEY =
  !!KAKAO_MAP_API_KEY && KAKAO_MAP_API_KEY.length > 0;
