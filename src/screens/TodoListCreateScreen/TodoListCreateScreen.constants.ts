/**
 * TodoListCreateScreen 상수 정의
 */

import { TimeState, TimePeriod } from './TodoListCreateScreen.types';

// 시간 선택 기본값
export const DEFAULT_START_TIME: TimeState = {
  period: 'AM' as TimePeriod,
  hour: 9,
  minute: 0,
};

export const DEFAULT_END_TIME: TimeState = {
  period: 'PM' as TimePeriod,
  hour: 6,
  minute: 0,
};

// 시간 선택 옵션
export const TIME_PERIODS: TimePeriod[] = ['AM', 'PM'];
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
export const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0-59
