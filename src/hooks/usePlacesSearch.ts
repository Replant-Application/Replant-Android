import { useState, useCallback, useMemo } from 'react';
import placesService, { Place } from '../services/placesService';
import { REGIONS } from '../constants/screens/placesSearch';

type PlaceFilter = 'all' | 'counseling' | 'mental_health';

export const usePlacesSearch = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilter>('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const searchPlaces = useCallback(async (
    userLat: number,
    userLng: number,
    filter: PlaceFilter,
    regionId: string = 'all'
  ) => {
    setIsLoading(true);
    try {
      const searchTypes = filter === 'all'
        ? ['counseling', 'mental_health', 'social_services']
        : [filter];

      const regionName = regionId === 'all'
        ? 'all'
        : (REGIONS.find((r) => r.id === regionId)?.location ?? '서울');

      const results = await placesService.searchByUserLocation(
        userLat,
        userLng,
        searchTypes,
        regionName
      );
      setPlaces(results);
    } catch (error) {
      console.error('장소 검색 오류:', error);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPlaces = useMemo(() => {
    const regionLocation = selectedRegion === 'all'
      ? null
      : (REGIONS.find((r) => r.id === selectedRegion)?.location ?? null);

    return places.filter((place) => {
      const matchesSearch = searchText.trim() === '' ||
        place.name.toLowerCase().includes(searchText.toLowerCase()) ||
        place.formatted_address.toLowerCase().includes(searchText.toLowerCase());

      const matchesRegion = regionLocation === null ||
        place.formatted_address.includes(regionLocation);

      return matchesSearch && matchesRegion;
    });
  }, [places, searchText, selectedRegion]);

  return {
    places: filteredPlaces,
    searchText,
    setSearchText,
    isLoading,
    selectedFilter,
    setSelectedFilter,
    selectedRegion,
    setSelectedRegion,
    searchPlaces,
  };
};
