import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { spacing, typography, colors, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { setOnboardingCompleted } from '../../services/onboardingService';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

interface OnboardingSlide {
  id: number;
  image: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const previousScrollOffset = useRef(0);

  const handleSkip = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  const handleStart = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.LOGIN as string);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

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
    if (newIndex === ONBOARDING_SLIDES.length - 1 && scrollDirection === 'right') {
      setTimeout(() => {
        handleStart();
      }, 500); // 스와이프 애니메이션이 완료될 시간을 주기
    }
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.white,
  },
  transparentFlatList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    right: spacing[6],
    zIndex: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44, // 최소 터치 영역 확보 (iOS 가이드라인: 44x44)
    minWidth: 44, // 최소 너비 확보 (X 기호용)
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
    fontWeight: typography.fontWeight.medium,
  },
  startButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontWeight: typography.fontWeight.medium,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  paginationWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? spacing[12] + 8 : spacing[8],
    left: 0,
    right: 0,
    zIndex: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default OnboardingScreen;
