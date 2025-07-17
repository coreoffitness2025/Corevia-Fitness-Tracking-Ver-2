import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { WorkoutSessionLog, PerformedExerciseLog } from '../types';

const logsCollection = firestore().collection('workoutSessionLogs');

/**
 * 완료된 운동 세션 로그를 Firestore에 저장합니다.
 * @param logData - 저장할 운동 세션 로그 데이터
 * @returns 생성된 로그 문서의 ID
 */
export const saveWorkoutSessionLog = async (
  logData: Omit<WorkoutSessionLog, 'id' | 'userId' | 'startedAt' | 'completedAt'>
): Promise<string> => {
  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }

  const newLogRef = logsCollection.doc();
  const timestamp = firestore.FieldValue.serverTimestamp();

  // 실제 저장될 데이터
  const sessionLog: Omit<WorkoutSessionLog, 'id'> = {
    ...logData,
    userId,
    startedAt: timestamp, // 실제로는 시작 시간을 받아서 처리해야 하지만, 여기서는 단순화
    completedAt: timestamp,
    totalVolume: logData.exercises.reduce((total, ex) => {
        return total + ex.sets.reduce((subTotal, set) => {
            return subTotal + (set.weight * set.reps);
        }, 0);
    }, 0)
  };

  await newLogRef.set({
    ...sessionLog,
    id: newLogRef.id,
  });

  return newLogRef.id;
};

/**
 * 특정 운동에 대한 가장 최근의 성공적인 운동 기록을 가져옵니다.
 * @param exerciseName - 기록을 조회할 운동의 이름
 * @returns 가장 최근의 PerformedExerciseLog 또는 null
 */
export const getLatestLogForExercise = async (exerciseName: string): Promise<PerformedExerciseLog | null> => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
        throw new Error('사용자 인증이 필요합니다.');
    }

    // workoutSessionLogs 컬렉션에서 최근 로그를 가져옵니다.
    const snapshot = await logsCollection
        .where('userId', '==', userId)
        .where('exercises', 'array-contains-any', [{name: exerciseName}]) // 'name' 필드를 포함하는지 확인하는 방식으로 변경 필요
        .orderBy('completedAt', 'desc')
        .limit(10) // 최근 10개 로그에서 검색하여 성능 최적화
        .get();

    if (snapshot.empty) {
        return null;
    }

    // 찾은 여러 세션 로그 중에서 해당 운동을 찾아 반환
    for (const doc of snapshot.docs) {
        const log = doc.data() as WorkoutSessionLog;
        const foundExercise = log.exercises.find(ex => ex.name === exerciseName);
        if (foundExercise) {
            // 성공적으로 완료된 세트가 하나라도 있는 기록만 유효 처리
            const hasSuccessfulSet = foundExercise.sets.some(set => set.isCompleted);
            if(hasSuccessfulSet) {
                return foundExercise;
            }
        }
    }

    return null;
}; 