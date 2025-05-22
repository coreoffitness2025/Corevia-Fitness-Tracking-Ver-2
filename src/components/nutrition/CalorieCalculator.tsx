import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import Card, { CardSection, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { Calculator, Info, ArrowRight, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  calculateNutritionGoals,
  ActivityLevel,
  FitnessGoal,
  activityMultipliers,
  goalMultipliers,
  DEFAULT_USER_PROFILE,
  calculateBMR
} from '../../utils/nutritionUtils';

interface CalorieCalculatorProps {
  userProfile: UserProfile | null;
  onComplete?: (result: { 
    targetCalories: number;
    macros: { protein: number; carbs: number; fat: number; };
  }) => Promise<void>;
}

interface CalorieCalculatorInputs {
  gender: UserProfile['gender'];
  age: number;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

interface CalorieCalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const activityLevelOptions = Object.keys(activityMultipliers).map(key => ({
  value: key as ActivityLevel,
  label: 
    key === 'sedentary' ? '거의 운동 안함' :
    key === 'light' ? '가벼운 활동' :
    key === 'moderate' ? '보통 활동' :
    key === 'active' ? '활동적' :
    key === 'veryActive' ? '매우 활동적' : '',
  description: 
    key === 'sedentary' ? '앉아서 일하거나 매우 적은 활동' :
    key === 'light' ? '주 1-3회 가벼운 운동' :
    key === 'moderate' ? '주 3-5회 중간 강도 운동' :
    key === 'active' ? '주 5-6회 강한 운동' :
    key === 'veryActive' ? '매일 강한 운동 또는 육체 노동' : ''
}));

const goalKeys = Object.keys(goalMultipliers) as FitnessGoal[];
const goalOptionsFormatted = goalKeys.map(key => {
  let label = '';
  let description = '';

  if (key === 'loss') {
    label = '체중 감량';
    description = '하루 15% 칼로리 감소';
  } else if (key === 'maintain') {
    label = '체중 유지';
    description = '현재 칼로리 유지';
  } else if (key === 'gain') {
    label = '근육 증가';
    description = '하루 15% 칼로리 증가';
  }
  
  return {
    value: key,
    label: label,
    description: description
  };
});

const CalorieCalculator = ({ userProfile, onComplete }: CalorieCalculatorProps) => {
  const [calculatorInputs, setCalculatorInputs] = useState<CalorieCalculatorInputs>(() => {
    const profile = userProfile || DEFAULT_USER_PROFILE;
    return {
      gender: profile.gender,
      age: profile.age || DEFAULT_USER_PROFILE.age,
      weight: profile.weight || DEFAULT_USER_PROFILE.weight,
      height: profile.height || DEFAULT_USER_PROFILE.height,
      activityLevel: profile.activityLevel || DEFAULT_USER_PROFILE.activityLevel,
      goal: profile.fitnessGoal || DEFAULT_USER_PROFILE.fitnessGoal,
    };
  });
  
  const [calculatorResults, setCalculatorResults] = useState<CalorieCalculatorResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setCalculatorInputs(prev => ({
        ...prev,
        gender: userProfile.gender || prev.gender,
        age: userProfile.age || prev.age,
        weight: userProfile.weight || prev.weight,
        height: userProfile.height || prev.height,
        activityLevel: userProfile.activityLevel || prev.activityLevel,
        goal: userProfile.fitnessGoal || prev.goal,
      }));
    }
  }, [userProfile]);

  const handleCalculate = () => {
    const profileForCalc = {
        gender: calculatorInputs.gender,
        age: calculatorInputs.age,
        weight: calculatorInputs.weight,
        height: calculatorInputs.height,
        activityLevel: calculatorInputs.activityLevel,
        goal: calculatorInputs.goal,
    };
    const results = calculateNutritionGoals(profileForCalc);
    
    const bmrVal = calculateBMR(profileForCalc.gender, profileForCalc.weight, profileForCalc.height, profileForCalc.age);
    const tdeeVal = bmrVal * activityMultipliers[profileForCalc.activityLevel];

    setCalculatorResults({
        bmr: Math.round(bmrVal),
        tdee: Math.round(tdeeVal),
        targetCalories: results.daily.calories,
        protein: results.daily.protein,
        carbs: results.daily.carbs,
        fat: results.daily.fat
    });
    setShowResults(true);
  };
  
  const handleInputChange = (field: keyof CalorieCalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveResults = async () => {
    if (!calculatorResults) return;
    try {
      if (onComplete) {
        await onComplete({
          targetCalories: calculatorResults.targetCalories,
          macros: {
            protein: calculatorResults.protein,
            carbs: calculatorResults.carbs,
            fat: calculatorResults.fat
          }
        });
        toast.success('칼로리 목표가 저장되었습니다.');
      }
    } catch (error) {
      console.error('칼로리 결과 저장 중 오류:', error);
      toast.error('저장에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardSection>
          <CardTitle>
            <Calculator className="w-5 h-5 mr-2" />
            칼로리 계산기
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInputChange('gender', 'male')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    calculatorInputs.gender === 'male' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >남성</button>
                <button
                  onClick={() => handleInputChange('gender', 'female')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    calculatorInputs.gender === 'female' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >여성</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">나이 (세)</label>
              <input type="number" value={calculatorInputs.age} onChange={(e) => handleInputChange('age', Number(e.target.value))} className="w-full p-2 border rounded-lg focus:border-primary-500 focus:ring-primary-500" min="12" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">체중 (kg)</label>
              <input type="number" value={calculatorInputs.weight} onChange={(e) => handleInputChange('weight', Number(e.target.value))} className="w-full p-2 border rounded-lg focus:border-primary-500 focus:ring-primary-500" min="30" max="200" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">신장 (cm)</label>
              <input type="number" value={calculatorInputs.height} onChange={(e) => handleInputChange('height', Number(e.target.value))} className="w-full p-2 border rounded-lg focus:border-primary-500 focus:ring-primary-500" min="100" max="250" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">활동 레벨</label>
            <div className="space-y-2">
              {activityLevelOptions.map(level => (
                <div
                  key={level.value}
                  onClick={() => handleInputChange('activityLevel', level.value)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    calculatorInputs.activityLevel === level.value ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium text-gray-800 dark:text-gray-100">{level.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">목표</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {goalOptionsFormatted.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('goal', option.value)}
                  className={`p-3 rounded-lg cursor-pointer text-center ${
                    calculatorInputs.goal === option.value ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium text-gray-800 dark:text-gray-100">{option.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleCalculate} variant="primary" className="w-full mt-2" icon={<Calculator className="w-4 h-4" />}>
            칼로리 계산하기
          </Button>
        </CardSection>
      </Card>
      
      {showResults && calculatorResults && (
        <Card>
          <CardSection>
            <CardTitle><Info className="w-5 h-5 mr-2" />계산 결과</CardTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">기초 대사량 (BMR)</div>
                  <div className="text-xl font-bold">{calculatorResults.bmr} 칼로리</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">일일 소비 칼로리 (TDEE)</div>
                  <div className="text-xl font-bold">{calculatorResults.tdee} 칼로리</div>
                </div>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <div className="text-center mb-2">
                  <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {goalOptionsFormatted.find(g => g.value === calculatorInputs.goal)?.label} 목표 칼로리
                  </div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {calculatorResults.targetCalories} 칼로리/일
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">단백질</div>
                    <div className="text-lg font-bold text-success-600 dark:text-success-400">{calculatorResults.protein}g</div>
                    <div className="text-xs text-gray-500">{Math.round(calculatorResults.protein * 4)} 칼로리</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">탄수화물</div>
                    <div className="text-lg font-bold text-warning-600 dark:text-warning-400">{calculatorResults.carbs}g</div>
                    <div className="text-xs text-gray-500">{Math.round(calculatorResults.carbs * 4)} 칼로리</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">지방</div>
                    <div className="text-lg font-bold text-danger-600 dark:text-danger-400">{calculatorResults.fat}g</div>
                    <div className="text-xs text-gray-500">{Math.round(calculatorResults.fat * 9)} 칼로리</div>
                  </div>
                </div>
              </div>
              {onComplete && (
                <Button onClick={handleSaveResults} variant="success" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
                  이 결과로 목표 설정하기
                </Button>
              )}
            </div>
          </CardSection>
        </Card>
      )}
    </div>
  );
};

export default CalorieCalculator;
