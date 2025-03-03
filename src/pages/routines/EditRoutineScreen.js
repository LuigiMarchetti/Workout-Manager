import React, { useEffect, useState } from 'react';
import { 
  Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, 
  TouchableOpacity, View, Alert 
} from 'react-native';
import FloatingAddButton from '../FloatingAddButton';
import SqliteService from '../../services/SqliteService';
import { Ionicons } from '@expo/vector-icons';
import ExerciseVideo from '../../components/ExerciseVideo';
import { capitalizeFirstLetterAllWords } from '../../utils/Utils';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const EditRoutineScreen = ({ navigation, route }) => {
  const { routineId } = route.params;
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const data = await SqliteService.getRoutineDetails(routineId);
        setRoutineName(data.name);
        setSelectedExercises(data.exercises || []);
      } catch (error) {
        console.error('Error loading routine:', error);
        Alert.alert('Error', 'Failed to load routine details');
      }
    };

    loadRoutine();
  }, [routineId]);

  const handleFabPress = () => {
    navigation.navigate('AddExercise', { routineId });
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert('Please enter a routine name');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Please select at least one exercise');
      return;
    }

    try {
      await SqliteService.updateRoutine(routineId, {
        name: routineName.trim(),
        description: ''
      });

      await SqliteService.updateExercisesForRoutine(routineId, selectedExercises);

      navigation.goBack();
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Failed to update routine');
    }
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const renderExerciseItem = ({ item }) => (
    <View style={styles.exerciseItem}>
      <ExerciseVideo
        id={item.id}
        isVisible={true}
        size={15}
        borderRadius={2}
        customStyles={{ marginRight: responsiveWidth(4) }}
        onError={(error) => console.warn(`Video error for exercise ${item.id}:`, error)}
      />
      <View style={styles.exerciseTextContainer}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseMuscle}>{capitalizeFirstLetterAllWords(item.bodyPart)}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeExercise(item.id)}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Routine</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleSaveRoutine}>
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Routine Name"
            placeholderTextColor="#888"
            value={routineName}
            onChangeText={setRoutineName}
          />
        </View>

        <FlatList
          data={selectedExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.exerciseList}
          ListEmptyComponent={<Text style={styles.emptyText}>No Exercises Added</Text>}
        />

        <FloatingAddButton onPress={handleFabPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2.5),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    backgroundColor: '#000',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    minWidth: responsiveWidth(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(1.75),
  },
  headerButtonText: {
    color: '#4C24FF',
    fontSize: responsiveWidth(3.8),
  },
  headerTitle: {
    color: '#FFF',
    fontSize: responsiveWidth(5.8),
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  input: {
    height: responsiveHeight(6),
    width: "90%",
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: '#FFF',
    paddingHorizontal: responsiveWidth(1.5),
    fontSize: responsiveWidth(5),
    textAlign: 'left',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(3.5),
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: 'bold',
    color: '#FFF',
    fontSize: 16,
  },
  exerciseMuscle: {
    color: '#888',
    fontSize: 14,
  },
  removeButton: {
    padding: 5,
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#FF4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: responsiveHeight(2),
  },
});

export default EditRoutineScreen;
