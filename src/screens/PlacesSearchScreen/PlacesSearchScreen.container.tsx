/**
 * PlacesSearchScreen 비즈니스 로직
 * 위치 권한 요청, 장소 검색 처리
 */

import { useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';

interface PlacesSearchScreenContainerProps {
  navigation: any;
}

export const usePlacesSearchScreenContainer = ({
  navigation,
}: PlacesSearchScreenContainerProps) => {
  const { userLocation, requestLocationPermission } = useLocation();
  const {
    places,
    searchText,
    setSearchText,
    isLoading,
    selectedFilter,
    setSelectedFilter,
    selectedRegion,
    setSelectedRegion,
    searchPlaces,
  } = usePlacesSearch();

  /**
   * 위치 권한 요청
   */
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  /**
   * 위치 기반 장소 검색
   * - userLocation이 있으면 자동으로 검색
   * - 필터·지역 변경 시 재검색
   */
  useEffect(() => {
    if (userLocation) {
      searchPlaces(userLocation.lat, userLocation.lng, selectedFilter, selectedRegion);
    }
  }, [userLocation, selectedFilter, selectedRegion, searchPlaces]);

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  /**
   * 필터 변경 핸들러
   */
  const handleFilterChange = (filter: 'all' | 'counseling' | 'mental_health') => {
    setSelectedFilter(filter);
  };

  /**
   * 지역 변경 핸들러
   */
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  /**
   * 뒤로 가기 핸들러
   */
  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    places,
    searchText,
    isLoading,
    selectedFilter,
    selectedRegion,
    handleSearchChange,
    handleFilterChange,
    handleRegionChange,
    handleGoBack,
  };
};
