import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { WorkoutProgram } from '../types';

const programsCollection = firestore().collection('workoutPrograms');

/**
 * 새로운 운동 프로그램을 Firestore에 추가합니다.
 * @param programData - 추가할 프로그램 데이터 (id 제외)
 * @returns 생성된 프로그램의 ID
 */
export const createWorkoutProgram = async (
  programData: Omit<WorkoutProgram, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }

  const newProgramRef = programsCollection.doc();
  const timestamp = firestore.FieldValue.serverTimestamp();

  await newProgramRef.set({
    ...programData,
    id: newProgramRef.id,
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return newProgramRef.id;
};

/**
 * 현재 사용자의 모든 운동 프로그램을 가져옵니다.
 * @returns WorkoutProgram 배열
 */
export const getUserWorkoutPrograms = async (): Promise<WorkoutProgram[]> => {
  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }

  const snapshot = await programsCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();

  if (snapshot.empty) {
    return [];
  }
  
  // 타입 캐스팅을 통해 데이터 반환
  return snapshot.docs.map(doc => doc.data() as WorkoutProgram);
};


/**
 * 특정 ID의 운동 프로그램을 업데이트합니다.
 * @param programId - 업데이트할 프로그램의 ID
 * @param updates - 업데이트할 필드 객체
 */
export const updateWorkoutProgram = async (
    programId: string,
    updates: Partial<Omit<WorkoutProgram, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }
  
  // 프로그램이 현재 사용자의 것인지 확인하는 로직 (보안 강화)
  const programRef = programsCollection.doc(programId);
  const doc = await programRef.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    throw new Error('프로그램을 찾을 수 없거나 수정할 권한이 없습니다.');
  }
  
  await programRef.update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * 특정 ID의 운동 프로그램을 삭제합니다.
 * @param programId - 삭제할 프로그램의 ID
 */
export const deleteWorkoutProgram = async (programId: string): Promise<void> => {
  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }
  
  // 프로그램이 현재 사용자의 것인지 확인하는 로직 (보안 강화)
  const programRef = programsCollection.doc(programId);
  const doc = await programRef.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    throw new Error('프로그램을 찾을 수 없거나 삭제할 권한이 없습니다.');
  }
  
  await programRef.delete();
}; 