import React, { useEffect } from 'react';
import Routes from './src/routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RealmService from './src/services/RealmService';

export default function App() {
  useEffect(() => {
    // Initialize Realm only once when the app starts
    const initializeRealm = async () => {
      await RealmService.initialize(); // Ensures Realm is initialized once
    };

    initializeRealm();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <SafeAreaProvider>
      <Routes />
    </SafeAreaProvider>
  );
}