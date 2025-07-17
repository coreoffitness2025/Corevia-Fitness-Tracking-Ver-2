import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AppButton from '../components/common/AppButton';
import { storage, auth } from '../services/firebase';
import { addBodyPhotoUrl } from '../services/bodyService';

const PhotoRecordModal = ({ navigation }) => {
    const [imageUri, setImageUri] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const selectImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
            if (response.didCancel || response.errorCode) {
                return;
            }
            setImageUri(response.assets[0].uri);
        });
    };

    const handleUpload = async () => {
        if (!imageUri) return;
        setIsUploading(true);
        const userId = auth().currentUser?.uid;
        if (!userId) {
            setIsUploading(false);
            return Alert.alert("Error", "You must be logged in.");
        }

        const reference = storage().ref(`images/${userId}/${new Date().toISOString()}`);
        
        try {
            await reference.putFile(imageUri);
            const url = await reference.getDownloadURL();
            await addBodyPhotoUrl(url);
            Alert.alert("Success", "Image uploaded and saved!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Record Photo</Text>
            
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text>Select an image to preview</Text>
                </View>
            )}

            <AppButton title="Select Image" variant="secondary" onPress={selectImage} style={{marginBottom: 10}} />
            <AppButton title="Upload and Save" onPress={handleUpload} loading={isUploading} disabled={!imageUri} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    imagePlaceholder: {
        height: 300,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 20,
    },
    imagePreview: {
        height: 300,
        resizeMode: 'contain',
        borderRadius: 8,
        marginBottom: 20,
    },
});

export default PhotoRecordModal; 