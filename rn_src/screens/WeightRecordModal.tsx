import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import AppButton from '../components/common/AppButton';
import { addWeightRecord } from '../services/bodyService';

const WeightRecordModal = ({ navigation }) => {
    const [weight, setWeight] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid weight.');
            return;
        }
        setIsSaving(true);
        try {
            await addWeightRecord(w);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save weight record.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Record Weight</Text>
            <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight in kg"
                keyboardType="numeric"
                autoFocus={true}
            />
            <AppButton title="Save" onPress={handleSave} loading={isSaving} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 18 },
});

export default WeightRecordModal; 