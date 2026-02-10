/**
 * OnboardingScreen 비즈니스 로직
 * 온보딩 완료 처리 및 스크롤 상태 관리
 */

import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { SCREEN_NAMES } from '../../utils/constants';
import { setOnboardingCompleted } from '../../services/onboardingService';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenContainerProps {
  onNavigate: (screen: string) => void;
  slidesLength: number;
}

/**
 * OnboardingScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useOnboardingScreenContainer = ({
  onNavigate,
  slidesLength,
}: OnboardingScreenContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Skip 버튼 클릭 처리
  const handleSkip = async () => {
    try {
      console.log('[OnboardingScreen] 스킵 버튼 클릭됨');
      await setOnboardingCompleted();
      console.log('[OnboardingScreen] 온보딩 완료 상태 저장됨');
      console.log('[OnboardingScreen] 로그인 화면으로 이동:', SCREEN_NAMES.LOGIN);
      onNavigate(SCREEN_NAMES.LOGIN as string);
    } catch (error) {
      console.error('[OnboardingScreen] 스킵 버튼 처리 오류:', error);
    }
  };

  // Start 버튼 클릭 처리
  const handleStart = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // 보이는 아이템 변경 핸들러
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // 이전 슬라이드로 이동 (스와이프 대체)
  const goToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToOffset({
        offset: (currentIndex - 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  // 다음 슬라이드로 이동 (스와이프 대체)
  const goToNext = () => {
    if (currentIndex < slidesLength - 1) {
      flatListRef.current?.scrollToOffset({
        offset: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  return {
    currentIndex,
    flatListRef,
    scrollX,
    handleSkip,
    handleStart,
    handleScroll,
    onViewableItemsChanged,
    viewabilityConfig,
    goToPrev,
    goToNext,
  };
};
