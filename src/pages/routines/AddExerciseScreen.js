import React, { useEffect, useState, useCallback, useRef, useMemo, useImperativeHandle } from 'react';
import { Modal } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import Video from 'react-native-video';
import SearchBar from '../../components/SearchBar';
import SqliteService from '../../services/SqliteService';
import ExerciseBodyPart from '../../enums/ExerciseBodyPart';
import ExerciseEquipment from '../../enums/ExerciseEquipment';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const PAGE_SIZE = 20;

const AddExerciseScreen = ({ navigation }) => {
    // Combined state object to reduce re-renders
    const [state, setState] = useState({
        exercises: [],
        hasMore: true,
        isLoading: false,
        isInitialLoad: true,
        totalCount: 0,
        currentPage: 0
    });

    // Filter state separated as it triggers data reload
    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedEquipment: 'All Equipment',
        selectedBodyPart: 'All Body Parts'
    });

    // Modal state
    const [modal, setModal] = useState({
        isVisible: false,
        type: null,
        options: []
    });

    // Refs
    const cellRefs = useRef({});
    const loadingRef = useRef(false);
    const lastLoadTimeRef = useRef(Date.now());
    const visibleItemsRef = useRef(new Set());

    // Memoized metadata
    const metadata = useMemo(() => ({
        uniqueEquipment: ['All Equipment', ...Object.values(ExerciseEquipment).filter(value => typeof value === 'string')],
        uniqueBodyParts: ['All Body Parts', ...Object.values(ExerciseBodyPart).filter(value => typeof value === 'string')]
    }), []);

    // Load exercises function
    const loadExercises = useCallback(async (reset = false) => {
        if (loadingRef.current || (!state.hasMore && !reset)) return;

        loadingRef.current = true;
        const pageToLoad = reset ? 0 : state.currentPage;

        try {
            const query = {
                searchQuery: filters.searchQuery,
                equipment: filters.selectedEquipment === 'All Equipment' ? null : filters.selectedEquipment,
                bodyPart: filters.selectedBodyPart === 'All Body Parts' ? null : filters.selectedBodyPart,
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
            setState(prev => ({
                ...prev,
                hasMore: false,
                isLoading: false,
                isInitialLoad: false
            }));
        } finally {
            loadingRef.current = false;
        }
    }, [filters, state.currentPage, state.hasMore]);

    // Initial load
    useEffect(() => {
        loadExercises(true);
    }, [filters]); // Only reload when filters change

    // Video visibility handler
    const onViewableItemsChanged = useCallback(({ changed }) => {
        changed.forEach(change => {
            if (change.isViewable) {
                visibleItemsRef.current.add(change.key);
            } else {
                visibleItemsRef.current.delete(change.key);
            }
        });
    }, []);


    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300
    }), []);

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged }
    ]);

    // Exercise Video Component
    const ExerciseVideo = React.memo(
        React.forwardRef(({ id, isVisible }, ref) => {
            const videoRef = useRef(null);
            const [isPaused, setIsPaused] = useState(!isVisible);
            const [videoState, setVideoState] = useState({
                isLoading: true,
                error: null,
            }); 

            useEffect(() => {
                setIsPaused(!isVisible);
            }, [isVisible]);

            useImperativeHandle(ref, () => ({
                play: () => videoRef.current && videoRef.current.play(),
                pause: () => videoRef.current && videoRef.current.pause(),
            }));

            return (
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: `file:///android_asset/videos/${id}.mp4` }}
                        style={styles.exerciseVideo}
                        resizeMode="cover"
                        repeat={true}
                        paused={isPaused}
                        onLoadStart={() => setVideoState(prev => ({ ...prev, isLoading: true }))}
                        onLoad={() => setVideoState(prev => ({ ...prev, isLoading: false }))}
                        onError={(error) => {
                            console.error(`Error loading video ${id}:`, error);
                            setVideoState({ isLoading: false, error });
                        }}
                    />
                    {videoState.isLoading && (
                        <View style={styles.loaderOverlay}>
                            <ActivityIndicator size="small" color="#4C24FF" />
                        </View>
                    )}
                </View>
            );
        })
    );

    // Render functions
    const renderExerciseItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => navigation.goBack()}
        >
            <ExerciseVideo
                ref={(ref) => { cellRefs.current[item.id] = ref; }}
                id={item.id}
                isVisible={visibleItemsRef.current.has(item.id)}
            />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{item.bodyPart} - {item.equipment}</Text>
            </View>
        </TouchableOpacity>
    ), [navigation]);

    // Handler functions
    const handleSearch = useCallback((query) => {
        setFilters(prev => ({ ...prev, searchQuery: query }));
    }, []);

    const handleFilterChange = useCallback((type, value) => {
        setFilters(prev => ({
            ...prev,
            [type === 'equipment' ? 'selectedEquipment' : 'selectedBodyPart']: value
        }));
        setModal(prev => ({ ...prev, isVisible: false }));
    }, []);

    const openFilterModal = useCallback((type) => {
        setModal({
            isVisible: true,
            type,
            options: type === 'equipment' ? metadata.uniqueEquipment : metadata.uniqueBodyParts
        });
    }, [metadata]);

    // Rest of your component remains the same, just update the references to state properties
    // ... (existing render method and styles)

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

    const FilterModal = useCallback(({ isVisible, options, onSelect, onClose }) => (
        <Modal visible={isVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select an Option</Text>
                    <FlatList
                        data={options} // Use the options passed to the modal, not state.exercises
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => onSelect(item)}>
                                <Text style={styles.modalOption}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.toString()}
                    />
                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                        <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    ), []);


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

                <SearchBar placeholder="Search exercises" value={filters.searchQuery} onChangeText={handleSearch} />

                <View style={styles.filterContainer}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('equipment')}>
                        <Text style={styles.filterButtonText}>{filters.selectedEquipment}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('bodyPart')}>
                        <Text style={styles.filterButtonText}>{filters.selectedBodyPart}</Text>
                    </TouchableOpacity>
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
                />

                <FilterModal
                    isVisible={modal.isVisible}
                    options={modal.options}
                    onSelect={(value) => handleFilterChange(modal.type, value)}
                    onClose={() => setModal(prev => ({ ...prev, isVisible: false }))}
                />
            </View>
        </SafeAreaView>
    );
};

// Your existing styles remain the same
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
        paddingHorizontal: responsiveWidth(4),
        marginBottom: responsiveHeight(2),
    },
    filterButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: responsiveWidth(2),
        paddingVertical: responsiveHeight(1.5),
        paddingHorizontal: responsiveWidth(6),
        flex: 0.475,
        alignItems: 'center',
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
        borderRadius: responsiveWidth(2),
        marginBottom: responsiveHeight(1.5),
        padding: responsiveWidth(3),
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
    exerciseImagePlaceholder: {
        width: responsiveWidth(12),
        height: responsiveWidth(12),
        marginRight: responsiveWidth(4),
        backgroundColor: '#333',
        borderRadius: responsiveWidth(1),
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 10,
        width: responsiveWidth(80),
    },
    modalList: {
        maxHeight: responsiveHeight(50),
    },
    modalTitle: {
        color: '#FFF',
        fontSize: responsiveWidth(4.5),
        marginBottom: 10,
    },
    modalOption: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    modalOptionText: {
        color: '#FFF',
        fontSize: responsiveWidth(4),
    },
    modalCloseButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#4C24FF',
        fontSize: responsiveWidth(4),
    },
    endMessageContainer: {
        padding: responsiveHeight(2),
        alignItems: 'center',
    },
    endMessageText: {
        color: '#888',
        fontSize: responsiveWidth(3.5),
    },
    exerciseVideo: {
        width: responsiveWidth(20),
        height: responsiveWidth(20),
        marginRight: responsiveWidth(4),
        borderRadius: responsiveWidth(1),
        backgroundColor: '#333', // Fallback color
        overflow: 'hidden', // Ensure video respects borderRadius
    },
    exerciseImagePlaceholder: {
        width: responsiveWidth(20),
        height: responsiveWidth(20),
        marginRight: responsiveWidth(4),
        backgroundColor: '#333',
        borderRadius: responsiveWidth(1),
    },
    videoContainer: {
        position: 'relative',
        width: responsiveWidth(20),
        height: responsiveWidth(20),
        marginRight: responsiveWidth(4),
        borderRadius: responsiveWidth(1),
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FFF',
        fontSize: responsiveWidth(6),
        textAlign: 'center',
        lineHeight: responsiveWidth(20),
    },
});

export default AddExerciseScreen;