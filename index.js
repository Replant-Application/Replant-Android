import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
import messaging from '@react-native-firebase/messaging';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import { OverlayProvider } from './src/contexts/OverlayContext';
import { SseProvider } from './src/contexts/SseContext';
import { initializeAmplitude } from './src/services/amplitudeService';

// ExoPlayer 스레드 에러는 무시 (앱 종료 시 발생하는 알려진 이슈)
if (LogBox) {
  LogBox.ignoreLogs([
    /Player is accessed on the wrong thread/i,
    /wrong thread/i,
    /mqt_native_modules/i,
    /onHostDestroy/i,
    /ExoPlayerImpl/i,
    /AVManager/i,
    /SimpleExoPlayer/i,
    /verifyApplicationThread/i,
    /ExoPlayer/i,
    /Player.*thread/i,
  ]);
}

function App() {
  // 폰트 로딩 (에러가 발생해도 계속 진행)
  const [fontsLoaded, fontError] = useFonts({
    'Neo-Regular': require('./src/assets/fonts/Neo-Regular.ttf'),
    'Maplestory Bold': require('./src/assets/fonts/Maplestory Bold.ttf'),
    'Maplestory Light': require('./src/assets/fonts/Maplestory Light.ttf'),
  });

  useEffect(() => {
    // FCM 토큰 등록은 로그인 성공 시에만 수행 (UserContext에서 처리)
    subscribe();
    
    // Amplitude 초기화
    initializeAmplitude().catch((error) => {
      console.error('Failed to initialize Amplitude:', error);
    });
  }, []);


  /**
   * FCM 메시지 구독
   */
  const subscribe = async () => {
    try {
      await messaging().subscribeToTopic('all');
      console.log('[+] FCM 구독 완료: all');
    } catch (error) {
      // 에뮬레이터에서는 구독도 실패할 수 있음
      if (error?.code === 'messaging/unknown' || error?.message?.includes('SERVICE_NOT_AVAILABLE')) {
        console.warn('[!] FCM 구독 실패 (에뮬레이터일 수 있음):', error.message);
      } else {
        console.error('FCM 구독 실패:', error);
      }
    }
  };

  // 포그라운드 메시지 핸들러
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[+] FCM 포그라운드 메시지:', remoteMessage);
      // 포그라운드에서 알림 표시 로직 추가 가능
    });

    // 백그라운드/종료 상태에서 알림 클릭 핸들러
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[+] FCM 알림 클릭 (백그라운드):', remoteMessage);
      // 알림 클릭 시 네비게이션 처리
    });

    // 앱이 종료된 상태에서 알림으로 앱 열기
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[+] FCM 알림 클릭 (종료 상태):', remoteMessage);
          // 알림 클릭 시 네비게이션 처리
        }
      });

    return unsubscribe;
  }, []);

  // 폰트 로딩 에러가 있어도 앱은 계속 진행
  if (fontError) {
    console.warn('Font loading error (continuing anyway):', fontError);
  }

  // 폰트가 로드되지 않았어도 앱은 계속 진행 (Expo가 자동으로 폰트를 링크함)
  return (
    <UserProvider>
      <OverlayProvider>
        <SseProvider>
          <AppNavigator />
        </SseProvider>
      </OverlayProvider>
    </UserProvider>
  );
}

// Expo와 React Native 모두 지원
registerRootComponent(App);
AppRegistry.registerComponent('main', () => App);

