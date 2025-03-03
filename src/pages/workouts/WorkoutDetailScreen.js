import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, FlatList, ActivityIndicator, Alert, Button } from 'react-native';
import SqliteService from '../../services/SqliteService';
import ExerciseVideo from '../../components/ExerciseVideo';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const WorkoutDetailScreen = ({ navigation, route }) => {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        setLoading(true);
        const data = await SqliteService.getWorkoutDetails(workoutId);
        console.log(data);
        setWorkout(data);
      } catch (error) {
        console.error('Error loading workout:', error);
        setError('Failed to load workout details');
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId]);

  const handleDelete = async () => {
    try {
      await SqliteService.deleteWorkout(workoutId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m 00s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDelete, style: 'destructive' }
      ]
    );
  };

  const renderExercise = ({ item }) => {
    // Safely handle mediaPath if it's null or undefined
    const mediaId = item.mediaPath
      ? item.mediaPath.replace('/mp4s/', '').replace('.mp4', '')
      : 'default'; // Fallback ID or handle as needed

    return (
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseHeader}>
          <ExerciseVideo
            id={mediaId}
            size={15}
            customStyles={styles.video}
          />
          <Text style={styles.exerciseName}>{item.name}</Text>
        </View>

        <View style={styles.setsContainer}>
          {item.sets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setText}>Set {index + 1}</Text>
              <Text style={styles.setData}>{set.weight} kg</Text>
              <Text style={styles.setData}>{set.reps} reps</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4C24FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={() => navigation.goBack()} color="#4C24FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4C24FF" />
        </TouchableOpacity>
        <Text style={styles.title}>{workout.metadata.routineName}</Text>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>
          Date: {formatDate(workout.metadata.date)}
        </Text>
        <Text style={styles.metadataText}>
          Duration: {formatDuration(workout.metadata.duration)}
        </Text>
        <Text style={styles.metadataText}>
          Total Volume: {workout.metadata.volume} kg
        </Text>
      </View>

      <FlatList
        data={workout.exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.exerciseId}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: responsiveWidth(2),
  },
  deleteButton: {
    padding: responsiveWidth(2),
  },
  title: {
    color: '#FFF',
    fontSize: responsiveWidth(5),
    fontWeight: 'bold',
  },
  metadataContainer: {
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  metadataText: {
    color: '#AAA',
    fontSize: responsiveWidth(3.8),
    marginBottom: responsiveHeight(1),
  },
  exerciseContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: responsiveWidth(2),
    margin: responsiveWidth(4),
    padding: responsiveWidth(4),
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  video: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: 8,
    marginRight: responsiveWidth(3),
  },
  exerciseName: {
    color: '#FFF',
    fontSize: responsiveWidth(4),
    fontWeight: '500',
  },
  setsContainer: {
    marginTop: responsiveHeight(1),
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  setText: {
    color: '#FFF',
    fontSize: responsiveWidth(3.5),
  },
  setData: {
    color: '#AAA',
    fontSize: responsiveWidth(3.5),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FF4444',
    fontSize: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
});

export default WorkoutDetailScreen;