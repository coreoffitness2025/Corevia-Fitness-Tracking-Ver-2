import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFoodLogStore } from '../stores/foodLogStore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import AppButton from '../components/common/AppButton';
import { format } from 'date-fns';

const FoodScreen = () => {
    const navigation = useNavigation();
    const addFoodLog = useFoodLogStore(state => state.addFoodLog);

    const [mealDate, setMealDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [foodName, setFoodName] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState(null); // To store the base64 string

    const takePicture = async (source) => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: source,
            });
            setImage(photo.dataUrl);
        } catch (error) {
            Alert.alert('오류', '사진을 가져오는 데 실패했습니다.');
            console.error(error);
        }
    };

    const handleSave = () => {
        if (!foodName.trim()) {
            Alert.alert('입력 오류', '음식 이름을 입력해주세요.');
            return;
        }

        const newLog = {
            id: Date.now().toString(),
            name: foodName,
            notes: notes,
            date: mealDate,
            image: image, // base64 dataUrl
            createdAt: new Date().toISOString(),
        };

        addFoodLog(newLog);
        Alert.alert('저장 완료', '식단 기록이 저장되었습니다.');
        navigation.goBack(); 
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>식단 기록하기</Text>
            </View>
            
            <View style={styles.formContainer}>
                <Text style={styles.label}>날짜</Text>
                {/* For simplicity, using a text input. A date picker would be better. */}
                <TextInput
                    style={styles.input}
                    value={mealDate}
                    onChangeText={setMealDate}
                />

                <Text style={styles.label}>사진 (선택)</Text>
                <View style={styles.imagePickerContainer}>
                    <AppButton title="카메라" onPress={() => takePicture(CameraSource.Camera)} variant="outline" style={styles.imageButton} icon="camera"/>
                    <AppButton title="갤러리" onPress={() => takePicture(CameraSource.Photos)} variant="outline" style={styles.imageButton} icon="image"/>
                </View>

                {image && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                        <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                            <Text style={styles.removeImageText}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.label}>음식 이름</Text>
                <TextInput
                    style={styles.input}
                    value={foodName}
                    onChangeText={setFoodName}
                    placeholder="예: 닭가슴살 샐러드"
                />

                <Text style={styles.label}>메모 (선택)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="식사에 대한 생각이나 느낌을 기록하세요."
                    multiline
                />
                
                <AppButton title="기록 저장" onPress={handleSave} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#28a745',
        padding: 24,
        paddingTop: 50,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#343a40',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imagePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    imageButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    imagePreviewContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default FoodScreen; 