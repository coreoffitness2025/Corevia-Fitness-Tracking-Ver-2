import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';

const FoodLogItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.calories}>{item.calories} kcal</Text>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 6,
        marginHorizontal: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
    },
    calories: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745'
    },
});

export default FoodLogItem; 