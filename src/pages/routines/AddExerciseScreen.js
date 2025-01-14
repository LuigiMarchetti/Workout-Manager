import React, { useEffect, useState, useCallback } from 'react';
import { Modal } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import SearchBar from '../../components/SearchBar';
import SqliteService from '../../services/SqliteService';
import ExerciseBodyPart from '../../enums/ExerciseBodyPart';
import ExerciseEquipment from '../../enums/ExerciseEquipment';

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalOptions, setModalOptions] = useState([]);
    const [uniqueEquipment, setUniqueEquipment] = useState(['All Equipment']);
    const [uniqueBodyParts, setUniqueBodyParts] = useState(['All Body Parts']);

    // Load initial data and metadata
    useEffect(() => {
        loadMetadata();
        loadExercises(true);
    }, []);

    // Load metadata (unique equipment and body parts)
    const loadMetadata = () => {
        const equipmentValues = Object.values(ExerciseEquipment)
            .filter(value => typeof value === 'string');
        const bodyPartValues = Object.values(ExerciseBodyPart)
            .filter(value => typeof value === 'string');

        setUniqueEquipment(['All Equipment', ...equipmentValues]);
        setUniqueBodyParts(['All Body Parts', ...bodyPartValues]);
    };

    // Load exercises with pagination and filters
    const loadExercises = useCallback(async (reset = false) => {
        if (isLoading || (!hasMore && !reset)) return;

        setIsLoading(true);
        const newPage = reset ? 0 : currentPage;

        try {
            const query = {
                searchQuery,
                equipment: selectedEquipment === 'All Equipment' ? null : selectedEquipment,
                bodyPart: selectedBodyPart === 'All Body Parts' ? null : selectedBodyPart,
                skip: newPage * PAGE_SIZE,
                limit: PAGE_SIZE // This ensures we only get 20 items per load
            };

            const { exercises: newExercises, hasMore: moreAvailable } = await SqliteService.getFilteredExercises(query);

            if (newExercises?.length > 0) {
                const exerciseArray = newExercises.map(exercise => ({
                    id: exercise.id,
                    name: exercise.name,
                    bodyPart: exercise.bodyPart,
                    equipment: exercise.equipment,
                    target: exercise.target,
                    mediaFileName: exercise.mediaFileName,
                }));

                setExercises(prev => reset ? exerciseArray : [...prev, ...exerciseArray]);
                setHasMore(moreAvailable);
                setCurrentPage(reset ? 1 : newPage + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, selectedEquipment, selectedBodyPart, isLoading, hasMore]);
    
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setExercises([]);
        setCurrentPage(0);
        setHasMore(true);
        loadExercises(true);
    }, [loadExercises]);

    const handleFilterChange = useCallback((type, value) => {
        if (type === 'equipment') {
            setSelectedEquipment(value);
        } else if (type === 'bodyPart') {
            setSelectedBodyPart(value);
        }
        setExercises([]);
        setCurrentPage(0);
        setHasMore(true);
        loadExercises(true);
    }, [loadExercises]);

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
                        data={options}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalOptionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.modalList}
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
            <View style={styles.exerciseImagePlaceholder} />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{item.bodyPart} - {item.equipment}</Text>
            </View>
        </TouchableOpacity>
    ), [navigation]);

    const renderFooter = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4C24FF" />
                </View>
            );
        }

        if (hasMore) {
            return (
                <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => loadExercises()}
                >
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                </TouchableOpacity>
            );
        }

        return null;
    }, [isLoading, hasMore, loadExercises]);

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
                    onEndReachedThreshold={0.5}
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
});

export default AddExerciseScreen;