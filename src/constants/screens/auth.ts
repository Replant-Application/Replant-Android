/**
 * SignUpScreen 상수 정의
 */

import { RegionInfo } from '../../api/authApi';

// 지역 목록 (백엔드 MetropolitanArea enum과 동일)
export const REGIONS: RegionInfo[] = [
  { code: 'SEOUL', name: '서울특별시' },
  { code: 'BUSAN', name: '부산광역시' },
  { code: 'DAEGU', name: '대구광역시' },
  { code: 'INCHEON', name: '인천광역시' },
  { code: 'GWANGJU', name: '광주광역시' },
  { code: 'DAEJEON', name: '대전광역시' },
  { code: 'ULSAN', name: '울산광역시' },
  { code: 'SEJONG', name: '세종특별자치시' },
  { code: 'GYEONGGI', name: '경기도' },
  { code: 'GANGWON', name: '강원특별자치도' },
  { code: 'CHUNGBUK', name: '충청북도' },
  { code: 'CHUNGNAM', name: '충청남도' },
  { code: 'JEONBUK', name: '전북특별자치도' },
  { code: 'JEONNAM', name: '전라남도' },
  { code: 'GYEONGBUK', name: '경상북도' },
  { code: 'GYEONGNAM', name: '경상남도' },
  { code: 'JEJU', name: '제주특별자치도' },
];

// 출생연도 목록 생성 함수 (1950년 ~ 현재년도 - 14세)
export const getBirthYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 14 - 1950 + 1 }, (_, i) => currentYear - 14 - i);
};
