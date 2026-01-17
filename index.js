import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
import messaging from '@react-native-firebase/messaging';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import { OverlayProvider } from './src/contexts/OverlayContext';
import { SseProvider, useSse } from './src/contexts/SseContext';
import { WakeUpMissionProvider } from './src/contexts/WakeUpMissionContext';
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

// FCM 알림 처리 컴포넌트 (SseContext 내부에서 사용)
function FcmNotificationHandler() {
  const { handleFcmNotification } = useSse();

  useEffect(() => {
    // 포그라운드 메시지 핸들러
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[+] FCM 포그라운드 메시지:', remoteMessage);
      console.log('[+] FCM data:', remoteMessage.data);
      
      // FCM data에서 userMissionId 또는 referenceId 추출
      const data = remoteMessage.data || {};
      const userMissionId = data.userMissionId || data.referenceId;
      
      console.log('[+] FCM userMissionId 추출:', {
        'data.userMissionId': data.userMissionId,
        'data.referenceId': data.referenceId,
        '추출된 userMissionId': userMissionId,
      });
      
      const notification = {
        ...remoteMessage,
        data: {
          ...data,
          // userMissionId 추출: data.userMissionId || data.referenceId
          userMissionId: userMissionId,
          referenceId: data.referenceId || data.userMissionId,
        },
      };
      
      handleFcmNotification(notification);
    });

    // 백그라운드/종료 상태에서 알림 클릭 핸들러
    const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[+] FCM 알림 클릭 (백그라운드):', remoteMessage);
      console.log('[+] FCM data:', remoteMessage.data);
      
      // FCM data에서 userMissionId 또는 referenceId 추출
      const data = remoteMessage.data || {};
      const userMissionId = data.userMissionId || data.referenceId;
      
      console.log('[+] FCM userMissionId 추출:', {
        'data.userMissionId': data.userMissionId,
        'data.referenceId': data.referenceId,
        '추출된 userMissionId': userMissionId,
      });
      
      const notification = {
        ...remoteMessage,
        data: {
          ...data,
          // userMissionId 추출: data.userMissionId || data.referenceId
          userMissionId: userMissionId,
          referenceId: data.referenceId || data.userMissionId,
        },
      };
      
      handleFcmNotification(notification);
    });

    // 앱이 종료된 상태에서 알림으로 앱 열기
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[+] FCM 알림 클릭 (종료 상태):', remoteMessage);
          console.log('[+] FCM data:', remoteMessage.data);
          
          // FCM data에서 userMissionId 또는 referenceId 추출
          const data = remoteMessage.data || {};
          const userMissionId = data.userMissionId || data.referenceId;
          
          console.log('[+] FCM userMissionId 추출:', {
            'data.userMissionId': data.userMissionId,
            'data.referenceId': data.referenceId,
            '추출된 userMissionId': userMissionId,
          });
          
          const notification = {
            ...remoteMessage,
            data: {
              ...data,
              // userMissionId 추출: data.userMissionId || data.referenceId
              userMissionId: userMissionId,
              referenceId: data.referenceId || data.userMissionId,
            },
          };
          
          handleFcmNotification(notification);
        }
      });

    return () => {
      unsubscribe();
      unsubscribeOpened();
    };
  }, [handleFcmNotification]);

  return null;
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

  // 폰트 로딩 에러가 있어도 앱은 계속 진행
  if (fontError) {
    console.warn('Font loading error (continuing anyway):', fontError);
  }

  // 폰트가 로드되지 않았어도 앱은 계속 진행 (Expo가 자동으로 폰트를 링크함)
  return (
    <UserProvider>
      <OverlayProvider>
        <SseProvider>
          <WakeUpMissionProvider>
            <FcmNotificationHandler />
            <AppNavigator />
          </WakeUpMissionProvider>
        </SseProvider>
      </OverlayProvider>
    </UserProvider>
  );
}

// Expo와 React Native 모두 지원
registerRootComponent(App);
AppRegistry.registerComponent('main', () => App);

