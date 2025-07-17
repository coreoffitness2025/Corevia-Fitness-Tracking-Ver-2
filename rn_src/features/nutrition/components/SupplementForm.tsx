import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import AppButton from '../../../components/common/AppButton';
import { addFoodLogToServer } from '../services'; // Assuming service is in the same feature folder
import { useFoodLogStore } from '../store'; // Assuming store is in the same feature folder

const SupplementForm = ({ date, onSave }) => {
    const [name, setName] = useState('');
    const [servings, setServings] = useState('1');
    const [loading, setLoading] = useState(false);
    const addFoodLog = useFoodLogStore((state) => state.addFoodLog);

    const handleSave = async () => {
        if (!name) {
            return Alert.alert('Error', 'Please enter a supplement name.');
        }
        setLoading(true);
        const logData = {
            name: `${name} (Supplement)`,
            servings: parseInt(servings, 10) || 1,
            calories: 0, // Supplements often tracked by serving, not calories
            type: 'supplement',
            date: date,
        };

        try {
            const docId = await addFoodLogToServer(logData);
            addFoodLog({ id: docId, ...logData });
            if (onSave) onSave();
        } catch (error) {
            Alert.alert('Error', 'Failed to save supplement log.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Supplement</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Creatine Monohydrate"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Servings"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
            />
            <AppButton title="Save Supplement" onPress={handleSave} loading={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, marginVertical: 10 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
});

export default SupplementForm; 