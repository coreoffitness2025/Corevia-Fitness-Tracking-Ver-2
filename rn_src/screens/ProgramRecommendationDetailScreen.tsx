import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RECOMMENDED_PROGRAMS } from '../data/programRecommendationData';
import { useWorkoutProgramStore } from '../features/workout/store/workoutProgramStore';
import AppButton from '../components/common/AppButton';
import { ProgramExercise } from '../features/workout/types';

const ProgramRecommendationDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { programName } = route.params as { programName: string };
    
    const program = RECOMMENDED_PROGRAMS.find(p => p.name === programName);
    const { addProgram, isLoading } = useWorkoutProgramStore();

    const handleAddProgram = async () => {
        if (!program) return;
        
        try {
            await addProgram({
                name: program.name,
                description: program.description,
                exercises: program.exercises,
            });
            Alert.alert(
                '추가 완료',
                `'${program.name}' 프로그램이 내 운동 프로그램 목록에 추가되었습니다.`,
                [
                    { text: '확인', onPress: () => navigation.navigate('WorkoutProgramList') }
                ]
            );
        } catch (error) {
            Alert.alert('오류', '프로그램을 추가하는 데 실패했습니다.');
        }
    };

    if (!program) {
        return <View style={styles.centered}><Text>프로그램을 찾을 수 없습니다.</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{program.name}</Text>
                <Text style={styles.description}>{program.description}</Text>
            </View>

            <View style={styles.exerciseListContainer}>
                <Text style={styles.listTitle}>프로그램 구성</Text>
                {program.exercises.map((exercise: ProgramExercise, index: number) => (
                    <View key={index} style={styles.exerciseItem}>
                        <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                            {exercise.targetSets} sets x {exercise.targetReps} reps
                        </Text>
                    </View>
                ))}
            </View>
            
            <AppButton
                title="내 운동 프로그램으로 추가"
                onPress={handleAddProgram}
                loading={isLoading}
                style={styles.addButton}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#6c757d',
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
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
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
    addButton: {
        margin: 20,
    },
});

export default ProgramRecommendationDetailScreen; 