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

/** 타임존 정보가 없는 ISO 로컬 문자열인지 확인 (예: 2026-02-04T13:27:00) */
const isLocalIsoString = (s: string): boolean =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/i.test(s.trim()) &&
  !/[Z+-]\d{2}:?\d{2}$/i.test(s.trim());

/**
 * 날짜를 ISO 8601 문자열로 변환
 * 배열 형태 [year, month, day, hour, minute, second, nanosecond]를 처리
 * 서버에서 타임존 없이 오는 문자열(Java LocalDateTime)은 UTC로 해석해 9시간 차이 방지
 */
export const normalizeDate = (date: string | number[] | null | undefined): string => {
  if (!date) return '';
  
  // 배열 형태인 경우 (Java LocalDateTime/LocalDate 직렬화)
  if (Array.isArray(date)) {
    if (date.length < 3) return '';
    
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    
    // ISO 8601 형식으로 변환: YYYY-MM-DDTHH:mm:ss
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');
    const secondStr = String(second).padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`;
  }
  
  const str = String(date).trim();
  // 서버(Spring LocalDateTime)가 타임존 없이 보낸 경우 → Asia/Seoul(KST)로 해석
  // 백엔드 server.timezone=Asia/Seoul 이므로 no-Z = KST. Z 없이 두면 브라우저가 로컬로 해석해 9시간 차이 발생
  if (isLocalIsoString(str)) {
    const base = str.replace(/Z$/i, '').replace(/\+\d{2}:?\d{2}$/i, '');
    return base.includes('+') || base.endsWith('Z') ? str : `${base}+09:00`;
  }
  return str;
};

/**
 * 상대 시간 포맷팅 (예: "방금 전", "5분 전", "2시간 전")
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열 또는 배열 형태
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 시간 문자열
 */
export const formatTimeAgo = (
  dateString: string | number[] | null | undefined,
  options: FormatTimeAgoOptions = {}
): string => {
  const { shortFormat = false, omitAgo = false, longFormat = false } = options;

  if (!dateString) return '알 수 없음';

  const now = new Date();
  let date: Date;

  try {
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(dateString);
    if (!normalizedDate) {
      console.warn('[formatTimeAgo] 날짜 정규화 실패:', dateString);
      return '알 수 없음';
    }

    // ISO 8601 형식 또는 다른 형식 처리
    date = new Date(normalizedDate);

    // 유효하지 않은 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('[formatTimeAgo] 잘못된 날짜 형식:', dateString, '정규화 후:', normalizedDate);
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
 * @param dateString - ISO 8601 형식의 날짜 문자열 또는 배열 형태
 * @param includeWeekday - 요일 포함 여부 (기본: false)
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDateKorean = (
  dateString: string | number[] | null | undefined,
  includeWeekday: boolean = false
): string => {
  try {
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(dateString);
    if (!normalizedDate) return '알 수 없음';
    
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) {
      return '알 수 없음';
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeWeekday && { weekday: 'long' }),
    });
  } catch {
    return '알 수 없음';
  }
};

/**
 * YYYY.MM.DD 형식으로 날짜 포맷팅
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열 또는 배열 형태
 * @returns YYYY.MM.DD 형식의 문자열
 */
export const formatDateDot = (dateString: string | number[] | null | undefined): string => {
  try {
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(dateString);
    if (!normalizedDate) return '알 수 없음';
    
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) {
      return '알 수 없음';
    }
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '알 수 없음';
  }
};

/**
 * 채팅방 날짜 구분선 포맷팅 (오늘/어제/날짜)
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열 또는 배열 형태
 * @returns "오늘", "어제", 또는 "YYYY년 M월 D일" 형식의 문자열
 */
export const formatDateDivider = (dateString: string | number[] | null | undefined): string => {
  try {
    // 날짜 정규화 (배열 형태 처리)
    const normalizedDate = normalizeDate(dateString);
    if (!normalizedDate) return '알 수 없음';
    
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) {
      return '알 수 없음';
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  } catch {
    return '알 수 없음';
  }
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

