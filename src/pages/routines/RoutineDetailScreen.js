import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  SafeAreaView, Dimensions, FlatList, ActivityIndicator, Alert, Button 
} from 'react-native';
import SqliteService from '../../services/SqliteService';
import Ionicons from '@expo/vector-icons/Ionicons';
import ExerciseVideo from '../../components/ExerciseVideo';
import { capitalizeFirstLetterAllWords } from '../../utils/Utils';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const RoutineDetailScreen = ({ navigation, route }) => {
  const { routineId } = route.params;
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const data = await SqliteService.getRoutineDetails(routineId);
        setRoutine(data);
      } catch (error) {
        console.error('Error loading routine:', error);
        setError('Failed to load routine details');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  const handleDelete = async () => {
    try {
      await SqliteService.deleteRoutine(routineId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting routine:', error);
      Alert.alert('Error', 'Failed to delete routine');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDelete, style: 'destructive' }
      ]
    );
  };

  const renderExerciseItem = ({ item }) => (
    <View style={styles.exerciseItem}>
      <ExerciseVideo
        id={item.id}
        size={15}
        isVisible={true}
        customStyles={styles.video}
      />
      <View style={styles.exerciseTextContainer}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetail}>{capitalizeFirstLetterAllWords(item.bodyPart)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4C24FF" />
      </View>
    );
  }

  if (error || !routine) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Routine not found'}</Text>
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
        <Text style={styles.title}>{routine.name}</Text>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Exercises: {routine.exercises?.length || 0}</Text>
      </View>

      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseItem}
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
  detailsContainer: {
    padding: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailText: {
    color: '#AAA',
    fontSize: responsiveWidth(3.8)
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: responsiveWidth(2),
    marginHorizontal: responsiveWidth(4),
    marginVertical: responsiveWidth(2.5),
    padding: responsiveWidth(4),
  },
  video: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: 8,
    marginRight: responsiveWidth(3),
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: responsiveWidth(4),
    fontWeight: 'bold',
  },
  exerciseDetail: {
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
  listContent: {
    paddingBottom: responsiveHeight(2),
  },
});

export default RoutineDetailScreen;
