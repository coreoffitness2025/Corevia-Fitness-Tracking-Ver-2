import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens for the workout stack
import WorkoutScreen from '../features/workout/screens/WorkoutScreen';
import WorkoutProgramScreen from '../screens/WorkoutProgramScreen';
import EditWorkoutProgramScreen from '../screens/EditWorkoutProgramScreen';
import WorkoutProgramDetailScreen from '../screens/WorkoutProgramDetailScreen';
import PerformWorkoutScreen from '../screens/PerformWorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import WorkoutLogListScreen from '../screens/WorkoutLogListScreen';
import WorkoutGraphScreen from '../screens/WorkoutGraphScreen'; // Import the new screen

const WorkoutStack = createNativeStackNavigator();

const WorkoutStackNavigator = () => {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen 
        name="WorkoutHome"
        component={WorkoutScreen} 
        options={{ headerShown: false }}
      />
      <WorkoutStack.Screen 
        name="WorkoutLogList"
        component={WorkoutLogListScreen} 
        options={{ title: '지난 운동 기록' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutProgramList"
        component={WorkoutProgramScreen} 
        options={{ title: '내 운동 프로그램' }}
      />
      <WorkoutStack.Screen 
        name="EditWorkoutProgram" 
        component={EditWorkoutProgramScreen} 
        options={{ title: '프로그램 편집' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutProgramDetail" 
        component={WorkoutProgramDetailScreen} 
        options={{ title: '프로그램 상세' }}
      />
      <WorkoutStack.Screen 
        name="PerformWorkout"
        component={PerformWorkoutScreen} 
        options={{ title: '운동 수행' }}
      />
       <WorkoutStack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen} 
        options={{ title: '지난 운동 기록' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutGraph"
        component={WorkoutGraphScreen} 
        options={{ title: '운동 성과 분석' }}
      />
    </WorkoutStack.Navigator>
  );
};

export default WorkoutStackNavigator; 