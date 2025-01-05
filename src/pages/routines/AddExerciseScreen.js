import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import SearchBar from '../../components/SearchBar';
import RealmService from '../../services/RealmService';

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
    const [uniqueEquipment, setUniqueEquipment] = useState([]);
    const [uniqueBodyParts, setUniqueBodyParts] = useState([]);

    // Load initial data and metadata
    useEffect(() => {
        loadMetadata();
        loadExercises(true);
    }, []);

    // Load metadata (unique equipment and body parts)
    const loadMetadata = () => {
        const allExercises = RealmService.getAllExercises();
        const equipmentSet = new Set(['All Equipment']);
        const bodyPartsSet = new Set(['All Body Parts']);

        allExercises.forEach(exercise => {
            equipmentSet.add(exercise.equipment);
            bodyPartsSet.add(exercise.bodyPart);
        });

        setUniqueEquipment(Array.from(equipmentSet));
        setUniqueBodyParts(Array.from(bodyPartsSet));
    };

    // Load exercises with pagination and filters
    const loadExercises = useCallback(async (reset = false) => {
        if (isLoading || (!hasMore && !reset)) return;
    
        setIsLoading(true);
        const newPage = reset ? 0 : currentPage;
        
        try {
            const query = {
                searchQuery,
                equipment: selectedEquipment,
                bodyPart: selectedBodyPart,
                skip: newPage * PAGE_SIZE,
                limit: PAGE_SIZE
            };
    
            const { exercises: newExercises, hasMore: moreAvailable } = RealmService.getFilteredExercises(query);
    
            // Convert Realm objects to plain objects
            const exerciseArray = newExercises.map(exercise => ({
                id: exercise.id,
                name: exercise.name,
                bodyPart: exercise.bodyPart,
                equipment: exercise.equipment,
                target: exercise.target,
                mediaFileName: exercise.mediaFileName,
            }));
    
            setExercises(reset ? exerciseArray : [...exercises, ...exerciseArray]);
            setHasMore(moreAvailable);
            setCurrentPage(reset ? 1 : newPage + 1);
        } catch (error) {
            console.error('Error loading exercises:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, selectedEquipment, selectedBodyPart, hasMore, exercises]);

    // Handle search input
    const handleSearch = (query) => {
        setSearchQuery(query);
        setExercises([]);
        setCurrentPage(0);
        setHasMore(true);
        loadExercises(true);
    };

    // Handle filter changes
    const handleFilterChange = (type, value) => {
        if (type === 'equipment') {
            setSelectedEquipment(value);
        } else {
            setSelectedBodyPart(value);
        }
        setExercises([]);
        setCurrentPage(0);
        setHasMore(true);
        loadExercises(true);
    };

    const renderExerciseItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.exerciseItem}
            onPress={() => {
                // Handle exercise selection
                navigation.goBack();
            }}
        >
            <View style={styles.exerciseImagePlaceholder} />
            <View style={styles.exerciseTextContainer}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMuscle}>{item.bodyPart} - {item.equipment}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!isLoading) return null;
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4C24FF" />
            </View>
        );
    };

    const renderLoadMoreButton = () => {
        if (!hasMore || isLoading) return null;
        return (
            <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={() => loadExercises()}
            >
                <Text style={styles.loadMoreButtonText}>Load More</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.headerButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Exercise</Text>
                    <TouchableOpacity 
                        style={styles.headerButton} 
                        onPress={() => navigation.navigate('CustomExercise')}
                    >
                        <Text style={styles.headerButtonText}>Custom</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <SearchBar 
                    placeholder="Search exercises" 
                    value={searchQuery}
                    onChangeText={handleSearch}
                />

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => {
                            const currentIndex = uniqueEquipment.indexOf(selectedEquipment);
                            const nextEquipment = uniqueEquipment[(currentIndex + 1) % uniqueEquipment.length];
                            handleFilterChange('equipment', nextEquipment);
                        }}
                    >
                        <Text style={styles.filterButtonText}>{selectedEquipment}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => {
                            const currentIndex = uniqueBodyParts.indexOf(selectedBodyPart);
                            const nextBodyPart = uniqueBodyParts[(currentIndex + 1) % uniqueBodyParts.length];
                            handleFilterChange('bodyPart', nextBodyPart);
                        }}
                    >
                        <Text style={styles.filterButtonText}>{selectedBodyPart}</Text>
                    </TouchableOpacity>
                </View>

                {/* Exercise List */}
                <FlatList
                    data={exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.exerciseList}
                    ListFooterComponent={
                        <>
                            {renderFooter()}
                            {renderLoadMoreButton()}
                        </>
                    }
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
        flex: 0.475, // Each button takes up ~47.5% of the container
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonText: {
        color: '#FFF',
        fontSize: responsiveWidth(3.8),
        textAlign: 'center',
    },
    listTitle: {
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(-0.5),
        marginLeft: responsiveWidth(0.7),
        paddingHorizontal: responsiveWidth(4),
        fontSize: responsiveWidth(3.8),
        color: '#888',
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
    exerciseImage: {
        width: responsiveWidth(12),
        height: responsiveWidth(12),
        marginRight: responsiveWidth(4),
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
    exerciseImagePlaceholder: {
        width: responsiveWidth(12),
        height: responsiveWidth(12),
        marginRight: responsiveWidth(4),
        backgroundColor: '#333',
        borderRadius: responsiveWidth(1),
    },
});

export default AddExerciseScreen;