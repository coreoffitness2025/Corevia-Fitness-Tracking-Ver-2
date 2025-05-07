import { useState } from 'react';
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
}

const PersonalizationModal = ({ isOpen, onClose, onSave }: PersonalizationModalProps) => {
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [fitnessGoal, setFitnessGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  const [benchPressMax, setBenchPressMax] = useState<number>(0);
  const [squatMax, setSquatMax] = useState<number>(0);
  const [deadliftMax, setDeadliftMax] = useState<number>(0);
  const [ohpMax, setOhpMax] = useState<number>(0);
  
  const [chestExercise, setChestExercise] = useState<ChestMainExercise>('benchPress');
  const [backExercise, setBackExercise] = useState<BackMainExercise>('deadlift');
  const [shoulderExercise, setShoulderExercise] = useState<ShoulderMainExercise>('overheadPress');
  const [legExercise, setLegExercise] = useState<LegMainExercise>('squat');
  const [bicepsExercise, setBicepsExercise] = useState<BicepsMainExercise>('dumbbellCurl');
  const [tricepsExercise, setTricepsExercise] = useState<TricepsMainExercise>('cablePushdown');
  
  const [setConfig, setSetConfig] = useState<SetConfiguration>('5x5');
  const [customSets, setCustomSets] = useState<number>(5);
  const [customReps, setCustomReps] = useState<number>(5);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      height,
      weight,
      age,
      gender,
      activityLevel,
      fitnessGoal,
      preferredExercises: {
        chest: chestExercise,
        back: backExercise,
        shoulder: shoulderExercise,
        leg: legExercise,
        biceps: bicepsExercise,
        triceps: tricepsExercise
      },
      setConfiguration: {
        preferredSetup: setConfig,
        customSets: setConfig === 'custom' ? customSets : undefined,
        customReps: setConfig === 'custom' ? customReps : undefined
      },
      oneRepMax: {
        bench: benchPressMax,
        squat: squatMax,
        deadlift: deadliftMax,
        overheadPress: ohpMax
      }
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? '' : 'hidden'} z-50`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">프로필 설정 (단계 {currentStep}/{totalSteps})</h2>
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
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  활동 수준
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as 'low' | 'moderate' | 'high')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="low">낮음</option>
                  <option value="moderate">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  목표
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as 'loss' | 'maintain' | 'gain')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="loss">체중 감소</option>
                  <option value="maintain">체중 유지</option>
                  <option value="gain">체중 증가</option>
                </select>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  가슴 메인 운동
                </label>
                <select
                  value={chestExercise}
                  onChange={(e) => setChestExercise(e.target.value as ChestMainExercise)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="benchPress">벤치 프레스</option>
                  <option value="inclineBenchPress">인클라인 벤치 프레스</option>
                  <option value="declineBenchPress">디클라인 벤치 프레스</option>
                </select>
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
                <select
                  value={setConfig}
                  onChange={(e) => setSetConfig(e.target.value as SetConfiguration)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="5x5">5세트 5회 (강도: 중상)</option>
                  <option value="10x5">10세트 5회 (강도: 상)</option>
                  <option value="6x5">6세트 5회 (강도: 중)</option>
                  <option value="custom">직접 설정</option>
                </select>
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  1RM을 입력하면 세트별 추천 무게를 제공해 드립니다.
                </p>
                
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
          
          <div className="flex justify-between mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goToPrevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                이전
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                저장
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationModal;
