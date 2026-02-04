/**
 * 환경변수 타입 정의
 */

declare module '@env' {
  // API 설정
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string;

  // OAuth 설정
  export const KAKAO_APP_KEY: string;
  export const GOOGLE_CLIENT_ID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const NAVER_CLIENT_ID: string;
  export const APPLE_CLIENT_ID: string;

  // 외부 API 키
  export const KAKAO_MAP_API_KEY: string;
  export const AMPLITUDE_API_KEY: string;
}
