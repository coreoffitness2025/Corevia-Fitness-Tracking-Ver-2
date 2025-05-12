/* ---------- 사용자 ---------- */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

/* ---------- 운동 타입 ---------- */
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps';

// 메인 운동 타입
export type ChestMainExercise = 'benchPress' | 'inclineBenchPress' | 'declineBenchPress';
export type BackMainExercise = 'deadlift' | 'barbellRow' | 'tBarRow' | 'pullUp';
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

// 세트 구성 타입
export type SetConfiguration = '10x5' | '6x3' | '15x5' | '20x5' | 'custom';

export interface ExerciseSet {
  reps: number;
  isSuccess: boolean;
  weight: number;
}

export interface MainExercise {
  part: ExercisePart;
  name: string;
  weight: number;
  sets: ExerciseSet[];
}

export interface AccessoryExercise {
  name: string;
  weight?: number;
  reps?: number;
  sets?: Array<{
    reps: number;
    weight: number;
    isSuccess: boolean;
  }>;
}

/* ---------- 세션 ---------- */
export interface Session {
  id?: string;
  userId: string;
  date: Date | string;
  part: ExercisePart;
  mainExercise: MainExercise;
  accessoryExercises?: AccessoryExercise[];
  notes?: string;
  isAllSuccess?: boolean;
  successSets?: number;
  accessoryNames?: string[];
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
export interface Set {
  reps: number;
  isSuccess: boolean;
  weight: number;
}

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
  activityLevel: 'low' | 'moderate' | 'high' | 'sedentary' | 'light' | 'veryActive';
  fitnessGoal: 'loss' | 'maintain' | 'gain' | 'lose';
  experience: {
    years: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    squat: {
      maxWeight: number;
      maxReps: number;
    };
  };
  settings?: UserSettings;
  targetCalories?: number;
  preferredExercises?: Record<string, string>;
  setConfiguration?: {
    preferredSetup: SetConfiguration;
    customSets?: number;
    customReps?: number;
  };
  oneRepMax?: {
    squat: number;
    bench: number;
    deadlift: number;
    overheadPress: number;
  };
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

/* ---------- 식단 및 영양 타입 ---------- */
export interface Food {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  category?: string;
  isFavorite?: boolean;
  userId?: string;
  createdAt?: Date | string;
  date?: Date | string;
  notes?: string;
  imageUrl?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity?: number;
}

/* ---------- 운동 가이드 타입 ---------- */
export interface WorkoutGuideInfo {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight-loss';
  daysPerWeek: number;
  timePerSession: number;
  maxLifts?: {
    squat: number;
    bench: number;
    deadlift: number;
    overheadPress: number;
  };
}

export interface WorkoutGuideResult {
  programName: string;
  description: string;
  schedule: {
    day: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      percentOfMax?: number;
    }[];
  }[];
  tips: string[];
  estimatedProgress: {
    weeks: number;
    strengthGain: string;
    muscleGain?: string;
    fatLoss?: string;
  };
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
}
