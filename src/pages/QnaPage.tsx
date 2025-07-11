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
import { BarChart3, Target, Award, Settings, Utensils, Info, TrendingUp, BookOpen } from 'lucide-react';
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => {setActiveTab('exercise'); setShowWeightGuide(false); setShow1RMCalculator(false); setShowWorkoutSets(false); setSelectedExercise(null);}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <Info size={20} className="mb-1" />
            운동 검색
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleCalculator();}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <BarChart3 size={20} className="mb-1" />
            목표 칼로리 계산
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleNutritionScout();}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <Utensils size={20} className="mb-1" />
            음식 영양성분 확인
          </button>
          
          <button
            onClick={() => {setActiveTab('exercise'); toggle1RMCalculator(); setShowWeightGuide(false); setShowWorkoutSets(false);}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <Target size={20} className="mb-1" />
            1RM 계산기
          </button>
           <button
            onClick={() => {setActiveTab('exercise'); toggleWeightGuide(); setShow1RMCalculator(false); setShowWorkoutSets(false);}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <TrendingUp size={20} className="mb-1" />
            운동 무게 추천
          </button>

          <button
            onClick={() => {setActiveTab('exercise'); setShowWorkoutSets(true); setShowWeightGuide(false); setShow1RMCalculator(false);}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <Award size={20} className="mb-1" />
            운동 프로그램
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <BookOpen size={20} className="mb-1" />
            핸드북
          </button>
          
          <button
            onClick={() => {setActiveTab('nutrition'); toggleMealPlans();}}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors flex flex-col items-center text-sm"
          >
            <Settings size={20} className="mb-1" />
            식단 예시
          </button>
        </div>
        
        {activeTab === 'exercise' && (
          show1RMCalculator ? <OneRepMaxCalculator /> :
          showWeightGuide ? <WorkoutWeightGuide /> :
          showWorkoutSets ? <WorkoutProgram /> :
          selectedExercise ? <ExerciseDetail exercise={selectedExercise} onClose={() => setSelectedExercise(null)} /> : 
          <ExerciseSearch onSelectExercise={handleExerciseSelect} selectedPart={selectedPart} onPartChange={handlePartSelect} />
        )}

        {activeTab === 'nutrition' && (
          showCalculator ? <CalorieCalculator userProfile={userProfile} onComplete={async () => {}} /> :
          showNutritionScout ? <NutritionScout /> :
          showMealPlans ? <MealPlans /> :
          <div className="text-center p-8"><p>영양 관련 기능을 선택해주세요.</p></div>
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
    </Layout>
  );
};

export default QnaPage;
