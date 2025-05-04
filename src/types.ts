/* ---------- 사용자 ---------- */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

/* ---------- 운동 타입 ---------- */
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg';

export interface ExerciseSet {
  reps: number;
  isSuccess: boolean;
  weight: number;
}

export interface MainExercise {
  part: ExercisePart;
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
  gender: 'male' | 'female' | 'other';
  activityLevel: 'low' | 'moderate' | 'high';
  fitnessGoal: 'loss' | 'maintain' | 'gain';
  experience: {
    years: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    squat: {
      maxWeight: number;
      maxReps: number;
    };
  };
}

export interface UserSettings {
  theme: 'light' | 'dark';
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
