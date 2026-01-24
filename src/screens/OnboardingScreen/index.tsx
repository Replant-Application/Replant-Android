import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useOnboardingScreenContainer } from './OnboardingScreen.container';
import { styles } from './OnboardingScreen.styles';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

interface OnboardingSlide {
  id: number;
  image: any;
}

import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../../assets/images/onboarding_1.jpeg'),
  },
  {
    id: 2,
    image: require('../../assets/images/onboarding_2.jpeg'),
  },
  {
    id: 3,
    image: require('../../assets/images/onboarding_3.jpeg'),
  },
  {
    id: 4,
    image: require('../../assets/images/onboarding_4.jpeg'),
  },
  {
    id: 5,
    image: require('../../assets/images/onboarding_5.jpeg'),
  },
  {
    id: 6,
    image: require('../../assets/images/onboarding_6.jpeg'),
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    currentIndex,
    flatListRef,
    handleSkip,
    handleScroll,
    handleScrollEnd,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useOnboardingScreenContainer({
    onNavigate,
    slidesLength: ONBOARDING_SLIDES.length,
  });

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    // 투명한 슬라이드 - 배경은 상단에서 처리
    return (
      <View style={styles.slideContainer} />
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip 버튼 */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={require('../../assets/images/background.png')}
          style={styles.skipButtonBackground}
          resizeMode="cover"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </ImageBackground>
      </TouchableOpacity>

      <ImageBackground
        source={ONBOARDING_SLIDES[currentIndex].image}
        style={styles.imageBackground}
        resizeMode="contain"
        accessibilityLabel="온보딩 배경 이미지"
      >
        {/* 슬라이드 - 투명하게 처리하여 스와이프만 가능하게 */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => String(item.id)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          style={styles.transparentFlatList}
        />
      </ImageBackground>
    </View>
  );
};

export default OnboardingScreen;
