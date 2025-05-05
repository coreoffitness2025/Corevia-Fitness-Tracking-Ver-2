import React from 'react';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ 
  calories, 
  protein, 
  carbs, 
  fat 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">총 칼로리</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          {calories} kcal
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">단백질</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          {protein}g
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">탄수화물</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          {carbs}g
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">지방</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          {fat}g
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary; 