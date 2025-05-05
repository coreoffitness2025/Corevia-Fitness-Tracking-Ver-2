import React, { useState } from 'react';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionScout from '../components/nutrition/NutritionScout';
import Handbook from '../components/handbook/Handbook';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import Layout from '../components/common/Layout';

type TabType = 'exercise' | 'nutrition' | 'handbook';
type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';

interface CalorieCalculatorInputs {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityLevel: number;
  goal: Goal;
}

interface CalorieCalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const QnaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('exercise');
  
  // 칼로리 계산기 상태
  const [calculatorInputs, setCalculatorInputs] = useState<CalorieCalculatorInputs>({
    gender: 'male',
    age: 25,
    weight: 70,
    height: 175,
    activityLevel: 1.55, // 보통 수준 (주 3-5회)
    goal: 'maintain'
  });
  
  const [calculatorResults, setCalculatorResults] = useState<CalorieCalculatorResults | null>(null);

  // BMR 계산 (기초 대사량)
  const calculateBMR = (inputs: CalorieCalculatorInputs): number => {
    const { gender, age, weight, height } = inputs;
    
    // 해리스-베네딕트 공식 사용
    if (gender === 'male') {
      return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
    } else {
      return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }
  };
  
  // 칼로리 계산
  const calculateCalories = () => {
    const bmr = calculateBMR(calculatorInputs);
    const tdee = bmr * calculatorInputs.activityLevel;
    
    let targetCalories = tdee;
    if (calculatorInputs.goal === 'lose') {
      targetCalories = tdee * 0.85; // 15% 감소
    } else if (calculatorInputs.goal === 'gain') {
      targetCalories = tdee * 1.15; // 15% 증가
    }
    
    // 영양소 계산
    const protein = calculatorInputs.weight * 2; // 체중 kg당 2g 단백질
    const fat = (targetCalories * 0.25) / 9; // 칼로리의 25%를 지방에서 (1g 지방 = 9 칼로리)
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4; // 나머지 칼로리 (1g 탄수화물 = 4 칼로리)
    
    setCalculatorResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    });
  };
  
  // 입력값 변경 처리
  const handleInputChange = (field: keyof CalorieCalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({ ...prev, [field]: value }));
  };

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
            
            {/* 운동 정보 탭에서는 핸드북과 1RM 계산기 표시 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-6">
                <OneRepMaxCalculator />
              </div>
              
              <div className="space-y-6">
                <Handbook />
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
                        <input 
                          type="radio" 
                          id="male" 
                          name="gender" 
                          checked={calculatorInputs.gender === 'male'}
                          onChange={() => handleInputChange('gender', 'male')}
                          className="mr-2" 
                        />
                        <label htmlFor="male" className="text-gray-700 dark:text-gray-300">남성</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="female" 
                          name="gender" 
                          checked={calculatorInputs.gender === 'female'}
                          onChange={() => handleInputChange('gender', 'female')}
                          className="mr-2" 
                        />
                        <label htmlFor="female" className="text-gray-700 dark:text-gray-300">여성</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">나이</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">체중 (kg)</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">신장 (cm)</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.height || ''}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">활동 수준</label>
                      <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={calculatorInputs.activityLevel}
                        onChange={(e) => handleInputChange('activityLevel', parseFloat(e.target.value))}
                      >
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
                    <select 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={calculatorInputs.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value as Goal)}
                    >
                      <option value="lose">체중 감량</option>
                      <option value="maintain">체중 유지</option>
                      <option value="gain">체중 증가</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={calculateCalories}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-4"
                  >
                    계산하기
                  </button>
                  
                  {calculatorResults && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">계산 결과</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">기초 대사량 (BMR)</p>
                          <p className="font-medium">{calculatorResults.bmr.toLocaleString()} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">활동 대사량 (TDEE)</p>
                          <p className="font-medium">{calculatorResults.tdee.toLocaleString()} kcal</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">하루 권장 칼로리</p>
                          <p className="font-medium text-blue-600 dark:text-blue-400 text-lg">
                            {calculatorResults.targetCalories.toLocaleString()} kcal
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">단백질</p>
                          <p className="font-medium">{calculatorResults.protein}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.protein / 3)}g/끼니)</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">탄수화물</p>
                          <p className="font-medium">{calculatorResults.carbs}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.carbs / 3)}g/끼니)</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">지방</p>
                          <p className="font-medium">{calculatorResults.fat}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.fat / 3)}g/끼니)</p>
                        </div>
                      </div>
                    </div>
                  )}
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
