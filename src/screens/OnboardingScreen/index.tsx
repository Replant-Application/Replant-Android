import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useOnboardingScreenContainer } from './OnboardingScreen.container';
import { styles } from './OnboardingScreen.styles';
import { SkipNextIcon } from '../../components/ui/icon/SkipNextIcon';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

interface OnboardingSlide {
  id: number;
  image: any;
  /** 이미지에 담긴 문구 (접근성 대체텍스트) */
  accessibilityLabel?: string;
  /** 슬라이드 텍스트 멘트 */
  text: string;
  /** 이모지 (선택사항) */
  emoji?: string;
}

import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../../assets/images/onboarding_1.png'),
    accessibilityLabel: 'RePlant 오늘의 나를 키우는 시간',
    text: '오늘의 작은 실천으로 성장의 흔적을 남겨보세요!',
    emoji: '🌱',
  },
  {
    id: 2,
    image: require('../../assets/images/onboarding_2.png'),
    accessibilityLabel: '캐릭터 성장: 오늘의 작은 실천으로 성장의 흔적을 남겨보세요',
    text: '주어진 미션으로 나만의 하루를 만들어보세요!',
  },
  {
    id: 3,
    image: require('../../assets/images/onboarding_3.png'),
    accessibilityLabel: '오늘의 공식 미션: 주어진 미션으로 나만의 하루를 만들어 보세요',
    text: '내가 만든 미션을 하나씩 완수해보는 재미',
    emoji: '🎯',
  },
  {
    id: 4,
    image: require('../../assets/images/onboarding_4.png'),
    accessibilityLabel: '나만의 미션: 내가 만든 미션을 하나씩 완수해보는 재미',
    text: '완료한 미션을 인증하고 따뜻한 응원을 받으세요',
    emoji: '⭐',
  },
  {
    id: 5,
    image: require('../../assets/images/onboarding_5.png'),
    accessibilityLabel: '미션 인증: 완료한 미션을 인증하고 따뜻한 응원을 받으세요',
    text: '오늘 하루는 어땠나요? 당신의 마음을 적어보아요',
    emoji: '🌙',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    currentIndex,
    flatListRef,
    handleSkip,
    handleStart,
    handleScroll,
    onViewableItemsChanged,
    viewabilityConfig,
    goToPrev,
    goToNext,
  } = useOnboardingScreenContainer({
    onNavigate,
    slidesLength: ONBOARDING_SLIDES.length,
  });

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slideContainer}>
        <Image
          source={item.image}
          style={styles.slideImage}
          resizeMode="contain"
          accessibilityLabel={item.accessibilityLabel ?? '온보딩 소개 이미지'}
        />
        <View style={styles.textContainer}>
          {item.emoji && (
            <Text style={styles.emoji}>{item.emoji}</Text>
          )}
          <Text style={styles.slideText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip 버튼 */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          console.log('[OnboardingScreen] 스킵 버튼 onPress 호출됨');
          handleSkip();
        }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="건너뛰기"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <SkipNextIcon size={28} />
      </TouchableOpacity>

      {/* 슬라이드 이미지 */}
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.flatList}
      />

      {/* 페이지네이션 점들 */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* 시작하기 버튼 */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="화면 시작하기"
      >
        <Text style={styles.startButtonText}>
          시작하기
        </Text>
      </TouchableOpacity>

      {/* 왼쪽 터치 영역 (이전 슬라이드) */}
      {currentIndex > 0 && (
        <TouchableOpacity
          style={styles.leftTouchArea}
          onPress={goToPrev}
          activeOpacity={1}
        />
      )}

      {/* 오른쪽 터치 영역 (다음 슬라이드) */}
      <TouchableOpacity
        style={styles.rightTouchArea}
        onPress={goToNext}
        activeOpacity={1}
      />
    </View>
  );
};

export default OnboardingScreen;
