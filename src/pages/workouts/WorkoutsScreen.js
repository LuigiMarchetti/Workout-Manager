import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableWithoutFeedback, BackHandler } from 'react-native';
import WorkoutCard from './WorkoutCard';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';
import TrainingModal from './TrainingModal';

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

    const handleSearch = (text) => {
        console.log(text);
    };

    const handleFabPress = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleSelectTraining = (training) => {
        setIsModalVisible(false);
        console.log('Selected training:', training);
        navigation.navigate('NewWorkout')
    };

    // Use BackHandler to close modal when back button is pressed
    useEffect(() => {
        const backAction = () => {
            if (isModalVisible) {
                handleCloseModal(); // Close the modal if it's visible
                return true; // Prevent default back behavior
            }
            return false; // Allow default back behavior if modal is not visible
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Cleanup the listener when component unmounts or modal closes
    }, [isModalVisible]);

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
                                    <TrainingModal
                                        onClose={handleCloseModal}
                                        onSelectTraining={handleSelectTraining}
                                    />
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
});
