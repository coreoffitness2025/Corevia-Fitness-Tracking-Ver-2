import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useWorkoutStore } from '../store/workoutStore';
import { addWorkoutLog } from '../services/workoutService';
import { addUnsyncedWorkout } from '../../../utils/database';
import NetInfo from '@react-native-community/netinfo';
import { format } from 'date-fns';
import AppButton from '../../../components/common/AppButton';
import Icon from 'react-native-vector-icons/FontAwesome5';
import WorkoutRoutineModal from './WorkoutRoutineModal'; // 새로 만들 컴포넌트
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTINES_STORAGE_KEY = '@workout_routines';

type FormMode = 'single' | 'complex';

// --- Reusable UI Components ---
const ExerciseInput = ({ exercise, onExerciseChange, onSetChange, onAddSet, onRemoveSet, onRemoveExercise, title }) => (
    <View style={styles.exerciseContainer}>
        <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {onRemoveExercise && (
                <TouchableOpacity onPress={onRemoveExercise}>
                    <Icon name="trash-alt" size={20} color="#dc3545" />
                </TouchableOpacity>
            )}
        </View>
        <TextInput
            style={styles.input}
            value={exercise.name}
            onChangeText={(text) => onExerciseChange('name', text)}
            placeholder="운동 이름"
        />
        {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
                <View style={styles.setHeader}>
                    <Text style={styles.setTitle}>세트 {setIndex + 1}</Text>
                    <TouchableOpacity style={styles.removeSetButton} onPress={() => onRemoveSet(setIndex)}>
                        <Icon name="times" size={16} color="#6c757d" />
                    </TouchableOpacity>
                </View>
                <View style={styles.setInputRow}>
                    <TextInput style={styles.setInput} value={set.weight} onChangeText={(val) => onSetChange(setIndex, 'weight', val)} placeholder="무게(kg)" keyboardType="numeric" />
                    <TextInput style={styles.setInput} value={set.reps} onChangeText={(val) => onSetChange(setIndex, 'reps', val)} placeholder="횟수" keyboardType="numeric" />
                </View>
            </View>
        ))}
        <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
            <Icon name="plus" size={14} color="#007bff" />
            <Text style={styles.addSetButtonText}>세트 추가</Text>
        </TouchableOpacity>
    </View>
);

const getSetConfiguration = (setup: string) => {
    const parts = setup.split('x');
    const reps = parseInt(parts[0], 10);
    const sets = parseInt(parts[1], 10);
    return { repsCount: reps, setsCount: sets };
};

// --- Main Form Component ---
const WorkoutForm = ({ navigation, route }) => {
  const { date } = route.params;
  const { workouts, addWorkout, preferredSetup } = useWorkoutStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [mainExercises, setMainExercises] = useState([]);
  const [accessoryExercises, setAccessoryExercises] = useState([]);

  const updateExercise = (type, index, field, value) => {
    const updater = type === 'main' ? setMainExercises : setAccessoryExercises;
    updater(prev => {
        const newExercises = [...prev];
        newExercises[index] = { ...newExercises[index], [field]: value };
        return newExercises;
    });
  };

  const updateSet = (type, exIndex, setIndex, field, value) => {
    const updater = type === 'main' ? setMainExercises : setAccessoryExercises;
    updater(prev => {
        const newExercises = [...prev];
        const newSets = [...newExercises[exIndex].sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        newExercises[exIndex].sets = newSets;
        return newExercises;
    });
  };

  const addSet = (type, exIndex) => {
      const updater = type === 'main' ? setMainExercises : setAccessoryExercises;
      updater(prev => {
          const newExercises = [...prev];
          newExercises[exIndex].sets.push({ weight: '', reps: '' });
          return newExercises;
      });
  };

  const removeSet = (type, exIndex, setIndex) => {
      const updater = type === 'main' ? setMainExercises : setAccessoryExercises;
      updater(prev => {
          const newExercises = [...prev];
          if(newExercises[exIndex].sets.length > 1) {
              newExercises[exIndex].sets.splice(setIndex, 1);
          }
          return newExercises;
      });
  };
  
  const handleAddMainExercise = useCallback((selectedExercise) => {
    const lastRecord = workouts
      .map(w => { // 모든 운동 기록을 동일한 구조로 정규화
          if (w.type === 'complex') {
              return [w.main, ...w.accessories];
          } else if(w.type === 'single') {
              return [{ name: w.name, sets: w.sets, date: w.date }];
          }
          return [];
      })
      .flat()
      .filter(ex => ex && ex.name === selectedExercise.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    let sets;
    if (lastRecord && lastRecord.sets) {
        sets = lastRecord.sets.map(s => ({ ...s }));
    } else {
        const { repsCount, setsCount } = getSetConfiguration(preferredSetup);
        sets = Array.from({ length: setsCount }, () => ({ weight: '', reps: repsCount.toString() }));
    }

    const newExercise = {
        name: selectedExercise.name,
        sets: sets
    };
    setMainExercises(prev => [...prev, newExercise]);
  }, [workouts, preferredSetup]);

  const handleAddAccessoryExercise = () => {
      setAccessoryExercises(prev => [...prev, { name: '', sets: [{ weight: '', reps: '' }] }]);
  };

  const handleRemoveExercise = (type, index) => {
    const updater = type === 'main' ? setMainExercises : setAccessoryExercises;
    updater(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    if (mainExercises.length === 0) {
      Alert.alert('오류', '최소 하나 이상의 메인 운동을 추가해주세요.');
      setIsSaving(false);
      return;
    }

    try {
        const netState = await NetInfo.fetch();
        const formattedDate = format(new Date(date), 'yyyy-MM-dd');
        
        const workoutData = {
            name: mainExercises[0].name + (mainExercises.length > 1 ? ` 외 ${mainExercises.length - 1}개` : ''),
            type: mainExercises.length === 1 && accessoryExercises.length === 0 ? 'single' : 'complex',
            date: formattedDate,
            main: mainExercises[0], // 대표 메인 운동
            mainExercises: mainExercises,
            accessories: accessoryExercises,
        };
        
        // 데이터 정제
        workoutData.mainExercises = workoutData.mainExercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps, 10) || 0 }))
        }));
        workoutData.accessories = workoutData.accessories.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps, 10) || 0 }))
        }));
        
        await addWorkout(workoutData); // Zustand 스토어 액션 사용
        
        navigation.goBack();
    } catch (error) {
      console.error("운동 저장 실패:", error);
      Alert.alert('오류', '운동 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>운동 기록</Text>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>메인 운동</Text>
            {mainExercises.map((ex, index) => (
                <ExerciseInput 
                    key={`main-${index}`} 
                    exercise={ex} 
                    title={`메인 운동 ${index + 1}`}
                    onExerciseChange={(field, value) => updateExercise('main', index, field, value)}
                    onSetChange={(setIndex, field, value) => updateSet('main', index, setIndex, field, value)}
                    onAddSet={() => addSet('main', index)}
                    onRemoveSet={(setIndex) => removeSet('main', index, setIndex)}
                    onRemoveExercise={() => handleRemoveExercise('main', index)}
                />
            ))}
            <AppButton title="메인 운동 추가" onPress={() => navigation.navigate('ExerciseList', { onSelect: handleAddMainExercise })} variant="primary" />
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>보조 운동</Text>
            {accessoryExercises.map((ex, index) => (
                <ExerciseInput 
                    key={`acc-${index}`} 
                    exercise={ex} 
                    title={`보조 운동 ${index + 1}`}
                    onExerciseChange={(field, value) => updateExercise('accessory', index, field, value)}
                    onSetChange={(setIndex, field, value) => updateSet('accessory', index, setIndex, field, value)}
                    onAddSet={() => addSet('accessory', index)}
                    onRemoveSet={(setIndex) => removeSet('accessory', index, setIndex)}
                    onRemoveExercise={() => handleRemoveExercise('accessory', index)}
                />
            ))}
            <AppButton title="보조 운동 추가" onPress={handleAddAccessoryExercise} variant="secondary" />
        </View>

        <AppButton title="세션 저장" onPress={handleSave} loading={isSaving} style={styles.saveButton} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  selector: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
  },
  selectedSelector: {
    backgroundColor: 'white', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  selectorText: {
    textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#6c757d',
  },
  selectedSelectorText: { color: '#007bff' },
  exerciseContainer: {
    backgroundColor: 'white', borderRadius: 12, padding: 15,
    marginBottom: 20, elevation: 1,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#343a40' },
  input: {
    backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15,
    borderWidth: 1, borderColor: '#ced4da', fontSize: 16,
  },
  setContainer: {
    padding: 12, borderRadius: 8, backgroundColor: '#f8f9fa',
    marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef',
  },
  setHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  setTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40' },
  removeSetButton: { padding: 5 },
  setInputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  setInput: {
    flex: 1, backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 6, borderWidth: 1, borderColor: '#ced4da', fontSize: 16,
    marginHorizontal: 4,
  },
  addSetButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderWidth: 1, borderStyle: 'dashed',
    borderColor: '#007bff', borderRadius: 8, marginTop: 10,
  },
  addSetButtonText: { marginLeft: 8, color: '#007bff', fontSize: 14, fontWeight: '500' },
  addExerciseButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e9ffef', padding: 15, borderRadius: 10, marginBottom: 10,
  },
  addExerciseButtonText: {
    marginLeft: 8, color: '#28a745', fontSize: 16, fontWeight: '500',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#343a40',
  },
});

export default WorkoutForm; 