import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the store's state
// This will be expanded as we build out the feature
interface WorkoutState {
  workouts: any[]; // We'll define a proper type later
  addWorkout: (workout: any) => void;
  preferredSetup: string;
  setPreferredSetup: (setup: string) => void;
  // We will add functions to fetch, update, and delete workouts later
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) =>
        set((state) => ({
          workouts: [...state.workouts, workout],
        })),
      
      preferredSetup: '10x5', // 기본값 설정
      setPreferredSetup: (setup) => set({ preferredSetup: setup }),

      // We will add functions to fetch, update, and delete workouts later
    }),
    {
      name: 'workout-storage', // storage name
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ preferredSetup: state.preferredSetup }), // preferredSetup만 저장
    }
  )
); 