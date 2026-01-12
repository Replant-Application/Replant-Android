/**
 * 사운드 재생 유틸리티
 * 각종 UI 상호작용에 대한 사운드 효과 제공
 */

import { Audio } from 'expo-av';
import { loadSoundSettings } from './soundSettings';

/**
 * 사운드 재생 함수
 * @param soundPath 사운드 파일 경로 (require로 가져온 모듈)
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 1.0)
 */
export const playSound = async (
  soundPath: any,
  volume: number = 1.0
): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundPath, {
      shouldPlay: true,
      volume: volume,
    });
    
    // 재생 완료 후 자동으로 해제
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        // 메인 스레드에서 실행되도록 보장하고 에러 무시
        setTimeout(() => {
          sound.unloadAsync().catch((error) => {
            // ExoPlayer 스레드 에러는 무시 (앱 종료 시 발생할 수 있는 알려진 이슈)
            if (!error?.message?.includes('wrong thread')) {
              console.error('[SoundUtils] 사운드 해제 실패:', error);
            }
          });
        }, 0);
      }
    });
  } catch (error) {
    console.error('[SoundUtils] 사운드 재생 실패:', error);
  }
};

/**
 * 캐릭터 터치 사운드 재생
 */
export const playTouchSound = async (): Promise<void> => {
  try {
    const settings = await loadSoundSettings();
    // 볼륨이 0이면 재생하지 않음
    if (settings.effectVolume <= 0) return;
    await playSound(require('../assets/sounds/touch_sound.mp3'), settings.effectVolume);
  } catch (error) {
    await playSound(require('../assets/sounds/touch_sound.mp3'), 1.0);
  }
};

/**
 * 책 읽기 사운드 재생
 */
export const playReadBookSound = async (): Promise<void> => {
  try {
    const settings = await loadSoundSettings();
    // 볼륨이 0이면 재생하지 않음
    if (settings.effectVolume <= 0) return;
    await playSound(require('../assets/sounds/read_book.mp3'), settings.effectVolume);
  } catch (error) {
    await playSound(require('../assets/sounds/read_book.mp3'), 1.0);
  }
};

/**
 * 버튼 클릭 사운드 재생
 */
export const playButtonSound = async (): Promise<void> => {
  try {
    const settings = await loadSoundSettings();
    // 볼륨이 0이면 재생하지 않음
    if (settings.effectVolume <= 0) return;
    await playSound(require('../assets/sounds/right_sound.mp3'), settings.effectVolume);
  } catch (error) {
    await playSound(require('../assets/sounds/right_sound.mp3'), 1.0);
  }
};
