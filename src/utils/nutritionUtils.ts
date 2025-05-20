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

// 사용자 기본 정보 (FoodLog.tsx에서 이동)
export const DEFAULT_USER_PROFILE = {
  weight: 70, // kg
  goal: 'maintain' as 'loss' | 'maintain' | 'gain',
  activityLevel: 'moderate' as 'low' | 'moderate' | 'high', // activityMultipliers의 키와 일치하도록 수정
  gender: 'male' as 'male' | 'female',
  age: 30,
  height: 175, // cm
  mealsPerDay: 3
};

// 활동 수준에 따른 칼로리 계수 (FoodLog.tsx에서 이동)
export const activityMultipliers = {
  low: 1.2,      // 거의 운동하지 않음
  moderate: 1.5, // 주 3-5회 운동
  high: 1.8      // 거의 매일 운동
};
export type ActivityLevel = keyof typeof activityMultipliers;

// 목표에 따른 칼로리 조정 (FoodLog.tsx에서 이동)
export const goalMultipliers = {
  loss: 0.8,     // 체중 감량
  maintain: 1.0, // 체중 유지
  gain: 1.2      // 체중 증가
};
export type FitnessGoal = keyof typeof goalMultipliers;

// 영양소 목표량 계산 함수 (FoodLog.tsx에서 이동)
export const calculateNutritionGoals = (user: Partial<typeof DEFAULT_USER_PROFILE> = DEFAULT_USER_PROFILE) => {
  let bmr = 0;
  // user 객체의 gender, weight, height, age가 유효한지, 그리고 타입에 맞는지 확인
  const validatedUser = {
    ...DEFAULT_USER_PROFILE, // 기본값으로 시작
    ...user, // 제공된 user 값으로 덮어쓰기
  };

  bmr = calculateBMR(validatedUser.gender, validatedUser.weight, validatedUser.height, validatedUser.age);
  
  const tdee = bmr * (activityMultipliers[validatedUser.activityLevel as ActivityLevel] || activityMultipliers.moderate);
  
  let targetCalories = tdee;
  if (validatedUser.goal && goalMultipliers[validatedUser.goal as FitnessGoal]) {
    targetCalories = tdee * goalMultipliers[validatedUser.goal as FitnessGoal];
  } else {
    targetCalories = tdee * goalMultipliers.maintain;
  }
  
  const protein = (validatedUser.weight) * 2; 
  const fat = (targetCalories * 0.25) / 9; 
  const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4; 
  
  const mealsPerDay = validatedUser.mealsPerDay;
  const perMeal = {
    calories: Math.round(targetCalories / mealsPerDay),
    protein: Math.round(protein / mealsPerDay),
    carbs: Math.round(carbs / mealsPerDay),
    fat: Math.round(fat / mealsPerDay)
  };
  
  return {
    daily: {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    },
    perMeal
  };
}; 