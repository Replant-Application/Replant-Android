/**
 * CommunityScreen 타입 정의
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export interface CommunityScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'Community'>;
}

export type CommunityTab = 'all' | 'todo-share';

export type VerificationFilter = 'all' | 'pending' | 'approved';

export type PostFilter = 'all' | 'popular';

export interface FilterOption {
  value: PostFilter;
  label: string;
}
