import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Animated,
} from 'react-native';
import { colors } from '../../utils/designTokens';
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
    scrollX,
    handleSkip,
    handleStart,
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

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: [
              colors.primary[300],
              colors.primary[600],
              colors.primary[300],
            ],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <ImageBackground
      source={ONBOARDING_SLIDES[currentIndex].image}
      style={styles.container}
      resizeMode="cover"
      accessibilityLabel="온보딩 배경 이미지"
    >
      {/* Skip/Start 버튼 */}
      {currentIndex < ONBOARDING_SLIDES.length - 1 ? (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip} 
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>✕</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleStart} 
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      )}

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

      {/* 페이지 인디케이터 */}
      <View style={styles.paginationWrapper}>
        {renderPagination()}
      </View>
    </ImageBackground>
  );
};

export default OnboardingScreen;
