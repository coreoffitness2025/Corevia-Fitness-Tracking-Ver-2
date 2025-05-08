// src/types/index.ts (혹은 types.ts)

export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps';

export interface WorkoutSet {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

export interface ExerciseSet {
  reps: number;
  isSuccess: boolean;
}

export interface MainExercise {
  name: string;
  part: ExercisePart;
  weight: number;
  sets: WorkoutSet[];
}

export interface AccessoryExercise {
  name: string;
  weight: number;
  reps: number;
  sets: number | WorkoutSet[];
}

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
}

export interface Progress {
  date: Date | string;
  weight: number;
  successSets: number;
  sets: ExerciseSet[];
  isSuccess: boolean;
}

export interface FAQ {
  id: string;
  part: ExercisePart;
  question: string;
  answer: string;
  videoUrl?: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'low' | 'moderate' | 'high';
  fitnessGoal?: 'loss' | 'maintain' | 'gain';
  experience?: {
    years: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    squat: {
      maxWeight: number;
      maxReps: number;
    };
  };
  preferredExercises?: {
    chest?: string;
    back?: string;
    shoulder?: string;
    leg?: string;
    biceps?: string;
    triceps?: string;
  };
  setConfiguration?: {
    preferredSetup?: string;
    customSets?: number;
    customReps?: number;
  };
  oneRepMax?: {
    bench?: number;
    squat?: number;
    deadlift?: number;
    overheadPress?: number;
  };
  targetCalories?: number;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: {
    workoutReminder: boolean;
    mealReminder: boolean;
    progressUpdate: boolean;
  };
  units: {
    weight: 'kg' | 'lb';
    height: 'cm' | 'ft';
  };
  language: string;
}

export interface Food {
  id: string;
  userId: string;
  date: Date | string;
  name: string;
  imageUrl: string;
  notes?: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
