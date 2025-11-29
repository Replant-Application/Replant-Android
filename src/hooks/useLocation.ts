import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

interface Location {
  lat: number;
  lng: number;
}

const DEFAULT_LOCATION: Location = { lat: 37.5665, lng: 126.9780 };

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  const getCurrentLocation = useCallback(() => {
    try {
      const nav = globalThis as { navigator?: { geolocation?: { getCurrentPosition: (success: (position: { coords: { latitude: number; longitude: number } }) => void, error: (err: unknown) => void) => void } } };
      if (nav.navigator?.geolocation) {
        nav.navigator.geolocation.getCurrentPosition(
          (position: { coords: { latitude: number; longitude: number } }) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error: unknown) => {
            console.error('위치 가져오기 실패:', error);
            setUserLocation(DEFAULT_LOCATION);
          }
        );
      } else {
        setUserLocation(DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('위치 가져오기 오류:', error);
      setUserLocation(DEFAULT_LOCATION);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '근처 상담센터를 찾기 위해 위치 정보가 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setUserLocation(DEFAULT_LOCATION);
        }
      } catch (error) {
        console.warn('위치 권한 요청 실패:', error);
        setUserLocation(DEFAULT_LOCATION);
      }
    } else {
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  return {
    userLocation,
    requestLocationPermission,
  };
};
