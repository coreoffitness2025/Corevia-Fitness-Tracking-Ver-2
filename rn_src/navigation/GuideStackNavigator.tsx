import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens for the guide stack
import GuideScreen from '../screens/GuideScreen';
import OneRepMaxCalculatorScreen from '../screens/OneRepMaxCalculatorScreen';
import CalorieCalculatorScreen from '../screens/CalorieCalculatorScreen';
import NutritionGuideScreen from '../screens/NutritionGuideScreen';
import WorkoutWeightGuideScreen from '../features/workout/screens/WorkoutWeightGuideScreen';
import ExerciseListScreen from '../features/exercise/screens/ExerciseListScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import HandbookScreen from '../screens/HandbookScreen';
import HandbookDetailScreen from '../screens/HandbookDetailScreen';
import ProgramRecommendationScreen from '../screens/ProgramRecommendationScreen';
import ProgramRecommendationDetailScreen from '../screens/ProgramRecommendationDetailScreen';

const GuideStack = createNativeStackNavigator();

const GuideStackNavigator = () => {
  return (
    <GuideStack.Navigator>
      <GuideStack.Screen 
        name="GuideHome"
        component={GuideScreen} 
        options={{ headerShown: false }}
      />
      <GuideStack.Screen 
        name="OneRepMaxCalculator" 
        component={OneRepMaxCalculatorScreen}
        options={{ title: '1RM 계산기' }}
      />
      <GuideStack.Screen 
        name="CalorieCalculator" 
        component={CalorieCalculatorScreen}
        options={{ title: '목표 칼로리 계산기' }}
      />
      <GuideStack.Screen 
        name="NutritionGuide" 
        component={NutritionGuideScreen}
        options={{ title: '음식 영양성분' }}
      />
      <GuideStack.Screen 
        name="WorkoutWeightGuide" 
        component={WorkoutWeightGuideScreen}
        options={{ title: '운동 무게 추천' }}
      />
      <GuideStack.Screen 
        name="ExerciseList" 
        component={ExerciseListScreen}
        options={{ title: '운동 검색' }}
      />
       <GuideStack.Screen 
        name="MealPlan" 
        component={MealPlanScreen}
        options={{ title: '식단 추천' }}
      />
       <GuideStack.Screen 
        name="Handbook" 
        component={HandbookScreen}
        options={{ title: '핸드북' }}
      />
      <GuideStack.Screen 
        name="HandbookDetail" 
        component={HandbookDetailScreen}
        options={{ title: '아티클 상세' }}
      />
      <GuideStack.Screen 
        name="ProgramRecommendation" 
        component={ProgramRecommendationScreen}
        options={{ title: '운동 프로그램 추천' }}
      />
      <GuideStack.Screen 
        name="ProgramRecommendationDetail" 
        component={ProgramRecommendationDetailScreen}
        options={{ title: '추천 프로그램 상세' }}
      />
    </GuideStack.Navigator>
  );
};

export default GuideStackNavigator; 