// src/types/index.ts (혹은 types.ts)

export type ExercisePart = 
  | 'chest' 
  | 'back' 
  | 'shoulder' 
  | 'leg' 
  | 'biceps' 
  | 'triceps' 
  | 'abs' 
  | 'cardio';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  part: ExercisePart;
  description: string;
  instructions: string[];
  videoUrl: string;
  equipment: string[];
  muscles: string[];
  level: ExerciseLevel;
}

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
  email: string;
  displayName: string;
  photoURL?: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  fitnessGoal: 'loss' | 'maintain' | 'gain';
  experience?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    years: number;
  };
  targetCalories: number;
  preferredExercises?: {
    chest: ChestMainExercise;
    back: BackMainExercise;
    shoulder: ShoulderMainExercise;
    leg: LegMainExercise;
    biceps: BicepsMainExercise;
    triceps: TricepsMainExercise;
  };
  oneRepMax?: {
    bench: number;
    squat: number;
    deadlift: number;
    overheadPress: number;
  };
  setConfiguration?: {
    preferredSetup: SetConfiguration;
    customSets: number;
    customReps: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type SetConfiguration = '10x5' | '15x5' | '6x3' | '5x5';

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

export interface WorkoutGuideInfo {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingYears?: number;
  oneRepMaxes: {
    squat: number;
    deadlift: number;
    bench: number;
    overheadPress: number;
  };
  preferredSetConfig: '10x5' | '6x3' | '15x5';
}

export interface WorkoutGuideResult {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: '20-35' | '36-50' | '51+';
  recommendedWeights: {
    squat?: number;
    deadlift?: number;
    bench?: number;
    overheadPress?: number;
  };
  recoveryTime: string;
  setConfig: {
    type: '10x5' | '6x3' | '15x5';
    description: string;
    advantages: string[];
  };
  percentageOfOneRM: number;
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
