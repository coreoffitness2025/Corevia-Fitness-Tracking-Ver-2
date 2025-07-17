import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator, AppState } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWorkoutProgramStore } from '../features/workout/store/workoutProgramStore';
import { PerformedExerciseLog, PerformedSet, WorkoutProgram } from '../features/workout/types';
import AppButton from '../components/common/AppButton';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { saveWorkoutSessionLog, getLatestLogForExercise } from '../features/workout/services/workoutLogService'; // 새로 만든 서비스 import

// 개별 세트 아이템 컴포넌트
const SetItem = ({ set, setIndex, onUpdate, onToggleComplete }) => {
    return (
        <View style={styles.setItem}>
            <TouchableOpacity onPress={onToggleComplete} style={styles.checkbox}>
                <Icon name={set.isCompleted ? 'check-square' : 'square'} size={24} color={set.isCompleted ? '#4CAF50' : '#ccc'} />
            </TouchableOpacity>
            <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
            <TextInput
                style={styles.setInput}
                value={String(set.weight)}
                onChangeText={(text) => onUpdate('weight', text)}
                placeholder="무게"
                keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>kg</Text>
            <TextInput
                style={styles.setInput}
                value={String(set.reps)}
                onChangeText={(text) => onUpdate('reps', text)}
                placeholder="횟수"
                keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>회</Text>
        </View>
    );
};


// 메인 컴포넌트
const PerformWorkoutScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { programId } = route.params as { programId: string };
    const { programs } = useWorkoutProgramStore();
    
    const [program, setProgram] = useState<WorkoutProgram | null>(null);
    const [performedExercises, setPerformedExercises] = useState<PerformedExerciseLog[]>([]);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [latestLogs, setLatestLogs] = useState<{ [exerciseName: string]: PerformedExerciseLog | null }>({});
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [timer, setTimer] = useState({
        timeLeft: 120, // 2분 기본값
        isRunning: false,
        timerConfigSeconds: 120
    });
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const appState = React.useRef(AppState.currentState);

    useEffect(() => {
        const foundProgram = programs.find(p => p.id === programId);
        if (foundProgram) {
            setProgram(foundProgram);
            // 프로그램 데이터를 기반으로 운동 기록을 위한 state 초기화
            const initialLogs: PerformedExerciseLog[] = foundProgram.exercises.map(ex => ({
                programExerciseId: ex.id,
                exerciseId: ex.id, // 실제로는 운동 DB의 ID를 써야 함
                name: ex.name,
                sets: Array.from({ length: ex.targetSets }, () => ({
                    reps: ex.targetReps,
                    weight: ex.targetWeight || 0,
                    isCompleted: false,
                })),
            }));
            setPerformedExercises(initialLogs);

            // Fetch latest logs for all exercises in the program
            const fetchAllLatestLogs = async () => {
                setIsLoadingLogs(true);
                const logPromises = foundProgram.exercises.map(ex => getLatestLogForExercise(ex.name));
                const results = await Promise.all(logPromises);
                
                const logsMap: { [exerciseName: string]: PerformedExerciseLog | null } = {};
                foundProgram.exercises.forEach((ex, index) => {
                    logsMap[ex.name] = results[index];
                });
                
                setLatestLogs(logsMap);
                setIsLoadingLogs(false);
            };

            fetchAllLatestLogs();
        }
    }, [programId, programs]);

    // 타이머 로직
    useEffect(() => {
        if (timer.isRunning && timer.timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (timer.timeLeft === 0 && timer.isRunning) {
            // TODO: 알림 보내기 (e.g., react-native-push-notification)
            console.log("Time's up!");
            setTimer(prev => ({ ...prev, isRunning: false }));
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timer.isRunning, timer.timeLeft]);

    // 앱이 백그라운드로 갈 때 타이머 처리
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // 앱이 포그라운드로 돌아왔을 때의 로직 (필요시)
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, []);

    const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        const newPerformedExercises = [...performedExercises];
        const numValue = Number(value.replace(/[^0-9]/g, ''));
        newPerformedExercises[exerciseIndex].sets[setIndex][field] = numValue;
        setPerformedExercises(newPerformedExercises);
    };

    const startTimer = () => {
        setTimer(prev => ({
            ...prev,
            timeLeft: prev.timerConfigSeconds,
            isRunning: true,
        }));
    };
    
    const pauseTimer = () => setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
    
    const resetTimer = () => setTimer(prev => ({ ...prev, timeLeft: prev.timerConfigSeconds, isRunning: false }));
    
    const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
        const newPerformedExercises = [...performedExercises];
        const currentStatus = newPerformedExercises[exerciseIndex].sets[setIndex].isCompleted;
        newPerformedExercises[exerciseIndex].sets[setIndex].isCompleted = !currentStatus;
        setPerformedExercises(newPerformedExercises);
        const isChecking = !currentStatus;
        if(isChecking) {
            startTimer(); // 세트를 체크하면 타이머 시작
        }
    };

    const handleFinishWorkout = async () => {
        if (!program) return;

        setIsSaving(true);
        try {
            const logData = {
                programId: program.id,
                programName: program.name,
                exercises: performedExercises,
            };
            
            await saveWorkoutSessionLog(logData);

            Alert.alert('운동 완료!', '오늘의 운동 기록이 성공적으로 저장되었습니다.', [
                { text: '확인', onPress: () => navigation.popToTop() }
            ]);

        } catch (error: any) {
            Alert.alert('저장 실패', '운동 기록 저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to render latest log info
    const renderLatestLog = (exerciseName: string) => {
        const log = latestLogs[exerciseName];
        if (!log || log.sets.length === 0) return null;

        // Display info from the first completed set as a reference
        const firstCompletedSet = log.sets.find(s => s.isCompleted) || log.sets[0];
        
        return (
            <View style={styles.latestLogContainer}>
                <Icon name="history" size={14} color="#555" />
                <Text style={styles.latestLogText}>
                    최근: {firstCompletedSet.weight}kg x {firstCompletedSet.reps}회
                </Text>
            </View>
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };


    if (!program) {
        return <View style={styles.centered}><Text>프로그램을 불러오는 중...</Text></View>;
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView style={styles.container}>
                <Text style={styles.programTitle}>{program.name}</Text>
                
                {performedExercises.map((exerciseLog, exIndex) => (
                    <View key={exerciseLog.programExerciseId} style={styles.exerciseContainer}>
                        <TouchableOpacity 
                            style={styles.exerciseHeader} 
                            onPress={() => setActiveExerciseIndex(activeExerciseIndex === exIndex ? null : exIndex)}
                        >
                            <View>
                                <Text style={styles.exerciseName}>{exIndex + 1}. {exerciseLog.name}</Text>
                                {isLoadingLogs ? <ActivityIndicator size="small"/> : renderLatestLog(exerciseLog.name)}
                            </View>
                            <Icon name={activeExerciseIndex === exIndex ? 'chevron-up' : 'chevron-down'} size={16} />
                        </TouchableOpacity>
                        
                        {activeExerciseIndex === exIndex && (
                             <View style={styles.setsContainer}>
                                {exerciseLog.sets.map((set, setIndex) => (
                                    <SetItem
                                        key={setIndex}
                                        set={set}
                                        setIndex={setIndex}
                                        onUpdate={(field, value) => handleUpdateSet(exIndex, setIndex, field, value)}
                                        onToggleComplete={() => handleToggleSetComplete(exIndex, setIndex)}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ))}
                
                <AppButton
                    title="운동 완료 및 기록 저장"
                    onPress={handleFinishWorkout}
                    style={styles.finishButton}
                    loading={isSaving} // 로딩 상태 연동
                />
            </ScrollView>
            
            {timer.isRunning || timer.timeLeft < timer.timerConfigSeconds ? (
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(timer.timeLeft)}</Text>
                    <View style={styles.timerControls}>
                        <TouchableOpacity onPress={pauseTimer}>
                            <Icon name={timer.isRunning ? 'pause' : 'play'} size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={resetTimer} style={{marginLeft: 20}}>
                            <Icon name="undo" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f2f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    programTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    exerciseContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4, // 여백 추가
    },
    setsContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    setItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    checkbox: {
        marginRight: 15,
    },
    setLabel: {
        width: 50,
        fontSize: 16,
        color: '#555'
    },
    setInput: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        textAlign: 'center',
        marginHorizontal: 5,
    },
    unitLabel: {
        fontSize: 16,
        marginRight: 15,
    },
    finishButton: {
        marginVertical: 30,
        marginHorizontal: 10,
    },
    latestLogContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e9ecef',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start', // 내용만큼만 차지하도록
    },
    latestLogText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#495057',
        fontWeight: '500',
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#343a40',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    timerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    timerControls: {
        flexDirection: 'row',
    }
});

export default PerformWorkoutScreen; 