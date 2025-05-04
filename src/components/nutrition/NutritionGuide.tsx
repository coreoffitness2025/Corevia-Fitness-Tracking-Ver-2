import { useState } from 'react';
import CalorieCalculator from './CalorieCalculator';
import NutritionScout from './NutritionScout';

const NutritionGuide = () => {
  const [activeTab, setActiveTab] = useState<'scout' | 'calculator'>('scout');

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('scout')}
          className={`px-4 py-2 rounded ${
            activeTab === 'scout'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          영양 정보 검색
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded ${
            activeTab === 'calculator'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          목표 칼로리 계산
        </button>
      </div>

      {activeTab === 'scout' ? <NutritionScout /> : <CalorieCalculator />}
    </div>
  );
};

export default NutritionGuide; 