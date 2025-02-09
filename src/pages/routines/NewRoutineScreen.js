import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FloatingAddButton from '../FloatingAddButton';
import ExerciseVideo from '../../components/ExerciseVideo';
import SqliteService from '../../services/SqliteService';
import { capitalizeFirstLetterAllWords } from '../../utils/Utils';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have this installed

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const NewRoutineScreen = ({ navigation, route }) => {
    const [routineName, setRoutineName] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);

    // Handle incoming selected exercise from AddExerciseScreen
    useEffect(() => {
        if (route.params?.selectedExercise) {
            setSelectedExercises(prev => {
                // Prevent duplicates
                const exists = prev.some(e => e.id === route.params.selectedExercise.id);
                return exists ? prev : [...prev, route.params.selectedExercise];
            });
        }
    }, [route.params?.selectedExercise]);

    const handleFabPress = () => {
        // Navigate to AddExercise without resetting the stack
        navigation.navigate('AddExercise');
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
            // Save routine - let SQLiteService handle ID creation
            const routineId = await SqliteService.createRoutine({
                name: routineName.trim(),
                description: ''
            });

            // Save routine-exercise relationships
            await SqliteService.addExercisesToRoutine(
                routineId,
                selectedExercises
            );

            navigation.goBack();
        } catch (error) {
            console.error('Error saving routine:', error);
            alert('Failed to save routine');
        }
    };

    // Updated renderEmptyState using improved UX design principles
    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Ionicons
                name="barbell-outline"  // Updated valid icon name
                size={responsiveWidth(20)}
                color="#4C24FF"
                style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No Exercises Added</Text>
            <Text style={styles.emptyStateSubtitle}>
                Start building your routine by tapping the + button below.
            </Text>
        </View>
    );

    const removeExercise = (exerciseId) => {
        setSelectedExercises(prev =>
            prev.filter(e => e.id !== exerciseId)
        );
    };

    const renderExerciseItem = ({ item }) => (
        <View style={styles.exerciseItem}>
            <ExerciseVideo
                id={item.id}
                isVisible={true} // Always visible in this screen context
                size={15}
                borderRadius={2}
                customStyles={{ marginRight: responsiveWidth(4) }}
                onError={(error) => console.warn(`Video error for exercise ${item.id}:`, error)}
            />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{capitalizeFirstLetterAllWords(item.bodyPart)}</Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeExercise(item.id)}
            >
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
                    <Text style={styles.headerTitle}>New routine</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={handleSaveRoutine}>
                        <Text style={styles.headerButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#888"
                        value={routineName}
                        onChangeText={setRoutineName}
                    />
                </View>

                <FlatList
                    data={selectedExercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.exerciseList}
                    ListEmptyComponent={renderEmptyState}
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
        padding: responsiveHeight(2.5),
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
    // Updated empty state styles for a more professional look
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateIcon: {
        marginBottom: responsiveHeight(2),
    },
    emptyStateTitle: {
        color: '#FFF',
        fontSize: responsiveWidth(5),
        fontWeight: 'bold',
        marginBottom: responsiveHeight(1),
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        color: '#888',
        fontSize: responsiveWidth(4),
        textAlign: 'center',
        marginHorizontal: responsiveWidth(10),
    },
});

export default NewRoutineScreen;