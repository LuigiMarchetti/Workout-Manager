import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView, Dimensions } from 'react-native';
import FloatingAddButton from '../FloatingAddButton';
import SearchBar from '../../components/SearchBar'; // Adjust the import path based on your structure

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const exerciseData = [
    { id: '1', name: 'Bench press', muscle: 'Chest', image: require('../../../assets/Outros/benchpress.png') },
    { id: '2', name: 'Running', muscle: 'Legs', image: require('../../../assets/Outros/running.png') },
    { id: '3', name: 'Diamond push up', muscle: 'Shoulder', image: require('../../../assets/Outros/diamond push up.png') },
];

const AddExerciseScreen = ({ navigation }) => {

    const handleFabPress = () => {
        console.log('Add button pressed');
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Exercise</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Custom</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <SearchBar placeholder="Search" />

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>All Equipment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>All Muscles</Text>
                    </TouchableOpacity>
                </View>

                {/* Exercise List */}
                <FlatList
                    data={exerciseData}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.exerciseList}
                />

                {/* Floating Add Button */}
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
        paddingHorizontal: responsiveWidth(3),
        paddingVertical: responsiveHeight(1),
        minWidth: responsiveWidth(20),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
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
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveWidth(4), // Adjust margins as needed
        marginTop: responsiveHeight(2),
    },
    filterButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        paddingVertical: responsiveHeight(1.5),
        paddingHorizontal: responsiveWidth(6),
        flex: 0.45, // Each button takes up 45% of the container
        alignItems: 'center', // Ensure the text is centered
        justifyContent: 'center',
    },
    filterButtonText: {
        color: '#FFF',
        fontSize: responsiveWidth(3.8),
        textAlign: 'center',
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


export default AddExerciseScreen;
