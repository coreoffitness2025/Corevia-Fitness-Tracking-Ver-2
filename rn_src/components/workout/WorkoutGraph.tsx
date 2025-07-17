import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import { useWorkoutStore } from '../../features/workout/store/workoutStore';
import { format, parse } from 'date-fns';
import * as scale from 'd3-scale';

const WorkoutGraph = () => {
    const { workouts } = useWorkoutStore();

    const chartData = useMemo(() => {
        if (workouts.length < 2) return [];

        const aggregatedData = workouts.reduce((acc, workout) => {
            const dateKey = format(new Date(workout.date), 'yyyy-MM-dd');
            let mainVolume = 0;

            if (workout.type === 'single') {
                mainVolume = workout.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0);
            } else if (workout.type === 'complex' && workout.mainExercises) {
                mainVolume = workout.mainExercises.reduce((exAcc, ex) => 
                    exAcc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0)
                , 0);
            }

            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey] += mainVolume;
            return acc;
        }, {});

        return Object.keys(aggregatedData)
            .map(date => ({ date: parse(date, 'yyyy-MM-dd', new Date()), volume: aggregatedData[date] }))
            .sort((a, b) => a.date - b.date);

    }, [workouts]);

    if (chartData.length < 2) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>메인 운동 볼륨 변화</Text>
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>그래프를 표시하려면 2일 이상 메인 운동 기록이 필요합니다.</Text>
                </View>
            </View>
        );
    }
    
    const volumes = chartData.map(item => item.volume);
    const dates = chartData.map(item => format(item.date, 'MM/dd'));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>메인 운동 볼륨 변화</Text>
            <View style={{ height: 200, flexDirection: 'row' }}>
                <YAxis
                    data={volumes}
                    contentInset={{ top: 20, bottom: 20 }}
                    svg={{ fill: 'grey', fontSize: 10 }}
                    numberOfTicks={5}
                    formatLabel={(value) => `${Math.round(value / 1000)}k`}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <LineChart
                        style={{ flex: 1 }}
                        data={volumes}
                        svg={{ stroke: 'rgb(134, 65, 244)' }}
                        contentInset={{ top: 20, bottom: 20 }}
                    >
                        <Grid />
                    </LineChart>
                    <XAxis
                        style={{ marginHorizontal: -10, marginTop: 10 }}
                        data={chartData}
                        scale={scale.scaleBand}
                        formatLabel={(value, index) => dates[index]}
                        svg={{
                          fontSize: 10,
                          fill: 'grey',
                        }}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    noDataContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 14,
    }
});

export default WorkoutGraph; 