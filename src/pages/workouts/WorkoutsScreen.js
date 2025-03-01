import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableWithoutFeedback, Text, Button } from 'react-native';
import WorkoutCard from './WorkoutCard';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';
import TrainingModal from './TrainingModal';
import SqliteService from '../../services/SqliteService';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

export default function WorkoutsScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRoutinesLoading, setIsRoutinesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routinesError, setRoutinesError] = useState(null);

  useEffect(() => {
    loadWorkouts();
    
    // Add navigation listener to refresh data when focusing screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkouts();
    });

    return unsubscribe;
  }, [navigation]);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await SqliteService.init();
      const workoutsData = await SqliteService.getAllWorkouts();
      
      setWorkouts(workoutsData.map(workout => ({
        id: workout.id,
        title: workout.routineName,
        date: new Date(workout.date).toLocaleDateString(),
        duration: workout.duration.toString(),
        weight: workout.volume.toString(),
        firstExerciseId: workout.firstExerciseId
      })));
    } catch (error) {
      console.error('Error loading workouts:', error);
      setError('Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutines = async () => {
    try {
      setIsRoutinesLoading(true);
      setRoutinesError(null);
      
      const data = await SqliteService.getAllRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error loading routines:', error);
      setRoutinesError('Failed to load routines');
    } finally {
      setIsRoutinesLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // You could implement filtering here if needed
  };

  const handleFabPress = () => {
    setIsModalVisible(true);
    loadRoutines();
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSelectTraining = (routine) => {
    setIsModalVisible(false);
    navigation.navigate('NewWorkout', {
      routineId: routine.id,
      routineName: routine.title
    });
  };

  const renderLoader = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4C24FF" />
    </View>
  );

  const renderError = (errorMessage, retryFunction) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <Button
        title="Try Again"
        onPress={retryFunction}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Header
          title="Workouts"
          onProfilePress={() => navigation.navigate('Profile')}
        />

        <SearchBar
          placeholder="Search"
          onSearch={handleSearch}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.workoutListContainer}>
          {isLoading ? (
            renderLoader()
          ) : error ? (
            renderError(error, loadWorkouts)
          ) : (
            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WorkoutCard
                  title={item.title}
                  date={item.date}
                  duration={item.duration}
                  weight={item.weight}
                  id={item.firstExerciseId}
                  onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
                />
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No workouts found</Text>
                </View>
              }
            />
          )}
        </View>

        <FloatingAddButton onPress={handleFabPress} />

        {isModalVisible && (
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <View>
                  {isRoutinesLoading ? renderLoader() :
                    routinesError ? renderError(routinesError, loadRoutines) :
                      <TrainingModal
                        routines={routines}
                        onClose={handleCloseModal}
                        onSelectTraining={handleSelectTraining}
                      />}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  workoutListContainer: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This creates the dimming effect
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    backgroundColor: '#1A1A1A',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: responsiveHeight(20),
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
  },
});