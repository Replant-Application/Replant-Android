/**
 * 캐릭터 관련 유틸리티 함수
 */

import { CHARACTER_ASSET_BASE_URL } from '@env';

/**
 * 캐릭터 애셋 기본 URL 가져오기
 */
const getAssetBaseUrl = (): string => {
  if (typeof CHARACTER_ASSET_BASE_URL === 'undefined' || !CHARACTER_ASSET_BASE_URL) {
    throw new Error('CHARACTER_ASSET_BASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }
  
  const baseUrl = CHARACTER_ASSET_BASE_URL.trim();
  
  // URL 끝에 슬래시가 있으면 제거
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

/**
 * 레벨별 캐릭터 정적 이미지 (PNG) - 프로필/리스트용
 * 레벨 5 이상은 모두 레벨 5 이미지 사용 (레벨 6 전용 이미지 미사용)
 */
export const getCharacterImageStatic = (level: number) => {
  const actualLevel = Math.min(level, 5);
  const levelFolder = `Level${actualLevel}`; // S3 경로는 대문자로 시작
  const baseUrl = getAssetBaseUrl();
  const imageUrl = `${baseUrl}/${levelFolder}/default_static.png`;
  
  return { uri: imageUrl };
};

/**
 * 레벨별 캐릭터 이미지 가져오기 (GIF, 애니메이션)
 * 레벨 5 이상은 모두 레벨 5 이미지 사용 (레벨 6 전용 이미지 미사용)
 */
export const getCharacterImage = (level: number, emotion: string = 'default') => {
  const actualLevel = Math.min(level, 5);
  const levelFolder = `Level${actualLevel}`; // S3 경로는 대문자로 시작
  const baseUrl = getAssetBaseUrl();
  const fileName = emotion === 'happy' ? 'happy.gif' : 'default.gif';
  const imageUrl = `${baseUrl}/${levelFolder}/${fileName}`;
  
  return { uri: imageUrl };
};

