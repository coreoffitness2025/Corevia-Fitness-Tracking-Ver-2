import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { useAuth } from '../features/auth/contexts/AuthContext';

// Screens
import HomePage from '../screens/HomePage';
import FoodScreen from '../screens/FoodScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';

// Navigators
import WorkoutStackNavigator from './WorkoutStackNavigator';
import GuideStackNavigator from './GuideStackNavigator';
import FoodStackNavigator from './FoodStackNavigator';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName = 'home'; // default
                if (route.name === 'Home') iconName = 'home';
                else if (route.name === 'Workout') iconName = 'dumbbell';
                else if (route.name === 'Food') iconName = 'utensils';
                else if (route.name === 'Guide') iconName = 'book-reader';
                else if (route.name === 'Settings') iconName = 'cog';
                return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007bff',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
        })}
    >
      <Tab.Screen name="Home" component={HomePage} options={{ title: '홈' }}/>
      <Tab.Screen name="Workout" component={WorkoutStackNavigator} options={{ title: '운동' }}/>
      <Tab.Screen name="Food" component={FoodStackNavigator} options={{ title: '식단' }} />
      <Tab.Screen name="Guide" component={GuideStackNavigator} options={{ title: '가이드' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    return (
        <NavigationContainer>
            {currentUser ? <BottomTabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator; 