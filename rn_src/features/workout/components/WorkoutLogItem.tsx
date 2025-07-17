import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const calculateTotalVolume = (sets) => {
    if (!sets || sets.length === 0) return 0;
    return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
};

const WorkoutLogItem = ({ item, onPress }) => {
    const totalVolume = calculateTotalVolume(item.sets);
    const totalSets = item.sets ? item.sets.length : 0;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>Volume: {totalVolume.toFixed(1)} kg</Text>
                <Text style={styles.detailText}>Sets: {totalSets}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailText: {
        fontSize: 14,
        color: 'gray',
    },
});

export default WorkoutLogItem;