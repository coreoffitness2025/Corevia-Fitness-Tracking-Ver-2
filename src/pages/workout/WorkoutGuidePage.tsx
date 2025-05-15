import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutGuideInfo, WorkoutGuideResult } from '../../types/index';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import { ArrowRight, Calculator } from 'lucide-react';

// 1RM 계산기 컴포넌트
const OneRMCalculator = ({
  onCalculate,
  onClose,
}: {
  onCalculate: (exercise: string, calculatedRM: number) => void;
  onClose: () => void;
}) => {
  const [exercise, setExercise] = useState<string>('squat');
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [calculatedRM, setCalculatedRM] = useState<number | null>(null);

  const calculate1RM = () => {
    // 브레찌키 공식: 1RM = 무게 * (36 / (37 - 반복횟수))
    const rm = Math.round(weight * (36 / (37 - reps)));
    setCalculatedRM(rm);
    onCalculate(exercise, rm);
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-800 p-6 z-10 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">1RM 계산기</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        여러 번 들 수 있는 무게와 반복 횟수를 입력하면 1RM을 예상해 드립니다.
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          운동 종류
        </label>
        <select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="squat">스쿼트</option>
          <option value="deadlift">데드리프트</option>
          <option value="bench">벤치 프레스</option>
          <option value="overheadPress">오버헤드 프레스</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          무게 (kg)
        </label>
        <input
          type="number"
          value={weight || ''}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          min="0"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          반복 횟수
        </label>
        <input
          type="number"
          value={reps || ''}
          onChange={(e) => setReps(Number(e.target.value))}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          min="1"
          max="15"
        />
      </div>
      
      {calculatedRM && (
        <div className="p-4 bg-blue-50 dark:bg-blue-800/30 rounded-md text-center mb-6">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            예상 1RM: <span className="text-lg font-bold">{calculatedRM} kg</span>
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          돌아가기
        </Button>
        <Button
          variant="primary"
          onClick={calculate1RM}
        >
          계산하기
        </Button>
      </div>
    </div>
  );
};

const WorkoutGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [guideInfo, setGuideInfo] = useState<WorkoutGuideInfo>({
    gender: userProfile?.gender || 'male',
    age: userProfile?.age || 30,
    weight: userProfile?.weight || 70,
    experience: userProfile?.experience?.level || 'beginner',
    trainingYears: userProfile?.experience?.years || 0,
    oneRepMaxes: {
      squat: userProfile?.oneRepMax?.squat || 0,
      deadlift: userProfile?.oneRepMax?.deadlift || 0,
      bench: userProfile?.oneRepMax?.bench || 0,
      overheadPress: userProfile?.oneRepMax?.overheadPress || 0,
    },
    preferredSetConfig: '10x5',
  });
  const [result, setResult] = useState<WorkoutGuideResult | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorExercise, setCalculatorExercise] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGuideInfo((prev: WorkoutGuideInfo) => {
        const parentObj = prev[parent as keyof WorkoutGuideInfo] || {};
        // 타입 안전을 위해 객체인지 확인
        const parentValue = typeof parentObj === 'object' && parentObj !== null ? parentObj : {};
        
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: name.includes('oneRepMaxes') ? Number(value) : value
          }
        };
      });
    } else {
      setGuideInfo((prev: WorkoutGuideInfo) => ({
        ...prev,
        [name]: name === 'age' || name === 'weight' || name === 'trainingYears' ? Number(value) : value
      }));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleOneRmCalculator = (exercise: string) => {
    setCalculatorExercise(exercise);
    setShowCalculator(true);
  };

  const handleCalculatorClose = () => {
    setShowCalculator(false);
  };

  const handleCalculatorResult = (exercise: string, result: number) => {
    const newOneRepMaxes = { ...guideInfo.oneRepMaxes };
    if (exercise === 'squat') {
      newOneRepMaxes.squat = result;
    } else if (exercise === 'deadlift') {
      newOneRepMaxes.deadlift = result;
    } else if (exercise === 'bench') {
      newOneRepMaxes.bench = result;
    } else if (exercise === 'overheadPress') {
      newOneRepMaxes.overheadPress = result;
    }

    setGuideInfo(prev => ({
      ...prev,
      oneRepMaxes: newOneRepMaxes
    }));
    setShowCalculator(false);
  };

  // 개인화 설정에 적용하는 함수
  const applyToProfile = async () => {
    if (!currentUser || !result) return;
    
    try {
      // 1. 1RM 업데이트
      const oneRepMax = {
        bench: guideInfo.oneRepMaxes.bench || 0,
        squat: guideInfo.oneRepMaxes.squat || 0,
        deadlift: guideInfo.oneRepMaxes.deadlift || 0,
        overheadPress: guideInfo.oneRepMaxes.overheadPress || 0,
      };
      
      // 2. 세트 구성 업데이트
      const setConfiguration = {
        preferredSetup: result.setConfig.type as any, // 타입 캐스팅으로 오류 해결
        customSets: 0,
        customReps: 0
      };
      
      // 3. 업데이트할 프로필 정보
      const profileUpdate: Partial<UserProfile> = {
        oneRepMax,
        setConfiguration
      };
      
      // 경험 정보가 있으면 추가
      if (userProfile?.experience) {
        profileUpdate.experience = {
          ...userProfile.experience,
          level: guideInfo.experience
        };
      }
      
      // Firebase와 컨텍스트 상태 모두 업데이트
      await updateProfile(profileUpdate);
      
      // 성공 메시지
      toast.success('프로필에 설정이 적용되었습니다', {
        duration: 3000,
        position: 'top-center'
      });

      // 설정 페이지로 리디렉션
      navigate('/settings');
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      toast.error('설정 적용 중 오류가 발생했습니다');
    }
  };

  const calculateResults = () => {
    const { experience, oneRepMaxes, preferredSetConfig } = guideInfo;
    
    // 사용자 프로필에서 기본 정보 가져오기
    const gender = userProfile?.gender || 'male';
    const age = userProfile?.age || 30;
    const weight = userProfile?.weight || 70;
    
    // 연령 그룹 결정
    let ageGroup: '20-35' | '36-50' | '51+' = '20-35';
    if (age >= 51) {
      ageGroup = '51+';
    } else if (age >= 36) {
      ageGroup = '36-50';
    }
    
    // 사용자 레벨 - 입력된 경험 레벨 사용
    let userLevel: 'beginner' | 'intermediate' | 'advanced' = experience;
    
    // 세트 설정에 따른 1RM 백분율 계산
    let percentageOfOneRM = 0;
    
    // 세트 유형에 따른 설명 및 장점
    const setConfigDetails: Record<'10x5' | '6x3' | '15x5', {
      description: string;
      advantages: string[];
    }> = {
      '10x5': {
        description: '10회 5세트',
        advantages: [
          '근비대(muscle hypertrophy)에 최적화된 구성',
          '중량과 볼륨 사이의 균형이 좋음',
          '근육의 모세혈관화를 촉진',
          '대사 스트레스(metabolic stress)를 적절히 유발하여 근육 성장 자극'
        ]
      },
      '6x3': {
        description: '6회 3세트',
        advantages: [
          '근력 향상에 중점을 둔 구성',
          '중추신경계 활성화 및 신경근 효율성 개선',
          '빠른 회복으로 더 자주 같은 운동을 반복할 수 있음',
          '관절 부담이 상대적으로 적음 (세트당 반복 횟수가 적어서)',
          '근육의 고밀도 섬유(fast-twitch fiber) 자극에 효과적'
        ]
      },
      '15x5': {
        description: '15회 5세트',
        advantages: [
          '근지구력 향상에 탁월',
          '젖산 내성 증가',
          '더 많은 혈류 제한 효과로 인한 근육 성장 자극',
          '느린 근섬유(slow-twitch fiber) 발달에 효과적',
          '관절과 인대의 강화'
        ]
      }
    };
    
    // 성별, 연령, 숙련도에 따른 1RM 백분율 결정
    if (gender === 'male') {
      // 남성
      if (userLevel === 'beginner') {
        // 남성 초보자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.6 : 
                              preferredSetConfig === '6x3' ? 0.75 : 0.5;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.55 : 
                              preferredSetConfig === '6x3' ? 0.7 : 0.45;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.5 : 
                              preferredSetConfig === '6x3' ? 0.65 : 0.4;
        }
      } else if (userLevel === 'intermediate') {
        // 남성 중급자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.7 : 
                              preferredSetConfig === '6x3' ? 0.85 : 0.6;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.65 : 
                              preferredSetConfig === '6x3' ? 0.8 : 0.55;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.6 : 
                              preferredSetConfig === '6x3' ? 0.75 : 0.5;
        }
      } else {
        // 남성 고급자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.75 : 
                              preferredSetConfig === '6x3' ? 0.9 : 0.65;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.7 : 
                              preferredSetConfig === '6x3' ? 0.85 : 0.6;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.65 : 
                              preferredSetConfig === '6x3' ? 0.8 : 0.55;
        }
      }
    } else {
      // 여성
      if (userLevel === 'beginner') {
        // 여성 초보자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.55 : 
                              preferredSetConfig === '6x3' ? 0.7 : 0.45;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.5 : 
                              preferredSetConfig === '6x3' ? 0.65 : 0.4;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.45 : 
                              preferredSetConfig === '6x3' ? 0.6 : 0.35;
        }
      } else if (userLevel === 'intermediate') {
        // 여성 중급자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.65 : 
                              preferredSetConfig === '6x3' ? 0.8 : 0.55;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.6 : 
                              preferredSetConfig === '6x3' ? 0.75 : 0.5;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.55 : 
                              preferredSetConfig === '6x3' ? 0.7 : 0.45;
        }
      } else {
        // 여성 고급자
        if (ageGroup === '20-35') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.7 : 
                              preferredSetConfig === '6x3' ? 0.85 : 0.6;
        } else if (ageGroup === '36-50') {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.65 : 
                              preferredSetConfig === '6x3' ? 0.8 : 0.55;
        } else {
          percentageOfOneRM = preferredSetConfig === '10x5' ? 0.6 : 
                              preferredSetConfig === '6x3' ? 0.75 : 0.5;
        }
      }
    }
    
    // 권장 무게 계산
    const recommendedWeights = {
      squat: oneRepMaxes.squat ? Math.round(oneRepMaxes.squat * percentageOfOneRM) : undefined,
      deadlift: oneRepMaxes.deadlift ? Math.round(oneRepMaxes.deadlift * percentageOfOneRM) : undefined,
      bench: oneRepMaxes.bench ? Math.round(oneRepMaxes.bench * percentageOfOneRM) : undefined,
      overheadPress: oneRepMaxes.overheadPress ? Math.round(oneRepMaxes.overheadPress * percentageOfOneRM) : undefined,
    };
    
    // 회복 시간 설정
    const recoveryTime = preferredSetConfig === '6x3' ? '세트 간 3분' : '세트 간 2분';
    
    // 결과 저장
    setResult({
      userLevel,
      ageGroup,
      recommendedWeights,
      recoveryTime,
      setConfig: {
        type: preferredSetConfig as any,
        description: setConfigDetails[preferredSetConfig as keyof typeof setConfigDetails].description,
        advantages: setConfigDetails[preferredSetConfig as keyof typeof setConfigDetails].advantages
      },
      percentageOfOneRM
    });
    
    // 결과 페이지로 이동
    setCurrentStep(3);
  };

  const renderWorkoutExperienceStep = () => (
    <Card className="p-6 relative">
      {showCalculator && (
        <OneRMCalculator 
          onCalculate={handleCalculatorResult} 
          onClose={handleCalculatorClose} 
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">운동 구력 및 1RM 입력</h2>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 dark:text-blue-400"
          onClick={() => {
            setCalculatorExercise('squat');
            setShowCalculator(true);
          }}
        >
          1RM 예상 계산하기
        </Button>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          운동 경력
        </label>
        <select
          name="experience"
          value={guideInfo.experience}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="beginner">1년 미만</option>
          <option value="intermediate">3년 미만</option>
          <option value="advanced">3년 이상</option>
        </select>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          1RM(One Repetition Maximum)은 한 번에 들 수 있는 최대 무게를 의미합니다.
          정확한 수치를 모르신다면 상단의 1RM 예상 계산하기 버튼을 이용하세요.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            스쿼트 1RM (kg)
          </label>
          <input
            type="number"
            name="oneRepMaxes.squat"
            value={guideInfo.oneRepMaxes.squat || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            데드리프트 1RM (kg)
          </label>
          <input
            type="number"
            name="oneRepMaxes.deadlift"
            value={guideInfo.oneRepMaxes.deadlift || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            벤치프레스 1RM (kg)
          </label>
          <input
            type="number"
            name="oneRepMaxes.bench"
            value={guideInfo.oneRepMaxes.bench || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            오버헤드프레스 1RM (kg)
          </label>
          <input
            type="number"
            name="oneRepMaxes.overheadPress"
            value={guideInfo.oneRepMaxes.overheadPress || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={handleNextStep}>
          다음
        </Button>
      </div>
    </Card>
  );
  
  const renderSetConfigStep = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">메인 운동 세트 설정</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="10x5"
              checked={guideInfo.preferredSetConfig === '10x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">10x5세트 (10회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근비대-보디빌딩 초점</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근비대(muscle hypertrophy)에 최적화된 구성</li>
              <li>중량과 볼륨 사이의 균형이 좋음</li>
              <li>근육의 모세혈관화를 촉진</li>
              <li>대사 스트레스(metabolic stress)를 적절히 유발하여 근육 성장 자극</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="6x3"
              checked={guideInfo.preferredSetConfig === '6x3'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">6x3세트 (6회 3세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근력 향상 - 스트렝스 초점</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근력 향상에 중점을 둔 구성</li>
              <li>중추신경계 활성화 및 신경근 효율성 개선</li>
              <li>빠른 회복으로 더 자주 같은 운동을 반복할 수 있음</li>
              <li>관절 부담이 상대적으로 적음 (세트당 반복 횟수가 적어서)</li>
              <li>근육의 고밀도 섬유(fast-twitch fiber) 자극에 효과적</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="15x5"
              checked={guideInfo.preferredSetConfig === '15x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">15x5세트 (15회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근육 성장 자극</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근지구력 향상에 탁월</li>
              <li>젖산 내성 증가</li>
              <li>더 많은 혈류 제한 효과로 인한 근육 성장 자극</li>
              <li>느린 근섬유(slow-twitch fiber) 발달에 효과적</li>
              <li>관절과 인대의 강화</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrevStep}>
          이전
        </Button>
        <Button variant="primary" onClick={handleNextStep}>
          결과 확인하기
        </Button>
      </div>
    </Card>
  );
  
  const renderResultStep = () => {
    if (!result) return null;
    
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">운동 세트 및 무게 가이드</h2>
        
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <p className="font-medium mb-2">
            {currentUser?.displayName || '회원'} 님의 개인 프로필과 선호를 참고해 운동 세트와 무게를 설정했습니다.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentUser?.displayName || '회원'} 님이 선호하시는 세트에 대해서 근력 수준을 참고해 선호하시는 세트를 수행할 때 다음과 같은 무게로 훈련하시기를 제안합니다.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-2">
            {currentUser?.displayName || '회원'} 님의 선호 세트: {result.setConfig.description}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            해당 세트를 수행할 경우 훈련 무게 세팅 권장 사항은 아래와 같습니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendedWeights.squat && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">스쿼트</p>
                <p className="font-bold text-xl">{result.recommendedWeights.squat} kg</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (1RM의 {Math.round(result.percentageOfOneRM * 100)}%)
                </p>
              </div>
            )}
            
            {result.recommendedWeights.deadlift && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">데드리프트</p>
                <p className="font-bold text-xl">{result.recommendedWeights.deadlift} kg</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (1RM의 {Math.round(result.percentageOfOneRM * 100)}%)
                </p>
              </div>
            )}
            
            {result.recommendedWeights.bench && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">벤치프레스</p>
                <p className="font-bold text-xl">{result.recommendedWeights.bench} kg</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (1RM의 {Math.round(result.percentageOfOneRM * 100)}%)
                </p>
              </div>
            )}
            
            {result.recommendedWeights.overheadPress && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">오버헤드프레스</p>
                <p className="font-bold text-xl">{result.recommendedWeights.overheadPress} kg</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (1RM의 {Math.round(result.percentageOfOneRM * 100)}%)
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">세트 간 휴식 시간</h3>
          <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {result.recoveryTime}
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">훈련 강도 설명</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="mb-2">
              이 무게는 1RM(최대 중량)의 {Math.round(result.percentageOfOneRM * 100)}%로, 
              {guideInfo.gender === 'male' ? '남성' : '여성'} {
                result.userLevel === 'beginner' ? '초보자' : 
                result.userLevel === 'intermediate' ? '중급자' : '고급자'
              }에게 적합한 {result.setConfig.description} 훈련 강도입니다.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이 무게로 모든 세트를 완료할 수 있다면, 다음 세션에서 2.5~5kg 증가시키는 것을 고려하세요.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            설정 변경
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="primary" onClick={applyToProfile} icon={<ArrowRight size={16} />}>
              프로필에 적용하기
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          메인 운동 세트 구성 및 적정 무게 가이드
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          개인 프로필과 선호도에 맞는 맞춤형 세트 구성 및 무게를 확인하세요.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex items-center ${
                step < 3 ? 'flex-1' : ''
              }`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step}
              </div>
              
              {step < 3 && (
                <div 
                  className={`h-1 flex-1 ${
                    currentStep > step 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>운동 구력 및 1RM 입력</span>
          <span>세트 설정</span>
          <span>결과</span>
        </div>
      </div>
      
      {currentStep === 1 && renderWorkoutExperienceStep()}
      {currentStep === 2 && renderSetConfigStep()}
      {currentStep === 3 && renderResultStep()}
    </Layout>
  );
};

export default WorkoutGuidePage; 