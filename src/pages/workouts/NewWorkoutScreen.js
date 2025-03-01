import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView, Dimensions } from 'react-native';
import SqliteService from '../../services/SqliteService';
import ExerciseVideo from '../../components/ExerciseVideo';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const NewWorkoutScreen = ({ navigation, route }) => {
    const { routineId, routineName } = route.params;
    const [timer, setTimer] = useState(0);
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        loadExercises();

        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const loadExercises = async () => {
        try {
            const routineExercises = await SqliteService.getRoutineExercises(routineId);
            const initializedExercises = routineExercises.map(exercise => ({
                ...exercise,
                sets: Array(3).fill().map((_, i) => ({
                    set: i + 1,
                    weight: '',
                    reps: '',
                    done: false,
                    // Add previous data fields
                    previous: exercise.type === 'running' ? '00:32' : '5kg X 10',
                    time: exercise.type === 'running' ? '00:00' : null,
                    km: exercise.type === 'running' ? '20' : null,
                }))
            }));
            setExercises(initializedExercises);
        } catch (error) {
            console.error('Error loading exercises:', error);
        }
    };

    const handleWeightChange = (exerciseIndex, setIndex, value) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].weight = value;
        setExercises(newExercises);
    };

    const handleRepsChange = (exerciseIndex, setIndex, value) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].reps = value;
        setExercises(newExercises);
    };

    const toggleSetDone = (exerciseIndex, setIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].done =
            !newExercises[exerciseIndex].sets[setIndex].done;
        setExercises(newExercises);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderExerciseHeaders = (exercise) => {
        if (exercise.type === 'running') {
            return (
                <View style={styles.headerRow}>
                    <View style={styles.setColumn}>
                        <Text style={styles.headerText}>Set</Text>
                    </View>
                    <View style={styles.previousColumn}>
                        <Text style={styles.headerText}>Previous</Text>
                    </View>
                    <View style={styles.valueColumn}>
                        <Text style={styles.headerText}>Km</Text>
                    </View>
                    <View style={styles.valueColumn}>
                        <Text style={styles.headerText}>Time</Text>
                    </View>
                    <View style={styles.checkColumn}>
                        <Image
                            source={require('../../../assets/check.png')}
                            style={styles.headerCheckImage}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.headerRow}>
                    <View style={styles.setColumn}>
                        <Text style={styles.headerText}>Set</Text>
                    </View>
                    <View style={styles.previousColumn}>
                        <Text style={styles.headerText}>Previous</Text>
                    </View>
                    <View style={styles.valueColumn}>
                        <Text style={styles.headerText}>KG</Text>
                    </View>
                    <View style={styles.valueColumn}>
                        <Text style={styles.headerText}>Reps</Text>
                    </View>
                    <View style={styles.checkColumn}>
                        <Image
                            source={require('../../../assets/check.png')}
                            style={styles.headerCheckImage}
                        />
                    </View>
                </View>
            );
        }
    };

    const renderSetRow = (exercise, set, setIndex, exerciseIndex) => {
        if (exercise.type === 'running') {
            return (
                <View key={`set-${setIndex}`} style={styles.setRow}>
                    <View style={styles.setColumn}>
                        <Text style={styles.setText}>{set.set}</Text>
                    </View>

                    <View style={styles.previousColumn}>
                        <Text style={styles.previousText}>{set.previous}</Text>
                    </View>

                    <View style={styles.valueColumn}>
                        <TextInput
                            style={styles.input}
                            value={set.km || ''}
                            onChangeText={(text) => handleWeightChange(exerciseIndex, setIndex, text)}
                            placeholder="0"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.valueColumn}>
                        <TextInput
                            style={styles.input}
                            value={set.time || ''}
                            onChangeText={(text) => handleRepsChange(exerciseIndex, setIndex, text)}
                            placeholder="00:00"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.checkColumn}>
                        <TouchableOpacity
                            onPress={() => toggleSetDone(exerciseIndex, setIndex)}
                        >
                            <Image
                                source={set.done ?
                                    require('../../../assets/checkedBox.png') :
                                    require('../../../assets/unCheckedBox.png')}
                                style={styles.checkImage}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            return (
                <View key={`set-${setIndex}`} style={styles.setRow}>
                    <View style={styles.setColumn}>
                        <Text style={styles.setText}>{set.set}</Text>
                    </View>

                    <View style={styles.previousColumn}>
                        <Text style={styles.previousText}>{set.previous}</Text>
                    </View>

                    <View style={styles.valueColumn}>
                        <TextInput
                            style={styles.input}
                            value={set.weight || ''}
                            onChangeText={(text) => handleWeightChange(exerciseIndex, setIndex, text)}
                            placeholder="0"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.valueColumn}>
                        <TextInput
                            style={styles.input}
                            value={set.reps || ''}
                            onChangeText={(text) => handleRepsChange(exerciseIndex, setIndex, text)}
                            placeholder="0"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.checkColumn}>
                        <TouchableOpacity
                            onPress={() => toggleSetDone(exerciseIndex, setIndex)}
                        >
                            <Image
                                source={set.done ?
                                    require('../../../assets/checkedBox.png') :
                                    require('../../../assets/unCheckedBox.png')}
                                style={styles.checkImage}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    };

    const renderExerciseItem = ({ item, index }) => (
        <View style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
                <ExerciseVideo
                    id={item.mediaPath?.replace('/mp4s/', '').replace('.mp4', '')}
                    size={20}
                    isVisible={true}
                    customStyles={styles.video}
                />
                <Text style={styles.exerciseName}>{item.name}</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Text style={styles.moreOptions}>⋮</Text>
                </TouchableOpacity>
            </View>

            {renderExerciseHeaders(item)}

            {item.sets.map((set, setIndex) =>
                renderSetRow(item, set, setIndex, index)
            )}
        </View>
    );

    const handleFinishWorkout = async () => {
        try {
            const volume = exercises.reduce((total, exercise) => {
                return total + exercise.sets.reduce((exTotal, set) => {
                    const weight = parseFloat(set.weight) || 0;
                    const reps = parseInt(set.reps) || 0;
                    return exTotal + (weight * reps);
                }, 0);
            }, 0);

            const exerciseSessions = exercises.map(exercise => ({
                exerciseId: exercise.id,
                sets: exercise.sets
            }));

            await SqliteService.createWorkoutSession({
                routineId,
                duration: timer,
                volume,
                notes: ''
            }, exerciseSessions);

            navigation.goBack();
        } catch (error) {
            console.error('Error saving workout:', error);
            Alert.alert('Error', 'Failed to save workout session');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.timer}>{formatTime(timer)}</Text>
                        <Text style={styles.headerTitle}>{routineName}</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton} onPress={handleFinishWorkout}>
                        <Text style={styles.headerButtonText}>Finish</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.exerciseList}
                />
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
        padding: responsiveHeight(1.2),
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: responsiveHeight(3.5),
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
    titleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: responsiveWidth(4),
        fontWeight: 'bold',
    },
    timer: {
        color: '#FFF',
        fontSize: responsiveWidth(6),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    exerciseList: {
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
    },
    exerciseItem: {
        backgroundColor: '#1A1A1A',
        borderRadius: responsiveWidth(2),
        marginBottom: responsiveHeight(2),
        padding: responsiveWidth(4),
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
    },
    exerciseName: {
        marginLeft: responsiveWidth(3.5),
        flex: 1,
        color: '#FFF',
        fontSize: responsiveWidth(4.5),
        fontWeight: 'bold',
    },
    moreOptions: {
        color: '#FFF',
        fontSize: responsiveWidth(6),
        fontWeight: 'bold',
    },
    moreButton: {
        padding: responsiveWidth(2),
    },
    // Consistent column widths
    setColumn: {
        width: '15%',
        alignItems: 'center',
    },
    previousColumn: {
        width: '25%',
        alignItems: 'center',
    },
    valueColumn: {
        width: '25%',
        alignItems: 'center',
    },
    checkColumn: {
        width: '10%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: responsiveHeight(1),
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    headerText: {
        color: '#999',
        fontSize: responsiveWidth(3.5),
        textAlign: 'center',
    },
    headerCheckImage: {
        width: responsiveWidth(5),
        height: responsiveWidth(5),
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: responsiveHeight(1.5),
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    setText: {
        color: '#FFF',
        fontSize: responsiveWidth(3.5),
        textAlign: 'center',
    },
    previousText: {
        color: '#999',
        fontSize: responsiveWidth(3.5),
        textAlign: 'center',
    },
    input: {
        color: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#4C24FF',
        fontSize: responsiveWidth(3.5),
        width: '90%',
        textAlign: 'center',
    },
    checkImage: {
        width: responsiveWidth(5),
        height: responsiveWidth(5),
    },
    video: {
        width: responsiveWidth(12),
        height: responsiveWidth(12),
        borderRadius: 8,
    },
});

export default NewWorkoutScreen;