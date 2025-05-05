import React, { useState } from 'react';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionScout from '../components/nutrition/NutritionScout';
import NutritionGuide from '../components/nutrition/NutritionGuide';
import Handbook from '../components/handbook/Handbook';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import Layout from '../components/common/Layout';

type TabType = 'exercise' | 'nutrition' | 'handbook';

const QnaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('exercise');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
        {activeTab === 'nutrition' && (
          <>
            <NutritionGuide />
            <NutritionScout />
          </>
        )}
        {activeTab === 'handbook' && <Handbook />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-6">
            <OneRepMaxCalculator />
          </div>
          
          <div className="space-y-6">
            {/* 추가 Q&A 섹션 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">자주 묻는 질문</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">운동 시작 전 준비사항은?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    충분한 워밍업과 스트레칭이 필요합니다. 운동 전 5-10분 정도의 가벼운 유산소 운동과 동적 스트레칭을 권장합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">운동 후 회복은 어떻게 해야 하나요?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    충분한 휴식과 영양 섭취가 중요합니다. 운동 후 30분 이내에 단백질과 탄수화물을 섭취하고, 7-8시간의 충분한 수면을 취하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QnaPage;
