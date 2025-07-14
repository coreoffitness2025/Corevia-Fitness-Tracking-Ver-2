import { create } from 'zustand';
import { Workout } from '../types';
// 네이티브화된 workoutService를 사용해야 하지만, 현재 workoutService는 Firestore를 직접 호출하지 않음.
// 따라서, 이 스토어에서 직접 네이티브 플러그인을 호출하도록 수정합니다.
import { FirebaseFirestore } from '@capacitor-firebase/firestore';

interface WorkoutState {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
  fetchWorkouts: (userId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workouts: [],
  loading: false,
  error: null,
  fetchWorkouts: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { docs } = await FirebaseFirestore.getCollection({
        collection: 'workouts',
        queries: [
          { type: 'where', fieldPath: 'userId', operator: '==', value: userId },
          { type: 'orderBy', fieldPath: 'date', direction: 'desc' },
        ],
      });
      const workouts = docs.map(doc => ({
        id: doc.id,
        ...doc.data,
        date: new Date(doc.data.date.seconds * 1000),
      })) as Workout[];
      set({ workouts, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workouts';
      set({ error: errorMessage, loading: false });
    }
  },
})); 