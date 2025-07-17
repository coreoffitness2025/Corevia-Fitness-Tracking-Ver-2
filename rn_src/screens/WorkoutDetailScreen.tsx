import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { format } from 'date-fns';
import WorkoutTimer from '../components/workout/WorkoutTimer';
import { useWorkoutStore } from '../features/workout/store/workoutStore';
import AppButton from '../components/common/AppButton';

const WorkoutDetailScreen = ({ route, navigation }) => {
    const { workoutId } = route.params;
    const { workouts, deleteWorkout } = useWorkoutStore();
    const [workout, setWorkout] = useState(null);
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [recentWorkouts, setRecentWorkouts] = useState([]);

    useEffect(() => {
        // 현재 운동 찾기
        const currentWorkout = workouts.find(w => w.id === workoutId);
        if (currentWorkout) {
            setWorkout(currentWorkout);
            
            // 같은 이름의 최근 운동 기록 찾기 (최대 3개)
            const recent = workouts
                .filter(w => w.name === currentWorkout.name && w.id !== workoutId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3);
            setRecentWorkouts(recent);
        }
    }, [workoutId, workouts]);

    const handleDelete = () => {
        Alert.alert(
            "운동 기록 삭제",
            "이 운동 기록을 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                { 
                    text: "삭제", 
                    onPress: async () => {
                        try {
                            await deleteWorkout(workoutId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("오류", "운동 기록 삭제에 실패했습니다.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'yyyy년 MM월 dd일');
        } catch (error) {
            return dateString;
        }
    };

    if (!workout) {
        return <View style={styles.container}><Text>로딩 중...</Text></View>;
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{workout.name}</Text>
                    <Text style={styles.date}>{formatDate(workout.date)}</Text>
                </View>
                
                <View style={styles.utilityContainer}>
                    <AppButton 
                        title="휴식 타이머 시작" 
                        onPress={() => setIsTimerVisible(true)}
                        icon="clock"
                        variant="secondary"
                    />
                </View>

                <View style={styles.setsContainer}>
                    <Text style={styles.sectionTitle}>세트 정보</Text>
                    {workout.sets && workout.sets.map((set, index) => (
                        <View key={index} style={styles.setRow}>
                            <Text style={styles.setText}>세트 {index + 1}</Text>
                            <Text style={styles.setText}>{set.weight} kg</Text>
                            <Text style={styles.setText}>{set.reps} 회</Text>
                        </View>
                    ))}
                </View>

                {recentWorkouts.length > 0 && (
                    <View style={styles.recentContainer}>
                        <Text style={styles.sectionTitle}>최근 기록</Text>
                        {recentWorkouts.map((recentWorkout, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.recentWorkoutCard}
                                onPress={() => navigation.replace('WorkoutDetail', { workoutId: recentWorkout.id })}
                            >
                                <View style={styles.recentHeader}>
                                    <Text style={styles.recentDate}>{formatDate(recentWorkout.date)}</Text>
                                    <Icon name="chevron-right" size={16} color="#6c757d" />
                                </View>
                                
                                <View style={styles.recentSets}>
                                    {recentWorkout.sets && recentWorkout.sets.map((set, setIndex) => (
                                        <Text key={setIndex} style={styles.recentSetText}>
                                            {set.weight}kg × {set.reps}회
                                        </Text>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <AppButton 
                        title="편집" 
                        onPress={() => navigation.navigate('EditWorkout', { workoutId })}
                        icon="edit"
                        variant="outline"
                        style={{ flex: 1, marginRight: 10 }}
                    />
                    <AppButton 
                        title="삭제" 
                        onPress={handleDelete}
                        icon="trash"
                        variant="danger"
                        style={{ flex: 1 }}
                    />
                </View>
            </ScrollView>
            
            <WorkoutTimer 
                isVisible={isTimerVisible} 
                onClose={() => setIsTimerVisible(false)}
                initialTime={90}
                onComplete={() => Alert.alert("휴식 완료", "다음 세트를 시작하세요!")}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f8f9fa' 
    },
    header: {
        marginBottom: 20,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 5 
    },
    date: {
        fontSize: 16,
        color: '#6c757d',
    },
    utilityContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#343a40',
    },
    setsContainer: { 
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    setText: { 
        fontSize: 16,
        color: '#212529',
    },
    recentContainer: {
        marginBottom: 20,
    },
    recentWorkoutCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    recentDate: {
        fontSize: 14,
        color: '#6c757d',
    },
    recentSets: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    recentSetText: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 14,
    },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
});

export default WorkoutDetailScreen; 