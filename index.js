import { registerRootComponent } from 'expo';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import { OverlayProvider } from './src/contexts/OverlayContext';
import { SseProvider } from './src/contexts/SseContext';

function App() {
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

