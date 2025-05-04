import { create } from 'zustand';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { User } from 'firebase/auth';

interface Food {
  name: string;
  calories: number;
  quantity: number;
}

interface FoodLog {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  totalCalories: number;
  foods: Food[];
}

interface FoodLogState {
  recentFoodLogs: FoodLog[];
  loading: boolean;
  error: string | null;
  fetchRecentFoodLogs: (currentUser: User | null) => Promise<void>;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  recentFoodLogs: [],
  loading: false,
  error: null,
  fetchRecentFoodLogs: async (currentUser) => {
    if (!currentUser) return;

    set({ loading: true, error: null });
    try {
      const foodLogsRef = collection(db, 'foodLogs');
      const q = query(
        foodLogsRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const foodLogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FoodLog[];
      
      set({ recentFoodLogs: foodLogs });
    } catch (err) {
      set({ error: '식단 기록을 불러오는데 실패했습니다.' });
      console.error('식단 기록 로드 실패:', err);
    } finally {
      set({ loading: false });
    }
  }
})); 