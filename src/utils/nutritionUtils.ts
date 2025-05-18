import { Food } from '../types';

/**
 * 음식 목록에서 총 영양소 정보를 계산합니다.
 */
export const calculateTotalNutrition = (foods: Food[]) => {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * 체중에 따른 권장 단백질 섭취량 계산 (kg당 1.6g)
 */
export const calculateProteinTarget = (weightKg: number): number => {
  return Math.round(weightKg * 1.6);
};

/**
 * 기초 대사량(BMR) 계산 (Harris-Benedict 방정식)
 */
export const calculateBMR = (
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  ageYears: number
): number => {
  if (gender === 'male') {
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
  } else {
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
  }
}; 