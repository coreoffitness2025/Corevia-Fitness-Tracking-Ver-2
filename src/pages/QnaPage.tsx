import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionCalculator from '../components/nutrition/NutritionCalculator';
import NutritionScout from '../components/nutrition/NutritionScout';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import WorkoutWeightGuide from '../components/workout/WorkoutWeightGuide';
import { Exercise, ExercisePart } from '../types';
import { exercises } from '../data/exerciseData';

type TabType = 'exercise' | 'nutrition' | 'handbook';
type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';

// Exercise 타입을 exerciseData.ts와 호환되도록 수정
interface Exercise {
  id: string;
  name: string;
  part: string;
  description: string;
  instructions: string[];
  videoUrl?: string;
  equipment: string[];
  muscles: string[];
  level: string;
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

// 운동 부위별로 분류하여 저장
const exercisesByPart: Record<ExercisePart, Exercise[]> = {
  chest: exercises.filter(exercise => exercise.part === 'chest'),
  back: exercises.filter(exercise => exercise.part === 'back'),
  shoulder: exercises.filter(exercise => exercise.part === 'shoulder'),
  leg: exercises.filter(exercise => exercise.part === 'leg'),
  biceps: exercises.filter(exercise => exercise.part === 'biceps'),
  triceps: exercises.filter(exercise => exercise.part === 'triceps'),
  abs: exercises.filter(exercise => exercise.part === 'abs'),
  cardio: exercises.filter(exercise => exercise.part === 'cardio')
};

// 추가: 운동 부위별 아이콘 매핑
const partIcons: Record<ExercisePart, string> = {
  chest: '💪',
  back: '🔙',
  shoulder: '🏋️',
  leg: '🦵',
  biceps: '💪',
  triceps: '💪',
  abs: '🧘',
  cardio: '🏃'
};

const QnaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('exercise');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [handbookSearchTerm, setHandbookSearchTerm] = useState<string>('');
  const [handbookSearchResults, setHandbookSearchResults] = useState<any[]>([]);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showNutritionScout, setShowNutritionScout] = useState<boolean>(false);
  const [showAllExercises, setShowAllExercises] = useState<boolean>(false);
  const [showWeightGuide, setShowWeightGuide] = useState<boolean>(false);
  const [show1RMCalculator, setShow1RMCalculator] = useState<boolean>(false);
  const [showWorkoutSets, setShowWorkoutSets] = useState<boolean>(false);
  const [selectedProgramType, setSelectedProgramType] = useState<string>('strength');
  
  // FoodForm 또는 FoodLog에서 전달받은 초기 탭 설정 적용
  useEffect(() => {
    const state = location.state as { activeTab?: TabType } | null;
    if (state && state.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [location.state]);
  
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
      leg: '하체',
      biceps: '이두',
      triceps: '삼두',
      abs: '복근',
      cardio: '유산소'
    };
    return labels[part];
  };
  
  // 검색어 변경 시 검색 결과 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // 모든 운동 데이터를 하나의 배열로 합침
    const allExercises = Object.values(exercisesByPart).flat();
    
    // 검색어와 일치하는 운동 찾기
    const results = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(term) || 
      ex.description.toLowerCase().includes(term)
    );
    
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };
  
  // 검색 결과에서 운동 선택
  const handleSearchSelect = (exercise: Exercise) => {
    // 해당 운동이 속한 부위 찾기
    for (const [part, exercises] of Object.entries(exercisesByPart)) {
      if (exercises.some(ex => ex.id === exercise.id)) {
        setSelectedPart(part as ExercisePart);
        setSelectedExercise(exercise);
        setSearchTerm(exercise.name);
        setShowDropdown(false);
        break;
      }
    }
  };
  
  // 핸드북 검색
  const handleHandbookSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setHandbookSearchTerm(term);
    
    // ExerciseFaq 컴포넌트에서 사용되는 실제 핸드북 데이터를 가져오기
    const handbookData = [
      { id: 'ex1', title: "운동 전 스트레칭은 꼭 해야 하나요?", content: "운동 전 워밍업과 스트레칭은 부상 방지와 운동 효과 증대를 위해 매우 중요합니다." },
      { id: 'ex2', title: "근육통이 생겼을 때 계속 운동해도 되나요?", content: "가벼운 근육통은 정상이지만, 심한 통증이 있다면 휴식을 취하는 것이 좋습니다." },
      { id: 'nt1', title: "단백질 섭취는 언제 하는 것이 가장 효과적인가요?", content: "운동 후 30분 이내에 섭취하는 것이 근육 회복과 성장에 가장 효과적입니다." },
      { id: 'wt1', title: "체중 감량을 위한 최적의 운동 방법은?", content: "유산소 운동과 근력 운동을 병행하는 것이 가장 효과적입니다. 식이 조절도 중요합니다." },
      { id: 'ex3', title: "하루에 몇 시간 운동하는 것이 적당한가요?", content: "개인의 체력과 목표에 따라 다르지만, 일반적으로 30분~1시간 정도가 적당합니다." },
      { id: 'wt2', title: "어떤 운동이 복부 지방 감소에 가장 효과적인가요?", content: "복부 지방을 집중적으로 감소시키는 운동은 없으며, 전체적인 체지방 감소가 필요합니다." },
      { id: 'ex4', title: "헬스장 없이 집에서 할 수 있는 효과적인 운동은?", content: "체중 운동, 서킷 트레이닝, 요가 등 다양한 홈 트레이닝이 가능합니다." },
      { id: 'sp1', title: "운동 후 단백질 셰이크는 꼭 필요한가요?", content: "필수는 아니지만, 빠른 근육 회복과 성장에 도움이 됩니다." },
      { id: 'ex5', title: "근력 운동과 유산소 운동의 순서는 어떻게 해야 하나요?", content: "목표에 따라 다르며, 근력 향상이 목표라면 근력 운동을 먼저 하는 것이 좋습니다." },
      { id: 'nt2', title: "운동 전후에 탄수화물 섭취가 필요한가요?", content: "운동 전에는 지속적인 에너지 공급을, 운동 후에는 글리코겐 재합성을 위해 필요합니다." }
    ];
    
    if (term.length < 1) {
      setHandbookSearchResults([]);
      return;
    }
    
    const results = handbookData.filter(item => 
      item.title.toLowerCase().includes(term) || 
      item.content.toLowerCase().includes(term)
    );
    
    setHandbookSearchResults(results);
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

        {/* 새로운 버튼들 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => {setActiveTab('exercise'); setShowWeightGuide(false); setShow1RMCalculator(false); setShowWorkoutSets(false);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            운동 검색
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); setShowCalculator(true); setShowNutritionScout(false);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            목표 칼로리 계산
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); setShowCalculator(false); setShowNutritionScout(true);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            음식 영양성분 확인
          </button>
          
          <button
            onClick={() => {setActiveTab('exercise'); setShow1RMCalculator(true); setShowWeightGuide(false); setShowWorkoutSets(false);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            1RM 계산기
          </button>
          
          <button
            onClick={() => {setActiveTab('exercise'); setShowWeightGuide(true); setShow1RMCalculator(false); setShowWorkoutSets(false);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            운동 무게 추천
          </button>

          <button
            onClick={() => {setActiveTab('exercise'); setShowWorkoutSets(true); setShowWeightGuide(false); setShow1RMCalculator(false);}}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            운동 프로그램
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className="p-2 bg-[#4285F4] text-white rounded-lg shadow hover:bg-[#3b78db] transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            핸드북
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'exercise' && (
          <div className="mt-6">
            {showWeightGuide ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">운동 무게 추천</h3>
                <WorkoutWeightGuide />
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setShowWeightGuide(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                  >
                    운동 검색으로 돌아가기
                  </button>
                </div>
              </div>
            ) : show1RMCalculator ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">1RM 계산기</h3>
                <OneRepMaxCalculator />
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setShow1RMCalculator(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                  >
                    운동 검색으로 돌아가기
                  </button>
                </div>
              </div>
            ) : showWorkoutSets ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">운동 프로그램</h3>
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      className="flex flex-col items-center p-3 rounded-lg transition-colors bg-blue-500 text-white"
                      onClick={() => setSelectedProgramType('strength')}
                    >
                      <span className="text-lg font-semibold mb-1">스트렝스 프로그램</span>
                      <span className="text-sm">근력 증가에 초점</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center p-3 rounded-lg transition-colors bg-purple-500 text-white"
                      onClick={() => setSelectedProgramType('powerbuilding')}
                    >
                      <span className="text-lg font-semibold mb-1">파워빌딩 프로그램</span>
                      <span className="text-sm">근력과 근비대 동시 발달</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center p-3 rounded-lg transition-colors bg-green-500 text-white"
                      onClick={() => setSelectedProgramType('hypertrophy')}
                    >
                      <span className="text-lg font-semibold mb-1">근비대 프로그램</span>
                      <span className="text-sm">근육 크기 증가에 초점</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center p-3 rounded-lg transition-colors bg-yellow-500 text-white"
                      onClick={() => setSelectedProgramType('beginner')}
                    >
                      <span className="text-lg font-semibold mb-1">초보자 프로그램</span>
                      <span className="text-sm">근신경계 발달 중심</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center p-3 rounded-lg transition-colors bg-red-500 text-white"
                      onClick={() => setSelectedProgramType('popular')}
                    >
                      <span className="text-lg font-semibold mb-1">유명 프로그램</span>
                      <span className="text-sm">검증된 다양한 루틴</span>
                    </button>
                  </div>
                  
                  {/* 스트렝스 프로그램 */}
                  {selectedProgramType === 'strength' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 border-b pb-2">스트렝스 프로그램 (근력 향상 중심)</h4>
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>연구 기반:</strong> Journal of Strength and Conditioning Research에 따르면, 낮은 반복 횟수(1-6회)와 
                          높은 무게(1RM의 80-95%)로 훈련 시 최대 근력 발달에 가장 효과적입니다. (Schoenfeld et al., 2016)
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-blue-600 dark:text-blue-400">5x5 프로그램 (Starting Strength 변형)</h5>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">A 데이 (월/목)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>스쿼트: 5세트 x 5회 (세트 간 3-5분 휴식)</li>
                            <li>벤치 프레스: 5세트 x 5회 (세트 간 3-5분 휴식)</li>
                            <li>바벨 로우: 5세트 x 5회 (세트 간 3-5분 휴식)</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">B 데이 (수/토)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>스쿼트: 5세트 x 5회 (세트 간 3-5분 휴식)</li>
                            <li>오버헤드 프레스: 5세트 x 5회 (세트 간 3-5분 휴식)</li>
                            <li>데드리프트: 3세트 x 5회 (세트 간 3-5분 휴식)</li>
                          </ul>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          <strong>진행 방법:</strong> 매 세션마다 무게를 2.5-5kg씩 증가시키며, 5x5를 모두 완료하지 못하면 
                          같은 무게로 다음 세션에 다시 시도합니다. 3번 연속 실패할 경우 10% 무게를 감소시킨 후 다시 진행합니다.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 파워빌딩 프로그램 */}
                  {selectedProgramType === 'powerbuilding' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 border-b pb-2">파워빌딩 프로그램 (근력+근비대 복합)</h4>
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>연구 기반:</strong> Sports Medicine의 메타분석에 따르면, 다양한 운동 강도(1RM의 70-95%)와 
                          반복 범위(3-12회)를 혼합하는 것이 근력과 근비대를 동시에 발달시키는 데 효과적입니다. (Grgic et al., 2018)
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-purple-600 dark:text-purple-400">PHUL 프로그램 (Power Hypertrophy Upper Lower)</h5>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">1일차: 상체 파워 (월)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>벤치 프레스: 4세트 x 3-5회 (80-85% 1RM)</li>
                            <li>인클라인 벤치: 3세트 x 6-8회</li>
                            <li>바벨 로우: 4세트 x 3-5회</li>
                            <li>풀업: 3세트 x 6-8회</li>
                            <li>오버헤드 프레스: 3세트 x 5-8회</li>
                            <li>바벨 컬: 3세트 x 6-8회</li>
                            <li>스컬크러셔: 3세트 x 6-8회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">2일차: 하체 파워 (화)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>스쿼트: 4세트 x 3-5회 (80-85% 1RM)</li>
                            <li>데드리프트: 3세트 x 3-5회</li>
                            <li>런지: 3세트 x 8-10회</li>
                            <li>레그 컬: 3세트 x 6-8회</li>
                            <li>카프 레이즈: 4세트 x 8-10회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">3일차: 상체 근비대 (목)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>덤벨 벤치 프레스: 3세트 x 8-12회</li>
                            <li>케이블 플라이: 3세트 x 10-15회</li>
                            <li>시티드 로우: 3세트 x 8-12회</li>
                            <li>랫 풀다운: 3세트 x 8-12회</li>
                            <li>덤벨 숄더 프레스: 3세트 x 8-12회</li>
                            <li>덤벨 컬: 3세트 x 10-15회</li>
                            <li>트라이셉스 푸시다운: 3세트 x 10-15회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">4일차: 하체 근비대 (금)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>프론트 스쿼트: 3세트 x 8-12회</li>
                            <li>레그 프레스: 3세트 x 10-15회</li>
                            <li>루마니안 데드리프트: 3세트 x 8-10회</li>
                            <li>레그 익스텐션: 3세트 x 12-15회</li>
                            <li>레그 컬: 3세트 x 12-15회</li>
                            <li>카프 레이즈: 4세트 x 15-20회</li>
                            <li>캐이블 크런치: 3세트 x 15-20회</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 근비대 프로그램 */}
                  {selectedProgramType === 'hypertrophy' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 border-b pb-2">근비대 프로그램 (근육량 증가 중심)</h4>
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>연구 기반:</strong> Journal of Applied Physiology에 발표된 연구에 따르면, 6-12회 반복 범위와 
                          1RM의 65-80% 무게로 훈련할 때 근비대 효과가 최대화됩니다. 또한 주당 근육그룹당 10-20세트가 최적입니다. (Schoenfeld et al., 2019)
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-green-600 dark:text-green-400">PPL 프로그램 (Push-Pull-Legs)</h5>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">푸시 데이 (월/목)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>벤치 프레스: 4세트 x 8-10회 (세트 간 1-2분 휴식)</li>
                            <li>인클라인 덤벨 프레스: 3세트 x 10-12회</li>
                            <li>케이블 플라이: 3세트 x 12-15회</li>
                            <li>숄더 프레스: 4세트 x 8-10회</li>
                            <li>사이드 레터럴 레이즈: 3세트 x 12-15회</li>
                            <li>트라이셉스 푸시다운: 3세트 x 10-12회</li>
                            <li>오버헤드 트라이셉스 익스텐션: 3세트 x 10-12회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">풀 데이 (화/금)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>바벨 로우: 4세트 x 8-10회</li>
                            <li>랫 풀다운: 3세트 x 10-12회</li>
                            <li>시티드 케이블 로우: 3세트 x 12-15회</li>
                            <li>페이스 풀: 3세트 x 15-20회</li>
                            <li>바벨 컬: 3세트 x 8-10회</li>
                            <li>해머 컬: 3세트 x 10-12회</li>
                            <li>케이블 컬: 3세트 x 12-15회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">레그 데이 (수/토)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>스쿼트: 4세트 x 8-10회</li>
                            <li>레그 프레스: 3세트 x 10-12회</li>
                            <li>루마니안 데드리프트: 3세트 x 8-10회</li>
                            <li>레그 익스텐션: 3세트 x 12-15회</li>
                            <li>레그 컬: 3세트 x 12-15회</li>
                            <li>카프 레이즈: 4세트 x 15-20회</li>
                            <li>캐이블 크런치: 3세트 x 15-20회</li>
                          </ul>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          <strong>진행 방법:</strong> 각 세트에서 근육 피로를 느낄 때까지 수행하고, 마지막 1-2회는 거의 실패 직전까지
                          진행합니다. 무게는 점진적으로 증가시키되, 정해진 반복 횟수를 유지할 수 있는 범위 내에서 조절합니다.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 초보자 프로그램 */}
                  {selectedProgramType === 'beginner' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 border-b pb-2">초보자 프로그램 (근신경계 발달 중심)</h4>
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>연구 기반:</strong> 초보자는 처음 3-6개월 동안 단순한 훈련 자극에도 신경근 적응과 근력 향상을 경험합니다.
                          International Journal of Exercise Science에 발표된 연구에 따르면, 초보자는 복잡한 프로그램보다 
                          기본 복합 운동을 중심으로 한 전신 루틴으로 시작하는 것이 좋습니다. (Kraemer et al., 2017)
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-yellow-600 dark:text-yellow-400">3일 풀바디 프로그램</h5>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">A 데이 (월/금)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>머신 체스트 프레스: 3세트 x 12-15회 (세트 간 1-2분 휴식)</li>
                            <li>시티드 로우 머신: 3세트 x 12-15회</li>
                            <li>레그 프레스: 3세트 x 12-15회</li>
                            <li>레그 익스텐션: 2세트 x 12-15회</li>
                            <li>레그 컬: 2세트 x 12-15회</li>
                            <li>케이블 트라이셉스 푸시다운: 2세트 x 12-15회</li>
                            <li>케이블 바이셉스 컬: 2세트 x 12-15회</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium mb-2">B 데이 (수)</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>랫 풀다운: 3세트 x 12-15회</li>
                            <li>숄더 프레스 머신: 3세트 x 12-15회</li>
                            <li>스미스 머신 스쿼트: 3세트 x 12-15회</li>
                            <li>시티드 레그 프레스: 3세트 x 12-15회</li>
                            <li>사이드 레터럴 레이즈: 2세트 x 12-15회</li>
                            <li>케이블 페이스 풀: 2세트 x 12-15회</li>
                            <li>플랭크: 3세트 x 30초</li>
                          </ul>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          <strong>진행 방법:</strong> 첫 2주는 가벼운 무게로 정확한 폼에 집중합니다. 이후 점차 무게를 증가시키되,
                          12-15회를 완료할 수 있는 범위를 유지합니다. 4-6주 후 프리웨이트 운동을 점진적으로 도입할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 유명 프로그램 */}
                  {selectedProgramType === 'popular' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 border-b pb-2">유명 프로그램 루틴</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">nSuns 5/3/1</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            Jim Wendler의 5/3/1을 기반으로 한 고강도 주간 프로그램. 주요 복합 운동의 점진적 과부하에 중점을 둡니다.
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-medium mb-2">주간 구성 (5일)</p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>월: 벤치 프레스 + 오버헤드 프레스 (9세트 각 운동)</li>
                              <li>화: 스쿼트 + 서모 데드리프트 (9세트 각 운동)</li>
                              <li>수: 오버헤드 프레스 + 인클라인 벤치 (9세트 각 운동)</li>
                              <li>목: 데드리프트 + 프론트 스쿼트 (9세트 각 운동)</li>
                              <li>금: 벤치 프레스 + 클로즈 그립 벤치 (9세트 각 운동)</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">매드카우 5x5</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            Bill Starr가 개발한 클래식 근력 프로그램으로, 복합 운동을 중심으로 주 3회 훈련합니다.
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-medium mb-2">주간 구성 (3일)</p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>월: 스쿼트 5x5, 벤치 프레스 5x5, 바벨 로우 5x5</li>
                              <li>수: 스쿼트 5x5, 오버헤드 프레스 5x5, 데드리프트 1x5</li>
                              <li>금: 스쿼트 5x5, 벤치 프레스 5x5, 바벨 로우 5x5</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">텍사스 메소드</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            파워리프터 마크 리퍼토가 개발한 고강도 프로그램으로, 높은 볼륨과 고강도의 조합이 특징입니다.
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-medium mb-2">주간 구성 (4일)</p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>월: 볼륨 - 스쿼트 5x5, 벤치 프레스 5x5, 액세서리</li>
                              <li>수: 복구 - 경량 스쿼트 2x5, 오버헤드 프레스 3x5, 데드리프트 1x5</li>
                              <li>금: 강도 - 스쿼트 1x5, 벤치 프레스 1x5 (최대 무게), 액세서리</li>
                              <li>토: 다이나믹 - 폭발적 스쿼트 10x3, 백오프 벤치 3x5, 액세서리</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">GZCL 메소드</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            파워리프터 코리 그레고리가 개발한 유연한 프레임워크로, 티어 시스템으로 운동을 분류합니다.
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-medium mb-2">티어 시스템</p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>T1 (메인 리프트): 1-5회 반복, 85-100% 1RM, 10-15세트</li>
                              <li>T2 (보조 리프트): 5-10회 반복, 65-85% 1RM, 15-25세트</li>
                              <li>T3 (고립 운동): 10+ 반복, 65% 1RM 이하, 25-50세트</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setShowWorkoutSets(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                  >
                    운동 검색으로 돌아가기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="운동 이름 검색..."
                    className="w-full p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
                      {searchResults.map(exercise => (
                        <div
                          key={exercise.id}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handleSearchSelect(exercise)}
                        >
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {getPartLabel(exercise.part as ExercisePart)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Object.entries(exercisesByPart).map(([part, _]) => (
                    <button
                      key={part}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                        selectedPart === part
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handlePartSelect(part as ExercisePart)}
                    >
                      <span className="text-2xl mb-1">{partIcons[part as ExercisePart]}</span>
                      <span>{getPartLabel(part as ExercisePart)}</span>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {exercisesByPart[selectedPart].slice(0, showAllExercises ? undefined : 4).map(exercise => (
                    <div 
                      key={exercise.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {getPartLabel(exercise.part as ExercisePart)}
                          </span>
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                            {exercise.level === 'beginner' ? '초급' : 
                            exercise.level === 'intermediate' ? '중급' : '고급'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 전체보기 버튼 */}
                {exercisesByPart[selectedPart].length > 4 && (
                  <div className="text-center mt-4 mb-6">
                    <button 
                      onClick={() => setShowAllExercises(!showAllExercises)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                    >
                      {showAllExercises ? '간략히 보기' : '전체 보기'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        {showAllExercises ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-1 gap-6">
            {/* 목표 칼로리 계산기 표시 */}
            {showCalculator && (
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
                      className="w-full bg-[#4285F4] text-white py-2 px-4 rounded-md hover:bg-[#3b78db] mt-4"
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
                            <p className="font-medium text-[#4285F4] dark:text-blue-400 text-lg">
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
            )}
            
            {/* 음식 영양성분 확인 표시 */}
            {showNutritionScout && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">음식 영양성분 확인하기</h2>
                <NutritionScout />
              </div>
            )}
          </div>
        )}

        {activeTab === 'handbook' && (
          <div>
            <div className="mb-4 relative">
              <input
                type="text"
                value={handbookSearchTerm}
                className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="핸드북 검색..."
                onChange={handleHandbookSearch}
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'%3E%3C/path%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '10px center',
                  backgroundSize: '20px',
                }}
              />
              
              {/* 핸드북 자동완성 드롭다운 */}
              {handbookSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  {handbookSearchResults.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setHandbookSearchTerm(item.title);
                        // 검색 이벤트 발생 - FAQ 항목 자동 확장을 위해
                        document.dispatchEvent(new CustomEvent('handbookSearch', {
                          detail: { searchTerm: item.title }
                        }));
                        setHandbookSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ExerciseFaq searchTerm={handbookSearchTerm} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
