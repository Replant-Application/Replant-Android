/**
 * 배경음악 서비스
 * 화면별로 다른 배경음악을 재생
 */

import { Audio } from 'expo-av';
import { Platform, InteractionManager } from 'react-native';

class BackgroundMusicService {
  private backgroundSound: Audio.Sound | null = null;
  private nightSound: Audio.Sound | null = null;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentScreen: string | null = null;
  private currentVolume: number = 0.5;

  /**
   * 배경음악 초기화
   */
  async initialize() {
    try {
      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // 소리 설정 로드
      try {
        const { loadSoundSettings } = require('../utils/soundSettings');
        const settings = await loadSoundSettings();
        this.currentVolume = settings.backgroundVolume;
      } catch (error) {
        console.error('[BackgroundMusic] 설정 로드 실패:', error);
        this.currentVolume = 0.5;
      }

      // 배경음악 로드
      const { sound: backgroundSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/background_sound.mp3'),
        { isLooping: true, volume: this.currentVolume }
      );
      this.backgroundSound = backgroundSound;

      // 밤 배경음악 로드
      const { sound: nightSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/night_sound.mp3'),
        { isLooping: true, volume: this.currentVolume }
      );
      this.nightSound = nightSound;
    } catch (error) {
      console.error('[BackgroundMusic] 초기화 실패:', error);
    }
  }

  /**
   * 화면 변경에 따른 배경음악 재생
   */
  async playForScreen(screenName: string) {
    // 메인 스레드에서 실행되도록 보장
    InteractionManager.runAfterInteractions(() => {
      this._playForScreenInternal(screenName);
    });
  }

  private async _playForScreenInternal(screenName: string) {
    this.currentScreen = screenName;

    try {
      // 감정일기 화면이면 night_sound, 나머지는 background_sound
      const shouldPlayNightSound = screenName === 'Diary' || screenName === 'EmotionDiary';
      
      // 현재 재생 중인 음악 확인
      const currentlyPlayingNight = this.currentSound === this.nightSound && this.isPlaying;
      const currentlyPlayingBackground = this.currentSound === this.backgroundSound && this.isPlaying;

      // 이미 올바른 음악이 재생 중이면 재생하지 않음
      if (shouldPlayNightSound && currentlyPlayingNight) {
        return;
      }
      if (!shouldPlayNightSound && currentlyPlayingBackground) {
        return;
      }

      // 다른 타입의 음악이 재생 중이면 정지
      if (this.currentSound && this.isPlaying) {
        await this.stop();
      }

      // 새로운 음악 재생
      if (shouldPlayNightSound) {
        if (this.nightSound) {
          await this.nightSound.playAsync();
          this.currentSound = this.nightSound;
          this.isPlaying = true;
        }
      } else {
        if (this.backgroundSound) {
          await this.backgroundSound.playAsync();
          this.currentSound = this.backgroundSound;
          this.isPlaying = true;
        }
      }
    } catch (error) {
      console.error('[BackgroundMusic] 재생 실패:', error);
    }
  }

  /**
   * 배경음악 정지
   */
  async stop() {
    // 메인 스레드에서 실행되도록 보장
    return new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          if (this.currentSound && this.isPlaying) {
            // pause만 하고 position 리셋은 하지 않음 (스레드 에러 방지)
            await this.currentSound.pauseAsync();
            this.isPlaying = false;
            this.currentSound = null;
          }
        } catch (error) {
          console.error('[BackgroundMusic] 정지 실패:', error);
        }
        resolve();
      });
    });
  }

  /**
   * 볼륨 설정
   */
  async setVolume(volume: number) {
    this.currentVolume = volume;
    try {
      if (this.backgroundSound) {
        await this.backgroundSound.setVolumeAsync(volume);
      }
      if (this.nightSound) {
        await this.nightSound.setVolumeAsync(volume);
      }
    } catch (error) {
      console.error('[BackgroundMusic] 볼륨 설정 실패:', error);
    }
  }

  /**
   * 현재 볼륨 가져오기
   */
  getVolume(): number {
    return this.currentVolume;
  }

  /**
   * 리소스 해제
   */
  async unload() {
    // 메인 스레드에서 실행되도록 보장
    return new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await this.stop();
          
          if (this.backgroundSound) {
            await this.backgroundSound.unloadAsync();
            this.backgroundSound = null;
          }
          
          if (this.nightSound) {
            await this.nightSound.unloadAsync();
            this.nightSound = null;
          }
        } catch (error) {
          console.error('[BackgroundMusic] 해제 실패:', error);
        }
        resolve();
      });
    });
  }
}

export const backgroundMusicService = new BackgroundMusicService();
