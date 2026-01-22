/**
 * 돌발 미션 설정 온보딩 화면
 * 신규 가입자의 기상, 취침, 식사 시간을 설정합니다.
 * 스텝별로 하나씩 입력하는 온보딩 형식
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { Header, AlertModal } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  useSpontaneousMissionSetupScreenContainer,
  STEPS,
  STEP_CONFIG,
  TimeState,
} from './SpontaneousMissionSetupScreen.container';

interface SpontaneousMissionSetupScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'SpontaneousMissionSetup'>;
}

const SpontaneousMissionSetupScreen: React.FC<SpontaneousMissionSetupScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    isEditMode,
    safeNavigation,
    currentStep,
    currentStepKey,
    stepConfig,
    currentTime,
    loading,
    initialLoading,
    alertModal,
    setCurrentTime,
    handleNext,
    handlePrev,
    handleSubmit,
    handleCloseAlert,
  } = useSpontaneousMissionSetupScreenContainer({ navigation, route });
  
  const ITEM_HEIGHT = 50;
  const VISIBLE_ITEMS = 5;

  // 휠 피커 컴포넌트 (갤럭시 스타일)
  const WheelPicker = ({
    value,
    options,
    onSelect,
    width,
  }: {
    value: string | number;
    options: Array<{ label: string; value: string | number }>;
    onSelect: (value: string | number) => void;
    width?: number;
  }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedIndex, setSelectedIndex] = useState(() => {
      const index = options.findIndex(opt => opt.value === value);
      return index >= 0 ? index : 0;
    });

    useEffect(() => {
      const index = options.findIndex(opt => opt.value === value);
      if (index >= 0 && index !== selectedIndex) {
        setSelectedIndex(index);
        scrollToIndex(index, false);
      }
    }, [value]);

    const scrollToIndex = (index: number, animated: boolean = true) => {
      if (scrollViewRef.current) {
        const y = index * ITEM_HEIGHT;
        scrollViewRef.current.scrollTo({ y, animated });
      }
    };

    const handleScroll = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      
      if (clampedIndex !== selectedIndex) {
        setSelectedIndex(clampedIndex);
        onSelect(options[clampedIndex].value);
      }
    };

    const handleScrollEnd = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      scrollToIndex(clampedIndex, true);
    };

    useEffect(() => {
      scrollToIndex(selectedIndex, false);
    }, []);

    return (
      <View style={[styles.wheelPickerContainer, width && { width }]}>
        {/* 선택 영역 표시 */}
        <View style={styles.wheelPickerSelection} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.wheelPickerScrollView}
          contentContainerStyle={styles.wheelPickerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {/* 상단 패딩 */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          {options.map((option, index) => {
            const distance = Math.abs(index - selectedIndex);
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.2;
            const scale = distance === 0 ? 1 : 0.9;
            const fontSize = distance === 0 ? typography.fontSize['2xl'] : typography.fontSize.lg;
            
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.wheelPickerItem,
                  { height: ITEM_HEIGHT, opacity, transform: [{ scale }] }
                ]}
                onPress={() => {
                  scrollToIndex(index, true);
                  setSelectedIndex(index);
                  onSelect(option.value);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.wheelPickerItemText, { fontSize }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* 하단 패딩 */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  // 드롭다운 컴포넌트 (레거시 - 제거 예정)
  const Dropdown = ({
    value,
    options,
    onSelect,
    isOpen,
    onToggle,
    width,
  }: {
    value: string | number;
    options: Array<{ label: string; value: string | number }>;
    onSelect: (value: string | number) => void;
    isOpen: boolean;
    onToggle: () => void;
    width?: number;
  }) => (
    <View style={[styles.dropdownContainer, width && { width }]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {isOpen && (
        <View 
          style={styles.dropdownList}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <ScrollView
            style={styles.dropdownScrollView}
            contentContainerStyle={styles.dropdownScrollContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(option.value);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (initialLoading && isEditMode) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </ImageBackground>
    );
  }

  // 렌더링 전 안전성 검사
  if (!stepConfig || !currentStepKey) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>초기화 중...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="돌발 미션 설정"
          navigation={safeNavigation}
          showBorder={false}
          showBackButton={isEditMode}
          titleStyle={styles.headerTitle}
        />

        <View style={styles.contentTouchable}>
          <View style={styles.content}>
            {/* 진행 표시 */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {currentStep + 1} / {STEPS.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* 스텝 내용 */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>{stepConfig.title}</Text>
              <Text style={styles.stepDescription}>{stepConfig.description}</Text>

              <View style={styles.timeInputContainer}>
                <View style={styles.timePickerWrapper}>
                  <View style={styles.timePickerRow}>
                    {/* AM/PM */}
                    <WheelPicker
                      value={currentTime.period}
                      options={[
                        { label: '오전', value: 'AM' },
                        { label: '오후', value: 'PM' },
                      ]}
                      onSelect={(value) => {
                        if (value === 'AM' || value === 'PM') {
                          setCurrentTime({ ...currentTime, period: value });
                        }
                      }}
                      width={80}
                    />

                    {/* 시 */}
                    <WheelPicker
                      value={currentTime.hour}
                      options={Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => ({
                        label: `${hour}`,
                        value: hour,
                      }))}
                      onSelect={(value) => {
                        setCurrentTime({ ...currentTime, hour: value as number });
                      }}
                      width={60}
                    />

                    {/* 콜론 */}
                    <View style={styles.timeSeparator}>
                      <Text style={styles.timeSeparatorText}>:</Text>
                    </View>

                    {/* 분 */}
                    <WheelPicker
                      value={currentTime.minute}
                      options={Array.from({ length: 60 }, (_, i) => i).map((minute) => ({
                        label: minute < 10 ? `0${minute}` : `${minute}`,
                        value: minute,
                      }))}
                      onSelect={(value) => {
                        setCurrentTime({ ...currentTime, minute: value as number });
                      }}
                      width={60}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePrev}
                activeOpacity={0.7}
              >
                <Text style={styles.prevButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                loading && styles.nextButtonDisabled,
                currentStep === 0 && styles.nextButtonFull,
              ]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {loading
                  ? isEditMode
                    ? '수정 중...'
                    : '저장 중...'
                  : currentStep === STEPS.length - 1
                  ? isEditMode
                    ? '수정 완료'
                    : '완료'
                  : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onClose={handleCloseAlert}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  contentTouchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingTop: spacing[6],
    justifyContent: 'flex-start',
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  stepContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize['2xl']),
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
  },
  timeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    paddingHorizontal: spacing[2],
  },
  timeSeparatorText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  wheelPickerContainer: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelPickerSelection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.sm,
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelPickerScrollView: {
    flex: 1,
  },
  wheelPickerContent: {
    paddingVertical: 0,
  },
  wheelPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  wheelPickerItemText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlign: 'center',
  },
  timePickerWrapper: {
    width: '100%',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownWrapperOpen: {
    zIndex: 1000,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    minHeight: 48,
    minWidth: 80,
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownArrow: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    marginTop: spacing[1],
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
    flexGrow: 0,
  },
  dropdownScrollContent: {
    paddingVertical: spacing[1],
  },
  dropdownItem: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  buttonContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  prevButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});

export default SpontaneousMissionSetupScreen;
