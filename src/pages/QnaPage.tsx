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
      <div className="container mx-auto max-w-4xl px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            운동 & 영양 가이드
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            운동, 영양, 건강에 대한 모든 것을 찾아보세요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('exercise')}
            className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors ${
              activeTab === 'exercise' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            운동 정보
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors ${
              activeTab === 'nutrition' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            영양 정보
          </button>
          <button
            onClick={() => setActiveTab('handbook')}
            className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors ${
              activeTab === 'handbook' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            핸드북
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div>
          {activeTab === 'exercise' && (
            <div className="space-y-4">
              <Button onClick={() => { setSelectedExercise(null); setShow1RMCalculator(false); setShowWeightGuide(false); }}>운동 검색</Button>
              <Button onClick={toggle1RMCalculator}>1RM 계산기</Button>
              <Button onClick={toggleWeightGuide}>운동 무게 추천</Button>
              <Button onClick={() => setShowWorkoutSets(true)}>운동 프로그램</Button>

              {show1RMCalculator ? <OneRepMaxCalculator /> :
               showWeightGuide ? <WorkoutWeightGuide /> :
               showWorkoutSets ? <WorkoutProgram /> :
               selectedExercise ? <ExerciseDetail exercise={selectedExercise} onClose={() => setSelectedExercise(null)} /> : 
               <ExerciseSearch onSelectExercise={handleExerciseSelect} selectedPart={selectedPart} onPartChange={handlePartSelect} />}
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <Button onClick={toggleCalculator}>목표 칼로리 계산</Button>
              <Button onClick={toggleNutritionScout}>음식 영양성분 확인</Button>
              <Button onClick={toggleMealPlans}>식단 예시</Button>

              {showCalculator && <CalorieCalculator userProfile={userProfile} onComplete={async (result) => {
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
              }} />}
              {showNutritionScout && <NutritionScout />}
              {showMealPlans && <MealPlans />}
            </div>
          )}

          {activeTab === 'handbook' && (
            <div className="space-y-4">
              <input
                type="text"
                value={handbookSearchTerm}
                onChange={handleHandbookSearch}
                placeholder="질문이나 키워드를 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
              <ExerciseFaq searchTerm={handbookSearchTerm} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QnaPage;
