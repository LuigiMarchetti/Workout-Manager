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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoutinesMain" component={RoutinesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutsMain" component={WorkoutsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const baseIconSize = Math.min(windowWidth, windowHeight) * 0.06;
  const tabBarHeight = windowHeight * 0.085;

  return (
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
          tabBarHideOnKeyboard: true,
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
          tabBarActiveTintColor: '#4C24FF',
          tabBarInactiveTintColor: '#FFFFFF',
        };
      }}
    >
      <Tab.Screen name="Routines" component={RoutinesStack} />
      <Tab.Screen name="Workout" component={WorkoutsStack} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
    </Tab.Navigator>
  );
}


export default function Routes() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1A1A' }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="NewWorkout" component={NewWorkoutScreen} />
          <Stack.Screen name="NewRoutine" component={NewRoutineScreen} />
          <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
          <Stack.Screen name="CustomExercise" component={CustomExerciseScreen} />
        </Stack.Navigator>
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
