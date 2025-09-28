import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Header } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { RootStackParamList } from '../types/navigation';
import placesService, { Place } from '../services/placesService';

interface PlacesSearchScreenProps {
  navigation: any;
}

// 지역 목록
const REGIONS = [
  { id: 'all', name: '전체', location: '' },
  { id: 'seoul', name: '서울', location: '서울' },
  { id: 'busan', name: '부산', location: '부산' },
  { id: 'daegu', name: '대구', location: '대구' },
  { id: 'incheon', name: '인천', location: '인천' },
  { id: 'gwangju', name: '광주', location: '광주' },
  { id: 'daejeon', name: '대전', location: '대전' },
  { id: 'ulsan', name: '울산', location: '울산' },
  { id: 'sejong', name: '세종', location: '세종' },
  { id: 'gyeonggi', name: '경기', location: '경기' },
  { id: 'gangwon', name: '강원', location: '강원' },
  { id: 'chungbuk', name: '충북', location: '충북' },
  { id: 'chungnam', name: '충남', location: '충남' },
  { id: 'jeonbuk', name: '전북', location: '전북' },
  { id: 'jeonnam', name: '전남', location: '전남' },
  { id: 'gyeongbuk', name: '경북', location: '경북' },
  { id: 'gyeongnam', name: '경남', location: '경남' },
  { id: 'jeju', name: '제주', location: '제주' },
];

const PlacesSearchScreen: React.FC<PlacesSearchScreenProps> = ({ navigation }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'counseling' | 'mental_health'>('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showAllRegions, setShowAllRegions] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchPlaces();
    }
  }, [userLocation]);

  useEffect(() => {
    filterPlaces();
  }, [places, searchText, selectedFilter, selectedRegion]);

  // 위치 권한 요청
  const requestLocationPermission = async () => {
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
          // 위치 권한이 없으면 서울 중심으로 검색
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        }
      } catch (err) {
        console.warn(err);
        setUserLocation({ lat: 37.5665, lng: 126.9780 });
      }
    } else {
      getCurrentLocation();
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (typeof window !== 'undefined' && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position: any) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error: any) => {
          console.error('위치 가져오기 실패:', error);
          // 기본값으로 서울 중심 설정
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.9780 });
    }
  };

  // 장소 검색
  const searchPlaces = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const results = await placesService.searchByUserLocation(
        userLocation.lat,
        userLocation.lng,
        ['counseling', 'mental_health', 'social_services']
      );
      setPlaces(results);
    } catch (error) {
      console.error('장소 검색 오류:', error);
      Alert.alert('오류', '장소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 지역별 장소 검색
  const searchPlacesByRegion = async (region: string) => {
    if (region === 'all') {
      searchPlaces();
      return;
    }

    setIsLoading(true);
    try {
      const regionData = REGIONS.find(r => r.id === region);
      if (!regionData) return;

      const results = await placesService.searchCounselingCenters(regionData.location);
      setPlaces(results);
    } catch (error) {
      console.error('지역별 장소 검색 오류:', error);
      Alert.alert('오류', '지역별 장소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 장소 필터링
  const filterPlaces = () => {
    let filtered = places;

    // 검색어 필터
    if (searchText.trim()) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchText.toLowerCase()) ||
        place.formatted_address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(place => {
        const searchText = `${place.name} ${place.formatted_address}`.toLowerCase();
        switch (selectedFilter) {
          case 'counseling':
            return searchText.includes('상담') || searchText.includes('심리');
          case 'mental_health':
            return searchText.includes('정신') || searchText.includes('병원');
          default:
            return true;
        }
      });
    }

    // 지역 필터
    if (selectedRegion !== 'all') {
      const regionData = REGIONS.find(r => r.id === selectedRegion);
      if (regionData) {
        filtered = filtered.filter(place =>
          place.formatted_address.includes(regionData.location)
        );
      }
    }

    setFilteredPlaces(filtered);
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 전화 걸기
  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Alert.alert(
        '전화 걸기',
        `${phoneNumber}로 전화를 걸까요?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '전화걸기', onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
        ]
      );
    }
  };

  // 웹사이트 열기
  const handleWebsite = (website: string) => {
    if (website) {
      Linking.openURL(website);
    }
  };

  // 지도에서 보기
  const handleMap = (place: Place) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.formatted_address)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="근처 상담센터"
        leftButton={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* 검색 바 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="상담센터명 또는 주소로 검색..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* 필터 버튼들 */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: '전체' },
              { key: 'counseling', label: '상담센터' },
              { key: 'mental_health', label: '정신건강' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 지역 선택 버튼들 */}
        <View style={styles.regionContainer}>
          <View style={styles.regionHeader}>
            <Text style={styles.regionTitle}>지역 선택</Text>
            <TouchableOpacity
              onPress={() => setShowAllRegions(!showAllRegions)}
              style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>
                {showAllRegions ? '간단히' : '더보기'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(showAllRegions ? REGIONS : REGIONS.slice(0, 8)).map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionButton,
                  selectedRegion === region.id && styles.regionButtonActive
                ]}
                onPress={() => {
                  setSelectedRegion(region.id);
                  searchPlacesByRegion(region.id);
                }}
              >
                <Text style={[
                  styles.regionButtonText,
                  selectedRegion === region.id && styles.regionButtonTextActive
                ]}>
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>근처 상담센터를 찾는 중...</Text>
          </View>
        )}

        {/* API 키 안내 */}
        {!isLoading && (
          <View style={styles.apiInfoContainer}>
            <Text style={styles.apiInfoText}>
              💡 카카오맵 API를 사용하여 실제 상담센터 정보를 검색합니다.
            </Text>
            <Text style={styles.apiInfoSubText}>
              한국의 정확한 상담센터 정보를 제공합니다.
            </Text>
          </View>
        )}

        {/* 결과 개수 */}
        {!isLoading && (
          <View style={styles.resultInfo}>
            <Text style={styles.resultText}>
              총 {filteredPlaces.length}개의 상담센터를 찾았습니다
            </Text>
          </View>
        )}

        {/* 장소 목록 */}
        {!isLoading && filteredPlaces.map((place) => (
          <View key={place.place_id} style={styles.placeCard}>
            <View style={styles.placeHeader}>
              <Text style={styles.placeName}>{place.name}</Text>
              {place.rating && (
                <View style={styles.ratingContainer}>
                  <View style={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} style={styles.star}>
                        {star <= Math.floor(place.rating!) ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                  {place.user_ratings_total && (
                    <Text style={styles.ratingCount}>({place.user_ratings_total})</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.placeInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍</Text>
                <Text style={styles.infoText}>{place.formatted_address}</Text>
              </View>

              {place.formatted_phone_number && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📞</Text>
                  <TouchableOpacity onPress={() => handleCall(place.formatted_phone_number!)}>
                    <Text style={styles.phoneText}>{place.formatted_phone_number}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {place.website && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🌐</Text>
                  <TouchableOpacity onPress={() => handleWebsite(place.website!)}>
                    <Text style={styles.websiteText}>웹사이트 방문</Text>
                  </TouchableOpacity>
                </View>
              )}

              {place.opening_hours && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🕒</Text>
                  <Text style={styles.infoText}>
                    {place.opening_hours.open_now ? '영업 중' : '영업 종료'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.placeActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleMap(place)}
              >
                <Text style={styles.actionButtonText}>🗺️ 지도에서 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 결과가 없을 때 */}
        {!isLoading && filteredPlaces.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              검색 조건에 맞는 상담센터가 없습니다.
            </Text>
            <Text style={styles.emptyStateSubText}>
              다른 검색어나 필터를 시도해보세요.
            </Text>
          </View>
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
  backButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  searchContainer: {
    marginBottom: spacing[4],
  },
  searchInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterContainer: {
    marginBottom: spacing[4],
  },
  filterButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  apiInfoContainer: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  apiInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[1],
  },
  apiInfoSubText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
  resultInfo: {
    marginBottom: spacing[4],
  },
  resultText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  placeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  placeName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRating: {
    flexDirection: 'row',
    marginRight: spacing[1],
  },
  star: {
    fontSize: typography.fontSize.sm,
    marginRight: 1,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing[1],
  },
  ratingCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  placeInfo: {
    marginBottom: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    marginRight: spacing[2],
    width: 20,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  phoneText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  websiteText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  emptyStateSubText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  regionContainer: {
    marginBottom: spacing[4],
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  regionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  moreButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  moreButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  regionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  regionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  regionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  regionButtonTextActive: {
    color: colors.white,
  },
});

export default PlacesSearchScreen;
