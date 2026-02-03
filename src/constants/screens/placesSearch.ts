/**
 * PlacesSearchScreen 상수 정의
 */

// 지역 목록
export const REGIONS = [
  { id: 'seoul', name: '서울', location: '서울' },
  { id: 'busan', name: '부산', location: '부산' },
  { id: 'daegu', name: '대구', location: '대구' },
  { id: 'incheon', name: '인천', location: '인천' },
  { id: 'gwangju', name: '광주', location: '광주' },
  { id: 'daejeon', name: '대전', location: '대전' },
  { id: 'gyeonggi', name: '경기', location: '경기' },
] as const;

// 필터 체크박스 (상담센터, 정신건강만)
export const FILTER_CHECKBOXES = [
  { key: 'counseling' as const, label: '상담센터' },
  { key: 'mental_health' as const, label: '정신건강' },
] as const;
