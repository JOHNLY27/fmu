import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { migrateStoresToCloud } from './src/services/migrationService';

LogBox.ignoreLogs(['@firebase/firestore: Firestore (12.12.0): BloomFilter error']);

export default function App() {
  useEffect(() => {
    // Cloud migration is now complete. 
    // Manual sync only needed for future data shifts.
    // migrateStoresToCloud();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
