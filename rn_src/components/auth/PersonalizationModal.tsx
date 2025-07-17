import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AppButton from '../common/AppButton';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import Card from '../common/Card';

const PersonalizationModal = ({ isVisible, onClose }) => {
    const { updateProfile } = useAuth();
    const [goal, setGoal] = useState('Weight Loss');
    const [gender, setGender] = useState('male');
    const [loading, setLoading] = useState(false);
    
    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ goal, gender });
            Alert.alert("Success", "Your profile has been updated!");
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Card style={styles.modalView}>
                    <Text style={styles.modalTitle}>Tell us about yourself</Text>
                    <Text style={styles.modalSubtitle}>This will help us personalize your experience.</Text>
                    
                    <ScrollView>
                        <Text style={styles.label}>My primary goal is...</Text>
                        <Picker selectedValue={goal} onValueChange={setGoal} style={styles.picker}>
                            <Picker.Item label="Weight Loss" value="Weight Loss" />
                            <Picker.Item label="Muscle Gain" value="Muscle Gain" />
                            <Picker.Item label="Maintenance" value="Maintenance" />
                        </Picker>
                        
                        <Text style={styles.label}>Gender</Text>
                         <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                        </Picker>
                        
                        {/* Add more fields like height, weight, age as needed */}
                    </ScrollView>

                    <AppButton title="Save Profile" onPress={handleSave} loading={loading} />
                </Card>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        margin: 0,
        padding: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        marginBottom: 20,
        textAlign: 'center',
        color: 'gray',
    },
    label: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
    },
    picker: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
});

export default PersonalizationModal; 