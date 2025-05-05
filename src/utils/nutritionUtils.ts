import { Food } from '../types';

/**
 * 음식 목록에서 총 영양소 정보를 계산합니다.
 */
export const calculateTotalNutrition = (foods: Food[]) => {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 */
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}; 