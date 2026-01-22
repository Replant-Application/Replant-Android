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
  const previousScrollOffset = useRef(0);

  // Skip 버튼 클릭 처리
  const handleSkip = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.LOGIN as string);
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

  /**
   * 스크롤이 끝났을 때 마지막 화면에서 오른쪽 스와이프를 했는지 확인하고 자동으로 넘어가기
   */
  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    const scrollDirection = offsetX > previousScrollOffset.current ? 'right' : 'left';

    previousScrollOffset.current = offsetX;

    // 마지막 화면에서 오른쪽으로 스와이프한 경우에만 자동으로 넘어가기
    if (newIndex === slidesLength - 1 && scrollDirection === 'right') {
      setTimeout(() => {
        handleStart();
      }, 500); // 스와이프 애니메이션이 완료될 시간을 주기
    }
  };

  return {
    currentIndex,
    flatListRef,
    scrollX,
    handleSkip,
    handleStart,
    handleScroll,
    handleScrollEnd,
    onViewableItemsChanged,
    viewabilityConfig,
  };
};
