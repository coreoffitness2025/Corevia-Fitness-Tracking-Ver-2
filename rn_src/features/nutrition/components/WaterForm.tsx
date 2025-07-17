import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AppButton from '../../../components/common/AppButton';
import { addFoodLogToServer } from '../services';
import { useFoodLogStore } from '../store';

const WaterForm = ({ date, onSave }) => {
    const [amount, setAmount] = useState(250); // default amount in ml
    const [loading, setLoading] = useState(false);
    const addFoodLog = useFoodLogStore((state) => state.addFoodLog);

    const handleSave = async () => {
        setLoading(true);
        const logData = {
            name: `Water`,
            amount: amount,
            calories: 0,
            type: 'water',
            date: date,
        };

        try {
            const docId = await addFoodLogToServer(logData);
            addFoodLog({ id: docId, ...logData });
            if (onSave) onSave();
        } catch (error) {
            Alert.alert('Error', 'Failed to save water log.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Water</Text>
            <View style={styles.presetContainer}>
                <TouchableOpacity onPress={() => setAmount(250)} style={[styles.preset, amount === 250 && styles.selected]}>
                    <Text style={styles.presetText}>250 ml</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAmount(500)} style={[styles.preset, amount === 500 && styles.selected]}>
                    <Text style={styles.presetText}>500 ml</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAmount(750)} style={[styles.preset, amount === 750 && styles.selected]}>
                    <Text style={styles.presetText}>750 ml</Text>
                </TouchableOpacity>
            </View>
            <AppButton title={`Add ${amount}ml`} onPress={handleSave} loading={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#e9f5ff', borderRadius: 8, marginVertical: 10 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    presetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    preset: {
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007bff',
    },
    selected: {
        backgroundColor: '#007bff',
    },
    presetText: {
        fontSize: 16,
    }
});

export default WaterForm; 