/**
 * 날짜 관련 유틸리티 함수
 */

export interface FormatTimeAgoOptions {
  /** "방금 전" 대신 "방금" 사용 (기본: false) */
  shortFormat?: boolean;
  /** "X분 전" 대신 "X분" 사용 (기본: false) */
  omitAgo?: boolean;
  /** 7일 이상일 때 긴 형식 사용 (예: "1월 1일") (기본: false) */
  longFormat?: boolean;
}

/**
 * 상대 시간 포맷팅 (예: "방금 전", "5분 전", "2시간 전")
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 시간 문자열
 */
export const formatTimeAgo = (
  dateString: string | null | undefined,
  options: FormatTimeAgoOptions = {}
): string => {
  const { shortFormat = false, omitAgo = false, longFormat = false } = options;

  if (!dateString) return '알 수 없음';

  const now = new Date();
  let date: Date;

  try {
    // ISO 8601 형식 또는 다른 형식 처리
    date = new Date(dateString);

    // 유효하지 않은 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('[formatTimeAgo] 잘못된 날짜 형식:', dateString);
      return '알 수 없음';
    }

    const diff = now.getTime() - date.getTime();

    // 미래 날짜인 경우 (타임존 문제 등)
    if (diff < 0) {
      console.warn('[formatTimeAgo] 미래 날짜:', dateString, '현재:', now.toISOString());
      return shortFormat ? '방금' : '방금 전';
    }

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return shortFormat ? '방금' : '방금 전';
    }
    if (minutes < 60) {
      return omitAgo ? `${minutes}분` : `${minutes}분 전`;
    }
    if (hours < 24) {
      return omitAgo ? `${hours}시간` : `${hours}시간 전`;
    }
    if (days < 7) {
      return omitAgo ? `${days}일` : `${days}일 전`;
    }

    // 7일 이상일 때
    if (longFormat) {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } catch (error) {
    console.error('[formatTimeAgo] 날짜 파싱 에러:', dateString, error);
    return '알 수 없음';
  }
};

/**
 * YYYY-MM-DD 형식으로 날짜 포맷팅
 * 
 * @param date - Date 객체 또는 날짜 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateYYYYMMDD = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 한국어 형식으로 날짜 포맷팅 (예: "2024년 1월 1일")
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param includeWeekday - 요일 포함 여부 (기본: false)
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDateKorean = (
  dateString: string,
  includeWeekday: boolean = false
): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeWeekday && { weekday: 'long' }),
    });
  } catch {
    return dateString;
  }
};

/**
 * YYYY.MM.DD 형식으로 날짜 포맷팅
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns YYYY.MM.DD 형식의 문자열
 */
export const formatDateDot = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * 채팅방 날짜 구분선 포맷팅 (오늘/어제/날짜)
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns "오늘", "어제", 또는 "YYYY년 M월 D일" 형식의 문자열
 */
export const formatDateDivider = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * 날짜 기준으로 배열 정렬
 * 
 * @param array - 정렬할 배열
 * @param dateExtractor - 각 항목에서 날짜를 추출하는 함수 (날짜 문자열 또는 Date 객체 반환)
 * @param order - 정렬 순서 ('asc' = 오름차순, 'desc' = 내림차순, 기본: 'desc')
 * @returns 정렬된 배열 (원본 배열을 변경하지 않음)
 * 
 * @example
 * // 최신순 정렬 (내림차순)
 * const sorted = sortByDate(notifications, n => n.createdAt);
 * 
 * // 오래된 순 정렬 (오름차순)
 * const sorted = sortByDate(events, e => e.date, 'asc');
 */
export function sortByDate<T>(
  array: T[],
  dateExtractor: (item: T) => string | Date | null | undefined,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    try {
      const dateAValue = dateExtractor(a);
      const dateBValue = dateExtractor(b);

      // null/undefined 처리
      if (!dateAValue && !dateBValue) return 0;
      if (!dateAValue) return 1; // dateA가 없으면 뒤로
      if (!dateBValue) return -1; // dateB가 없으면 뒤로

      // Date 객체 또는 문자열을 Date로 변환
      const dateA = dateAValue instanceof Date ? dateAValue : new Date(dateAValue);
      const dateB = dateBValue instanceof Date ? dateBValue : new Date(dateBValue);

      // 유효하지 않은 날짜 처리
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

      // 날짜 파싱 실패 시 순서 유지
      if (timeA === 0 && timeB === 0) return 0;

      // 정렬 순서에 따라 반환
      return order === 'desc' ? timeB - timeA : timeA - timeB;
    } catch (error) {
      console.warn('[sortByDate] 날짜 정렬 실패:', error);
      return 0; // 에러 발생 시 순서 유지
    }
  });
}

