import React, { useEffect, useState } from 'react';
import Routes from './src/routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SQLite from 'react-native-sqlite-storage';
import { View, ActivityIndicator, Text } from 'react-native';
import SqliteService from './src/services/SqliteService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SqliteService.init();
        /*
        const exerciseList = await SqliteService.getAllExercises();
        console.log(exerciseList);
        setExercises(exerciseList);
        */
        setIsLoading(false);
      } catch (err) {
        setError(`Database error: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      SqliteService.closeDatabase();
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Routes exercises={exercises} />
    </SafeAreaProvider>
  );
}