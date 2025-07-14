import { create } from 'zustand';
// 네이티브화된 foodService 사용
import { getFoodEntriesByDate } from '../services/foodService';
import { Food } from '../types';

interface FoodLogState {
  foodLogs: Food[];
  loading: boolean;
  error: string | null;
  fetchFoodLogs: (userId: string, date: Date) => Promise<void>;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  foodLogs: [],
  loading: false,
  error: null,
  fetchFoodLogs: async (userId, date) => {
    set({ loading: true, error: null });
    try {
      // 이제 웹 SDK가 아닌, 네이티브 플러그인을 사용하는 서비스를 호출
      const logs = await getFoodEntriesByDate(userId, date);
      set({ foodLogs: logs, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch food logs';
      set({ error: errorMessage, loading: false });
    }
  },
})); 