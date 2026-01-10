/**
 * 온보딩 서비스
 * 첫 실행 여부를 체크하고 온보딩 완료 상태를 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@replant:onboardingCompleted';

/**
 * 온보딩 완료 여부 확인
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
};

/**
 * 온보딩 완료 표시
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
  }
};

/**
 * 온보딩 상태 초기화 (테스트용)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding status:', error);
  }
};
