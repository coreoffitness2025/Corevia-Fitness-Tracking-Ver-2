import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { EXERCISE_DATA, Exercise } from '../../data/exerciseData';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const PARTS = ['all', 'chest', 'back', 'shoulder', 'leg', 'biceps', 'triceps', 'abs', 'cardio'];
const partLabels = {
    all: '전체', chest: '가슴', back: '등', shoulder: '어깨', leg: '하체', 
    biceps: '이두', triceps: '삼두', abs: '복근', cardio: '유산소'
};

const ExerciseListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const onSelectExercise = route.params?.onSelect;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState('all');

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_DATA;
    if (selectedPart !== 'all') {
        exercises = exercises.filter(exercise => exercise.part === selectedPart);
    }
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        exercises = exercises.filter(exercise => 
            exercise.name.toLowerCase().includes(lowerCaseQuery)
        );
    }
    return exercises;
  }, [searchQuery, selectedPart]);

  const renderItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => {
            if (onSelectExercise) {
                onSelectExercise(item);
                navigation.goBack();
            } else {
                navigation.navigate('ExerciseDetail', { exerciseId: item.id });
            }
        }}
    >
        <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPart}>{partLabels[item.part]}</Text>
        </View>
        <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
        </Text>
        <View style={styles.musclesContainer}>
            {item.muscles.slice(0, 3).map((muscle, index) => (
                <View key={index} style={styles.muscleChip}>
                    <Text style={styles.muscleText}>{muscle}</Text>
                </View>
            ))}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
                style={styles.searchBar}
                placeholder="운동 이름으로 검색..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PARTS.map(part => (
                    <TouchableOpacity 
                        key={part} 
                        style={[styles.tab, selectedPart === part && styles.selectedTab]}
                        onPress={() => setSelectedPart(part)}
                    >
                        <Text style={[styles.tabText, selectedPart === part && styles.selectedTabText]}>{partLabels[part]}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        <FlatList
            data={filteredExercises}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#f8f9fa' 
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 12,
      margin: 16,
      paddingHorizontal: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
  },
  searchIcon: {
      marginRight: 10,
  },
  searchBar: { 
      flex: 1,
      height: 50,
      fontSize: 16
  },
  tabContainer: { 
      paddingHorizontal: 16, 
      marginBottom: 10 
  },
  tab: { 
      paddingVertical: 10, 
      paddingHorizontal: 20, 
      borderRadius: 20, 
      backgroundColor: '#e9ecef', 
      marginRight: 10 
  },
  selectedTab: { 
      backgroundColor: '#007bff' 
  },
  tabText: { 
      color: '#495057', 
      fontWeight: '600' 
  },
  selectedTabText: { 
      color: 'white' 
  },
  itemContainer: { 
      backgroundColor: 'white', 
      padding: 20, 
      marginBottom: 12, 
      borderRadius: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1.0,
  },
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  itemName: { 
      fontSize: 18, 
      fontWeight: 'bold' 
  },
  itemPart: { 
      fontSize: 14, 
      color: 'gray',
      backgroundColor: '#f1f3f5',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      overflow: 'hidden'
  },
  itemDescription: {
      fontSize: 14,
      color: '#495057',
      marginBottom: 12,
      lineHeight: 20,
  },
  musclesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  muscleChip: {
      backgroundColor: '#e7f5ff',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
  },
  muscleText: {
      color: '#007bff',
      fontSize: 12,
  },
});

export default ExerciseListScreen; 