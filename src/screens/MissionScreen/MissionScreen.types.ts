import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

export interface MissionScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Mission'>;
}

export type MissionFilter = 'inProgress' | 'pendingVerification' | 'completed';
export type MissionPeriodFilter = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type MissionSourceFilter = 'REGULAR' | 'CUSTOM';
export type MissionTab = 'myMission' | 'missionGroup';

