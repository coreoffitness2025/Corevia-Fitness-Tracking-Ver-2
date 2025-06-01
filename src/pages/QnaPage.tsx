import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import ExerciseSearch from '../components/exercise/ExerciseSearch';
import ExerciseDetail from '../components/exercise/ExerciseDetail';
import CalorieCalculator from '../components/nutrition/CalorieCalculator';
import NutritionScout from '../components/nutrition/NutritionScout';
import MealPlans from '../components/nutrition/MealPlans';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import WorkoutWeightGuide from '../components/workout/WorkoutWeightGuide';
import WorkoutProgram from '../components/workout/WorkoutProgram';
import { Exercise as ImportedExercise, ExercisePart } from '../types';
import { exercises as exerciseDataFromFile } from '../data/exerciseData';
import { BarChart3, Target, Award, Settings, Utensils, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

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

const exercisesByPart: Record<ExercisePart, ImportedExercise[]> = {
  chest: exerciseDataFromFile.filter(exercise => exercise.part === 'chest') as ImportedExercise[],
  back: exerciseDataFromFile.filter(exercise => exercise.part === 'back') as ImportedExercise[],
  shoulder: exerciseDataFromFile.filter(exercise => exercise.part === 'shoulder') as ImportedExercise[],
  leg: exerciseDataFromFile.filter(exercise => exercise.part === 'leg') as ImportedExercise[],
  biceps: exerciseDataFromFile.filter(exercise => exercise.part === 'biceps') as ImportedExercise[],
  triceps: exerciseDataFromFile.filter(exercise => exercise.part === 'triceps') as ImportedExercise[],
  abs: exerciseDataFromFile.filter(exercise => exercise.part === 'abs') as ImportedExercise[],
  cardio: exerciseDataFromFile.filter(exercise => exercise.part === 'cardio') as ImportedExercise[],
  complex: exerciseDataFromFile.filter(exercise => exercise.part === 'complex') as ImportedExercise[],
};

const QnaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('exercise');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [selectedExercise, setSelectedExercise] = useState<ImportedExercise | null>(null);
  const [handbookSearchTerm, setHandbookSearchTerm] = useState<string>('');
  const [handbookSearchResults, setHandbookSearchResults] = useState<any[]>([]);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showNutritionScout, setShowNutritionScout] = useState<boolean>(false);
  const [showWeightGuide, setShowWeightGuide] = useState<boolean>(false);
  const [show1RMCalculator, setShow1RMCalculator] = useState<boolean>(false);
  const [showWorkoutSets, setShowWorkoutSets] = useState<boolean>(false);
  const [showMealPlans, setShowMealPlans] = useState<boolean>(false);
  const [selectedProgramType, setSelectedProgramType] = useState<string>('strength');
  
  useEffect(() => {
    const state = location.state as { 
      activeTab?: TabType;
      openNutritionScout?: boolean;
      searchTerm?: string; 
    } | null;
    
    if (state) {
      if (state.activeTab) {
        setActiveTab(state.activeTab);
      }
      
      if (state.openNutritionScout) {
        setActiveTab('nutrition');
        setShowNutritionScout(true);
        setShowCalculator(false);
        setShowMealPlans(false);
        if (state.searchTerm) {
          // TODO: NutritionScout 컴포넌트에 searchTerm 전달 처리
        }
      }
    }
  }, [location.state]);
  
  const [calculatorInputs, setCalculatorInputs] = useState<CalorieCalculatorInputs>({
    gender: 'male',
    age: 25,
    weight: 70,
    height: 175,
    activityLevel: 1.55,
    goal: 'maintain'
  });
  
  const [calculatorResults, setCalculatorResults] = useState<CalorieCalculatorResults | null>(null);

  const calculateBMR = (inputs: CalorieCalculatorInputs): number => {
    const { gender, age, weight, height } = inputs;
    
    if (gender === 'male') {
      return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
    } else {
      return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }
  };
  
  const calculateCalories = () => {
    const bmr = calculateBMR(calculatorInputs);
    const tdee = bmr * calculatorInputs.activityLevel;
    
    let targetCalories = tdee;
    if (calculatorInputs.goal === 'lose') {
      targetCalories = tdee * 0.85;
    } else if (calculatorInputs.goal === 'gain') {
      targetCalories = tdee * 1.15;
    }
    
    const protein = calculatorInputs.weight * 2;
    const fat = (targetCalories * 0.25) / 9;
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    
    setCalculatorResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    });
  };
  
  const handleInputChange = (field: keyof CalorieCalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePartSelect = (part: ExercisePart) => {
    setSelectedPart(part);
    setSelectedExercise(null);
  };
  
  const handleExerciseSelect = (exercise: ImportedExercise) => {
    setSelectedExercise(exercise);
  };
  
  const handleHandbookSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setHandbookSearchTerm(term);
    
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

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
    setShowNutritionScout(false);
    setShowMealPlans(false);
  };
  
  const toggleNutritionScout = () => {
    setShowNutritionScout(!showNutritionScout);
    setShowCalculator(false);
    setShowMealPlans(false);
  };
  
  const toggleMealPlans = () => {
    setShowMealPlans(!showMealPlans);
    setShowCalculator(false);
    setShowNutritionScout(false);
  };
  
  const toggleWeightGuide = () => setShowWeightGuide(!showWeightGuide);
  const toggle1RMCalculator = () => setShow1RMCalculator(!show1RMCalculator);

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            운동 & 영양 가이드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            올바른 운동 정보 및 영양 가이드
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => {setActiveTab('exercise'); setShowWeightGuide(false); setShow1RMCalculator(false); setShowWorkoutSets(false);}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            운동 검색
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleCalculator();}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            목표 칼로리 계산
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleNutritionScout();}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            음식 영양성분 확인
          </button>
          
          <button
            onClick={() => {setActiveTab('exercise'); setShow1RMCalculator(true); setShowWeightGuide(false); setShowWorkoutSets(false);}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            1RM 계산기
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => {setActiveTab('exercise'); setShowWeightGuide(true); setShow1RMCalculator(false); setShowWorkoutSets(false);}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            운동 무게 추천
          </button>

          <button
            onClick={() => {setActiveTab('exercise'); setShowWorkoutSets(true); setShowWeightGuide(false); setShow1RMCalculator(false);}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            운동 프로그램
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            핸드북
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleMealPlans();}}
            className="p-2 bg-primary-400 text-white rounded-lg shadow hover:bg-primary-500 transition-colors flex flex-col items-center text-sm"
          >
            <Utensils size={20} className="mb-1" />
            식단 예시
          </button>
        </div>

        {activeTab === 'exercise' && !showWeightGuide && !show1RMCalculator && !showWorkoutSets && (
          <>
            {selectedExercise ? (
              <ExerciseDetail 
                exercise={selectedExercise} 
                onClose={() => setSelectedExercise(null)} 
              />
            ) : (
              <ExerciseSearch 
                onSelectExercise={handleExerciseSelect} 
                selectedPart={selectedPart}
                onPartChange={handlePartSelect}
              />
            )}
          </>
        )}

        {activeTab === 'exercise' && show1RMCalculator && (
          <OneRepMaxCalculator />
        )}

        {activeTab === 'exercise' && showWeightGuide && (
          <WorkoutWeightGuide />
        )}

        {activeTab === 'exercise' && showWorkoutSets && (
          <>
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-start">
              <Info className="text-primary-500 mr-2 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  자세한 운동 종목에 대한 정보는 운동 검색을 통해 파악 가능합니다.
                </p>
              </div>
            </div>
            <WorkoutProgram />
          </>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-8">
            {showCalculator && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">칼로리 계산기</h2>
                  <button
                    onClick={toggleCalculator}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <CalorieCalculator 
                  userProfile={userProfile} 
                  onComplete={async (result) => {
                    try {
                      console.log('칼로리 계산 결과:', result);
                      setCalculatorResults({
                        bmr: result.bmr,
                        tdee: result.tdee,
                        targetCalories: result.targetCalories,
                        protein: result.macros.protein,
                        carbs: result.macros.carbs,
                        fat: result.macros.fat
                      });
                      toast.success('칼로리 계산이 완료되었습니다.');
                      return Promise.resolve();
                    } catch (error) {
                      console.error('에러:', error);
                      toast.error('칼로리 계산 중 오류가 발생했습니다.');
                      return Promise.reject(error);
                    }
                  }}
                />
              </div>
            )}
            
            {showNutritionScout && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">영양성분 검색</h2>
                  <button
                    onClick={toggleNutritionScout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <NutritionScout />
              </div>
            )}
            
            {showMealPlans && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">식단 예시</h2>
                  <button
                    onClick={toggleMealPlans}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <MealPlans />
              </div>
            )}
            
            {!showCalculator && !showNutritionScout && !showMealPlans && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">영양 & 식단 정보</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  위 버튼을 클릭하여 칼로리 계산, 영양성분 검색, 혹은 다양한 식단 예시를 확인하세요.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-success-50 dark:bg-success-900/20 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">건강한 식단의 기본 원칙</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>충분한 단백질 섭취 (체중 1kg당 1.6-2g)</li>
                      <li>다양한 과일과 채소로 비타민, 미네랄 섭취</li>
                      <li>건강한 지방 섭취 (아보카도, 견과류, 올리브 오일)</li>
                      <li>정제된 탄수화물보다 통곡물 위주 섭취</li>
                      <li>충분한 수분 섭취 (하루 2L 이상)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">운동 목적별 영양 섭취</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>근육 증가:</strong> 칼로리 surplus (+300~500kcal), 고단백</li>
                      <li><strong>체중 감량:</strong> 칼로리 deficit (-300~500kcal), 단백질 유지</li>
                      <li><strong>퍼포먼스:</strong> 탄수화물 타이밍, 훈련 전후 영양 전략</li>
                      <li><strong>건강 증진:</strong> 균형 잡힌 식단, 영양소 밀도 높은 식품</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'handbook' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">핸드북</h2>
            <div className="mb-4">
              <input
                type="text"
                value={handbookSearchTerm}
                onChange={handleHandbookSearch}
                placeholder="질문이나 키워드를 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <ExerciseFaq
              searchTerm={handbookSearchTerm}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
