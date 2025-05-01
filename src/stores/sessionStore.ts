import { create } from 'zustand';
import {
  ExercisePart,
  MainExercise,
  AccessoryExercise,
  Session
} from '../types';

interface SessionState {
  /* ---------- 기존 상태 ---------- */
  part: ExercisePart | null;
  mainExercise: MainExercise | null;
  accessoryExercises: AccessoryExercise[];
  notes: string;

  /* ---------- 🔥 새로 추가 ---------- */
  /** 파트별 최근 세션 캐시 (중복 네트워크 호출 제거용) */
  lastSessionCache: Partial<Record<ExercisePart, Session | null>>;

  /* ---------- setters ---------- */
  setPart: (part: ExercisePart) => void;
  setMainExercise: (mainExercise: MainExercise) => void;
  cacheLastSession: (part: ExercisePart, session: Session | null) => void;

  /* ---------- 기존 메서드 ---------- */
  updateReps: (setIndex: number, reps: number) => void;
  toggleSuccess: (setIndex: number) => void;
  addAccessoryExercise: (exercise: AccessoryExercise) => void;
  removeAccessoryExercise: (index: number) => void;
  setNotes: (notes: string) => void;
  getSuccessSets: () => number;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  /* ---------- 상태 초기값 ---------- */
  part: null,
  mainExercise: null,
  accessoryExercises: [],
  notes: '',
  lastSessionCache: {},

  /* ---------- 기본 setters ---------- */
  setPart: (part) => set({ part }),

  setMainExercise: (mainExercise) => set({ mainExercise }),

  /** 🔥 파트별 최근 세션을 메모리에 캐싱 */
  cacheLastSession: (part, session) =>
    set((state) => ({
      lastSessionCache: { ...state.lastSessionCache, [part]: session }
    })),

  /* ---------- 세트 반복/성공 토글 ---------- */
  updateReps: (setIndex, reps) =>
    set((state) => {
      if (!state.mainExercise) return state;

      const updatedSets = [...state.mainExercise.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        reps,
        isSuccess: reps >= 10 // 10회 이상이면 성공
      };

      return {
        mainExercise: {
          ...state.mainExercise,
          sets: updatedSets
        }
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

      return {
        mainExercise: {
          ...state.mainExercise,
          sets: updatedSets
        }
      };
    }),

  /* ---------- 액세서리 운동 ---------- */
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
    if (!mainExercise) return 0;
    return mainExercise.sets.filter((set) => set.isSuccess).length;
  },

  /* ---------- 세션 초기화 (캐시는 보존) ---------- */
  resetSession: () =>
    set((state) => ({
      part: null,
      mainExercise: null,
      accessoryExercises: [],
      notes: '',
      lastSessionCache: state.lastSessionCache
    }))
}));
