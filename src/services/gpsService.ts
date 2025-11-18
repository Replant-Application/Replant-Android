/**
 * GPS 위치 서비스
 * 현재 위치 가져오기 및 위치 권한 관리
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface Location {
  lat: number;
  lng: number;
}

export interface LocationError {
  code: string;
  message: string;
}

/**
 * 위치 권한 요청 (Android)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한',
          message: '미션 인증을 위해 위치 정보가 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '취소',
          buttonPositive: '확인',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('위치 권한 요청 오류:', err);
      return false;
    }
  }
  // iOS는 Info.plist에 권한 설명이 있으면 자동으로 요청됨
  return true;
};

/**
 * 현재 위치 가져오기
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    // React Native의 Geolocation API 사용
    if (typeof navigator !== 'undefined' && (navigator as any).geolocation) {
      (navigator as any).geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error: any) => {
          const locationError: LocationError = {
            code: error.code?.toString() || 'UNKNOWN',
            message: error.message || '위치를 가져올 수 없습니다.',
          };
          reject(locationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } else {
      reject({
        code: 'NOT_SUPPORTED',
        message: '이 기기에서 위치 서비스를 사용할 수 없습니다.',
      });
    }
  });
};

/**
 * 위치 권한 확인 및 현재 위치 가져오기
 */
export const getLocationWithPermission = async (): Promise<Location> => {
  try {
    // 권한 요청
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: '위치 권한이 거부되었습니다.',
      };
    }

    // 위치 가져오기
    const location = await getCurrentLocation();
    return location;
  } catch (error) {
    throw error;
  }
};

/**
 * 현재 시간 가져오기 (ISO 형식)
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

