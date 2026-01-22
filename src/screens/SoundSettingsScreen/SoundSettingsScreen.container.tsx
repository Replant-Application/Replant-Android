/**
 * SoundSettingsScreen 비즈니스 로직
 * 사운드 설정 로드, 저장 및 볼륨 관리
 */

import { useState, useEffect } from 'react';
import {
  saveSoundSettings,
  loadSoundSettings,
  getDefaultSoundSettings,
  SoundSettings,
} from '../../utils/soundSettings';
import { backgroundMusicService } from '../../services/backgroundMusicService';
import { playButtonSound } from '../../utils/soundUtils';

/**
 * 볼륨 값 검증 (0.0 ~ 1.0 범위)
 */
const validateVolume = (volume: number): number => {
  if (volume < 0) return 0;
  if (volume > 1) return 1;
  return volume;
};

/**
 * SoundSettingsScreen Container Hook
 * 비즈니스 로직을 처리하고 UI에 필요한 데이터와 핸들러를 제공
 */
export const useSoundSettingsScreenContainer = () => {
  const [settings, setSettings] = useState<SoundSettings>(getDefaultSoundSettings());

  // 초기 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await loadSoundSettings();
    setSettings(loadedSettings);
    // 배경음악 서비스에 볼륨 적용
    await backgroundMusicService.setVolume(loadedSettings.backgroundVolume);
  };

  // 효과음 음소거 토글
  const handleEffectMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.effectVolume === 0 ? 1.0 : 0;
    const newSettings = { ...settings, effectVolume: newVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
  };

  // 배경소리 음소거 토글
  const handleBackgroundMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.backgroundVolume === 0 ? 0.5 : 0;
    const newSettings = { ...settings, backgroundVolume: newVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    await backgroundMusicService.setVolume(newVolume);
  };

  // 효과음 볼륨 변경 핸들러
  const handleEffectVolumeChange = async (value: number) => {
    const validatedVolume = validateVolume(value);
    const newSettings = { ...settings, effectVolume: validatedVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
  };

  // 배경소리 볼륨 변경 핸들러
  const handleBackgroundVolumeChange = async (value: number) => {
    const validatedVolume = validateVolume(value);
    const newSettings = { ...settings, backgroundVolume: validatedVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    // 실시간으로 배경음악 볼륨 적용
    await backgroundMusicService.setVolume(validatedVolume);
  };

  // 기본값으로 초기화
  const handleReset = async () => {
    const defaultSettings = getDefaultSoundSettings();
    setSettings(defaultSettings);
    await saveSoundSettings(defaultSettings);
    await backgroundMusicService.setVolume(defaultSettings.backgroundVolume);
  };

  // 초기화 버튼 클릭 핸들러 (사운드 재생 포함)
  const handleResetWithSound = async () => {
    await playButtonSound();
    await handleReset();
  };

  return {
    settings,
    handleEffectMuteToggle,
    handleBackgroundMuteToggle,
    handleEffectVolumeChange,
    handleBackgroundVolumeChange,
    handleResetWithSound,
  };
};
