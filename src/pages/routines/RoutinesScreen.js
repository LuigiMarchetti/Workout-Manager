import React, { useState, useCallback } from 'react';
import {
    SafeAreaView, View, FlatList, StyleSheet, Dimensions,
    TouchableOpacity, Modal, Text, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../Header';
import SearchBar from '../../components/SearchBar';
import FloatingAddButton from '../FloatingAddButton';
import RoutineCard from './RoutineCard';
import SqliteService from '../../services/SqliteService';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const RoutinesScreen = ({ navigation }) => {
    const [routines, setRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null); // for modal context menu

    useFocusEffect(
        useCallback(() => {
            loadRoutines();
            return () => { };
        }, [])
    );

    const loadRoutines = async () => {
        setIsLoading(true);
        setRoutines([]);
        try {
            const data = await SqliteService.getAllRoutines();
            setRoutines(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (text) => {
        console.log(text);
    };

    const handleFabPress = () => {
        navigation.navigate('NewRoutine');
    };

    const openContextMenu = (routine) => {
        setActiveRoutine(routine);
    };

    const closeContextMenu = () => {
        setActiveRoutine(null);
    };

    const deleteRoutine = async (routine) => {
        try {
            await SqliteService.deleteRoutine(routine.id);
            loadRoutines();
        } catch (error) {
            Alert.alert('Error', 'Failed to delete routine');
        }
    };

    // New confirmation alert for deletion
    const confirmDeleteRoutine = (routine) => {
        Alert.alert(
            'Delete Routine',
            'Deleting this routine will also delete all associated workouts. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRoutine(routine)
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => openContextMenu(item)}>
            <RoutineCard
                title={item.title}
                exercisesNumber={item.exercisesNumber}
                id={item.idExercise?.uri}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <Header title="Routines" onProfilePress={() => navigation.navigate('Profile')} />
                <SearchBar placeholder="Search" onSearch={handleSearch} />
                <View style={styles.listContainer}>
                    <FlatList
                        data={routines}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                <FloatingAddButton onPress={handleFabPress} />

                {/* Modal-based context menu */}
                {activeRoutine && (
                    <Modal visible={!!activeRoutine} transparent animationType="fade">
                        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeContextMenu}>
                            <View style={styles.contextMenu}>
                                <TouchableOpacity
                                    style={styles.contextMenuItem}
                                    onPress={() => {
                                        closeContextMenu();
                                        navigation.navigate('RoutineDetail', { routineId: activeRoutine.id });
                                    }}
                                >
                                    <Text style={styles.contextMenuText}>View</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.contextMenuItem}
                                    onPress={() => {
                                        closeContextMenu();
                                        navigation.navigate('EditRoutine', { routineId: activeRoutine.id });
                                    }}
                                >
                                    <Text style={styles.contextMenuText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.contextMenuItem}
                                    onPress={() => {
                                        closeContextMenu();
                                        confirmDeleteRoutine(activeRoutine);
                                    }}
                                >
                                    <Text style={[styles.contextMenuText, { color: 'red' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    screen: {
        flex: 1,
        backgroundColor: 'black',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contextMenu: {
        backgroundColor: '#2A2A2A',
        borderRadius: responsiveWidth(2),
        padding: responsiveWidth(2),
        width: responsiveWidth(60),
    },
    contextMenuItem: {
        paddingVertical: responsiveHeight(1),
    },
    contextMenuText: {
        color: '#FFF',
        fontSize: responsiveWidth(4),
        textAlign: 'center',
    },
});

export default RoutinesScreen;
