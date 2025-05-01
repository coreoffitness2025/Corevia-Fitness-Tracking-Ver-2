import { create } from 'zustand';
import { ExercisePart, MainExercise, AccessoryExercise, ExerciseSet } from '../types';

interface SessionState {
  part: ExercisePart | null;
  mainExercise: MainExercise | null;
  accessoryExercises: AccessoryExercise[];
  notes: string;
  setPart: (part: ExercisePart) => void;
  setMainExercise: (mainExercise: MainExercise) => void;
  updateReps: (setIndex: number, reps: number) => void;
  toggleSuccess: (setIndex: number) => void;
  addAccessoryExercise: (exercise: AccessoryExercise) => void;
  removeAccessoryExercise: (index: number) => void;
  setNotes: (notes: string) => void;
  getSuccessSets: () => number;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  part: null,
  mainExercise: null,
  accessoryExercises: [],
  notes: '',

  setPart: (part) => set({ part }),

  setMainExercise: (mainExercise) => set({ mainExercise }),

  updateReps: (setIndex, reps) => set((state) => {
    if (!state.mainExercise) return state;

    const updatedSets = [...state.mainExercise.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      reps,
      isSuccess: reps >= 10 // 10회 이상이면 성공으로 간주
    };

    return {
      mainExercise: {
        ...state.mainExercise,
        sets: updatedSets
      }
    };
  }),

  toggleSuccess: (setIndex) => set((state) => {
    if (!state.mainExercise) return state;

    const updatedSets = [...state.mainExercise.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      isSuccess: !updatedSets[setIndex].isSuccess
    };

    return {
      mainExercise: {
        ...state.mainExercise,
        sets: updatedSets
      }
    };
  }),

  addAccessoryExercise: (exercise) => set((state) => ({
    accessoryExercises: [...state.accessoryExercises, exercise]
  })),

  removeAccessoryExercise: (index) => set((state) => ({
    accessoryExercises: state.accessoryExercises.filter((_, i) => i !== index)
  })),

  setNotes: (notes) => set({ notes }),

  getSuccessSets: () => {
    const { mainExercise } = get();
    if (!mainExercise) return 0;
    return mainExercise.sets.filter(set => set.isSuccess).length;
  },

  resetSession: () => set({
    part: null,
    mainExercise: null,
    accessoryExercises: [],
    notes: ''
  })
}));
