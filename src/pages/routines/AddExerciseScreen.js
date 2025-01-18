import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Modal } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import SearchBar from '../../components/SearchBar';
import SqliteService from '../../services/SqliteService';
import ExerciseBodyPart from '../../enums/ExerciseBodyPart';
import ExerciseEquipment from '../../enums/ExerciseEquipment';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const PAGE_SIZE = 20;

const AddExerciseScreen = ({ navigation }) => {
    const [exercises, setExercises] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('All Equipment');
    const [selectedBodyPart, setSelectedBodyPart] = useState('All Body Parts');
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalOptions, setModalOptions] = useState([]);
    const [uniqueEquipment, setUniqueEquipment] = useState(['All Equipment']);
    const [uniqueBodyParts, setUniqueBodyParts] = useState(['All Body Parts']);
    const [visibleItems, setVisibleItems] = useState(new Set());
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const lastLoadTimeRef = useRef(Date.now());
    const loadingRef = useRef(false);

    // Load initial data and metadata
    useEffect(() => {
        loadMetadata();
        loadInitialExercises();
    }, []);

    const loadInitialExercises = async () => {
        setIsInitialLoad(true);
        setCurrentPage(0);
        setExercises([]);
        await loadExercises(true);
        setIsInitialLoad(false);
    };

    // Load metadata (unique equipment and body parts)
    const loadMetadata = () => {
        const equipmentValues = Object.values(ExerciseEquipment)
            .filter(value => typeof value === 'string');
        const bodyPartValues = Object.values(ExerciseBodyPart)
            .filter(value => typeof value === 'string');

        setUniqueEquipment(['All Equipment', ...equipmentValues]);
        setUniqueBodyParts(['All Body Parts', ...bodyPartValues]);
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        const newVisibleItems = new Set(viewableItems.map(item => item.item.id));
        setVisibleItems(prevItems => {
            if (areSetsDifferent(prevItems, newVisibleItems)) {
                return newVisibleItems;
            }
            return prevItems;
        });
    }, []);
    
    const areSetsDifferent = (setA, setB) => {
        if (setA.size !== setB.size) return true;
        for (const item of setA) {
            if (!setB.has(item)) return true;
        }
        return false;
    };

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
        waitForInteraction: true,
    }), []);

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged }
    ]);

    // Load exercises with pagination and filters
    const loadExercises = useCallback(async (reset = false) => {
        if (loadingRef.current || (!hasMore && !reset)) return;

        const pageToLoad = reset ? 0 : currentPage;

        try {
            const query = {
                searchQuery,
                equipment: selectedEquipment === 'All Equipment' ? null : selectedEquipment,
                bodyPart: selectedBodyPart === 'All Body Parts' ? null : selectedBodyPart,
                skip: pageToLoad * PAGE_SIZE,
                limit: PAGE_SIZE
            };

            const { exercises: newExercises, hasMore: moreAvailable, totalCount: total } =
                await SqliteService.getFilteredExercises(query);

            setTotalCount(total);

            if (newExercises.length > 0) {
                setExercises(prev => reset ? newExercises : [...prev, ...newExercises]);
                setHasMore(moreAvailable);
                setCurrentPage(reset ? 1 : pageToLoad + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
            setHasMore(false);
        }
    }, [currentPage, searchQuery, selectedEquipment, selectedBodyPart, hasMore]);


    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        loadInitialExercises();
    }, []);

    const handleFilterChange = useCallback((type, value) => {
        if (type === 'equipment') {
            setSelectedEquipment(value);
        } else if (type === 'bodyPart') {
            setSelectedBodyPart(value);
        }
        loadInitialExercises();
    }, []);

    const openFilterModal = useCallback((type) => {
        setModalType(type);
        setModalOptions(type === 'equipment' ? uniqueEquipment : uniqueBodyParts);
        setIsModalVisible(true);
    }, [uniqueEquipment, uniqueBodyParts]);

    const FilterModal = useCallback(({ isVisible, options, onSelect, onClose }) => (
        <Modal visible={isVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select an Option</Text>
                    <FlatList
                        data={exercises}
                        renderItem={renderExerciseItem}
                        keyExtractor={useCallback((item) => item.id.toString(), [])}
                        style={styles.exerciseList}
                        ListFooterComponent={renderFooter}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.5}
                        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={4}
                        windowSize={3}
                        initialNumToRender={6}
                        updateCellsBatchingPeriod={50}
                        onEndReachedThresholdRelative={0.5}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 10,
                        }}
                    />
                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                        <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    ), []);


    const renderExerciseItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => {
                navigation.goBack();
            }}
        >
            <ExerciseVideo
                id={item.id}
                isVisible={visibleItems.has(item.id)}
            />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{item.bodyPart} - {item.equipment}</Text>
            </View>
        </TouchableOpacity>
    ), [navigation, visibleItems]);

    const renderFooter = useCallback(() => {
        if (isInitialLoad) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4C24FF" />
                </View>
            );
        }

        if (isLoading && !isInitialLoad) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#4C24FF" />
                </View>
            );
        }

        if (hasMore && exercises.length >= PAGE_SIZE) {
            return (
                <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => loadExercises()}
                >
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                </TouchableOpacity>
            );
        }

        if (!hasMore && exercises.length > 0) {
            return (
                <View style={styles.endMessageContainer}>
                    <Text style={styles.endMessageText}>No more exercises to load</Text>
                </View>
            );
        }

        return null;
    }, [isLoading, hasMore, exercises.length, isInitialLoad]);

    const handleEndReached = useCallback(async () => {
        const now = Date.now();
        if (loadingRef.current || !hasMore || now - lastLoadTimeRef.current < 1000) {
            return;
        }

        loadingRef.current = true;
        lastLoadTimeRef.current = now;

        try {
            setLoadingMore(true);
            await loadExercises();
        } finally {
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }, [hasMore, loadExercises]);

    const ExerciseVideo = React.memo(({ id, isVisible }) => {
        const [isLoading, setIsLoading] = useState(true);
        const [videoError, setVideoError] = useState(false);
        const videoRef = useRef(null);
        const lastVisibleRef = useRef(isVisible);
        const uri = `file:///android_asset/videos/${id}.mp4`;
        const videoSource = useMemo(() => ({
            uri: uri
        }), [id]);

        console.log(uri);

        // Only update video state when visibility actually changes
        useEffect(() => {
            if (lastVisibleRef.current !== isVisible) {
                lastVisibleRef.current = isVisible;
                if (videoRef.current) {
                    if (isVisible) {
                        videoRef.current.seek(0);
                    }
                }
            }
        }, [isVisible]);

        const onLoadStart = useCallback(() => {
            setIsLoading(true);
            setVideoError(false);
        }, []);

        const onLoad = useCallback(() => {
            setIsLoading(false);
        }, []);

        const onError = useCallback((error) => {
            console.warn(`Video loading error for ${id}:`, error);
            setVideoError(true);
            setIsLoading(false);
        }, [id]);

        if (videoError) {
            return (
                <View style={styles.exerciseImagePlaceholder}>
                    <Text style={styles.errorText}>!</Text>
                </View>
            );
        }

        return (
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={videoSource}
                    style={styles.exerciseVideo}
                    repeat={true}
                    resizeMode="cover"
                    muted={true}
                    playInBackground={false}
                    playWhenInactive={false}
                    paused={!isVisible}
                    onLoadStart={onLoadStart}
                    onLoad={onLoad}
                    onError={onError}
                    //poster="placeholder.png"
                    posterResizeMode="cover"
                />
                {isLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="small" color="#4C24FF" />
                    </View>
                )}
            </View>
        );
    }, (prevProps, nextProps) => {
        // Custom comparison to prevent unnecessary rerenders
        return prevProps.id === nextProps.id &&
            prevProps.isVisible === nextProps.isVisible;
    });

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

                <SearchBar placeholder="Search exercises" value={searchQuery} onChangeText={handleSearch} />

                <View style={styles.filterContainer}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('equipment')}>
                        <Text style={styles.filterButtonText}>{selectedEquipment}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('bodyPart')}>
                        <Text style={styles.filterButtonText}>{selectedBodyPart}</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.exerciseList}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    initialNumToRender={4}
                />

                <FilterModal
                    isVisible={isModalVisible}
                    options={modalOptions}
                    onSelect={(value) => handleFilterChange(modalType, value)}
                    onClose={() => setIsModalVisible(false)}
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