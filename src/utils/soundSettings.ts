/**
 * 소리 설정 저장/로드 유틸리티
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_SETTINGS_KEY = 'soundSettings';

export interface SoundSettings {
  effectVolume: number; // 효과음 볼륨 (0.0 ~ 1.0)
  backgroundVolume: number; // 배경소리 볼륨 (0.0 ~ 1.0)
}

/** 접근성 3.4: 3초 이상 배경음 자동재생 금지. 기본 OFF, 설정에서 켜기 전까지 재생하지 않음 */
const DEFAULT_SETTINGS: SoundSettings = {
  effectVolume: 1.0,
  backgroundVolume: 0,
};

/**
 * 소리 설정 저장
 */
export const saveSoundSettings = async (settings: SoundSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[SoundSettings] 저장 실패:', error);
  }
};

/**
 * 소리 설정 로드
 */
export const loadSoundSettings = async (): Promise<SoundSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      return {
        effectVolume: settings.effectVolume ?? DEFAULT_SETTINGS.effectVolume,
        backgroundVolume: settings.backgroundVolume ?? DEFAULT_SETTINGS.backgroundVolume,
      };
    }
  } catch (error) {
    console.error('[SoundSettings] 로드 실패:', error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * 기본 설정 반환
 */
export const getDefaultSoundSettings = (): SoundSettings => {
  return { ...DEFAULT_SETTINGS };
};
