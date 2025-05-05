import { create } from 'zustand';
import { Food } from '../types';

interface FoodState {
  foods: Food[];
  addFood: (food: Food) => void;
  setFoods: (foods: Food[]) => void;
  clearFoods: () => void;
}

export const useFoodStore = create<FoodState>((set) => ({
  foods: [],
  addFood: (food) => set((state) => ({ foods: [...state.foods, food] })),
  setFoods: (foods) => set({ foods }),
  clearFoods: () => set({ foods: [] }),
})); 