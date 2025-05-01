export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg';

export interface ExerciseSet {
  reps: number;
  isSuccess: boolean;
}

export interface MainExercise {
  part: ExercisePart;
  weight: number;
  sets: ExerciseSet[];
}

export interface AccessoryExercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
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
}

export interface Progress {
  date: Date | string;
  weight: number;
  successSets: number;
}

export interface FAQ {
  id: string;
  part: ExercisePart;
  question: string;
  answer: string;
  videoUrl?: string;
}
