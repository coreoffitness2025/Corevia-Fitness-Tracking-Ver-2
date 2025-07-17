import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutProgramStore } from '../features/workout/store/workoutProgramStore';
import { WorkoutProgram } from '../features/workout/types';
import AppButton from '../components/common/AppButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 네비게이션 스택 파라미터 타입 정의 (추후 확장)
type RootStackParamList = {
  WorkoutProgramDetail: { programId: string };
  EditWorkoutProgram: { programId?: string }; // programId가 있으면 수정, 없으면 생성
};

type WorkoutProgramScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkoutProgramDetail'
>;

const WorkoutProgramScreen = () => {
  const navigation = useNavigation<WorkoutProgramScreenNavigationProp>();
  const { programs, isLoading, error, fetchPrograms, deleteProgram } = useWorkoutProgramStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 프로그램 목록을 가져옵니다.
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = (programId: string) => {
    Alert.alert(
      '프로그램 삭제',
      '정말로 이 운동 프로그램을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deleteProgram(programId) },
      ]
    );
  };

  const renderProgramItem = ({ item }: { item: WorkoutProgram }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('WorkoutProgramDetail', { programId: item.id })}
    >
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description || '설명이 없습니다.'}</Text>
            <Text style={styles.itemInfo}>{item.exercises.length}개의 운동 포함</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading && programs.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>운동 프로그램을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>오류가 발생했습니다: {error}</Text>
            <AppButton title="다시 시도" onPress={fetchPrograms} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
        <AppButton 
            title="새 운동 프로그램 만들기"
            onPress={() => navigation.navigate('EditWorkoutProgram')}
            style={styles.createButton}
        />
      {programs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>저장된 운동 프로그램이 없습니다.</Text>
          <Text style={styles.emptySubText}>새로운 프로그램을 만들어보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={programs}
          renderItem={renderProgramItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
    },
    emptySubText: {
        fontSize: 14,
        color: '#777',
        marginTop: 8,
    },
    createButton: {
        margin: 15,
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    itemInfo: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#ff3b30',
        borderRadius: 5,
        marginLeft: 15,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default WorkoutProgramScreen; 