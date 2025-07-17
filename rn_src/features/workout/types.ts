import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * WorkoutProgram 에 포함될 개별 운동의 구조
 */
export interface ProgramExercise {
  //운동 고유 ID
  id: string; 
  // 운동 이름
  name: string;
  // 'main' | 'accessory' 등 운동 유형
  type: 'main' | 'accessory' | 'warmup';
  // 목표 세트 수
  targetSets: number;
  // 목표 반복 횟수
  targetReps: number;
  // 목표 중량 (선택 사항)
  targetWeight?: number;
  // 운동 순서
  order: number;
  // 메모 (선택 사항)
  notes?: string;
}

/**
 * 사용자가 생성하는 운동 프로그램(루틴)의 구조
 */
export interface WorkoutProgram {
  // Firestore 문서 ID
  id: string; 
  // 사용자 ID
  userId: string;
  // 프로그램 이름 (예: "3대 운동 볼륨 프로그램")
  name: string;
  // 프로그램 설명 (선택 사항)
  description?: string;
  // 프로그램에 포함된 운동 목록
  exercises: ProgramExercise[];
  // 생성일
  createdAt: FirebaseFirestoreTypes.FieldValue;
  // 수정일
  updatedAt: FirebaseFirestoreTypes.FieldValue;
}

/**
 * 실제 운동 수행 시 기록되는 개별 세트의 구조
 */
export interface PerformedSet {
  // 실제 수행한 반복 횟수
  reps: number;
  // 실제 사용한 중량
  weight: number;
  // 완료 여부
  isCompleted: boolean;
}

/**
 * 실제 운동 세션에서 수행된 개별 운동의 로그
 */
export interface PerformedExerciseLog {
  // 프로그램에 정의된 운동의 ID
  programExerciseId: string;
  // 운동의 고유 ID
  exerciseId: string;
  // 운동 이름
  name:string;
  // 수행한 세트 목록
  sets: PerformedSet[];
  // 메모 (선택 사항)
  notes?: string;
}

/**
 * 운동 프로그램에 기반한 전체 운동 세션의 로그
 */
export interface WorkoutSessionLog {
  // Firestore 문서 ID
  id: string; 
  // 사용자 ID
  userId: string;
  // 기반이 된 프로그램의 ID
  programId: string;
  // 기반이 된 프로그램의 이름
  programName: string;
  // 운동 시작 시간
  startedAt: FirebaseFirestoreTypes.FieldValue;
  // 운동 완료 시간
  completedAt: FirebaseFirestoreTypes.FieldValue;
  // 수행한 운동 로그 목록
  exercises: PerformedExerciseLog[];
  // 운동 총 볼륨 (선택 사항)
  totalVolume: number;
} 