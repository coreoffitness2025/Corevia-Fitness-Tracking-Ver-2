import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import ExerciseProgressGraph from '../components/workout/ExerciseProgressGraph';

const WorkoutLogListScreen = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('workoutSessionLogs')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .onSnapshot(querySnapshot => {
                const fetchedLogs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLogs(fetchedLogs);
                setIsLoading(false);
            }, error => {
                console.error("Failed to fetch logs:", error);
                setIsLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const renderLogItem = ({ item }) => (
        <View style={styles.logItem}>
            <Text style={styles.logDate}>{format(new Date(item.completedAt.seconds * 1000), 'yyyy-MM-dd')}</Text>
            <Text style={styles.logProgramName}>{item.programName}</Text>
            {item.exercises.map(ex => (
                <TouchableOpacity key={ex.exerciseId} onPress={() => setSelectedExercise(ex.name)}>
                    <Text style={styles.logExerciseName}>{ex.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {selectedExercise && (
                <View style={styles.graphContainer}>
                    <Text style={styles.graphTitle}>{selectedExercise} 성장 그래프</Text>
                     <ExerciseProgressGraph 
                        logs={logs.map(log => log.exercises.filter(ex => ex.name === selectedExercise)).flat()} 
                     />
                    <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                        <Text style={styles.closeGraphText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text>운동 기록이 없습니다.</Text>}
                />
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    graphContainer: { padding: 10, backgroundColor: 'white' },
    graphTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    closeGraphText: { textAlign: 'center', color: 'blue', padding: 10 },
    logItem: { backgroundColor: 'white', padding: 15, margin: 10, borderRadius: 8 },
    logDate: { fontSize: 14, color: 'gray' },
    logProgramName: { fontSize: 18, fontWeight: 'bold' },
    logExerciseName: { color: 'blue', textDecorationLine: 'underline', marginTop: 5 }
});

export default WorkoutLogListScreen; 