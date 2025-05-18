/**
 * 운동 관련 타입 정의
 */

// 운동 부위 타입
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps' | 'complex';

// 세트 타입
export interface Set {
  reps: number;
  weight: number;
  isSuccess: boolean | null;
}

// 메인 운동 타입
export interface MainExercise {
  part?: ExercisePart;
  name: string;
  weight?: number;
  sets: Set[];
}

// 보조 운동 타입
export interface AccessoryExercise {
  name: string;
  weight?: number;
  reps?: number;
  sets?: Set[];
}

// 메인 운동 타입 (타입 안전성을 위해 union 타입으로 정의)
export type ChestMainExercise = 'benchPress' | 'inclineBenchPress' | 'declineBenchPress';
export type BackMainExercise = 'deadlift' | 'barbellRow' | 'pullUp' | 'tBarRow';
export type ShoulderMainExercise = 'overheadPress' | 'lateralRaise' | 'facePull';
export type LegMainExercise = 'squat' | 'legPress' | 'lunge';
export type BicepsMainExercise = 'dumbbellCurl' | 'barbellCurl' | 'hammerCurl';
export type TricepsMainExercise = 'cablePushdown' | 'overheadExtension' | 'lyingTricepsExtension';
export type ComplexMainExercise = 'customComplex';

export type MainExerciseType = 
  | ChestMainExercise 
  | BackMainExercise 
  | ShoulderMainExercise 
  | LegMainExercise 
  | BicepsMainExercise 
  | TricepsMainExercise
  | ComplexMainExercise;

// 세트 설정 타입
export type SetConfiguration = '5x5' | '10x5' | '15x5' | '6x3' | 'custom';

// 운동 세션 타입
export interface Session {
  id?: string;
  userId: string;
  date: Date;
  part: ExercisePart;
  mainExercise: MainExercise;
  accessoryExercises: AccessoryExercise[];
  notes: string;
  isAllSuccess: boolean;
  successSets: number;
  accessoryNames: string[];
}

// 일일 운동 기록 타입
export interface DailyWorkout {
  id: string;
  userId: string;
  date: string;
  sessions: string[];
  totalDuration: number;
  caloriesBurned: number;
}

// 운동 기록용 세트 타입
export interface WorkoutSet {
  reps: number;
  weight: number;
  isSuccess: boolean | null;
}

// Firestore Timestamp 인터페이스
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

// 운동 기록 타입
export interface Workout {
  id: string;
  date: string | Date | FirestoreTimestamp;
  part: ExercisePart;
  mainExercise: {
    name: string;
    sets: WorkoutSet[];
    weight?: number;
    part?: ExercisePart; // 복합 운동에서 사용할 부위 속성 추가
  };
  accessoryExercises?: AccessoryExercise[];
  notes?: string;
  isAllSuccess: boolean;
  successSets?: number;
}

// 날짜별 운동 기록 맵
export interface DateWorkoutMap {
  [dateStr: string]: Workout[];
}

// 차트 데이터 포인트
export interface ChartDataPoint {
  date: string;
  weight: number;
  isSuccess: boolean;
}

// 운동 프로그램 타입
export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight-loss';
  duration: string;
  durationType?: 'weeks' | 'days';
  daysPerWeek: number;
  schedule: Array<{
    day: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      notes?: string;
    }>;
  }>;
  tips: string[];
  videoUrl?: string;
}

// 운동 가이드 정보 타입
export interface WorkoutGuideInfo {
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingYears?: number;
  oneRepMaxes?: {
    squat: number;
    deadlift: number;
    bench: number;
    overheadPress: number;
  };
  preferredSetConfig: string;
}

// 운동 가이드 결과 타입
export interface WorkoutGuideResult {
  programName: string;
  description: string;
  schedule: Array<{
    day: string;
    focus: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
    }>;
  }>;
  tips: string[];
  estimatedProgress: {
    weeks: number;
    strengthGain: string;
  };
  userLevel: string;
  recommendedWeights: Record<string, number>;
  recoveryTime: string;
  percentageOfOneRM: number;
  setConfig: {
    type: string;
    description: string;
    advantages: string[];
  };
} 