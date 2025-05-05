import React, { useState } from 'react';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionScout from '../components/nutrition/NutritionScout';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import Layout from '../components/common/Layout';

type TabType = 'exercise' | 'nutrition' | 'handbook';
type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';
type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg';

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  steps: string[];
}

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

// 운동 부위별 운동 목록 데이터
const exercisesByPart: Record<ExercisePart, Exercise[]> = {
  chest: [
    {
      id: 'bench_press',
      name: '벤치 프레스',
      description: '가슴과 삼두근을 타겟으로 하는 대표적인 상체 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      steps: [
        '벤치에 누워 양 발을 바닥에 단단히 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 중앙까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '내릴 때는 천천히, 올릴 때는 강하게 밀어올립니다.'
      ]
    },
    {
      id: 'incline_bench_press',
      name: '인클라인 벤치 프레스',
      description: '상부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
      steps: [
        '30-45도 각도로 세팅된 벤치에 등을 기대어 앉습니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 쇄골 상단까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '일반 벤치프레스보다 중량은 약간 낮게 시작하는 것이 좋습니다.'
      ]
    },
    {
      id: 'decline_bench_press',
      name: '디클라인 벤치 프레스',
      description: '하부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
      steps: [
        '10-30도 각도로 아래로 기울어진 벤치에 누워 다리를 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 하단부까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '어깨 관절에 무리가 가지 않도록 주의합니다.'
      ]
    }
  ],
  back: [
    {
      id: 'deadlift',
      name: '데드리프트',
      description: '등, 허리, 하체 전체를 사용하는 대표적인 복합 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      steps: [
        '바벨 앞에 발을 어깨너비로 벌리고 선 후 무릎을 굽혀 바를 잡습니다.',
        '등을 곧게 편 상태에서 바벨을 다리와 히프로 들어올립니다.',
        '허리를 곧게 유지한 채 어깨를 뒤로 젖히며 상체를 똑바로 세웁니다.',
        '역순으로 바벨을 내려놓는 동작을 반복합니다.'
      ]
    },
    {
      id: 'pull_up',
      name: '풀업',
      description: '등 넓이와 상부 등을 발달시키는 기초 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      steps: [
        '풀업 바를 어깨너비보다 약간 넓게 잡습니다.',
        '팔을 완전히 펴고 매달린 상태에서 시작합니다.',
        '턱이 바 위로 올라오도록 몸을 끌어올립니다.',
        '천천히 원래 위치로 내려옵니다.'
      ]
    }
  ],
  shoulder: [
    {
      id: 'overhead_press',
      name: '오버헤드 프레스',
      description: '어깨 전체, 특히 전면 삼각근을 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      steps: [
        '바벨을 어깨너비로 잡고 가슴 높이에서 시작합니다.',
        '팔꿈치를 바깥쪽으로 향하게 한 채로 바벨을 머리 위로 밀어올립니다.',
        '팔이 완전히 펴질 때까지 밀어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    },
    {
      id: 'lateral_raise',
      name: '래터럴 레이즈',
      description: '측면 삼각근을 타겟으로 하는 어깨 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      steps: [
        '덤벨을 양손에 들고 팔을 옆구리에 붙인 채로 서 있습니다.',
        '팔꿈치를 약간 구부린 상태로 고정합니다.',
        '덤벨을 어깨 높이까지 들어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    }
  ],
  leg: [
    {
      id: 'squat',
      name: '스쿼트',
      description: '하체 전체를 발달시키는 가장 기본적인 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=1oed-UmAxFs',
      steps: [
        '바벨을 어깨에 올리고 발을 어깨너비로 벌립니다.',
        '허리를 곧게 펴고 엉덩이를 뒤로 빼면서 무릎을 굽힙니다.',
        '대퇴부가 바닥과 평행해질 때까지 내려갑니다.',
        '발바닥으로 바닥을 강하게 밀며 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'leg_press',
      name: '레그 프레스',
      description: '하체 근육을 타겟으로 하는 기계 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
      steps: [
        '레그 프레스 기계에 앉아 발을 어깨너비로 플랫폼에 놓습니다.',
        '안전 장치를 해제하고 무릎을 가슴쪽으로 굽힙니다.',
        '발로 플랫폼을 밀어 다리를 펴지만, 무릎을 완전히 펴지는 않습니다.',
        '천천히 시작 위치로 돌아옵니다.'
      ]
    }
  ]
};

const QnaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('exercise');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
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
  
  // 운동 선택 처리
  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };
  
  // 운동 부위 선택 처리
  const handlePartSelect = (part: ExercisePart) => {
    setSelectedPart(part);
    setSelectedExercise(null);
  };
  
  // 운동 부위 레이블
  const getPartLabel = (part: ExercisePart) => {
    const labels: { [key in ExercisePart]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체'
    };
    return labels[part];
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽: 운동 유형 선택 */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">문의 유형 선택</h2>
                
                {/* 운동 부위 선택 버튼 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['chest', 'back', 'shoulder', 'leg'] as const).map((part) => (
                    <button
                      key={part}
                      onClick={() => handlePartSelect(part)}
                      className={`px-4 py-2 rounded-md ${
                        selectedPart === part
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {getPartLabel(part)}
                    </button>
                  ))}
                </div>
                
                {/* 선택된 부위의 운동 목록 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    {getPartLabel(selectedPart)} 운동 목록
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {exercisesByPart[selectedPart].map((exercise) => (
                      <div 
                        key={exercise.id}
                        onClick={() => handleExerciseSelect(exercise)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedExercise?.id === exercise.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {exercise.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {exercise.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 선택된 운동의 상세 정보 */}
                {selectedExercise && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {selectedExercise.name} 수행 방법
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      {selectedExercise.steps.map((step, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {step}
                        </li>
                      ))}
                    </ol>
                    {selectedExercise.videoUrl && (
                      <a 
                        href={selectedExercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        영상으로 보기
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* 오른쪽: 1RM 계산기 */}
            <div className="space-y-6">
              <OneRepMaxCalculator />
            </div>
          </div>
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
          <ExerciseFaq />
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
