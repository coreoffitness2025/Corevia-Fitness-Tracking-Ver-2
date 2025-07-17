import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFoodLogStore } from '../store';
import Card from '../../../components/common/Card';

const NutritionSummary = ({ date }) => {
    // In a real app, we would filter logs by the passed 'date' prop.
    const foodLogs = useFoodLogStore((state) => state.foodLogs);

    const summary = foodLogs.reduce(
        (acc, log) => {
            acc.calories += log.calories || 0;
            acc.protein += log.protein || 0;
            acc.carbs += log.carbs || 0;
            acc.fat += log.fat || 0;
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return (
        <Card style={styles.card}>
            <Text style={styles.title}>Today's Summary</Text>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Text style={styles.value}>{summary.calories.toFixed(0)}</Text>
                    <Text style={styles.label}>kcal</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.value}>{summary.protein.toFixed(0)}g</Text>
                    <Text style={styles.label}>Protein</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.value}>{summary.carbs.toFixed(0)}g</Text>
                    <Text style={styles.label}>Carbs</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.value}>{summary.fat.toFixed(0)}g</Text>
                    <Text style={styles.label}>Fat</Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: { marginHorizontal: 16, marginBottom: 10, elevation: 1 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    grid: { flexDirection: 'row', justifyContent: 'space-around' },
    gridItem: { alignItems: 'center' },
    value: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
    label: { fontSize: 12, color: 'gray', marginTop: 2 },
});

export default NutritionSummary; 