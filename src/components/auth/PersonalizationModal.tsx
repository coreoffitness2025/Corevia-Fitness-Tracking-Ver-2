import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  ChestMainExercise,
  BackMainExercise,
  ShoulderMainExercise,
  LegMainExercise,
  BicepsMainExercise,
  TricepsMainExercise,
  SetConfiguration
} from '../../types';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => void;
  userProfile?: Partial<UserProfile> | null;
}

// 1RM 계산기 컴포넌트
const OneRMCalculator = ({
  onBack,
  onCalculate,
}: {
  onBack: () => void;
  onCalculate: (exercise: string, weight: number, reps: number, calculatedRM: number) => void;
}) => {
  const [exercise, setExercise] = useState<string>('bench');
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [calculatedRM, setCalculatedRM] = useState<number | null>(null);

  const calculate1RM = () => {
    // 브레찌키 공식: 1RM = 무게 * (36 / (37 - 반복횟수))
    const rm = Math.round(weight * (36 / (37 - reps)));
    setCalculatedRM(rm);
    onCalculate(exercise, weight, reps, rm);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">1RM 계산기</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        여러 번 들 수 있는 무게와 반복 횟수를 입력하면 1RM을 예상해 드립니다.
      </p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          운동 종류
        </label>
        <select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="bench">벤치 프레스</option>
          <option value="squat">스쿼트</option>
          <option value="deadlift">데드리프트</option>
          <option value="overheadPress">오버헤드 프레스</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          무게 (kg)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          min="0"
          max="500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          반복 횟수
        </label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          min="1"
          max="15"
        />
      </div>
      
      {calculatedRM && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md text-center">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            예상 1RM: <span className="text-lg font-bold">{calculatedRM} kg</span>
          </p>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          돌아가기
        </button>
        <button
          type="button"
          onClick={calculate1RM}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          계산하기
        </button>
      </div>
    </div>
  );
};

// HomePage.tsx 또는 NutritionGuide.tsx와 유사한 매크로 계산 함수
const calculateMacrosForModal = (targetCalories: number, weight_kg: number | undefined) => {
  if (!weight_kg || weight_kg <= 0 || !targetCalories || targetCalories <= 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  const proteinGrams = Math.round(weight_kg * 1.6);
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories);
  const carbsCalories = Math.max(0, remainingCalories * 0.55);
  const fatCalories = Math.max(0, remainingCalories * 0.30);
  
  return {
    protein: proteinGrams,
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
};

const PersonalizationModal = ({ isOpen, onClose, onSave, userProfile }: PersonalizationModalProps) => {
  const [height, setHeight] = useState<number>(userProfile?.height || 170);
  const [weight, setWeight] = useState<number>(userProfile?.weight || 70);
  const [age, setAge] = useState<number>(userProfile?.age || 25);
  const [gender, setGender] = useState<'male' | 'female'>(userProfile?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(userProfile?.activityLevel || 'moderate');
  const [fitnessGoal, setFitnessGoal] = useState<UserProfile['fitnessGoal']>(userProfile?.fitnessGoal || 'maintain');
  
  // 1RM 데이터 초기화
  const [benchPressMax, setBenchPressMax] = useState<number>(userProfile?.oneRepMax?.bench || 0);
  const [squatMax, setSquatMax] = useState<number>(userProfile?.oneRepMax?.squat || 0);
  const [deadliftMax, setDeadliftMax] = useState<number>(userProfile?.oneRepMax?.deadlift || 0);
  const [ohpMax, setOhpMax] = useState<number>(userProfile?.oneRepMax?.overheadPress || 0);
  
  // 선호 운동 초기화
  const [chestExercise, setChestExercise] = useState<ChestMainExercise>(
    userProfile?.preferredExercises?.chest as ChestMainExercise || 'benchPress'
  );
  const [backExercise, setBackExercise] = useState<BackMainExercise>(
    userProfile?.preferredExercises?.back as BackMainExercise || 'deadlift'
  );
  const [shoulderExercise, setShoulderExercise] = useState<ShoulderMainExercise>(
    userProfile?.preferredExercises?.shoulder as ShoulderMainExercise || 'overheadPress'
  );
  const [legExercise, setLegExercise] = useState<LegMainExercise>(
    userProfile?.preferredExercises?.leg as LegMainExercise || 'squat'
  );
  const [bicepsExercise, setBicepsExercise] = useState<BicepsMainExercise>(
    userProfile?.preferredExercises?.biceps as BicepsMainExercise || 'dumbbellCurl'
  );
  const [tricepsExercise, setTricepsExercise] = useState<TricepsMainExercise>(
    userProfile?.preferredExercises?.triceps as TricepsMainExercise || 'cablePushdown'
  );
  
  // 세트 구성 초기화
  const [setConfig, setSetConfig] = useState<SetConfiguration>(
    userProfile?.setConfiguration?.preferredSetup || '5x5'
  );
  const [customSets, setCustomSets] = useState<number>(
    userProfile?.setConfiguration?.customSets || 5
  );
  const [customReps, setCustomReps] = useState<number>(
    userProfile?.setConfiguration?.customReps || 5
  );
  
  // 목표 칼로리 관련 상태
  const [targetCalories, setTargetCalories] = useState<number>(
    userProfile?.targetCalories || 0
  );
  const [calculatedCalories, setCalculatedCalories] = useState<{
    bmr: number;
    maintenance: number;
    target: number;
  } | null>(null);
  
  const [calculatedMacros, setCalculatedMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const totalSteps = 4; // 4단계로 변경

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // BMR 및 목표 칼로리 계산 함수 (calculateBMR)
  const calculateBMRAndMacros = () => {
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else { // female
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityFactors: Record<UserProfile['activityLevel'], number> = { 
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725, 
        veryActive: 1.9
    };
    const activityFactor = activityFactors[activityLevel] || 1.55;

    const maintenance = Math.round(bmr * activityFactor);

    const goalFactors: Record<string, number> = { 
        lose: 0.8,
        maintain: 1.0,
        gain: 1.15
    };
    const target = Math.round(maintenance * (goalFactors[fitnessGoal as string] || 1.0));

    setCalculatedCalories({
      bmr: Math.round(bmr),
      maintenance,
      target
    });
    // 사용자가 직접 값을 입력하기 전까지는 계산된 target을 targetCalories 상태에 반영
    // 사용자가 값을 직접 입력하면 targetCalories 상태는 그 값을 따르고, handleSubmit에서 최종 결정됨
    if (targetCalories === 0 || !userProfile?.targetCalories) { // 초기 계산 시 또는 userProfile에 targetCalories가 없을때만 자동 설정
        setTargetCalories(target);
    }
    
    const currentTargetCalories = targetCalories > 0 && userProfile?.targetCalories ? targetCalories : target; // 사용자가 조정한 값이 있으면 그것을, 아니면 계산된 target 사용
    const macros = calculateMacrosForModal(currentTargetCalories, weight);
    setCalculatedMacros(macros);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculatedCalories) { // 만약 BMR/목표칼로리 계산이 아직 안되었다면 수행
        calculateBMRAndMacros(); 
    }
    
    // 사용자가 직접 조정한 targetCalories가 있으면 그것을 사용, 아니면 계산된 값 사용
    const finalCalories = targetCalories > 0 ? targetCalories : (calculatedCalories ? calculatedCalories.target : 0);
    
    // setConfiguration 객체 생성 - custom이 아닌 경우에도 값을 0으로 설정
    const setConfigObject = {
      preferredSetup: setConfig,
      customSets: setConfig === 'custom' ? customSets : 0,
      customReps: setConfig === 'custom' ? customReps : 0
    };
    
    // 모든 정보를 포함하는 완전한 프로필 업데이트
    onSave({
      height,
      weight,
      age,
      gender,
      activityLevel,
      fitnessGoal,
      targetCalories: finalCalories, // 최종 칼로리 전달
      preferredExercises: {
        chest: chestExercise,
        back: backExercise,
        shoulder: shoulderExercise,
        leg: legExercise,
        biceps: bicepsExercise,
        triceps: tricepsExercise
      },
      setConfiguration: setConfigObject,
      oneRepMax: {
        bench: benchPressMax,
        squat: squatMax,
        deadlift: deadliftMax,
        overheadPress: ohpMax
      }
    });
    
    onClose();
  };
  
  const handleCalculate = (exercise: string, weight: number, reps: number, calculatedRM: number) => {
    switch (exercise) {
      case 'bench':
        setBenchPressMax(calculatedRM);
        break;
      case 'squat':
        setSquatMax(calculatedRM);
        break;
      case 'deadlift':
        setDeadliftMax(calculatedRM);
        break;
      case 'overheadPress':
        setOhpMax(calculatedRM);
        break;
    }
  };

  // 사용자가 targetCalories를 직접 수정할 때 매크로도 다시 계산
  useEffect(() => {
    if (targetCalories > 0 && weight > 0) {
      const macros = calculateMacrosForModal(targetCalories, weight);
      setCalculatedMacros(macros);
    }
  }, [targetCalories, weight]); // weight도 의존성에 추가 (체중 변경 시 매크로 재계산)

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">프로필 설정 (단계 {currentStep}/{totalSteps})</h2>
        
        {showCalculator ? (
          <OneRMCalculator 
            onBack={() => setShowCalculator(false)} 
            onCalculate={handleCalculate}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    키 (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    min="100"
                    max="250"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    몸무게 (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    min="30"
                    max="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    나이
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    min="13"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    성별
                  </label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8"
                      required
                    >
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    활동 수준
                  </label>
                  <div className="relative">
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value as UserProfile['activityLevel'])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8"
                      required
                    >
                      <option value="sedentary">거의 안함 (좌식생활)</option>
                      <option value="light">가벼운 활동 (주 1-3회 운동)</option>
                      <option value="moderate">보통 활동 (주 3-5회 운동)</option>
                      <option value="active">활동적 (주 6-7회 운동)</option>
                      <option value="veryActive">매우 활동적 (하루 2회 이상 운동)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    목표
                  </label>
                  <div className="relative">
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value as UserProfile['fitnessGoal'])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8"
                      required
                    >
                      <option value="loss">체중 감소</option>
                      <option value="maintain">체중 유지</option>
                      <option value="gain">체중 증가</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    가슴 메인 운동
                  </label>
                  <div className="relative">
                    <select
                      value={chestExercise}
                      onChange={(e) => setChestExercise(e.target.value as ChestMainExercise)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8"
                    >
                      <option value="benchPress">벤치 프레스</option>
                      <option value="inclineBenchPress">인클라인 벤치 프레스</option>
                      <option value="declineBenchPress">디클라인 벤치 프레스</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    등 메인 운동
                  </label>
                  <select
                    value={backExercise}
                    onChange={(e) => setBackExercise(e.target.value as BackMainExercise)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="deadlift">데드리프트</option>
                    <option value="pullUp">턱걸이</option>
                    <option value="bentOverRow">벤트오버 로우</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    어깨 메인 운동
                  </label>
                  <select
                    value={shoulderExercise}
                    onChange={(e) => setShoulderExercise(e.target.value as ShoulderMainExercise)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="overheadPress">오버헤드 프레스</option>
                    <option value="lateralRaise">레터럴 레이즈</option>
                    <option value="facePull">페이스 풀</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    하체 메인 운동
                  </label>
                  <select
                    value={legExercise}
                    onChange={(e) => setLegExercise(e.target.value as LegMainExercise)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="squat">스쿼트</option>
                    <option value="legPress">레그 프레스</option>
                    <option value="lungue">런지</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    이두 메인 운동
                  </label>
                  <select
                    value={bicepsExercise}
                    onChange={(e) => setBicepsExercise(e.target.value as BicepsMainExercise)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="dumbbellCurl">덤벨 컬</option>
                    <option value="barbelCurl">바벨 컬</option>
                    <option value="hammerCurl">해머 컬</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    삼두 메인 운동
                  </label>
                  <select
                    value={tricepsExercise}
                    onChange={(e) => setTricepsExercise(e.target.value as TricepsMainExercise)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="cablePushdown">케이블 푸시다운</option>
                    <option value="overheadExtension">오버헤드 익스텐션</option>
                    <option value="lyingExtension">라잉 익스텐션</option>
                  </select>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    세트 구성
                  </label>
                  <div className="relative">
                    <select
                      value={setConfig}
                      onChange={(e) => setSetConfig(e.target.value as SetConfiguration)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none pr-8"
                    >
                      <option value="5x5">5세트 5회 (강도: 중상)</option>
                      <option value="10x5">10세트 5회 (강도: 상)</option>
                      <option value="6x5">6세트 5회 (강도: 중)</option>
                      <option value="custom">직접 설정</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {setConfig === 'custom' && (
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        세트 수
                      </label>
                      <input
                        type="number"
                        value={customSets}
                        onChange={(e) => setCustomSets(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        반복 횟수
                      </label>
                      <input
                        type="number"
                        value={customReps}
                        onChange={(e) => setCustomReps(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">1RM 설정 (선택사항)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    1RM을 입력하면 세트별 추천 무게를 제공해 드립니다.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setShowCalculator(true)}
                    className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    1RM을 모르나요? 예상 1RM 계산기를 이용해보세요.
                  </button>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        벤치 프레스 1RM (kg)
                      </label>
                      <input
                        type="number"
                        value={benchPressMax}
                        onChange={(e) => setBenchPressMax(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="0"
                        max="300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        스쿼트 1RM (kg)
                      </label>
                      <input
                        type="number"
                        value={squatMax}
                        onChange={(e) => setSquatMax(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="0"
                        max="400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        데드리프트 1RM (kg)
                      </label>
                      <input
                        type="number"
                        value={deadliftMax}
                        onChange={(e) => setDeadliftMax(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="0"
                        max="400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        오버헤드 프레스 1RM (kg)
                      </label>
                      <input
                        type="number"
                        value={ohpMax}
                        onChange={(e) => setOhpMax(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        min="0"
                        max="200"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="pt-2">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">목표 칼로리 및 영양소</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    입력하신 정보를 바탕으로 목표 칼로리 및 주요 영양소 목표치를 계산해 드립니다.
                  </p>

                  <button
                    type="button"
                    onClick={calculateBMRAndMacros}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
                  >
                    계산하기
                  </button>

                  {calculatedCalories && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">기초 대사량 (BMR)</h4>
                        <p className="text-lg font-semibold">{calculatedCalories.bmr} kcal</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">유지 칼로리</h4>
                        <p className="text-lg font-semibold">{calculatedCalories.maintenance} kcal</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">계산된 목표 칼로리</h4>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{calculatedCalories.target} kcal</p>
                      </div>

                      {/* 계산된 매크로 영양소 표시 */} 
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">단백질</p>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{calculatedMacros.protein}g</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">탄수화물</p>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{calculatedMacros.carbs}g</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">지방</p>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{calculatedMacros.fat}g</p>
                        </div>
                      </div>

                      <div className="pt-3">
                        <label htmlFor="targetCaloriesInputModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          최종 목표 칼로리 직접 설정 (kcal)
                        </label>
                        <input
                          type="number"
                          id="targetCaloriesInputModal"
                          value={targetCalories} 
                          onChange={(e) => setTargetCalories(Number(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="예: 2500"
                          min="1000"
                          max="5000"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          계산된 값을 참고하여 최종 목표 칼로리를 직접 설정할 수 있습니다. 변경 시 위 영양소 목표도 함께 업데이트됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  이전
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  취소
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4285F4] border border-transparent rounded-md hover:bg-[#3b78db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                >
                  다음
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4285F4] border border-transparent rounded-md hover:bg-[#3b78db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                >
                  저장
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PersonalizationModal;
