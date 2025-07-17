import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWorkoutProgramStore } from '../features/workout/store/workoutProgramStore';
import { ProgramExercise, WorkoutProgram } from '../features/workout/types';
import AppButton from '../components/common/AppButton';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import ExercisePicker from '../components/exercise/ExercisePicker'; // 추가

const EditWorkoutProgramScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { programId } = route.params as { programId?: string };

  const { addProgram, updateProgram, programs, isLoading } = useWorkoutProgramStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  useEffect(() => {
    if (programId) {
      const existingProgram = programs.find(p => p.id === programId);
      if (existingProgram) {
        setName(existingProgram.name);
        setDescription(existingProgram.description || '');
        setExercises(existingProgram.exercises);
      }
    }
  }, [programId, programs]);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '프로그램 이름을 입력해주세요.');
      return;
    }
    
    const programData = { name, description, exercises };
    
    try {
      if (programId) {
        await updateProgram(programId, programData);
        Alert.alert('성공', '프로그램이 수정되었습니다.');
      } else {
        await addProgram(programData);
        Alert.alert('성공', '새로운 프로그램이 생성되었습니다.');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('저장 실패', error.message);
    }
  };
  
  const handleSelectExercise = (selectedExercise) => {
    const newExercise: ProgramExercise = {
      id: selectedExercise.id,
      name: selectedExercise.name,
      type: selectedExercise.type,
      targetSets: 3, // 기본값 설정
      targetReps: 10, // 기본값 설정
      targetWeight: 0,
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
  };
  
  const addExercise = () => {
    setIsPickerVisible(true);
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };
  
  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<ProgramExercise>) => (
    <TouchableOpacity
      style={[styles.exerciseItem, { backgroundColor: isActive ? '#e0e0e0' : 'white' }]}
      onLongPress={drag}
      disabled={isActive}
    >
        <View>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDetails}>
                {item.targetSets} sets x {item.targetReps} reps
            </Text>
        </View>
        <TouchableOpacity onPress={() => removeExercise(item.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>X</Text>
        </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>프로그램 이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="예: 3대 운동 스트렝스"
        />

        <Text style={styles.label}>프로그램 설명 (선택)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="프로그램에 대한 간단한 설명을 입력하세요"
          multiline
        />
        
        <View style={styles.exercisesHeader}>
            <Text style={styles.label}>운동 목록</Text>
            <AppButton title="운동 추가" onPress={addExercise} variant="secondary" size="sm"/>
        </View>
        
        <DraggableFlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setExercises(data)}
          containerStyle={{ flex: 1 }}
        />
        
        <AppButton
          title={programId ? '프로그램 수정' : '프로그램 생성'}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>
      <ExercisePicker 
        isVisible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelectExercise={handleSelectExercise}
      />
    </>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    exercisesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    exerciseItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
    },
    exerciseDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    removeButton: {
        padding: 8,
    },
    removeButtonText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        marginTop: 30,
    }
});

export default EditWorkoutProgramScreen; 