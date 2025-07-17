import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens for the food stack
import FoodScreen from '../screens/FoodScreen';
import FoodLogListScreen from '../screens/FoodLogListScreen';
import FoodForm from '../components/FoodForm'; // components 폴더에 있을 수 있음

const FoodStack = createNativeStackNavigator();

const FoodStackNavigator = () => {
  return (
    <FoodStack.Navigator>
      <FoodStack.Screen 
        name="FoodHome"
        component={FoodScreen} 
        options={{ headerShown: false }}
      />
      <FoodStack.Screen 
        name="FoodLogList"
        component={FoodLogListScreen} 
        options={{ title: '내 식단 기록' }}
      />
      <FoodStack.Screen 
        name="FoodForm" 
        component={FoodForm}
        options={{ title: '식단 기록하기', presentation: 'modal' }}
      />
    </FoodStack.Navigator>
  );
};

export default FoodStackNavigator; 