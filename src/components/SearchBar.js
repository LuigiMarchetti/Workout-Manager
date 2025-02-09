// SearchBar.js
import React from 'react';
import { View, StyleSheet, TextInput, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const responsiveFontSize = (size) => (width * size) / 375; // Assuming design is based on 375px width

const SearchBar = ({ placeholder, onChangeText }) => {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#888"
                onChangeText={onChangeText} // Pass the onChangeText prop
            />
            <Image
                source={require('../../assets/search.png')}
                style={styles.searchIcon}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: responsiveWidth(3),
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(4.5),
        alignItems: 'center',
        marginVertical: responsiveHeight(2),
        marginHorizontal: responsiveWidth(4),
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: responsiveFontSize(17.5),
        paddingVertical: responsiveHeight(1),
    },
    searchIcon: {
        width: responsiveWidth(7),
        height: responsiveWidth(7),
        tintColor: '#FFFFFF',
    },
});

export default SearchBar;