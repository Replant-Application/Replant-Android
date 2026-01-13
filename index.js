import { registerRootComponent } from 'expo';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
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
    // Amplitude 초기화
    initializeAmplitude().catch((error) => {
      console.error('Failed to initialize Amplitude:', error);
    });
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

registerRootComponent(App);

