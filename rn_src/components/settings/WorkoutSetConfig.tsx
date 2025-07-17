import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWorkoutStore } from '../../features/workout/store/workoutStore';
import { Picker } from '@react-native-picker/picker';

const setOptions = [
    { label: '근력 집중 (6회 x 3세트)', value: '6x3' },
    { label: '근력/근비대 균형 (5회 x 5세트)', value: '5x5' },
    { label: '근비대 집중 (10회 x 5세트)', value: '10x5' },
    { label: '근지구력 집중 (15회 x 5세트)', value: '15x5' },
];

const WorkoutSetConfig = () => {
    const { preferredSetup, setPreferredSetup } = useWorkoutStore();

    return (
        <View style={styles.container}>
            <Text style={styles.label}>메인 운동 선호 세트</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={preferredSetup}
                    onValueChange={(itemValue) => setPreferredSetup(itemValue)}
                    style={styles.picker}
                >
                    {setOptions.map(option => (
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                </Picker>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        color: '#343a40',
    },
    pickerContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        width: '100%',
    },
});

export default WorkoutSetConfig; 