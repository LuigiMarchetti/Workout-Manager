import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Header from './Header';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;
const responsiveFontSize = (size) => (width * size) / 375; // Assuming design is based on 375px width

export default function ProfileScreen({ navigation }) {
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none"
      }
    });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: undefined
    });
  }, [navigation]);

  return (
    <>
      <Header
        title="Profile"
        showProfileIcon={false}
      />
      <View style={styles.screen}>
        {/* Profile Container */}
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/account.png')} // Replace with your user icon
            style={styles.profileImage}
          />
          <Text style={styles.username}>Anonymous user</Text>
          <TouchableOpacity style={styles.signInButton}>
            <Image
              source={require('../../assets/google.png')} // Replace with your Google icon
              style={styles.googleIcon}
            />
            <Text style={styles.signInText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(10),
    paddingBottom: responsiveWidth(8),
    alignItems: 'center',
    width: responsiveWidth(80),
    marginTop: responsiveHeight(4),
  },
  profileImage: {
    width: responsiveWidth(22), // Approximately 70px on a 375px wide screen
    height: responsiveWidth(22),
    marginBottom: responsiveHeight(2),
    tintColor: '#FFFFFF',
  },
  username: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(3),
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveWidth(2),
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  googleIcon: {
    width: responsiveWidth(5), // Approximately 20px on a 375px wide screen
    height: responsiveWidth(5),
    marginRight: responsiveWidth(2),
  },
  signInText: {
    color: '#000000',
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
});