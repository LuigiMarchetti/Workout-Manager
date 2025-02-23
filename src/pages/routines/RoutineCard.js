import React from 'react';
import { View, Text, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import ExerciseVideo from '../../components/ExerciseVideo';

const { width, height } = Dimensions.get('window');
const scale = width / 375; // Assuming the design is based on a 375px wide screen

const normalize = (size) => {
  return Math.round(scale * size);
};

export default function RoutineCard({ title, exercisesNumber, id }) {
  return (
    <View style={styles.card}>
      <ExerciseVideo
        id={id}
        size={20} // Adjust size percentage as needed
        isVisible={true} // Auto-play when card is visible
        customStyles={styles.video}
      />
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.info}>Exercises: {exercisesNumber}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: normalize(8),
    padding: normalize(15.5),
    marginBottom: normalize(10),
    alignItems: 'center',
    width: width * 0.9,
    alignSelf: 'center',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.3,
    shadowRadius: normalize(4),
    elevation: Platform.OS === 'android' ? normalize(6) : 0,
  },
  video: {
    width: normalize(70),
    height: normalize(70),
    marginRight: normalize(14),
    borderRadius: normalize(8), // Match card border radius
  },
  details: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: 'bold',
    marginBottom: normalize(1.5),
  },
  info: {
    color: '#AAAAAA',
    fontSize: normalize(12)
  },
});