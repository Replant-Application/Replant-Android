/**
 * CommunityScreen 상수 정의
 */

import { FilterOption } from '../../types/screens/community';

export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '좋아요순' },
  { value: 'comments', label: '댓글순' },
];
