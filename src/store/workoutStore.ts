import { create } from 'zustand';
import { WorkoutSession } from '../types/workout';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutState {
  recentWorkouts: WorkoutSession[];
  loading: boolean;
  error: string | null;
  fetchRecentWorkouts: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  recentWorkouts: [],
  loading: false,
  error: null,
  fetchRecentWorkouts: async () => {
    const { currentUser } = useAuth();
    if (!currentUser) return;

    set({ loading: true, error: null });
    try {
      const workoutsRef = collection(db, 'workoutSessions');
      const q = query(
        workoutsRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutSession[];
      
      set({ recentWorkouts: workouts });
    } catch (err) {
      set({ error: '운동 기록을 불러오는데 실패했습니다.' });
      console.error('운동 기록 로드 실패:', err);
    } finally {
      set({ loading: false });
    }
  }
})); 