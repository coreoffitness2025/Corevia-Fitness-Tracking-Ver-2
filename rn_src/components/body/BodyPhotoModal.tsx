import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import AppButton from '../common/AppButton';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { addBodyPhoto } from '../../services/bodyService';

const BodyPhotoModal = ({ isVisible, onClose, onSuccess }) => {
    const { userProfile } = useAuthStore();
    const [date, setDate] = useState(new Date());
    const [memo, setMemo] = useState('');
    const [image, setImage] = useState(null); // base64 dataUrl
    const [isSaving, setIsSaving] = useState(false);

    const takePicture = async (source: CameraSource) => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: source,
            });
            setImage(photo.dataUrl);
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '사진을 가져오는 데 실패했습니다.');
        }
    };

    const handleSave = async () => {
        if (!image) {
            Alert.alert('오류', '사진을 선택해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            await addBodyPhoto(userProfile.uid, {
                date,
                memo,
                imageUrl: image // Storing base64 directly for simplicity
            });
            Alert.alert('성공', '바디 체크 기록이 저장되었습니다.');
            onSuccess();
        } catch (error) {
            Alert.alert('오류', '저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.modalTitle}>바디 체크 기록</Text>
                
                <TouchableOpacity onPress={() => takePicture(CameraSource.Photos)} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                    ) : (
                        <Text>사진 선택하기</Text>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={memo}
                    onChangeText={setMemo}
                    placeholder="메모 (선택)"
                />
                <View style={styles.buttonContainer}>
                    <AppButton title="취소" onPress={onClose} variant="secondary" style={{flex: 1, marginRight: 10}} />
                    <AppButton title="저장" onPress={handleSave} loading={isSaving} style={{flex: 1}}/>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagePicker: {
        height: 300,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 20,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
    }
});

export default BodyPhotoModal; 