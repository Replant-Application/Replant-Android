/**
 * 미션 관련 유틸리티 함수
 */

import { Mission } from '../types';
import { removeDuplicates } from './arrayUtils';

/**
 * 미션을 제목 기준으로 정렬
 */
export const sortMissionsByTitle = (missions: Mission[]): Mission[] => {
  return [...missions].sort((a, b) => a.title.localeCompare(b.title));
};

/**
 * 완료되지 않은 미션 필터링
 */
export const filterIncompleteMissions = (missions: Mission[]): Mission[] => {
  return missions.filter(mission => !mission.completed);
};

/**
 * 완료된 미션 필터링
 */
export const filterCompletedMissions = (missions: Mission[]): Mission[] => {
  return missions.filter(mission => mission.completed);
};

/**
 * 완료되지 않은 미션을 제목 기준으로 정렬하여 반환
 */
export const getSortedIncompleteMissions = (missions: Mission[]): Mission[] => {
  return sortMissionsByTitle(filterIncompleteMissions(missions));
};

/**
 * 미션 배열에서 중복 제거 (mission_id 기준)
 */
export const removeDuplicateMissions = (missions: Mission[]): Mission[] => {
  return removeDuplicates(missions, mission => mission.mission_id);
};
