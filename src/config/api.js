/**
 * API 설정 파일
 * 환경변수로 관리되는 API 키들
 */

import { KAKAO_MAP_API_KEY as ENV_KAKAO_KEY } from '@env';

// 카카오맵 API 키 (환경변수에서 읽어옴)
export const KAKAO_MAP_API_KEY = ENV_KAKAO_KEY || '';

// API 키가 설정되었는지 확인
export const HAS_KAKAO_API_KEY =
  !!KAKAO_MAP_API_KEY && KAKAO_MAP_API_KEY.length > 0;
