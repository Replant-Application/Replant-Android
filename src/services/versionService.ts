/**
 * 앱 버전 체크 서비스
 * FCM으로 통일된 업데이트 알림 시스템
 * API를 통해 버전 체크 수행
 */

import { version } from '../../package.json';
import { checkVersion } from '../api/versionApi';
import { UpdateCheckResult } from '../types';

/**
 * 현재 앱 버전 가져오기
 * @returns 현재 앱 버전 문자열 (예: "0.0.41")
 */
export const getCurrentAppVersion = (): string => {
  return version;
};


/**
 * 업데이트 필요 여부 체크 (API 호출)
 * @returns 업데이트 체크 결과 또는 null (체크 실패 시)
 */
export const checkUpdateRequired = async (): Promise<UpdateCheckResult | null> => {
  try {
    const currentVersion = getCurrentAppVersion();
    console.log('[VersionService] 현재 앱 버전:', currentVersion);
    console.log('[VersionService] API로 버전 체크 시작');
    
    const result = await checkVersion(currentVersion);
    
    if (!result.success || !result.data) {
      console.log('[VersionService] 버전 체크 API 실패:', result.error);
      return null;
    }

    const { isRequired, isRecommended, message, storeUrl } = result.data;
    console.log('[VersionService] 버전 체크 결과:', {
      isRequired,
      isRecommended,
      message,
      storeUrl,
    });

    // 업데이트가 필요 없는 경우
    if (!isRequired && !isRecommended) {
      console.log('[VersionService] 업데이트 불필요');
      return null;
    }

    // 업데이트 필요
    console.log('[VersionService] 업데이트 필요 - isRequired:', isRequired, 'isRecommended:', isRecommended);
    return {
      isRequired,
      isRecommended,
      message,
      storeUrl,
    };
  } catch (error) {
    console.error('[VersionService] 업데이트 체크 실패:', error);
    return null;
  }
};
