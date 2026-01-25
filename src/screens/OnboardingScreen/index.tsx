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
  /** 이미지에 담긴 문구 (접근성 대체텍스트) */
  accessibilityLabel?: string;
}

import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../../assets/images/onboarding_1.jpeg'),
    accessibilityLabel: 'RePlant 오늘의 나를 키우는 시간',
  },
  {
    id: 2,
    image: require('../../assets/images/onboarding_2.jpeg'),
    accessibilityLabel: '캐릭터 성장: 오늘의 작은 실천으로 성장의 흔적을 남겨보세요',
  },
  {
    id: 3,
    image: require('../../assets/images/onboarding_3.jpeg'),
    accessibilityLabel: '오늘의 공식 미션: 주어진 미션으로 나만의 하루를 만들어 보세요',
  },
  {
    id: 4,
    image: require('../../assets/images/onboarding_4.jpeg'),
    accessibilityLabel: '나만의 미션: 내가 만든 미션을 하나씩 완수해보는 재미',
  },
  {
    id: 5,
    image: require('../../assets/images/onboarding_5.jpeg'),
    accessibilityLabel: '미션 인증: 완료한 미션을 인증하고 따뜻한 응원을 받으세요',
  },
  {
    id: 6,
    image: require('../../assets/images/onboarding_6.jpeg'),
    accessibilityLabel: '감정일기: 오늘의 하루는 어땠나요? 당신의 하루를 적어보세요',
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

  const renderSlide = ({ item: _item }: { item: OnboardingSlide }) => {
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
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      <ImageBackground
        source={ONBOARDING_SLIDES[currentIndex].image}
        style={styles.imageBackground}
        resizeMode="cover"
        accessibilityLabel={ONBOARDING_SLIDES[currentIndex].accessibilityLabel ?? '온보딩 소개 이미지'}
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
