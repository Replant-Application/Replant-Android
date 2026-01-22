import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Header, EmptyState } from '../../components/ui';
import { PlaceCard } from '../../components/specialized/PlaceCard';
import { colors } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { usePlacesSearchScreenContainer } from './PlacesSearchScreen.container';
import { styles } from './PlacesSearchScreen.styles';

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
  // 비즈니스 로직은 Container에서 처리
  const {
    places,
    searchText,
    isLoading,
    selectedFilter,
    selectedRegion,
    handleSearchChange,
    handleFilterChange,
    handleRegionChange,
    handleGoBack,
  } = usePlacesSearchScreenContainer({ navigation });

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="근처 상담센터"
          leftButton={
            <TouchableOpacity onPress={handleGoBack}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
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
            onChangeText={handleSearchChange}
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
              onPress={() => handleFilterChange(filter.key)}
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
              onPress={() => handleRegionChange(region.id)}
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
            iconImage={require('../../assets/images/search.png')}
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
    </ImageBackground>
  );
};

export default PlacesSearchScreen;
