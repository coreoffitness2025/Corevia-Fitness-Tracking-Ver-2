import React, { useState } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

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

interface WorkoutGuideInfo {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingYears: number;
  oneRepMaxes: {
    squat: number;
    deadlift: number;
    bench: number;
    overheadPress: number;
  };
  preferredSetConfig: '10x5' | '6x3' | '15x5';
}

interface WorkoutGuideResult {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: '20-35' | '36-50' | '51+';
  recommendedWeights: {
    squat?: number;
    deadlift?: number;
    bench?: number;
    overheadPress?: number;
  };
  recoveryTime: string;
  setConfig: {
    type: '10x5' | '6x3' | '15x5';
    description: string;
    advantages: string[];
  };
  percentageOfOneRM: number;
}

const WorkoutWeightGuide: React.FC = () => {
  const { userProfile } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorExercise, setCalculatorExercise] = useState<string>('');
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
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

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

  const calculateResults = () => {
    setIsCalculating(true);
    const { experience, oneRepMaxes, preferredSetConfig } = guideInfo;
    
    // 사용자 프로필에서 기본 정보 가져오기
    const gender = userProfile?.gender || 'male';
    const age = userProfile?.age || 30;
    
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
    
    setIsCalculating(false);
  };

  const resetCalculator = () => {
    setResult(null);
  };

  // 반복 횟수별 무게 테이블 생성 함수
  const generateRepsTable = (maxWeight: number | null, exerciseName: string) => {
    if (!maxWeight) return <p>1RM 정보가 없습니다</p>;
    
    const repRanges = [
      { reps: 1, percentage: 1.00 },
      { reps: 2, percentage: 0.97 },
      { reps: 3, percentage: 0.94 },
      { reps: 4, percentage: 0.92 },
      { reps: 5, percentage: 0.89 },
      { reps: 6, percentage: 0.86 },
      { reps: 8, percentage: 0.81 },
      { reps: 10, percentage: 0.75 },
      { reps: 12, percentage: 0.70 },
      { reps: 15, percentage: 0.65 }
    ];
    
    return repRanges.map(range => (
      <div key={range.reps} className="bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
        <div className="text-sm font-medium">{range.reps}회</div>
        <div className="text-lg font-bold">{Math.round(maxWeight * range.percentage)}kg</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">1RM의 {Math.round(range.percentage * 100)}%</div>
      </div>
    ));
  };

  return (
    <Card className="p-6 relative">
      {showCalculator && (
        <OneRMCalculator 
          onCalculate={handleCalculatorResult} 
          onClose={handleCalculatorClose} 
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">운동 무게 추천</h2>
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

      {!result ? (
        <>
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
          
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
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
          
          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                선호하는 세트 구성
              </label>
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
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
                
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
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
                
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
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
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="primary" 
              onClick={calculateResults}
              disabled={isCalculating}
            >
              무게 계산하기
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">운동 무게 추천 결과</h3>
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              size="sm"
            >
              다시 계산하기
            </Button>
          </div>
          
          {/* 결과 표시 섹션 */}
          <div className="space-y-6">
            {/* 스쿼트 결과 */}
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="text-md font-medium mb-2">스쿼트 (Squat)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {generateRepsTable(guideInfo.oneRepMaxes.squat, 'squat')}
              </div>
            </div>
            
            {/* 데드리프트 결과 */}
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="text-md font-medium mb-2">데드리프트 (Deadlift)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {generateRepsTable(guideInfo.oneRepMaxes.deadlift, 'deadlift')}
              </div>
            </div>
            
            {/* 벤치프레스 결과 */}
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="text-md font-medium mb-2">벤치프레스 (Bench Press)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {generateRepsTable(guideInfo.oneRepMaxes.bench, 'bench')}
              </div>
            </div>
            
            {/* 오버헤드프레스 결과 */}
            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="text-md font-medium mb-2">오버헤드프레스 (Overhead Press)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {generateRepsTable(guideInfo.oneRepMaxes.overheadPress, 'overheadPress')}
              </div>
            </div>
          </div>
          
          <div className="p-4 mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>참고:</strong> 이 무게는 참고용이며, 실제 운동 시 컨디션과 경험에 따라 조절하세요.
              처음 시도하는 무게라면 낮은 무게부터 시작하여 점진적으로 증가시키는 것이 안전합니다.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WorkoutWeightGuide; 