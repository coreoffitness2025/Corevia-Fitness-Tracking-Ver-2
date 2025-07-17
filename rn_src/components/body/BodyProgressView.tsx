import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { LineChart, Grid, YAxis } from 'react-native-svg-charts';
import { useAuthStore } from '../../stores/authStore';
import { getWeightRecords, getBodyPhotos } from '../../services/bodyService';
import AppButton from '../common/AppButton';

const BodyProgressView = ({ isVisible, onClose }) => {
    const { userProfile } = useAuthStore();
    const [weightData, setWeightData] = useState([]);
    const [photoData, setPhotoData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible && userProfile) {
            fetchData();
        }
    }, [isVisible, userProfile]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const weights = await getWeightRecords(userProfile.uid);
            const photos = await getBodyPhotos(userProfile.uid);
            setWeightData(weights.map(w => w.weight));
            setPhotoData(photos);
        } catch (error) {
            console.error('Failed to fetch progress data', error);
        } finally {
            setLoading(false);
        }
    };

    const renderPhoto = ({ item }) => (
        <View style={styles.photoContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
            <Text style={styles.photoDate}>{new Date(item.date.seconds * 1000).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.title}>신체 변화 추이</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>체중 변화</Text>
                    {weightData.length > 1 ? (
                        <View style={{ height: 200, flexDirection: 'row' }}>
                            <YAxis
                                data={weightData}
                                contentInset={{ top: 20, bottom: 20 }}
                                svg={{ fill: 'grey', fontSize: 10 }}
                            />
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={weightData}
                                svg={{ stroke: 'rgb(134, 65, 244)' }}
                                contentInset={{ top: 20, bottom: 20 }}
                            >
                                <Grid />
                            </LineChart>
                        </View>
                    ) : (
                        <Text>그래프를 표시하려면 2개 이상의 기록이 필요합니다.</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>바디 체크 사진</Text>
                    <FlatList
                        data={photoData}
                        renderItem={renderPhoto}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                <AppButton title="닫기" onPress={onClose} style={{marginTop: 20}}/>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    photoContainer: {
        marginRight: 10,
    },
    photo: {
        width: 150,
        height: 200,
        borderRadius: 8,
    },
    photoDate: {
        textAlign: 'center',
        marginTop: 5,
    }
});

export default BodyProgressView; 