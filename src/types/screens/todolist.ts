/**
 * TodoListCreateScreen 타입 정의
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export type Step = 'random' | 'custom' | 'confirm';

export interface TodoListCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'TodoListCreate'>;
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
