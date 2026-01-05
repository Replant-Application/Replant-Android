import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, EmptyState } from '../components/ui';
import { PlaceCard } from '../components/specialized/PlaceCard';
import { useLocation } from '../hooks/useLocation';
import { usePlacesSearch } from '../hooks/usePlacesSearch';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';

interface PlacesSearchScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const REGIONS = [
  { id: 'all', name: '전체', location: '' },
  { id: 'seoul', name: '서울', location: '서울' },
  { id: 'busan', name: '부산', location: '부산' },
  { id: 'daegu', name: '대구', location: '대구' },
  { id: 'incheon', name: '인천', location: '인천' },
  { id: 'gwangju', name: '광주', location: '광주' },
  { id: 'daejeon', name: '대전', location: '대전' },
  { id: 'gyeonggi', name: '경기', location: '경기' },
];

const FILTERS = [
  { key: 'all' as const, label: '전체' },
  { key: 'counseling' as const, label: '상담센터' },
  { key: 'mental_health' as const, label: '정신건강' },
];

const PlacesSearchScreen: React.FC<PlacesSearchScreenProps> = ({ navigation }) => {
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    if (userLocation) {
      searchPlaces(userLocation.lat, userLocation.lng, selectedFilter);
    }
  }, [userLocation, selectedFilter, searchPlaces]);

  return (
    <View style={styles.container}>
      <Header
        title="근처 상담센터"
        leftButton={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={require('../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* 검색 바 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소 이름 또는 주소로 검색"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionContainer}
        >
          {REGIONS.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionChip,
                selectedRegion === region.id && styles.regionChipActive,
              ]}
              onPress={() => setSelectedRegion(region.id)}
            >
              <Text
                style={[
                  styles.regionChipText,
                  selectedRegion === region.id && styles.regionChipTextActive,
                ]}
              >
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : places.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없습니다"
            description="다른 필터나 지역을 선택해보세요"
          />
        ) : (
          <ScrollView style={styles.placesList}>
            <Text style={styles.resultsCount}>총 {places.length}개의 장소</Text>
            {places.map((place) => (
              <PlaceCard key={place.place_id} place={place} />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  searchContainer: {
    marginBottom: spacing[3],
  },
  searchInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterContainer: {
    marginBottom: spacing[3],
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    marginRight: spacing[2],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  regionContainer: {
    marginBottom: spacing[4],
    maxHeight: 40,
  },
  regionChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  regionChipActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  regionChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  regionChipTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  placesList: {
    flex: 1,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    fontWeight: typography.fontWeight.medium,
  },
});

export default PlacesSearchScreen;
