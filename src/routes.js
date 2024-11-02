import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import RoutinesScreen from './pages/routines/RoutinesScreen';
import WorkoutsScreen from './pages/workouts/WorkoutsScreen';
import ProfileScreen from './pages/ProfileScreen';
import StatisticsScreen from './pages/statistics/StatisticsScreen';
import NewRoutineScreen from './pages/routines/NewRoutineScreen';
import AddExerciseScreen from './pages/routines/AddExerciseScreen';
import CustomExerciseScreen from './pages/routines/CustomExerciseScreen';
import NewWorkoutScreen from './pages/workouts/NewWorkoutScreen';
import { useState } from 'react';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function RoutinesStack() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          height: 60, // Set your desired height
          paddingBottom: 15, // Adjust as needed
          borderTopColor: '#333',
          display: route.name === 'NewRoutine' ? 'none' : 'flex', // Hide tab bar on NewRoutine screen
        },
      })}
    >
      <Stack.Screen name="RoutinesMain" component={RoutinesScreen} />
      <Stack.Screen name="NewRoutine" component={NewRoutineScreen} />
      <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
      <Stack.Screen name="CustomExercise" component={CustomExerciseScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function WorkoutsStack({ navigation, route }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutsMain" component={WorkoutsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="NewWorkout" component={NewWorkoutScreen} />
    </Stack.Navigator>
  );
}


export default function Routes() {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const baseIconSize = Math.min(windowWidth, windowHeight) * 0.06;
  const tabBarHeight = windowHeight * 0.085;

  const [isProfileActive, setIsProfileActive] = useState(false);

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1A1A' }}>
        <Tab.Navigator
          initialRouteName="Workout"
          screenOptions={({ route }) => {
            let iconSource, iconSize = baseIconSize, iconTransform = [];

            if (route.name === 'Routines') {
              iconSource = require('../assets/icons/menu.png');
              iconSize = baseIconSize * 1.15;
            } else if (route.name === 'Workout') {
              iconSource = require('../assets/icons/dumbbell.png');
              iconSize = baseIconSize * 1.30;
              iconTransform = [{ rotate: '45deg' }];
            } else if (route.name === 'Statistics') {
              iconSource = require('../assets/icons/statistical.png');
            }

            return {
              headerShown: false,
              tabBarHideOnKeyboard: true, // Add this line
              animationEnabled: false,
              tabBarIcon: ({ color }) => (
                <Image
                  source={iconSource}
                  style={[
                    styles.icon,
                    { tintColor: color, width: iconSize, height: iconSize, transform: iconTransform }
                  ]}
                />
              ),
              tabBarStyle: {
                backgroundColor: '#1A1A1A',
                height: tabBarHeight,
                paddingBottom: windowHeight * 0.015,
                borderTopColor: '#333',
              },
              tabBarLabelStyle: {
                paddingBottom: 2,
              },
              tabBarActiveTintColor: isProfileActive ? 'transparent' : '#4C24FF', // Use transparent if in Profile
              tabBarInactiveTintColor: '#FFFFFF',
            };
          }}
        >
          <Tab.Screen
            name="Routines"
            component={RoutinesStack}
            listeners={({ navigation }) => ({
              focus: () => setIsProfileActive(false),
            })}
          />
          <Tab.Screen
            name="Workout"
            component={WorkoutsStack}
            listeners={({ navigation }) => ({
              focus: () => {
                navigation.addListener('state', (e) => {
                  const isProfileScreen = e?.data?.state?.routes?.[e.data.state.index]?.name === 'Profile';
                  setIsProfileActive(isProfileScreen);
                });
              }
            })}
          />
          <Tab.Screen
            name="Statistics"
            component={StatisticsScreen}
            listeners={({ navigation }) => ({
              focus: () => setIsProfileActive(false),
            })}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  text: {
    color: '#1A1A1A',
  },
  icon: {
    resizeMode: 'contain',
  },
});
