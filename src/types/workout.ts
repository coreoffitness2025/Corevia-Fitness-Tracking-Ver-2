export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg';

export interface ExerciseSet {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
  weight: number;
  rest: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  part: ExercisePart;
  mainExercise: Exercise;
  accessoryExercises: Exercise[];
  notes?: string;
  isAllSuccess: boolean;
}

export interface Progress {
  date: Date;
  weight: number;
  successSets: number;
  isSuccess: boolean;
  sets: ExerciseSet[];
  notes?: string;
  accessoryExercises: Exercise[];
  accessoryNames: string[];
} 