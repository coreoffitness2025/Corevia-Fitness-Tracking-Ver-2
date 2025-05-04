import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CalorieCalculator from './CalorieCalculator';
import NutritionScout from './NutritionScout';

const NutritionGuide = () => {
  const [activeTab, setActiveTab] = useState<'scout' | 'calculator'>('scout');
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('scout')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'scout'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          영양소 스카우트
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'calculator'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          칼로리 계산기
        </button>
      </div>
      
      {activeTab === 'scout' ? (
        <NutritionScout />
      ) : userProfile ? (
        <CalorieCalculator userProfile={userProfile} />
      ) : (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
          <p>프로필을 완성하면 칼로리 계산기를 사용할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
};

export default NutritionGuide;
