import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Alert } from 'react-native';
import AppButton from '../common/AppButton';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { addWeightRecord } from '../../services/bodyService';

const WeightRecordModal = ({ isVisible, onClose, onSuccess }) => {
    const { userProfile, updateUserProfile } = useAuthStore();
    const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const newWeight = parseFloat(weight);
        if (isNaN(newWeight) || newWeight <= 0) {
            Alert.alert('입력 오류', '올바른 체중을 입력해주세요.');
            return;
        }
        
        setIsSaving(true);
        try {
            await addWeightRecord(userProfile.uid, { weight: newWeight, date: new Date() });
            updateUserProfile({ weight: newWeight }); // Update local state
            Alert.alert('성공', '체중이 기록되었습니다.');
            onSuccess();
        } catch (error) {
            Alert.alert('오류', '체중 기록에 실패했습니다.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>오늘의 체중 기록</Text>
                    <Text style={styles.dateText}>{format(new Date(), 'yyyy년 MM월 dd일')}</Text>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            placeholder="kg"
                        />
                        <Text style={styles.unitText}>kg</Text>
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        <AppButton title="취소" onPress={onClose} variant="secondary" style={{flex: 1, marginRight: 10}}/>
                        <AppButton title="저장" onPress={handleSave} loading={isSaving} style={{flex: 1}}/>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: '#007bff',
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        minWidth: 100,
    },
    unitText: {
        fontSize: 20,
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    }
});

export default WeightRecordModal; 