import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView, Dimensions } from 'react-native';
import FloatingAddButton from '../FloatingAddButton';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const exerciseData = [
    { id: '1', name: 'Bench press', muscle: 'Chest', image: require('../../../assets/Outros/benchpress.png') },
    { id: '2', name: 'Running', muscle: 'Legs', image: require('../../../assets/Outros/running.png') },
    { id: '3', name: 'Diamond push up', muscle: 'Shoulder', image: require('../../../assets/Outros/diamond push up.png') },
];

const CreateRoutineScreen = ({ navigation }) => {

    const handleFabPress = () => {
        navigation.navigate('AddExercise');
    };

    const renderExerciseItem = ({ item }) => (
        <TouchableOpacity style={styles.exerciseItem}>
            <Image source={item.image} style={styles.exerciseImage} />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{item.muscle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New routine</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#888"
                    />
                </View>

                <FlatList
                    data={exerciseData}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.exerciseList}
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
        borderRadius: responsiveWidth(1.75), // size border radius
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
        marginTop: responsiveHeight(2),
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
    },
    exerciseImage: {
        width: 50,
        height: 50,
        marginRight: 10,
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
});

export default CreateRoutineScreen;