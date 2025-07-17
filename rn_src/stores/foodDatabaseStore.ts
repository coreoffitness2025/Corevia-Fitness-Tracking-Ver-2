import { create } from 'zustand';

interface FoodItem {
    Food: string;
    Calories: string;
    // Add other fields from your CSV
}

interface FoodDatabaseState {
    database: FoodItem[];
    isLoaded: boolean;
    loadDatabase: (data: FoodItem[]) => void;
}

export const useFoodDatabaseStore = create<FoodDatabaseState>((set) => ({
    database: [],
    isLoaded: false,
    loadDatabase: (data) => set({ database: data, isLoaded: true }),
})); 