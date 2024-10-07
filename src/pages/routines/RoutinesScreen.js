import React from 'react';
import { View, StyleSheet, TextInput, Image, FlatList, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import RoutineCard from './RoutineCard';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
//const responsiveFontSize = (size) => (width * size) / 375; // Assuming design is based on 375px width

const workoutsData = [
    {
        id: '1',
        title: 'Chest Train',
        exercisesNumber: '5',
        imageSource: require('../../../assets/Outros/benchpress.png'),
    },
    {
        id: '2',
        title: 'Leg Train',
        exercisesNumber: '6',
        imageSource: require('../../../assets/Outros/running.png'),
    },
    {
        id: '3',
        title: 'Chest Train B',
        exercisesNumber: '7',
        imageSource: require('../../../assets/Outros/diamond push up.png'),
    },
    // Add more workout data here
];

export default function RoutinesScreen({ navigation }) {
    
    const handleSearch = (text) => {
        console.log(text);
    };

    const handleFabPress = () => {
        navigation.navigate('CreateRoutine'); // Navigate to the new screen
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <Header 
                    title="Routines"
                    onProfilePress={() => navigation.navigate('Profile')}
                />

                <SearchBar 
                    placeholder="Search" 
                    onSearch={handleSearch} 
                />

                <View style={styles.workoutListContainer}>
                    <FlatList
                        data={workoutsData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <RoutineCard
                                title={item.title}
                                exercisesNumber={item.exercisesNumber}
                                imageSource={item.imageSource}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <FloatingAddButton onPress={handleFabPress} />
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1A1A1A', // Match the header color
    },
    screen: {
        flex: 1,
        backgroundColor: 'black',
    },
    workoutListContainer: {
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
    },
    fab: {
        position: 'absolute',
        right: responsiveWidth(12),  // Responsive right positioning
        bottom: responsiveHeight(5.5), // Responsive bottom positioning
        width: responsiveWidth(5),
        height: responsiveWidth(5),
        borderRadius: responsiveWidth(4),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4C24FF',
    },
});
