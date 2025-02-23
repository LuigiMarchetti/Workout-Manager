import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableWithoutFeedback, BackHandler } from 'react-native';
import WorkoutCard from './WorkoutCard';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';
import TrainingModal from './TrainingModal';
import SqliteService from '../../services/SqliteService';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const workoutsData = [
    {
        id: '1',
        title: 'Chest Train',
        date: '20/07/2024',
        duration: '60',
        weight: '200',
        imageSource: require('../../../assets/Outros/benchpress.png'),
    },
    {
        id: '2',
        title: 'Leg Train',
        date: '22/07/2024',
        duration: '45',
        weight: '150',
        imageSource: require('../../../assets/Outros/running.png'),
    },
    {
        id: '3',
        title: 'Chest Train B',
        date: '22/07/2024',
        duration: '45',
        weight: '150',
        imageSource: require('../../../assets/Outros/diamond push up.png'),
    },
];

export default function WorkoutsScreen({ navigation }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = (text) => {
        console.log(text);
    };

    const handleFabPress = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const loadRoutines = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await SqliteService.init();
                const data = await SqliteService.getAllRoutines();
                setRoutines(data);
            } catch (error) {
                console.error('Error loading routines:', error);
                setError('Failed to load routines');
            } finally {
                setIsLoading(false);
            }
        };

        if (isModalVisible) {
            loadRoutines();
        }
    }, [isModalVisible]);

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

    // Add this error component
    const renderError = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
                title="Try Again"
                onPress={() => {
                    setError(null);
                    loadRoutines();
                }}
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
                />

                <View style={styles.workoutListContainer}>
                    <FlatList
                        data={workoutsData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <WorkoutCard
                                title={item.title}
                                date={item.date}
                                duration={item.duration}
                                weight={item.weight}
                                imageSource={item.imageSource}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <FloatingAddButton onPress={handleFabPress} />

                {isModalVisible && (
                    <TouchableWithoutFeedback onPress={handleCloseModal}>
                        <View style={styles.overlay}>
                            <TouchableWithoutFeedback>
                                <View>
                                    {isLoading ? renderLoader() :
                                        error ? renderError() :
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
});
