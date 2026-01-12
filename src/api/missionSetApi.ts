/**
 * 미션세트(투두리스트) API - Deprecated
 *
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새로운 코드에서는 todolistApi.ts를 직접 import하세요.
 *
 * @deprecated todolistApi.ts를 사용하세요
 */

// 모든 타입과 함수를 todolistApi.ts에서 re-export
export {
  // 타입
  MissionSetMission,
  MissionSetSimple,
  MissionSetDetail,
  MissionSetListResponse,
  CreateMissionSetRequest,
  UpdateMissionSetRequest,
  MissionSetReview,
  MissionSetReviewListResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  // 함수
  getMissionSets,
  getMyMissionSets,
  searchMissionSets,
  getMissionSetDetail,
  createMissionSet,
  updateMissionSet,
  deleteMissionSet,
  addMissionToSet,
  removeMissionFromSet,
  reorderMissions,
  copyMissionSet,
  createReview,
  getReviews,
  getMyReview,
  updateReview,
  deleteReview,
} from './todolistApi';
