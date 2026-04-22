import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox, View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import IntroScreen from './src/components/IntroScreen';
import { ToastProvider } from './src/context/ToastContext';
import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash visible during early boot
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(['@firebase/firestore: Firestore (12.12.0): BloomFilter error']);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Fast-boot sequence: Resized assets allow for immediate handoff to the custom intro
        await new Promise(resolve => setTimeout(resolve, 800)); 
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Boot Error:', e);
        setAppIsReady(true);
      }
    };
    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Keep Native Splash showing
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            
            <View style={styles.content}>
              <AppNavigator />
              
              {showIntro && (
                <IntroScreen onFinish={() => setShowIntro(false)} />
              )}
            </View>
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#fff4ef', // Match Intro color to prevent flickering
  }
});
