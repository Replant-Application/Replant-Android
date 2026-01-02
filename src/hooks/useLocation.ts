/**
 * 위치 관련 Hook
 * expo-location을 사용한 GPS 기능
 */

import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: LocationCoords | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_LOCATION: LocationCoords = { lat: 37.5665, lng: 126.9780 }; // 서울 시청

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationState, setLocationState] = useState<LocationState>({
    coords: null,
    loading: false,
    error: null,
  });

  /**
   * 위치 권한 요청 및 현재 위치 가져오기
   */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLocationState(prev => ({ ...prev, loading: true, error: null }));

      // 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationState(prev => ({
          ...prev,
          loading: false,
          error: '위치 권한이 거부되었습니다.',
        }));
        Alert.alert('권한 필요', 'GPS 인증을 위해 위치 권한이 필요합니다.');
        setUserLocation(DEFAULT_LOCATION);
        return false;
      }

      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LocationCoords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(coords);
      setLocationState({
        coords,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('위치 가져오기 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '위치를 가져올 수 없습니다.';
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      setUserLocation(DEFAULT_LOCATION);
      return false;
    }
  }, []);

  /**
   * 현재 위치와 목표 위치 간의 거리 계산 (미터 단위)
   * Haversine 공식 사용
   */
  const calculateDistance = useCallback(
    (targetLat: number, targetLng: number): number | null => {
      if (!userLocation) return null;

      const R = 6371000; // 지구 반지름 (미터)
      const lat1 = (userLocation.lat * Math.PI) / 180;
      const lat2 = (targetLat * Math.PI) / 180;
      const deltaLat = ((targetLat - userLocation.lat) * Math.PI) / 180;
      const deltaLng = ((targetLng - userLocation.lng) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // 거리 (미터)
    },
    [userLocation]
  );

  /**
   * GPS 인증 확인
   * 현재 위치가 목표 위치 반경 내에 있는지 확인
   */
  const verifyGPSLocation = useCallback(
    async (targetLat: number, targetLng: number, radiusMeters: number): Promise<{
      success: boolean;
      distance: number | null;
      withinRadius: boolean;
      message: string;
    }> => {
      // 먼저 현재 위치를 갱신
      const hasPermission = await requestLocationPermission();

      if (!hasPermission || !userLocation) {
        return {
          success: false,
          distance: null,
          withinRadius: false,
          message: '위치를 가져올 수 없습니다.',
        };
      }

      const distance = calculateDistance(targetLat, targetLng);

      if (distance === null) {
        return {
          success: false,
          distance: null,
          withinRadius: false,
          message: '거리 계산에 실패했습니다.',
        };
      }

      const withinRadius = distance <= radiusMeters;

      return {
        success: true,
        distance,
        withinRadius,
        message: withinRadius
          ? `목표 위치 내에 있습니다. (거리: ${Math.round(distance)}m)`
          : `목표 위치에서 ${Math.round(distance)}m 떨어져 있습니다. (필요: ${radiusMeters}m 이내)`,
      };
    },
    [userLocation, calculateDistance, requestLocationPermission]
  );

  return {
    userLocation,
    locationState,
    requestLocationPermission,
    calculateDistance,
    verifyGPSLocation,
  };
};
