import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const responsiveFontSize = (size) => (width * size) / 375; // Assuming design is based on 375px width

const Header = ({ title, onProfilePress = null, showProfileIcon = true }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        {showProfileIcon ? (
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Image
              source={require('../../assets/account.png')}
              style={styles.profileIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.profileButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Subtle line for separation
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: responsiveHeight(6.5), // Approximately 60px on a standard screen
  },
  title: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(2),
  },
  profileIcon: {
    width: responsiveWidth(8), // Approximately 32px on a standard screen
    height: responsiveWidth(8),
    tintColor: '#FFFFFF',
  },
});

export default Header;