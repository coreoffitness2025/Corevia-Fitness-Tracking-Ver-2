import { create } from 'zustand';
import {
  ExercisePart,
  MainExercise,
  AccessoryExercise,
  Session
} from '../types';

interface SessionState {
  /* ---------- 상태 ---------- */
  part: ExercisePart | null;
  mainExercise: MainExercise | null;
  accessoryExercises: AccessoryExercise[];
  notes: string;

  /** 파트별 최근 세션 캐시 */
  lastSessionCache: Partial<Record<ExercisePart, Session | null>>;

  /* ---------- setters ---------- */
  setPart: (part: ExercisePart) => void;
  setMainExercise: (mainExercise: MainExercise) => void;
  cacheLastSession: (part: ExercisePart, session: Session | null) => void;

  /* ---------- 메서드 ---------- */
  updateReps: (setIndex: number, reps: number) => void;
  toggleSuccess: (setIndex: number) => void;
  addAccessoryExercise: (exercise: AccessoryExercise) => void;
  removeAccessoryExercise: (index: number) => void;
  setNotes: (notes: string) => void;
  getSuccessSets: () => number;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  /* ---------- 초기값 ---------- */
  part: null,
  mainExercise: null,
  accessoryExercises: [],
  notes: '',
  lastSessionCache: {},

  /* ---------- 기본 setters ---------- */
  setPart: (part) => set({ part }),

  setMainExercise: (mainExercise) => set({ mainExercise }),

  /** 파트별 최근 세션 캐시 */
  cacheLastSession: (part, session) =>
    set((state) => ({
      lastSessionCache: { ...state.lastSessionCache, [part]: session }
    })),

  /* ---------- 세트 반복/성공 ---------- */
  updateReps: (setIndex, reps) =>
    set((state) => {
      if (!state.mainExercise) return state;

      const updatedSets = [...state.mainExercise.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        reps,
        isSuccess: reps >= 10
      };

      return {
        mainExercise: { ...state.mainExercise, sets: updatedSets }
      };
    }),

  toggleSuccess: (setIndex) =>
    set((state) => {
      if (!state.mainExercise) return state;

      const updatedSets = [...state.mainExercise.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isSuccess: !updatedSets[setIndex].isSuccess
      };

      return { mainExercise: { ...state.mainExercise, sets: updatedSets } };
    }),

  /* ---------- 액세서리 ---------- */
  addAccessoryExercise: (exercise) =>
    set((state) => ({
      accessoryExercises: [...state.accessoryExercises, exercise]
    })),

  removeAccessoryExercise: (index) =>
    set((state) => ({
      accessoryExercises: state.accessoryExercises.filter((_, i) => i !== index)
    })),

  /* ---------- 메모 ---------- */
  setNotes: (notes) => set({ notes }),

  /* ---------- 유틸 ---------- */
  getSuccessSets: () => {
    const { mainExercise } = get();
    return mainExercise
      ? mainExercise.sets.filter((set) => set.isSuccess).length
      : 0;
  },

  /* ---------- 세션 초기화 (캐시는 보존, part 유지) ---------- */
  resetSession: () =>
    set((state) => ({
      part: state.part,                 // ❗ part 유지
      mainExercise: null,
      accessoryExercises: [],
      notes: '',
      lastSessionCache: state.lastSessionCache
    }))
}));
