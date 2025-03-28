import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

function TrainingModal({ routines, onClose, onSelectTraining }) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Begin training</Text>
        <View style={styles.trainingDropdown}>
          {routines.map((routine, index) => (
            <TouchableOpacity
              key={routine.id}
              style={[styles.trainingOption, index < routines.length - 1 && styles.borderBottom]}
              onPress={() => onSelectTraining(routine)}
            >
              <Text style={styles.trainingText}>{routine.title}</Text>
              <Text style={[styles.trainingText, { fontSize: responsiveHeight(1.8) }]}>
                {routine.exercisesNumber} exercises
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.startButton} onPress={() => onSelectTraining(routines[0])}>
          <Feather name="play" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: responsiveWidth(10), // Adjusted with responsive width
    borderTopRightRadius: responsiveWidth(10), // Adjusted with responsive width
    padding: responsiveWidth(3.5), // Adjusted with responsive height
    paddingHorizontal: responsiveWidth(8), // Adjusted with responsive height
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: responsiveHeight(2.5), // Adjusted with responsive height
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: responsiveHeight(2), // Adjusted with responsive height
  },
  trainingDropdown: {
    backgroundColor: '#4C24FF',
    borderRadius: responsiveWidth(5), // Adjusted with responsive width
    marginBottom: responsiveHeight(1), // Adjusted with responsive height
    paddingVertical: responsiveHeight(1), // Reduced padding to make it smaller
  },
  trainingOption: {
    paddingVertical: responsiveHeight(1.5), // Adjusted with responsive height
    paddingHorizontal: responsiveWidth(5), // Adjusted with responsive width
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)', // Border color
  },
  trainingText: {
    color: '#FFFFFF',
    fontSize: responsiveHeight(2.2), // Adjusted with responsive height
  },
  startButton: {
    alignSelf: 'center',
    backgroundColor: '#4C24FF',
    borderRadius: responsiveWidth(5), // Adjusted with responsive width
    paddingVertical: responsiveHeight(2), // Adjusted with responsive height
    paddingHorizontal: responsiveWidth(10), // Adjusted with responsive width
  },
});

export default TrainingModal;
