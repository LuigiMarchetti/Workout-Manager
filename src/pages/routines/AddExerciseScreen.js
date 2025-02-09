import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import FilterModal from '../../components/FilterModal';
import ExerciseVideo from '../../components/ExerciseVideo';
import SqliteService from '../../services/SqliteService';
import { ExerciseBodyPart } from '../../enums/ExerciseBodyPart';
import { ExerciseEquipment } from '../../enums/ExerciseEquipment';
import { debounce, capitalizeFirstLetterAllWords } from '../../utils/Utils'; // Import debounce utility

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const PAGE_SIZE = 20;

const AddExerciseScreen = ({ navigation }) => {
    const [state, setState] = useState({
        exercises: [],
        hasMore: true,
        isLoading: false,
        isInitialLoad: true,
        totalCount: 0,
        currentPage: 0,
        searchQuery: '',
        selectedEquipment: 'All Equipment',
        selectedBodyPart: 'All Body Parts'
    });

    const loadingRef = useRef(false);
    const visibleItemsRef = useRef(new Set());
    const filtersRef = useRef({
        searchQuery: '',
        selectedEquipment: 'All Equipment',
        selectedBodyPart: 'All Body Parts'
    });

    // Memoized metadata
    const metadata = useMemo(() => ({
        uniqueEquipment: ['All Equipment', ...ExerciseEquipment.values()],
        uniqueBodyParts: ['All Body Parts', ...ExerciseBodyPart.values()]
    }), []);

    // Debounced search handler
    const debouncedSearch = useMemo(() => debounce((query) => {
        filtersRef.current.searchQuery = query;
        setState(prev => ({ ...prev, searchQuery: query }));
        loadExercises(true); // Reset and reload exercises
    }, 300), []); // 300ms debounce delay

    const handleSearchChange = useCallback((query) => {
        setState(prev => ({ ...prev, searchQuery: query })); // Update UI immediately
        debouncedSearch(query); // Trigger debounced search
    }, [debouncedSearch]);

    const handleEquipmentChange = useCallback((equipment) => {
        filtersRef.current.selectedEquipment = equipment;
        setState(prev => ({ ...prev, selectedEquipment: equipment }));
    }, []);

    const handleBodyPartChange = useCallback((bodyPart) => {
        filtersRef.current.selectedBodyPart = bodyPart;
        setState(prev => ({ ...prev, selectedBodyPart: bodyPart }));
    }, []);

    const loadExercises = useCallback(async (reset = false) => {
        if (loadingRef.current || (!state.hasMore && !reset)) return;

        loadingRef.current = true;
        const pageToLoad = reset ? 0 : state.currentPage;

        try {
            const query = {
                searchQuery: filtersRef.current.searchQuery,
                equipment: filtersRef.current.selectedEquipment === 'All Equipment' ? null : filtersRef.current.selectedEquipment,
                bodyPart: filtersRef.current.selectedBodyPart === 'All Body Parts' ? null : filtersRef.current.selectedBodyPart,
                skip: pageToLoad * PAGE_SIZE,
                limit: PAGE_SIZE
            };

            const { exercises: newExercises, hasMore: moreAvailable, totalCount } =
                await SqliteService.getFilteredExercises(query);

            setState(prev => ({
                ...prev,
                exercises: reset ? newExercises : [...prev.exercises, ...newExercises],
                hasMore: moreAvailable,
                currentPage: reset ? 1 : pageToLoad + 1,
                totalCount,
                isLoading: false,
                isInitialLoad: false
            }));
        } catch (error) {
            console.error('Error loading exercises:', error);
            setState(prev => ({ ...prev, hasMore: false, isLoading: false, isInitialLoad: false }));
        } finally {
            loadingRef.current = false;
        }
    }, [state.currentPage, state.hasMore]);

    useEffect(() => {
        loadExercises(true);
    }, [state.selectedEquipment, state.selectedBodyPart]);

    const onViewableItemsChanged = useCallback(({ changed }) => {
        changed.forEach(change => {
            const method = change.isViewable ? 'add' : 'delete';
            visibleItemsRef.current[method](change.key);
        });
    }, []);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300
    }), []);

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged }
    ]);

    const renderExerciseItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => navigation.navigate('NewRoutine', {selectedExercise: item})}
        >
            <ExerciseVideo
                id={item.id}
                isVisible={visibleItemsRef.current.has(item.id)}
                size={15}
                borderRadius={2}
                customStyles={{ marginRight: responsiveWidth(4) }}
                onError={(error) => console.warn(`Video error for exercise ${item.id}:`, error)}
            />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{capitalizeFirstLetterAllWords(item.bodyPart)} - {capitalizeFirstLetterAllWords(item.equipment)}</Text>
            </View>
        </TouchableOpacity>
    ), [navigation]);

    const renderFooter = useCallback(() => {
        if (state.isInitialLoad) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4C24FF" />
                </View>
            );
        }

        if (state.isLoading && !state.isInitialLoad) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#4C24FF" />
                </View>
            );
        }

        if (state.hasMore && state.exercises.length >= PAGE_SIZE) {
            return (
                <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => loadExercises()}
                >
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                </TouchableOpacity>
            );
        }

        if (!state.hasMore && state.exercises.length > 0) {
            return (
                <View style={styles.endMessageContainer}>
                    <Text style={styles.endMessageText}>No more exercises to load</Text>
                </View>
            );
        }

        return null;
    }, [state.isLoading, state.hasMore, state.exercises.length, state.isInitialLoad]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Exercise</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CustomExercise')}>
                        <Text style={styles.headerButtonText}>Custom</Text>
                    </TouchableOpacity>
                </View>

                <FilterModal
                    equipmentOptions={metadata.uniqueEquipment}
                    bodyPartOptions={metadata.uniqueBodyParts}
                    selectedEquipment={state.selectedEquipment}
                    selectedBodyPart={state.selectedBodyPart}
                    onEquipmentChange={handleEquipmentChange}
                    onBodyPartChange={handleBodyPartChange}
                    searchQuery={state.searchQuery}
                    onSearchChange={handleSearchChange}
                />

                <View style={styles.listHeader}>
                    <Text style={styles.listHeaderText}>Exercises</Text>
                    <View style={styles.listHeaderLine} />
                </View>

                <FlatList
                    data={state.exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={(item) => item.id.toString()}
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                    removeClippedSubviews={true}
                    initialNumToRender={5}
                    ListFooterComponent={renderFooter}
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
        paddingVertical: responsiveHeight(2.5),
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
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: responsiveWidth(2),
        marginBottom: responsiveHeight(1.5),
        padding: responsiveWidth(3),
        marginHorizontal: responsiveWidth(4),
    },
    exerciseTextContainer: {
        flex: 1,
    },
    exerciseName: {
        fontWeight: 'bold',
        color: '#FFF',
        fontSize: responsiveWidth(4.5),
    },
    exerciseMuscle: {
        color: '#888',
        fontSize: responsiveWidth(3.8),
    },
    loaderContainer: {
        paddingVertical: responsiveHeight(2),
        alignItems: 'center',
    },
    loadMoreButton: {
        backgroundColor: '#4C24FF',
        padding: responsiveHeight(2),
        margin: responsiveWidth(4),
        borderRadius: responsiveWidth(2),
        alignItems: 'center',
    },
    loadMoreButtonText: {
        color: '#FFF',
        fontSize: responsiveWidth(4),
        fontWeight: 'bold',
    },
    endMessageContainer: {
        padding: responsiveHeight(2),
        alignItems: 'center',
    },
    endMessageText: {
        color: '#888',
        fontSize: responsiveWidth(3.5),
    },
    listHeader: {
        marginHorizontal: responsiveWidth(4), // Match list item horizontal margin
        marginVertical: responsiveHeight(1),
    },
    listHeaderText: {
        color: '#FFF',
        fontSize: responsiveWidth(4),
        marginTop: responsiveHeight(1.5),
    },
    listHeaderLine: {
        height: 0.8,
        backgroundColor: '#FFF'
    },
});

export default AddExerciseScreen;