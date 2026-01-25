/**
 * 돌발 미션 설정 온보딩 화면
 * 신규 가입자의 기상, 취침, 식사 시간을 설정합니다.
 * 스텝별로 하나씩 입력하는 온보딩 형식
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { Header, AlertModal, WheelPicker } from '../../components/ui';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  useSpontaneousMissionSetupScreenContainer,
  STEPS,
  STEP_CONFIG,
  TimeState,
} from './SpontaneousMissionSetupScreen.container';
import { styles } from './SpontaneousMissionSetupScreen.styles';

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
        accessibilityElementsHidden={true}
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
        accessibilityElementsHidden={true}
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
      accessibilityElementsHidden={true}
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


export default SpontaneousMissionSetupScreen;
