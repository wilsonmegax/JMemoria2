import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SettingsProvider } from '../context/SettingsContext';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.frameworkReady?.();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="game" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="light" />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}