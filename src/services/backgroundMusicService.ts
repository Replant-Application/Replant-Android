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
      // 볼륨이 0이면 재생하지 않음
      if (this.currentVolume <= 0) {
        return;
      }

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
    } catch (error: any) {
      // 오디오 포커스 획득 실패 에러는 무시 (앱이 백그라운드에 있을 때 발생할 수 있음)
      const errorMessage = error?.message || error?.toString() || '';
      const isAudioFocusError = 
        errorMessage.includes('AudioFocusNotAcquiredException') ||
        errorMessage.includes('audio focus could not be acquired') ||
        errorMessage.includes('currently in the background');
      
      if (!isAudioFocusError) {
        console.error('[BackgroundMusic] 재생 실패:', error);
      } else {
        // 오디오 포커스 에러는 조용히 무시 (정상적인 상황일 수 있음)
        console.log('[BackgroundMusic] 오디오 포커스 획득 실패 (백그라운드 상태)');
      }
    }
  }

  /**
   * 배경음악 정지
   */
  async stop() {
    // 메인 스레드에서 실행되도록 보장
    return new Promise<void>((resolve) => {
      // setTimeout을 사용하여 메인 스레드에서 실행 보장
      setTimeout(async () => {
        try {
          if (this.currentSound && this.isPlaying) {
            // pause만 하고 position 리셋은 하지 않음 (스레드 에러 방지)
            await this.currentSound.pauseAsync();
            this.isPlaying = false;
            this.currentSound = null;
          }
        } catch (error: any) {
          // ExoPlayer 스레드 에러 및 플레이어 존재하지 않음 에러는 무시
          // (앱 종료 시 또는 플레이어가 이미 해제된 경우 발생할 수 있는 알려진 이슈)
          const errorMessage = error?.message || error?.toString() || '';
          const isThreadError = 
            errorMessage.includes('wrong thread') ||
            errorMessage.includes('mqt_native_modules') ||
            errorMessage.includes('onHostDestroy') ||
            errorMessage.includes('ExoPlayerImpl') ||
            errorMessage.includes('Player does not exist') ||
            errorMessage.includes('does not exist');
          
          if (!isThreadError) {
            console.error('[BackgroundMusic] 정지 실패:', error);
          }
          
          // 에러 발생 시에도 상태는 초기화
          this.isPlaying = false;
          this.currentSound = null;
        }
        resolve();
      }, 0);
    });
  }

  /**
   * 볼륨 설정
   */
  async setVolume(volume: number) {
    this.currentVolume = volume;
    try {
      // 볼륨이 0이면 음악 정지
      if (volume <= 0) {
        await this.stop();
        return;
      }

      // 볼륨이 0보다 크면 볼륨 적용
      if (this.backgroundSound) {
        await this.backgroundSound.setVolumeAsync(volume);
      }
      if (this.nightSound) {
        await this.nightSound.setVolumeAsync(volume);
      }

      // 볼륨이 0에서 0보다 큰 값으로 변경되면 현재 화면에 맞는 음악 재생
      if (!this.isPlaying && this.currentScreen) {
        await this._playForScreenInternal(this.currentScreen);
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
   * 주의: 앱 종료 시 호출하면 ExoPlayer 스레드 에러가 발생할 수 있으므로
   * 가능하면 호출하지 않는 것을 권장합니다.
   */
  async unload() {
    // 메인 스레드에서 실행되도록 보장
    return new Promise<void>((resolve) => {
      // setTimeout을 사용하여 메인 스레드에서 실행 보장
      setTimeout(async () => {
        try {
          // stop만 호출하고 unload는 호출하지 않음 (스레드 에러 방지)
          await this.stop();
          
          // 리소스는 null로만 설정 (실제 unload는 하지 않음)
          // 앱 종료 시 OS가 자동으로 정리함
          this.backgroundSound = null;
          this.nightSound = null;
          this.currentSound = null;
        } catch (error: any) {
          // 모든 에러 무시 (앱 종료 시 발생할 수 있는 알려진 이슈)
          // 에러 로그도 출력하지 않음 (RedBox 방지)
        }
        resolve();
      }, 0);
    });
  }
}

export const backgroundMusicService = new BackgroundMusicService();
