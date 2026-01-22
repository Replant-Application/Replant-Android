/**
 * 버전 비교 유틸리티
 */

/**
 * 버전 문자열을 숫자 배열로 변환
 * 예: "0.0.41" -> [0, 0, 41]
 * @param version 버전 문자열
 * @returns 버전 숫자 배열
 */
export const parseVersion = (version: string): number[] => {
  return version.split('.').map(Number);
};

/**
 * 버전 비교
 * @param current 현재 버전
 * @param target 비교 대상 버전
 * @returns current < target이면 -1, 같으면 0, current > target이면 1
 */
export const compareVersions = (current: string, target: string): number => {
  const currentParts = parseVersion(current);
  const targetParts = parseVersion(target);

  const maxLength = Math.max(currentParts.length, targetParts.length);

  for (let i = 0; i < maxLength; i++) {
    const currentPart = currentParts[i] || 0;
    const targetPart = targetParts[i] || 0;

    if (currentPart < targetPart) {
      return -1;
    } else if (currentPart > targetPart) {
      return 1;
    }
  }

  return 0;
};

/**
 * 현재 버전이 최소 버전보다 낮은지 확인 (강제 업데이트 필요)
 * @param current 현재 버전
 * @param minimum 최소 버전
 * @returns 최소 버전보다 낮으면 true
 */
export const isVersionBelowMinimum = (current: string, minimum: string): boolean => {
  return compareVersions(current, minimum) < 0;
};

/**
 * 현재 버전이 최신 버전보다 낮은지 확인 (선택 업데이트 권장)
 * @param current 현재 버전
 * @param latest 최신 버전
 * @returns 최신 버전보다 낮으면 true
 */
export const isVersionBelowLatest = (current: string, latest: string): boolean => {
  return compareVersions(current, latest) < 0;
};
