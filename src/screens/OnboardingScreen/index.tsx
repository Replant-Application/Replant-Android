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
import { spacing, typography, colors, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { setOnboardingCompleted } from '../../services/onboardingService';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

interface OnboardingSlide {
  id: number;
  image: any;
  title: string;
  description: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../../assets/images/Replant_Loading.png'),
    title: 'Replant에 오신 것을 환영합니다',
    description: '다시 살아갈 당신에게 희망을 🍀',
  },
  {
    id: 2,
    image: require('../../assets/images/onboarding_mission.png'),
    title: '간단한 미션으로 시작하는 변화',
    description: '매일 간단한 미션을 완료하며 성장해요',
  },
  {
    id: 3,
    image: require('../../assets/images/onboarding_community.png'),
    title: '함께 성장하는 커뮤니티',
    description: '다른 사용자들과 경험을 공유하며 함께 성장해요',
  },
  {
    id: 4,
    image: require('../../assets/images/onboarding_diary.png'),
    title: '하루하루를 기록하며 성장하기',
    description: '일기를 작성하며 감정과 생각을 정리해요',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSkip = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.START as string);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    await setOnboardingCompleted();
    onNavigate(SCREEN_NAMES.START as string);
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

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    // 스크린샷 이미지인지 확인 (id가 2, 3, 4인 경우)
    const isScreenshot = index >= 1 && index <= 3;
    
    return (
      <View style={styles.slideContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <View style={styles.imageContainer}>
          {isScreenshot ? (
            <View style={styles.screenshotFrame}>
              <Image source={item.image} style={styles.screenshotImage} resizeMode="cover" />
            </View>
          ) : (
            <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
          )}
        </View>
      </View>
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
            outputRange: [0.3, 1, 0.3],
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
      {/* Skip 버튼 */}
      {currentIndex < ONBOARDING_SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      {/* 슬라이드 */}
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
      />

      {/* 페이지 인디케이터 */}
      {renderPagination()}

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        {currentIndex < ONBOARDING_SLIDES.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: spacing[6],
    zIndex: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 40,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.2,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'ios' ? 110 : 100, // 건너뛰기 버튼과 제목 사이 여백 추가
    paddingBottom: 0,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing[2], // 가로 여백 줄여서 텍스트 범위 넓힘
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: -spacing[2], // 설명과 스크린샷 사이 여백 줄임
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  slideImage: {
    width: SCREEN_WIDTH * 0.85,
    height: (SCREEN_WIDTH * 0.85) * (2400 / 1080) * 0.65,
    borderRadius: 0,
  },
  screenshotFrame: {
    width: SCREEN_WIDTH * 0.62, // 너비를 62%로 살짝 줄임
    height: (SCREEN_WIDTH * 0.62) * (2400 / 1080), // 비율 유지하면서 전체 크기 조정
    borderRadius: borderRadius.lg,
    borderWidth: 8,
    borderColor: colors.gray[800],
    overflow: 'hidden',
    backgroundColor: colors.gray[800],
    ...shadows.lg,
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // cover로 변경하여 프레임을 채우도록
  },
  title: {
    fontSize: typography.fontSize.xl, // 2xl에서 xl로 줄임
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
    letterSpacing: 0.3,
    fontWeight: typography.fontWeight.medium,
    paddingHorizontal: spacing[2], // 가로 범위 넓힘
  },
  description: {
    fontSize: typography.fontSize.sm, // base에서 sm으로 줄임
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    letterSpacing: 0.2,
    paddingHorizontal: spacing[4], // 가로 범위 넓힘
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
  },
  buttonContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[14], // 하단바 여백 고려하여 더 위로 올림
    paddingTop: 0, // 스크린샷과 버튼 사이 여백 제거
  },
  nextButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
    letterSpacing: 0.5,
    fontWeight: typography.fontWeight.medium,
  },
  startButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
    letterSpacing: 0.5,
    fontWeight: typography.fontWeight.medium,
  },
});

export default OnboardingScreen;
