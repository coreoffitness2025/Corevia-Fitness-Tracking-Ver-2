/* ---------- 사용자 ---------- */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

/* ---------- 운동 타입 ---------- */
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps' | 'complex' | 'abs' | 'cardio';

export interface Set {
  reps: number;
  weight: number;
  isSuccess: boolean | null;
}

export interface MainExercise {
  part?: ExercisePart;
  name: string;
  weight?: number;
  sets: Set[];
}

export interface AccessoryExercise {
  name: string;
  weight?: number;
  reps?: number;
  sets?: Set[];
}

// 메인 운동 타입 (타입 안전성을 위해 union 타입으로 정의)
export type ChestMainExercise = 'benchPress' | 'inclineBenchPress' | 'declineBenchPress' | 'dumbbellBenchPress' | 'chestPress';
export type BackMainExercise = 'deadlift' | 'barbellRow' | 'pullUp' | 'tBarRow';
export type ShoulderMainExercise = 'overheadPress' | 'lateralRaise' | 'facePull' | 'dumbbellShoulderPress';
export type LegMainExercise = 'squat' | 'legPress' | 'lunge' | 'romanianDeadlift';
export type BicepsMainExercise = 'dumbbellCurl' | 'barbellCurl' | 'hammerCurl';
export type TricepsMainExercise = 'cablePushdown' | 'overheadExtension' | 'lyingTricepsExtension';

export type MainExerciseType = 
  | ChestMainExercise 
  | BackMainExercise 
  | ShoulderMainExercise 
  | LegMainExercise 
  | BicepsMainExercise 
  | TricepsMainExercise
  | 'customComplex';

// 세트 설정 타입
export type SetConfiguration = '5x5' | '10x5' | '15x5' | '6x3';

/* ---------- 세션 ---------- */
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
  sleepHours?: number; // 수면 시간 (선택 사항)
  condition?: 'bad' | 'normal' | 'good'; // 컨디션 상태 (선택 사항)
  startTime?: string; // 운동 시작 시간 (HH:MM 형식)
  lastMealTime?: string; // 마지막 식사 시간 (HH:MM 형식)
  stretchingCompleted?: boolean; // 스트레칭 완료 여부
  warmupCompleted?: boolean; // 웜업 완료 여부
  stretchingNotes?: string; // 스트레칭/웜업 관련 메모
}

/* ---------- 일일 운동 기록 ---------- */
export interface DailyWorkout {
  id: string;
  userId: string;
  date: string;
  sessions: string[];
  totalDuration: number;
  caloriesBurned: number;
}

/* ---------- 그래프용 진행 데이터 ---------- */
export interface Progress {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  measurements?: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    thighs: number;
  };
  photos?: string[];
  notes?: string;
}

/* ---------- FAQ ---------- */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  videoUrl?: string;
  type: 'method' | 'sets';
  part: ExercisePart;
  category: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  fitnessGoal: 'loss' | 'maintain' | 'gain';
  targetCalories?: number;
  experience: {
    years: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    squat: {
      maxWeight: number;
      maxReps: number;
    };
  };
  preferredExercises?: {
    chest: ChestMainExercise;
    back: BackMainExercise;
    shoulder: ShoulderMainExercise;
    leg: LegMainExercise;
    biceps: BicepsMainExercise;
    triceps: TricepsMainExercise;
  };
  setConfiguration?: {
    preferredSetup: SetConfiguration;
    customSets?: number;
    customReps?: number;
  };
  oneRepMax?: {
    bench: number;
    squat: number;
    deadlift: number;
    overheadPress: number;
  };
  settings?: UserSettings;
  isPremium?: boolean; // 프리미엄 회원 여부
}

export interface UserSettings {
  darkMode: boolean;
  notifications: {
    workoutReminder: boolean;
    mealReminder: boolean;
    progressUpdate: boolean;
  };
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
  };
  language: 'ko' | 'en';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscles: string[];
  equipment: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  videoUrl?: string;
  part: ExercisePart;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  exercises: {
    exerciseId: string;
    sets: {
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
  duration: number;
  notes?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface Food {
  id: string;
  userId: string;
  date: Date;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type?: string;
  imageUrl?: string;
  notes?: string;
}

// 물 섭취 기록
export interface WaterIntake {
  id: string;
  userId: string;
  date: Date;
  amount: number; // ml 단위
  time: string; // 섭취 시간 (HH:mm)
  notes?: string;
}

// 영양제/보충제 섭취 기록
export interface Supplement {
  id: string;
  userId: string;
  date: Date;
  name: string; // 영양제 이름
  dosage: string; // 복용량 (예: "1정", "2스푼")
  time: string; // 섭취 시간 (HH:mm)
  type: 'vitamin' | 'mineral' | 'protein' | 'preworkout' | 'postworkout' | 'other'; // 영양제 종류
  notes?: string;
}

// 식단 관련 통합 타입 (기록 보기에서 사용)
export type IntakeRecord = {
  type: 'food';
  data: Food;
} | {
  type: 'water';
  data: WaterIntake;
} | {
  type: 'supplement';
  data: Supplement;
};

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

/* ---------- 운동 기록용 타입 정의 (WorkoutList, WorkoutGraph에서 사용) ---------- */
export interface WorkoutSet {
  reps: number;
  weight: number;
  isSuccess: boolean | null;
}

// Firestore Timestamp 인터페이스 추가
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

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

export interface DateWorkoutMap {
  [dateStr: string]: Workout[];
}

export interface ChartDataPoint {
  date: string;
  weight: number;
  isSuccess: boolean;
}

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
