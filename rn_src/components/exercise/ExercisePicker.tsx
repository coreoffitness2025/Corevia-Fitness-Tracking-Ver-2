import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { EXERCISE_DATA } from '../../data/exerciseData';
import AppButton from '../common/AppButton';

const ExercisePicker = ({ isVisible, onClose, onSelectExercise }) => {
    const [searchText, setSearchText] = useState('');

    const filteredExercises = useMemo(() => {
        if (!searchText) {
            return EXERCISE_DATA;
        }
        return EXERCISE_DATA.filter(exercise => 
            exercise.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText]);

    const handleSelect = (exercise) => {
        onSelectExercise(exercise);
        setSearchText('');
        onClose();
    };
    
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.part} | {item.type}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>운동 선택</Text>
                    <AppButton title="닫기" onPress={onClose} variant="secondary" size="sm" />
                </View>

                <TextInput
                    style={styles.searchInput}
                    placeholder="운동 이름으로 검색..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                
                <FlatList
                    data={filteredExercises}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        margin: 15,
    },
    list: {
        paddingHorizontal: 15,
    },
    itemContainer: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemMeta: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    }
});

export default ExercisePicker; 