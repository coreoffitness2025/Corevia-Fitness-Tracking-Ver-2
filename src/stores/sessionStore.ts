import { create } from 'zustand';
import {
  ExercisePart,
  MainExercise,
  AccessoryExercise,
  Session,
  Progress          // 🔥 추가
} from '../types';

interface SessionState {
  /* 기존 상태 */
  part: ExercisePart | null;
  mainExercise: MainExercise | null;
  accessoryExercises: AccessoryExercise[];
  notes: string;

  /* 🔥 새 캐시 */
  lastSessionCache: Partial<Record<ExercisePart, Session | null>>;
  progressCache: Partial<Record<ExercisePart, Progress[]>>;

  /* setters */
  setPart: (part: ExercisePart) => void;
  setMainExercise: (m: MainExercise) => void;
  cacheLastSession: (p: ExercisePart, s: Session | null) => void;
  cacheProgress: (p: ExercisePart, d: Progress[]) => void;

  /* 기존 메서드 */
  updateReps: (idx: number, reps: number) => void;
  toggleSuccess: (idx: number) => void;
  addAccessoryExercise: (e: AccessoryExercise) => void;
  removeAccessoryExercise: (i: number) => void;
  setNotes: (n: string) => void;
  getSuccessSets: () => number;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  part: null,
  mainExercise: null,
  accessoryExercises: [],
  notes: '',
  lastSessionCache: {},
  progressCache: {},                                      // 🔥

  setPart: (part) => set({ part }),
  setMainExercise: (m) => set({ mainExercise: m }),

  cacheLastSession: (part, s) =>
    set((st) => ({ lastSessionCache: { ...st.lastSessionCache, [part]: s } })),

  cacheProgress: (part, d) =>                             // 🔥
    set((st) => ({ progressCache: { ...st.progressCache, [part]: d } })),

  /* 이하 기존 로직 그대로 … */
  updateReps: (idx, reps) =>
    set((st) => {
      if (!st.mainExercise) return st;
      const sets = [...st.mainExercise.sets];
      sets[idx] = { ...sets[idx], reps, isSuccess: reps >= 10 };
      return { mainExercise: { ...st.mainExercise, sets } };
    }),

  toggleSuccess: (idx) =>
    set((st) => {
      if (!st.mainExercise) return st;
      const sets = [...st.mainExercise.sets];
      sets[idx] = { ...sets[idx], isSuccess: !sets[idx].isSuccess };
      return { mainExercise: { ...st.mainExercise, sets } };
    }),

  addAccessoryExercise: (e) =>
    set((st) => ({ accessoryExercises: [...st.accessoryExercises, e] })),

  removeAccessoryExercise: (i) =>
    set((st) => ({
      accessoryExercises: st.accessoryExercises.filter((_, idx) => idx !== i)
    })),

  setNotes: (n) => set({ notes: n }),

  getSuccessSets: () => {
    const m = get().mainExercise;
    return m ? m.sets.filter((s) => s.isSuccess).length : 0;
  },

  /* part 값과 두 캐시 유지 */
  resetSession: () =>
    set((st) => ({
      part: st.part,
      mainExercise: null,
      accessoryExercises: [],
      notes: '',
      lastSessionCache: st.lastSessionCache,
      progressCache: st.progressCache
    }))
}));
