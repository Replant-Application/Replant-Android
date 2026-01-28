/**
 * TodoListCreateScreen 상수 정의
 */

import { TimeState, TimePeriod } from '../../types/screens/todolist';

// 시간 선택 기본값 (하루 종일: 00:00 ~ 23:59)
export const DEFAULT_START_TIME: TimeState = {
  period: 'AM' as TimePeriod,
  hour: 12,
  minute: 0,
};

export const DEFAULT_END_TIME: TimeState = {
  period: 'PM' as TimePeriod,
  hour: 11,
  minute: 59,
};

// 시간 선택 옵션
export const TIME_PERIODS: TimePeriod[] = ['AM', 'PM'];
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
export const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0-59
