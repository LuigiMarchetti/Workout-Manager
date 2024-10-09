import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const CustomExerciseScreen = ({ navigation }) => {
    const [exerciseName, setExerciseName] = useState('');
    const [bodyPart, setBodyPart] = useState('');
    const [equipment, setEquipment] = useState('');
    const [targetMuscle, setTargetMuscle] = useState('');
    const [instructions, setInstructions] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Custom exercise</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Image Placeholder */}
                <TouchableOpacity style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>+ Image</Text>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Exercise name"
                        placeholderTextColor="#666"
                        value={exerciseName}
                        onChangeText={setExerciseName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Body part"
                        placeholderTextColor="#666"
                        value={bodyPart}
                        onChangeText={setBodyPart}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Equipment"
                        placeholderTextColor="#666"
                        value={equipment}
                        onChangeText={setEquipment}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Target muscle"
                        placeholderTextColor="#666"
                        value={targetMuscle}
                        onChangeText={setTargetMuscle}
                    />
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Exercise instructions"
                        placeholderTextColor="#666"
                        value={instructions}
                        onChangeText={setInstructions}
                        multiline
                    />
                </View>
            </ScrollView>
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
        borderRadius: responsiveWidth(1.75),
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
    imagePlaceholder: {
        width: responsiveWidth(25),
        height: responsiveWidth(25),
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: responsiveHeight(2.5),
        borderRadius: responsiveWidth(2.5),
    },
    imagePlaceholderText: {
        color: '#4C24FF',
        fontSize: responsiveWidth(4),
    },
    formContainer: {
        paddingHorizontal: responsiveWidth(4),
    },
    input: {
        backgroundColor: '#1C1C1E',
        borderRadius: responsiveWidth(2),
        padding: responsiveWidth(3),
        marginBottom: responsiveHeight(2),
        color: '#FFF',
        fontSize: responsiveWidth(4),
    },
    multilineInput: {
        height: responsiveHeight(12),
        textAlignVertical: 'top',
    },
});

export default CustomExerciseScreen;