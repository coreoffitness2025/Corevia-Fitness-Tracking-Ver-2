import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import { useWorkoutStore } from '../features/workout/store/workoutStore';
import { format } from 'date-fns';
import * as scale from 'd3-scale';

const WorkoutGraphScreen = () => {
    const { workouts } = useWorkoutStore();
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedSetCount, setSelectedSetCount] = useState(null);

    const mainExercises = useMemo(() => {
        const names = new Set();
        workouts.forEach(w => {
            if (w.type === 'single') names.add(w.name);
            else if (w.type === 'complex') w.mainExercises.forEach(m => names.add(m.name));
        });
        return Array.from(names);
    }, [workouts]);

    const availableSetCounts = useMemo(() => {
        if (!selectedExercise) return [];
        const counts = new Set();
        workouts.forEach(w => {
            const exercises = (w.type === 'complex' ? w.mainExercises : (w.type === 'single' ? [{name: w.name, sets: w.sets}] : []));
            exercises.forEach(ex => {
                if (ex.name === selectedExercise) {
                    counts.add(ex.sets.length);
                }
            });
        });
        return Array.from(counts).sort((a,b) => a-b);
    }, [workouts, selectedExercise]);
    
    const chartData = useMemo(() => {
        if (!selectedExercise || !selectedSetCount) return [];
        
        return workouts
            .map(w => ({...w, dateObj: new Date(w.date)}))
            .filter(w => {
                const exercises = (w.type === 'complex' ? w.mainExercises : (w.type === 'single' ? [{name: w.name, sets: w.sets}] : []));
                return exercises.some(ex => ex.name === selectedExercise && ex.sets.length === selectedSetCount);
            })
            .map(w => {
                const targetExercise = (w.type === 'complex' ? w.mainExercises : [{name: w.name, sets: w.sets}])
                                        .find(ex => ex.name === selectedExercise);
                // For simplicity, we take the weight of the first set. 
                // A more advanced approach could average or take the max weight.
                const weight = targetExercise.sets[0]?.weight || 0; 
                return { date: w.dateObj, weight };
            })
            .sort((a, b) => a.date - b.date);
            
    }, [workouts, selectedExercise, selectedSetCount]);

    const chartWeights = chartData.map(item => item.weight);
    const chartDates = chartData.map(item => format(item.date, 'MM/dd'));

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>메인 운동 중량 변화 추이</Text>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedExercise}
                    onValueChange={(itemValue) => {
                        setSelectedExercise(itemValue);
                        setSelectedSetCount(null); // Reset set count when exercise changes
                    }}
                >
                    <Picker.Item label="분석할 운동을 선택하세요" value={null} />
                    {mainExercises.map(ex => <Picker.Item key={ex} label={ex} value={ex} />)}
                </Picker>
            </View>
            
            {selectedExercise && (
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedSetCount}
                        onValueChange={(itemValue) => setSelectedSetCount(itemValue)}
                        enabled={availableSetCounts.length > 0}
                    >
                        <Picker.Item label="세트 수를 선택하세요" value={null} />
                        {availableSetCounts.map(c => <Picker.Item key={c} label={`${c} 세트`} value={c} />)}
                    </Picker>
                </View>
            )}

            {chartData.length > 1 ? (
                <View style={styles.chartContainer}>
                    <View style={{ height: 250, flexDirection: 'row' }}>
                        <YAxis
                            data={chartWeights}
                            contentInset={{ top: 20, bottom: 20 }}
                            svg={{ fill: 'grey', fontSize: 10 }}
                            numberOfTicks={5}
                            formatLabel={(value) => `${value}kg`}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <LineChart
                                style={{ flex: 1 }}
                                data={chartWeights}
                                svg={{ stroke: 'rgb(134, 65, 244)' }}
                                contentInset={{ top: 20, bottom: 20 }}
                            >
                                <Grid />
                            </LineChart>
                            <XAxis
                                style={{ marginHorizontal: -10, marginTop: 10 }}
                                data={chartData} // Use original data for label mapping
                                formatLabel={(value, index) => chartDates[index]}
                                contentInset={{ left: 10, right: 10 }}
                                svg={{ fontSize: 10, fill: 'grey' }}
                            />
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text>선택한 조건의 운동 기록이 2개 이상 필요합니다.</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15 },
    chartContainer: { height: 250, marginTop: 20 },
    noDataContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
});

export default WorkoutGraphScreen; 