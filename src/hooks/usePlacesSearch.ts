import { useState, useCallback, useMemo } from 'react';
import placesService, { Place } from '../services/placesService';
import { REGIONS } from '../constants/screens/placesSearch';

export const usePlacesSearch = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [counselingChecked, setCounselingChecked] = useState(true);
  const [mentalHealthChecked, setMentalHealthChecked] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('seoul');

  const searchPlaces = useCallback(async (
    userLat: number,
    userLng: number,
    counseling: boolean,
    mentalHealth: boolean,
    regionId: string
  ) => {
    setIsLoading(true);
    try {
      const searchTypes: string[] = [];
      if (counseling) searchTypes.push('counseling');
      if (mentalHealth) searchTypes.push('mental_health');
      if (searchTypes.length === 0) {
        searchTypes.push('counseling', 'mental_health', 'social_services');
      } else {
        searchTypes.push('social_services');
      }

      const regionName = REGIONS.find((r) => r.id === regionId)?.location ?? '서울';

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

  const toggleFilter = useCallback((key: 'counseling' | 'mental_health') => {
    if (key === 'counseling') setCounselingChecked((prev) => !prev);
    else setMentalHealthChecked((prev) => !prev);
  }, []);

  return {
    places: filteredPlaces,
    searchText,
    setSearchText,
    isLoading,
    counselingChecked,
    mentalHealthChecked,
    toggleFilter,
    selectedRegion,
    setSelectedRegion,
    searchPlaces,
  };
};
