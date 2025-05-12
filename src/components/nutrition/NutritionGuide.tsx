import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types';
// import CalorieCalculator from './CalorieCalculator'; // CalorieCalculator 사용하지 않음
import FoodLog from './FoodLog';
import Card from '../common/Card';
import { Info } from 'lucide-react';

// FoodForm.tsx와 유사한 목표 칼로리 및 매크로 계산 로직 (필요시 AuthContext에서 가져오거나 공통 함수로 분리)
const calculateMacroNutrientTargetsForGuide = (targetCalories: number, weight_kg: number) => {
  const proteinGrams = Math.round(weight_kg * 1.6); // 체중 1kg당 단백질 1.6g
  const proteinCalories = proteinGrams * 4;
  
  const remainingCalories = Math.max(0, targetCalories - proteinCalories);
  
  const carbsCalories = Math.max(0, remainingCalories * 0.55); // 탄수화물 55%
  const fatCalories = Math.max(0, remainingCalories * 0.30);   // 지방 30%
  
  return {
    proteinTarget: proteinGrams,
    carbsTarget: Math.round(carbsCalories / 4),
    fatTarget: Math.round(fatCalories / 9)
  };
};

const NutritionGuide = () => {
  const { userProfile } = useAuth();
  const [nutritionTargets, setNutritionTargets] = useState({
    targetCalories: 0,
    proteinTarget: 0,
    carbsTarget: 0,
    fatTarget: 0,
  });

  useEffect(() => {
    if (userProfile?.targetCalories && userProfile?.weight) {
      const macros = calculateMacroNutrientTargetsForGuide(userProfile.targetCalories, userProfile.weight);
      setNutritionTargets({
        targetCalories: userProfile.targetCalories,
        ...macros,
      });
    } else if (userProfile) { // targetCalories는 있으나 weight 정보가 없을 경우 (혹은 그 반대)
        // 이 경우 FoodForm처럼 BMR 기반으로 모두 재계산하거나, 부분 정보만 표시할 수 있음
        // 여기서는 일단 userProfile.targetCalories만 사용
        setNutritionTargets(prev => ({ ...prev, targetCalories: userProfile.targetCalories || 2000 }));
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">프로필을 완성하면 영양 가이드를 사용할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 목표 칼로리 및 영양소 가이드 UI (FoodForm.tsx 참고) */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold mb-2">일일 영양소 목표</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">칼로리</span>
                <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{nutritionTargets.targetCalories} kcal</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">단백질</span>
                <span className="block text-lg font-bold text-green-600 dark:text-green-400">{nutritionTargets.proteinTarget}g</span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">탄수화물</span>
                <span className="block text-lg font-bold text-yellow-600 dark:text-yellow-400">{nutritionTargets.carbsTarget}g</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">지방</span>
                <span className="block text-lg font-bold text-red-600 dark:text-red-400">{nutritionTargets.fatTarget}g</span>
              </div>
            </div>
            {userProfile.targetCalories && (
                 <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>식사별 목표: 아침 <strong>{Math.round(nutritionTargets.targetCalories * 0.3)}kcal</strong>, 점심 <strong>{Math.round(nutritionTargets.targetCalories * 0.4)}kcal</strong>, 저녁 <strong>{Math.round(nutritionTargets.targetCalories * 0.3)}kcal</strong></p>
                    <p className="mt-1">💡 개인의 필요에 따라 이 목표를 조정할 수 있습니다. 이 가이드라인은 일반적인 권장 사항입니다.</p>
                 </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* CalorieCalculator 컴포넌트는 일단 제거하고, 필요시 별도 기능으로 다시 고려 */}
      {/* <CalorieCalculator userProfile={userProfile} /> */}
      
      <FoodLog />
    </div>
  );
};

export default NutritionGuide;
