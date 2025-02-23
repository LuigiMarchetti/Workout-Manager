import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, TextInput, Image, FlatList, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import RoutineCard from './RoutineCard';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';
import SqliteService from '../../services/SqliteService';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

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
    const [routines, setRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            console.log("RoutinesScreen recebeu foco");
            loadRoutines();
            return () => console.log("RoutinesScreen perdeu foco");
        }, [])
    );
    

    const loadRoutines = async () => {
        setIsLoading(true);
        setRoutines([]);
    
        try {
            const data = await SqliteService.getAllRoutines();
            console.log("Rotinas carregadas:", data);
            setRoutines(data);
        } catch (err) {
            console.error("Erro ao carregar rotinas:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleSearch = (text) => {
        console.log(text);
    };

    const handleFabPress = () => {
        navigation.navigate('NewRoutine'); // Navigate to the new screen
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
                        data={routines}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <RoutineCard
                                title={item.title}
                                exercisesNumber={item.exercisesNumber}
                                id={item.idExercise?.uri}
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
