import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Correct import for SafeAreaView
import Header from '../Header';

export default function StatisticsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Header
        title="Statistics"
        onProfilePress={() => navigation.navigate('Profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: '#1A1A1A',
  },
});
