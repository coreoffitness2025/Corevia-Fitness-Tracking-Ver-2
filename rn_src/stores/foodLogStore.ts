import { create } from 'zustand';

// Define the shape of the food log state
interface FoodLogState {
  foodLogs: any[]; // Define a proper type later
  addFoodLog: (log: any) => void;
  // We will add functions to fetch and manage logs
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  foodLogs: [],
  addFoodLog: (log) =>
    set((state) => ({
      foodLogs: [...state.foodLogs, log],
    })),
})); 