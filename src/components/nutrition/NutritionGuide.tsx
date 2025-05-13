import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types';
// import CalorieCalculator from './CalorieCalculator'; // CalorieCalculator 사용하지 않음
import FoodLog from './FoodLog';
import Card from '../common/Card';
import { Info } from 'lucide-react';

// 식단 추천 타입 정의
interface FoodRecommendation {
  name: string;
  amount: string;
  nutrition: string;
}

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
  
  // 식단 추천 관련 상태
  const [recommendedFoods, setRecommendedFoods] = useState<FoodRecommendation[]>([]);
  const [recommendationTitle, setRecommendationTitle] = useState<string>('');

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
  
  // 식단 추천 핸들러
  const handleFoodRecommendation = (type: 'carbs' | 'protein' | 'fat') => {
    let foods: FoodRecommendation[] = [];
    let title = '';
    
    if (type === 'carbs') {
      title = '탄수화물 식단 추천';
      foods = [
        { name: '흰쌀밥', amount: '210g', nutrition: '탄수화물 70g' },
        { name: '고구마', amount: '150g', nutrition: '탄수화물 45g' },
        { name: '통밀빵', amount: '100g', nutrition: '탄수화물 50g' },
        { name: '오트밀', amount: '100g', nutrition: '탄수화물 66g' }
      ];
    } else if (type === 'protein') {
      title = '단백질 식단 추천';
      foods = [
        { name: '닭가슴살', amount: '100g', nutrition: '단백질 23g' },
        { name: '계란', amount: '2개', nutrition: '단백질 12g' },
        { name: '그릭요거트', amount: '200g', nutrition: '단백질 20g' },
        { name: '연어', amount: '100g', nutrition: '단백질 22g' }
      ];
    } else if (type === 'fat') {
      title = '지방 식단 추천';
      foods = [
        { name: '아보카도', amount: '100g', nutrition: '지방 15g' },
        { name: '아몬드', amount: '30g', nutrition: '지방 14g' },
        { name: '올리브 오일', amount: '15ml', nutrition: '지방 14g' },
        { name: '연어', amount: '100g', nutrition: '지방 13g' }
      ];
    }
    
    setRecommendationTitle(title);
    setRecommendedFoods(foods);
  };

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
                 <div className="mt-4 space-y-4">
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                     <h4 className="font-semibold mb-2">끼니당 권장 영양소</h4>
                     <p className="mb-2 text-gray-700 dark:text-gray-300">3끼 기준, 하루 균등 배분:</p>
                     <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                       <p>탄수화물: <strong>{Math.round(nutritionTargets.carbsTarget / 3)}g</strong>/끼니</p>
                       <p>단백질: <strong>{Math.round(nutritionTargets.proteinTarget / 3)}g</strong>/끼니</p>
                       <p>지방: <strong>{Math.round(nutritionTargets.fatTarget / 3)}g</strong>/끼니</p>
                     </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                     <button 
                       className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                       onClick={() => handleFoodRecommendation('carbs')}
                     >
                       탄수화물 식단 추천
                     </button>
                     <button 
                       className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                       onClick={() => handleFoodRecommendation('protein')}
                     >
                       단백질 식단 추천
                     </button>
                     <button 
                       className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                       onClick={() => handleFoodRecommendation('fat')}
                     >
                       지방 식단 추천
                     </button>
                   </div>
                   
                   {/* 식단 추천 결과 표시 */}
                   {recommendedFoods.length > 0 && (
                     <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                       <h4 className="font-semibold mb-2">{recommendationTitle}</h4>
                       <ul className="space-y-2">
                         {recommendedFoods.map((food, index) => (
                           <li key={index} className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                             <span>{food.name} {food.amount}</span>
                             <span>{food.nutrition}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
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
