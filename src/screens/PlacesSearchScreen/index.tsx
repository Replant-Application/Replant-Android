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
import { REGIONS, FILTERS } from '../../constants/screens/placesSearch';
import { usePlacesSearchScreenContainer } from './PlacesSearchScreen.container';
import { styles } from './PlacesSearchScreen.styles';

interface PlacesSearchScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

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
      accessibilityElementsHidden={true}
    >
      <View style={styles.container}>
        <Header
          title="근처 상담센터"
          leftButton={
            <TouchableOpacity
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
            >
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
                accessibilityElementsHidden={true}
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
            placeholderTextColor={colors.text.primary}
            accessibilityLabel="장소 검색"
            accessibilityHint="장소 이름 또는 주소로 검색"
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
              accessibilityRole="button"
              accessibilityLabel={filter.label}
              accessibilityState={{ selected: selectedFilter === filter.key }}
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
              accessibilityRole="button"
              accessibilityLabel={region.name}
              accessibilityState={{ selected: selectedRegion === region.id }}
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
