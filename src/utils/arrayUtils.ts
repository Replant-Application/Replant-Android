/**
 * 배열 관련 유틸리티 함수
 */

/**
 * 배열에서 중복 제거
 * 
 * @param array - 중복을 제거할 배열
 * @param keyExtractor - 각 항목에서 고유 키를 추출하는 함수
 * @returns 중복이 제거된 배열 (첫 번째 항목 유지)
 * 
 * @example
 * // ID 기준으로 중복 제거
 * const unique = removeDuplicates(items, item => item.id);
 * 
 * // 복합 키로 중복 제거
 * const unique = removeDuplicates(items, item => `${item.type}-${item.id}`);
 */
export function removeDuplicates<T>(
  array: T[],
  keyExtractor: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyExtractor(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
