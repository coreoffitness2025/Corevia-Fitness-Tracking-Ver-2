/**
 * 영양 및 식단 관련 타입 정의
 */

// 식사 유형
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 영양소 타입
export interface Nutrients {
  protein: number;
  carbs: number;
  fat: number;
}

// 식단 기록 타입
export interface Food {
  id: string;
  userId: string;
  date: Date | string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType?: MealType;
  imageUrl?: string;
  notes?: string;
  nutrients?: Nutrients;
  description?: string;
}

// 식단 요약 타입
export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
}

// 활동 수준 타입
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

// 피트니스 목표 타입
export type FitnessGoal = 'lose' | 'maintain' | 'gain';

// 칼로리 계산 입력 타입
export interface CalorieCalculationInput {
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  age: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}

// 영양소 목표 타입
export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 영양소 급원 항목 타입
export interface NutritionSource {
  name: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  unit: string;
  amount: number;
  calories: number;
}

// 음식 카테고리 타입
export type FoodCategory = 'protein' | 'carbs' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'other'; 