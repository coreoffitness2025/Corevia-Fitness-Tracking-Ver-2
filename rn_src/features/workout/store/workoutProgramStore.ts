import create from 'zustand';
import { WorkoutProgram } from '../types';
import {
  createWorkoutProgram,
  deleteWorkoutProgram,
  getUserWorkoutPrograms,
  updateWorkoutProgram,
} from '../services/workoutProgramService';
import { produce } from 'immer';

interface WorkoutProgramState {
  programs: WorkoutProgram[];
  isLoading: boolean;
  error: string | null;
  fetchPrograms: () => Promise<void>;
  addProgram: (programData: Omit<WorkoutProgram, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateProgram: (programId: string, updates: Partial<Omit<WorkoutProgram, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteProgram: (programId: string) => Promise<void>;
}

export const useWorkoutProgramStore = create<WorkoutProgramState>((set, get) => ({
  programs: [],
  isLoading: false,
  error: null,

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const programs = await getUserWorkoutPrograms();
      set({ programs, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addProgram: async (programData) => {
    set({ isLoading: true, error: null });
    try {
      const newProgramId = await createWorkoutProgram(programData);
      // Optimistic update: 새 프로그램을 즉시 상태에 추가하지 않고,
      // 목록을 다시 불러와서 최신 상태를 반영합니다.
      await get().fetchPrograms(); 
      return newProgramId;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateProgram: async (programId, updates) => {
    set({ isLoading: true, error: null });
    try {
      await updateWorkoutProgram(programId, updates);
      // Immer를 사용한 불변성 업데이트
      set(produce((state: WorkoutProgramState) => {
          const programIndex = state.programs.findIndex(p => p.id === programId);
          if (programIndex !== -1) {
              state.programs[programIndex] = { ...state.programs[programIndex], ...updates };
          }
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      // 에러 발생 시 원래 상태로 되돌리는 로직을 추가할 수도 있습니다.
    } finally {
        set({ isLoading: false });
    }
  },

  deleteProgram: async (programId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteWorkoutProgram(programId);
      // Immer를 사용한 불변성 업데이트
      set(produce((state: WorkoutProgramState) => {
        state.programs = state.programs.filter(p => p.id !== programId);
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    } finally {
        set({ isLoading: false });
    }
  },
})); 