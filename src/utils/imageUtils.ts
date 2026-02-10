/**
 * 이미지 URL 관련 유틸리티 함수
 */

import { CHARACTER_ASSET_BASE_URL } from '@env';

// CloudFront 도메인 (게시글 이미지용)
const CLOUDFRONT_DOMAIN = 'd43d9zobzzt3j.cloudfront.net';
const CLOUDFRONT_BASE_URL = `https://${CLOUDFRONT_DOMAIN}`;

/**
 * S3 URL을 CloudFront URL로 변환
 * 백엔드가 S3 URL을 반환하는 경우 CloudFront URL로 변환합니다
 * 
 * @param s3Url S3 URL 또는 이미 CloudFront URL
 * @returns CloudFront URL
 */
export const convertToCloudFrontUrl = (s3Url: string | undefined | null): string => {
  if (!s3Url) return '';
  
  // 이미 CloudFront URL인 경우 그대로 반환
  if (s3Url.includes(CLOUDFRONT_DOMAIN)) {
    return s3Url;
  }
  
  // S3 URL인 경우 CloudFront URL로 변환
  // S3 URL 형식: https://replant-bucket.s3.ap-northeast-2.amazonaws.com/REPLANT/COMMUNITY/...
  // CloudFront URL 형식: https://d43d9zobzzt3j.cloudfront.net/REPLANT/COMMUNITY/...
  try {
    const url = new URL(s3Url);
    
    // S3 버킷 URL인지 확인
    if (url.hostname.includes('s3') || url.hostname.includes('amazonaws.com')) {
      // 경로 추출 (버킷 이름 제외)
      const pathParts = url.pathname.split('/').filter(p => p);
      
      // 버킷 이름 제거 (첫 번째 경로가 버킷 이름일 수 있음)
      // replant-bucket/REPLANT/COMMUNITY/... -> REPLANT/COMMUNITY/...
      const bucketName = 'replant-bucket';
      const pathWithoutBucket = pathParts[0] === bucketName 
        ? pathParts.slice(1).join('/')
        : pathParts.join('/');
      
      // CloudFront URL 생성
      return `${CLOUDFRONT_BASE_URL}/${pathWithoutBucket}${url.search}`;
    }
    
    // S3 URL이 아니면 그대로 반환
    return s3Url;
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    console.warn('[convertToCloudFrontUrl] URL 파싱 실패:', s3Url, error);
    return s3Url;
  }
};

/**
 * 이미지 URL 배열을 CloudFront URL 배열로 변환
 * 
 * @param imageUrls 이미지 URL 배열
 * @returns CloudFront URL 배열
 */
export const convertImageUrlsToCloudFront = (imageUrls: string[] | undefined | null): string[] => {
  if (!imageUrls || imageUrls.length === 0) return [];
  return imageUrls.map(url => convertToCloudFrontUrl(url));
};
