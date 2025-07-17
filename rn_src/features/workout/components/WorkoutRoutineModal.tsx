import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ROUTINES_STORAGE_KEY = '@workout_routines';

const WorkoutRoutineModal = ({ isVisible, onClose, onSelectRoutine }) => {
    const [routines, setRoutines] = useState([]);

    useEffect(() => {
        if (isVisible) {
            loadRoutines();
        }
    }, [isVisible]);

    const loadRoutines = async () => {
        try {
            const storedRoutines = await AsyncStorage.getItem(ROUTINES_STORAGE_KEY);
            if (storedRoutines) {
                setRoutines(JSON.parse(storedRoutines));
            }
        } catch (e) {
            Alert.alert('오류', '루틴을 불러오는 데 실패했습니다.');
        }
    };

    const handleSelect = (routine) => {
        onSelectRoutine(routine);
        onClose();
    };
    
    const handleDelete = async (routineNameToDelete) => {
        Alert.alert(
            "루틴 삭제",
            `'${routineNameToDelete}' 루틴을 정말 삭제하시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        try {
                            const newRoutines = routines.filter(r => r.name !== routineNameToDelete);
                            await AsyncStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(newRoutines));
                            setRoutines(newRoutines);
                            Alert.alert('성공', '루틴이 삭제되었습니다.');
                        } catch (e) {
                            Alert.alert('오류', '루틴 삭제에 실패했습니다.');
                        }
                    },
                    style: "destructive"
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity style={styles.itemContent} onPress={() => handleSelect(item)}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>
                    메인: {item.main.name}, 보조: {item.accessories.length}개
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.name)}>
                <Icon name="trash-alt" size={20} color="#dc3545" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <Text style={styles.modalTitle}>저장된 루틴 불러오기</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="times" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={routines}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.name}
                    ListEmptyComponent={<Text style={styles.emptyText}>저장된 루틴이 없습니다.</Text>}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        marginBottom: 10,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDetail: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    deleteButton: {
        padding: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
    }
});

export default WorkoutRoutineModal; 