/**
 * Amplitude Analytics 서비스
 * Amplitude 이벤트 추적 및 세션 리플레이 관리
 */

import { init, track, identify, setUserId as amplitudeSetUserId, Identify, add } from '@amplitude/analytics-react-native';
import { SessionReplayPlugin, SessionReplayConfig } from '@amplitude/plugin-session-replay-react-native';

const AMPLITUDE_API_KEY = 'de3d2c3b9c4a94952c91e3221fd74bb0';

let isInitialized = false;
let sessionReplayPlugin: SessionReplayPlugin | null = null;

/**
 * Amplitude 초기화
 * 앱 시작 시 한 번만 호출되어야 합니다.
 */
export const initializeAmplitude = async (): Promise<void> => {
  if (isInitialized) {
    console.warn('Amplitude is already initialized');
    return;
  }

  try {
    // Session Replay 플러그인 설정
    const sessionReplayConfig: SessionReplayConfig = {
      enableRemoteConfig: true, // 원격 구성 활성화
      sampleRate: 1, // 100% 세션 캡처 (필요에 따라 조정 가능, 예: 0.1 = 10%)
      autoStart: true, // 자동 시작
    };

    sessionReplayPlugin = new SessionReplayPlugin(sessionReplayConfig);

    // Amplitude 초기화 및 플러그인 추가
    // React Native 환경에서는 cookie를 비활성화해야 합니다
    // init(apiKey, userId?, options?)
    const initResult = init(AMPLITUDE_API_KEY, undefined, {
      disableCookies: true, // React Native 환경에서 cookie 사용 비활성화
    });
    if (initResult?.promise) {
      await initResult.promise;
    }
    
    const addResult = add(sessionReplayPlugin);
    if (addResult?.promise) {
      await addResult.promise;
    }

    isInitialized = true;
    console.log('Amplitude initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
};

/**
 * 이벤트 추적
 * @param eventName 이벤트 이름 (예: 'Sign Up', 'Button Click')
 * @param eventProperties 이벤트 속성 (선택사항)
 * 
 * 사용 예시:
 * ```tsx
 * import { trackEvent } from './services/amplitudeService';
 * 
 * // 기본 이벤트 추적
 * trackEvent('Sign Up');
 * 
 * // 속성과 함께 이벤트 추적
 * trackEvent('Button Click', { buttonName: 'Submit', screen: 'Login' });
 * ```
 */
export const trackEvent = (
  eventName: string,
  eventProperties?: Record<string, any>
): void => {
  if (!isInitialized) {
    console.warn('Amplitude is not initialized. Call initializeAmplitude() first.');
    return;
  }

  try {
    track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

/**
 * 사용자 식별
 * @param userId 사용자 ID
 * @param userProperties 사용자 속성 (선택사항)
 */
export const setUserId = (
  userId: string,
  userProperties?: Record<string, any>
): void => {
  if (!isInitialized) {
    console.warn('Amplitude is not initialized. Call initializeAmplitude() first.');
    return;
  }

  try {
    amplitudeSetUserId(userId);
    if (userProperties) {
      const identifyObj = new Identify();
      identifyObj.set(userProperties);
      identify(identifyObj);
    }
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
};

/**
 * 사용자 속성 설정
 * @param userProperties 사용자 속성
 */
export const setUserProperties = (userProperties: Record<string, any>): void => {
  if (!isInitialized) {
    console.warn('Amplitude is not initialized. Call initializeAmplitude() first.');
    return;
  }

  try {
    const identifyObj = new Identify();
    identifyObj.set(userProperties);
    identify(identifyObj);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

/**
 * 세션 리플레이 녹화 시작
 */
export const startSessionReplay = async (): Promise<void> => {
  if (!sessionReplayPlugin) {
    console.warn('Session Replay plugin is not initialized');
    return;
  }

  try {
    await sessionReplayPlugin.start();
  } catch (error) {
    console.error('Failed to start session replay:', error);
  }
};

/**
 * 세션 리플레이 녹화 중지
 */
export const stopSessionReplay = async (): Promise<void> => {
  if (!sessionReplayPlugin) {
    console.warn('Session Replay plugin is not initialized');
    return;
  }

  try {
    await sessionReplayPlugin.stop();
  } catch (error) {
    console.error('Failed to stop session replay:', error);
  }
};

/**
 * Amplitude 초기화 상태 확인
 */
export const isAmplitudeInitialized = (): boolean => {
  return isInitialized;
};
