/**
 * TodoListCreateScreen 타입 정의
 */

export type Step = 'intro' | 'random' | 'custom' | 'confirm';

export interface TodoListCreateScreenProps {
  navigation: any;
}

export type TimePeriod = 'AM' | 'PM';

export interface TimeState {
  period: TimePeriod;
  hour: number;
  minute: number;
}

export interface MissionTimeRange {
  start: string; // "HH:mm" 형식
  end: string;   // "HH:mm" 형식
}

export interface DropdownType {
  type: 'startPeriod' | 'startHour' | 'startMinute' | 'endPeriod' | 'endHour' | 'endMinute' | null;
}
