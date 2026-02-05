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

/** 게시글 종류: 전체 / 인증글만 / 일반글만 */
export type PostTypeFilter = 'all' | 'certified' | 'general';

export type PostFilter = 'latest' | 'likes' | 'comments';

export interface FilterOption {
  value: PostFilter;
  label: string;
}
