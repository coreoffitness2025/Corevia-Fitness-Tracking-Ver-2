import { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface CalorieCalculatorProps {
  userProfile: UserProfile;
  onComplete?: (result: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

const CalorieCalculator: React.FC<CalorieCalculatorProps> = ({ userProfile, onComplete }) => {
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  useEffect(() => {
    const calculateCalories = () => {
      const { gender, age, height, weight, activityLevel, fitnessGoal } = userProfile;
      
      // BMR 계산 (Mifflin-St Jeor Equation)
      let bmr = 10 * weight + 6.25 * height - 5 * Number(age);
      bmr += gender === 'male' ? 5 : -161;

      // 활동 계수 적용
      const activityMultiplier = {
        low: 1.2,
        moderate: 1.375,
        high: 1.55
      }[activityLevel];

      let dailyCalories = bmr * activityMultiplier;

      // 목표에 따른 조정
      if (fitnessGoal === 'loss') {
        dailyCalories -= 500; // 500칼로리 감소
      } else if (fitnessGoal === 'gain') {
        dailyCalories += 500; // 500칼로리 증가
      }

      // 영양소 비율 계산
      const proteinGrams = (dailyCalories * 0.3) / 4; // 30% 단백질
      const fatGrams = (dailyCalories * 0.3) / 9; // 30% 지방
      const carbGrams = (dailyCalories * 0.4) / 4; // 40% 탄수화물

      setCalories(Math.round(dailyCalories));
      setProtein(Math.round(proteinGrams));
      setCarbs(Math.round(carbGrams));
      setFat(Math.round(fatGrams));

      if (onComplete) {
        onComplete({
          calories: Math.round(dailyCalories),
          protein: Math.round(proteinGrams),
          carbs: Math.round(carbGrams),
          fat: Math.round(fatGrams)
        });
      }
    };

    calculateCalories();
  }, [userProfile, onComplete]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 className="text-xl font-bold mb-4">권장 일일 섭취량</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">칼로리</h3>
          <p className="text-2xl font-bold text-blue-600">{calories} kcal</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold">단백질</h3>
            <p className="text-xl font-bold text-green-600">{protein}g</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">탄수화물</h3>
            <p className="text-xl font-bold text-yellow-600">{carbs}g</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">지방</h3>
            <p className="text-xl font-bold text-red-600">{fat}g</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
