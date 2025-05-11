/* ---------- 사용자 ---------- */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

/* ---------- 운동 타입 ---------- */
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps';

export interface Set {
  reps: number;
  weight: number;
  isSuccess: boolean | null;
}

export interface MainExercise {
  part: ExercisePart;
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

// 메인 운동 타입
export type ChestMainExercise = 'benchPress' | 'inclineBenchPress' | 'declineBenchPress';
export type BackMainExercise = 'deadlift' | 'pullUp' | 'bentOverRow' | 'barbellRow' | 'tBarRow';
export type ShoulderMainExercise = 'overheadPress' | 'lateralRaise' | 'facePull';
export type LegMainExercise = 'squat' | 'legPress' | 'lunge';
export type BicepsMainExercise = 'dumbbellCurl' | 'barbellCurl' | 'hammerCurl';
export type TricepsMainExercise = 'cablePushdown' | 'overheadExtension' | 'lyingTricepsExtension';

export type MainExerciseType = 
  | ChestMainExercise 
  | BackMainExercise 
  | ShoulderMainExercise 
  | LegMainExercise
  | BicepsMainExercise
  | TricepsMainExercise;

// 세트 설정 타입
export type SetConfiguration = '5x5' | '10x5' | '15x5' | '6x3' | '6x5' | '3x10' | 'custom';

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
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  videoUrl?: string;
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
