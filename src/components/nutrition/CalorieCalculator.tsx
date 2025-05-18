import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import Card, { CardSection, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { Calculator, Info, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';
type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

interface CalorieCalculatorProps {
  userProfile: UserProfile;
  onComplete?: (result: any) => Promise<void>;
}

interface CalorieCalculatorInputs {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
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

const activityLevels = [
  { value: 1.2, label: '거의 운동 안함', description: '앉아서 일하거나 매우 적은 활동' },
  { value: 1.375, label: '가벼운 활동', description: '주 1-3회 가벼운 운동' },
  { value: 1.55, label: '보통 활동', description: '주 3-5회 중간 강도 운동' },
  { value: 1.725, label: '활동적', description: '주 5-6회 강한 운동' },
  { value: 1.9, label: '매우 활동적', description: '매일 강한 운동 또는 육체 노동' }
];

const goalOptions = [
  { value: 'lose', label: '체중 감량', description: '하루 15% 칼로리 감소' },
  { value: 'maintain', label: '체중 유지', description: '현재 칼로리 유지' },
  { value: 'gain', label: '근육 증가', description: '하루 15% 칼로리 증가' }
];

const CalorieCalculator = ({ userProfile, onComplete }: CalorieCalculatorProps) => {
  // 입력값 상태
  const [calculatorInputs, setCalculatorInputs] = useState<CalorieCalculatorInputs>({
    gender: userProfile?.gender as Gender || 'male',
    age: userProfile?.age || 30,
    weight: userProfile?.weight || 70,
    height: userProfile?.height || 175,
    activityLevel: 1.55,
    goal: 'maintain'
  });
  
  // 결과 상태
  const [calculatorResults, setCalculatorResults] = useState<CalorieCalculatorResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  // 프로필 정보가 업데이트되면 입력값도 업데이트
  useEffect(() => {
    if (userProfile) {
      setCalculatorInputs(prev => ({
        ...prev,
        gender: userProfile.gender as Gender || prev.gender,
        age: userProfile.age || prev.age,
        weight: userProfile.weight || prev.weight,
        height: userProfile.height || prev.height
      }));
    }
  }, [userProfile]);

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
    
    const results = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
    
    setCalculatorResults(results);
    setShowResults(true);
    
    return results;
  };
  
  // 입력값 변경 처리
  const handleInputChange = (field: keyof CalorieCalculatorInputs, value: any) => {
    setCalculatorInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      // 결과 재계산 필요시 여기서 추가
      return newInputs;
    });
  };
  
  // 결과 저장
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
            {/* 성별 선택 */}
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInputChange('gender', 'male')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    calculatorInputs.gender === 'male'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  남성
                </button>
                <button
                  onClick={() => handleInputChange('gender', 'female')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    calculatorInputs.gender === 'female'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>
            
            {/* 나이 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">나이 (세)</label>
              <input
                type="number"
                value={calculatorInputs.age}
                onChange={(e) => handleInputChange('age', Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="12"
                max="100"
              />
            </div>
            
            {/* 체중 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">체중 (kg)</label>
              <input
                type="number"
                value={calculatorInputs.weight}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="30"
                max="200"
                step="0.1"
              />
            </div>
            
            {/* 신장 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">신장 (cm)</label>
              <input
                type="number"
                value={calculatorInputs.height}
                onChange={(e) => handleInputChange('height', Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="100"
                max="250"
              />
            </div>
          </div>
          
          {/* 활동 레벨 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">활동 레벨</label>
            <div className="space-y-2">
              {activityLevels.map(level => (
                <div
                  key={level.value}
                  onClick={() => handleInputChange('activityLevel', level.value as ActivityLevel)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    calculatorInputs.activityLevel === level.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {level.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 목표 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">목표</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {goalOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('goal', option.value as Goal)}
                  className={`p-3 rounded-lg cursor-pointer text-center ${
                    calculatorInputs.goal === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 계산 버튼 */}
          <Button
            onClick={calculateCalories}
            variant="primary"
            className="w-full mt-2"
            icon={<Calculator className="w-4 h-4" />}
          >
            칼로리 계산하기
          </Button>
        </CardSection>
      </Card>
      
      {/* 결과 표시 */}
      {showResults && calculatorResults && (
        <Card>
          <CardSection>
            <CardTitle>
              <Info className="w-5 h-5 mr-2" />
              계산 결과
            </CardTitle>
            
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
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-center mb-2">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {goalOptions.find(g => g.value === calculatorInputs.goal)?.label} 목표 칼로리
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculatorResults.targetCalories} 칼로리/일
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">단백질</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {calculatorResults.protein}g
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(calculatorResults.protein * 4)} 칼로리
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">탄수화물</div>
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {calculatorResults.carbs}g
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(calculatorResults.carbs * 4)} 칼로리
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">지방</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {calculatorResults.fat}g
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(calculatorResults.fat * 9)} 칼로리
                    </div>
                  </div>
                </div>
              </div>
              
              {onComplete && (
                <Button
                  onClick={handleSaveResults}
                  variant="success"
                  className="w-full mt-2"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
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
