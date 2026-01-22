import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
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
    <View style={styles.container}>
      {/* 배경 이미지 - 각 슬라이드의 배경 */}
      <Image 
        source={ONBOARDING_SLIDES[currentIndex].image} 
        style={styles.fullScreenImage} 
        resizeMode="cover" 
        accessibilityLabel="온보딩 배경 이미지"
      />
      
      {/* Skip/Start 버튼 */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={currentIndex < ONBOARDING_SLIDES.length - 1 ? handleSkip : handleStart} 
        activeOpacity={0.8}
      >
        <Text style={styles.skipButtonText}>
          {currentIndex < ONBOARDING_SLIDES.length - 1 ? '건너뛰기' : '시작하기'}
        </Text>
      </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 0,
  },
  transparentFlatList: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    right: spacing[6],
    zIndex: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44, // 최소 터치 영역 확보 (iOS 가이드라인: 44x44)
    minWidth: 80, // 최소 너비 확보
  },
  skipButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
    letterSpacing: 0.2,
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
