import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWorkoutProgramStore } from '../features/workout/store/workoutProgramStore';
import AppButton from '../components/common/AppButton';
import { ProgramExercise } from '../features/workout/types';

const WorkoutProgramDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { programId } = route.params as { programId: string };
  const { programs } = useWorkoutProgramStore();

  const program = programs.find(p => p.id === programId);

  if (!program) {
    return (
      <View style={styles.centered}>
        <Text>프로그램을 찾을 수 없습니다.</Text>
      </View>
    );
  }
  
  const handleStartWorkout = () => {
    navigation.navigate('PerformWorkout', { programId: program.id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{program.name}</Text>
        <Text style={styles.description}>{program.description}</Text>
      </View>

      <View style={styles.exerciseListContainer}>
        <Text style={styles.listTitle}>포함된 운동</Text>
        {program.exercises.map((exercise: ProgramExercise, index: number) => (
          <View key={exercise.id || index} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
            <Text style={styles.exerciseDetails}>
              {exercise.targetSets} sets x {exercise.targetReps} reps
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <AppButton 
          title="이 프로그램으로 운동 시작" 
          onPress={handleStartWorkout} 
          style={{marginBottom: 10}}
        />
        <AppButton 
          title="프로그램 편집" 
          variant="secondary"
          onPress={() => navigation.navigate('EditWorkoutProgram', { programId: program.id })}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#555',
    },
    exerciseListContainer: {
        padding: 20,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    exerciseItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
    },
    exerciseDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    buttonContainer: {
        padding: 20,
        marginTop: 20,
    }
});

export default WorkoutProgramDetailScreen; 