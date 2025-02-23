import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView, Dimensions } from 'react-native';
import SqliteService from '../../services/SqliteService';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const exerciseData = [
    { 
        id: '1', 
        name: 'Bench press', 
        image: require('../../../assets/Outros/benchpress.png'),
        sets: [
            { set: 1, weight: '5kg X 10', reps: 20, done: true },
            { set: 2, weight: '5kg X 10', reps: 20, done: true },
            { set: 3, weight: '5kg X 10', reps: 20, done: false },
        ]
    },
    { 
        id: '2', 
        name: 'Running', 
        image: require('../../../assets/Outros/running.png'),
        sets: [
            { set: 1, distance: '00:32', time: '20', done: false },
        ]
    },
    { 
        id: '3', 
        name: 'Diamond push-up', 
        image: require('../../../assets/Outros/diamond push up.png'),
        sets: [
            { set: 1, reps: 'x 10', count: 12, done: true },
            { set: 2, reps: 'x 28', count: 10, done: true },
        ]
    },
];

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
                    done: false
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

    const renderExerciseItem = ({ item, index }) => (
        <View style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
                <Image source={{ uri: item.mediaPath }} style={styles.exerciseImage} />
                <Text style={styles.exerciseName}>{item.name}</Text>
            </View>
            {item.sets.map((set, setIndex) => (
                <View key={`set-${setIndex}`} style={styles.setRow}>
                    <Text style={styles.setText}>Set {set.set}</Text>
                    <TextInput
                        style={styles.input}
                        value={set.weight}
                        onChangeText={(text) => handleWeightChange(index, setIndex, text)}
                        placeholder="0 kg"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity 
                        onPress={() => toggleSetDone(index, setIndex)}
                        style={styles.checkbox}
                    >
                        <Image 
                            source={set.done ? 
                                require('../../../assets/checkedBox.png') : 
                                require('../../../assets/unCheckedBox.png')} 
                            style={styles.checkImage}
                        />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{routineName}</Text>
                    <TouchableOpacity>
                        <Text style={styles.headerButton}>Finish</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.timer}>{formatTime(timer)}</Text>

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
    input: {
        color: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#4C24FF',
        width: responsiveWidth(20),
        textAlign: 'center',
        fontSize: responsiveWidth(3.5),
    },
    checkbox: {
        padding: responsiveWidth(1),
    },
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
        padding: responsiveWidth(4),
    },
    headerButton: {
        color: '#4C24FF',
        fontSize: responsiveWidth(4),
    },
    headerTitle: {
        color: '#FFF',
        fontSize: responsiveWidth(5),
        fontWeight: 'bold',
    },
    timer: {
        color: '#FFF',
        fontSize: responsiveWidth(12),
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: responsiveHeight(2),
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
    exerciseImage: {
        width: responsiveWidth(10),
        height: responsiveWidth(10),
        marginRight: responsiveWidth(3),
    },
    exerciseName: {
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
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(1),
    },
    setText: {
        color: '#FFF',
        fontSize: responsiveWidth(3.5),
    },
    checkImage: {
        width: responsiveWidth(5),
        height: responsiveWidth(5),
    },
});

export default NewWorkoutScreen;