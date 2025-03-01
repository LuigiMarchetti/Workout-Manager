import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import ExerciseVideo from '../../components/ExerciseVideo';

const { width } = Dimensions.get('window');
const scale = width / 375; // Based on a 375px wide design

const normalize = (size) => Math.round(scale * size);

export default function WorkoutCard({ title, date, duration, weight, id, onPress }) {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <ExerciseVideo
        id={id}
        size={18} // Percentage of screen width
        isVisible={true}
        customStyles={styles.video}
        showRetryButton={false}
      />
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.info}>{date}</Text>
        <Text style={styles.info}>{duration} min</Text>
        <Text style={styles.info}>{weight} kg</Text>
      </View>
    </TouchableOpacity>
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
    borderRadius: normalize(8),
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
    fontSize: normalize(12),
    marginBottom: normalize(3),
  },
});