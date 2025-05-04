import { useState } from 'react';
import Layout from '../components/common/Layout';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionScout from '../components/nutrition/NutritionScout';
import Handbook from '../components/handbook/Handbook';

type TabType = 'exercise' | 'nutrition' | 'handbook';

const QnaPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('exercise');

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          운동 & 영양 가이드
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          올바른 운동 정보 및 영양 가이드
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6">
        {(['exercise', 'nutrition', 'handbook'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab === 'exercise' && '운동 정보'}
            {tab === 'nutrition' && '영양 정보'}
            {tab === 'handbook' && '핸드북'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'exercise' && <ExerciseFaq />}
      {activeTab === 'nutrition' && <NutritionScout />}
      {activeTab === 'handbook' && <Handbook />}
    </Layout>
  );
};

export default QnaPage;
