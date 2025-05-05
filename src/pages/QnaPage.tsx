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
        {activeTab === 'exercise' && (
          <>
            <ExerciseFaq />
            
            {/* 운동 정보 탭에서만 표시되는 1RM 계산기와 자주 묻는 질문 */}
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
          </>
        )}

        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽에 목표 칼로리 계산기 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">목표 칼로리 계산기</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">성별</label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input type="radio" id="male" name="gender" className="mr-2" defaultChecked />
                        <label htmlFor="male" className="text-gray-700 dark:text-gray-300">남성</label>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" id="female" name="gender" className="mr-2" />
                        <label htmlFor="female" className="text-gray-700 dark:text-gray-300">여성</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">나이</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">체중 (kg)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">신장 (cm)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">활동 수준</label>
                      <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="1.2">거의 운동 안함</option>
                        <option value="1.375">가벼운 운동 (주 1-3회)</option>
                        <option value="1.55">보통 수준 (주 3-5회)</option>
                        <option value="1.725">활발한 운동 (주 6-7회)</option>
                        <option value="1.9">매우 활발함 (하루 2회)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">목표</label>
                    <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="lose">체중 감량</option>
                      <option value="maintain">체중 유지</option>
                      <option value="gain">체중 증가</option>
                    </select>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-4">
                    계산하기
                  </button>
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">계산 결과</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">기초 대사량 (BMR)</p>
                        <p className="font-medium">1,745 kcal</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">하루 권장 칼로리</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">2,400 kcal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 오른쪽에 음식 영양성분 확인하기 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">음식 영양성분 확인하기</h2>
              <NutritionScout />
            </div>
          </div>
        )}

        {activeTab === 'handbook' && (
          <Handbook />
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
