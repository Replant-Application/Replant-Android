/**
 * 파일 API 인터페이스
 * S3 파일 업로드/삭제 기능 제공
 */

import { apiClient } from './client';
import { API_CONFIG } from '../config/apiConfig';
import { ServiceResult } from '../types';
import { Platform } from 'react-native';

// 업로드 응답 타입
export interface UploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

/**
 * 사진 업로드 (일반)
 * POST /files/upload
 */
export const uploadPhoto = async (file: { uri: string; type: string; name: string }): Promise<ServiceResult<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    type: file.type,
    name: file.name,
  } as any);

  return apiClient.upload<UploadResponse>(API_CONFIG.endpoints.file.upload, formData);
};

/**
 * 미션 인증 사진 업로드
 * POST /files/upload/mission-verify
 * S3의 mission_verify 폴더에 업로드됩니다
 */
export const uploadMissionVerifyPhoto = async (file: { uri: string; type: string; name: string }): Promise<ServiceResult<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    type: file.type,
    name: file.name,
  } as any);

  return apiClient.upload<UploadResponse>(API_CONFIG.endpoints.file.uploadMissionVerify, formData);
};

/**
 * 특정 폴더에 사진 업로드
 * POST /files/upload/:folder
 */
export const uploadPhotoToFolder = async (
  file: { uri: string; type: string; name: string },
  folder: string
): Promise<ServiceResult<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    type: file.type,
    name: file.name,
  } as any);

  const endpoint = API_CONFIG.endpoints.file.uploadToFolder.replace(':folder', folder);
  return apiClient.upload<UploadResponse>(endpoint, formData);
};

/**
 * 사진 삭제
 * DELETE /file/:id
 */
export const deletePhoto = async (fileId: string): Promise<ServiceResult<void>> => {
  // TODO: 백엔드 개발자가 실제 구현
  const endpoint = API_CONFIG.endpoints.file.delete.replace(':id', fileId);
  return apiClient.delete<void>(endpoint);
};

/**
 * 사진 불러오기
 * POST /file (명세서에 POST로 명시됨)
 */
export const getPhoto = async (fileId: string): Promise<ServiceResult<{ fileUrl: string }>> => {
  // TODO: 백엔드 개발자가 실제 구현
  // 명세서에 POST /file로 명시되어 있으나, 일반적으로는 GET이지만 명세서를 따름
  return apiClient.post<{ fileUrl: string }>(API_CONFIG.endpoints.file.upload, { fileId });
};

