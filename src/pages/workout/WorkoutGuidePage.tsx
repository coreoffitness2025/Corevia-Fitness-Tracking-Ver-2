import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutGuideInfo, WorkoutGuideResult } from '../../types/index';

const WorkoutGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [guideInfo, setGuideInfo] = useState<WorkoutGuideInfo>({
    gender: userProfile?.gender || 'male',
    age: userProfile?.age || 30,
    weight: userProfile?.weight || 70,
    experience: userProfile?.experience?.level || 'beginner',
    oneRepMaxes: {
      squat: userProfile?.oneRepMax?.squat || 0,
      deadlift: userProfile?.oneRepMax?.deadlift || 0,
      bench: userProfile?.oneRepMax?.bench || 0,
      overheadPress: userProfile?.oneRepMax?.overheadPress || 0,
    },
    preferredSetConfig: '10x5',
  });
  const [result, setResult] = useState<WorkoutGuideResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGuideInfo((prev: WorkoutGuideInfo) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof WorkoutGuideInfo],
          [child]: name.includes('oneRepMaxes') ? Number(value) : value
        }
      }));
    } else {
      setGuideInfo((prev: WorkoutGuideInfo) => ({
        ...prev,
        [name]: name === 'age' || name === 'weight' ? Number(value) : value
      }));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
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

  const handleOneRmCalculator = () => {
    // 임시로 새 탭에서 열기
    window.open("https://www.calculator.net/one-rep-max-calculator.html", "_blank");
    // TODO: 내부 1RM 계산기로 교체
  };

  const calculateResults = () => {
    const { gender, age, weight, experience, oneRepMaxes, preferredSetConfig } = guideInfo;
    
    // 연령 그룹 결정
    let ageGroup: '20-35' | '36-50' | '51+' = '20-35';
    if (age >= 51) {
      ageGroup = '51+';
    } else if (age >= 36) {
      ageGroup = '36-50';
    }
    
    // 사용자 레벨 결정 (경험과 1RM 기준으로)
    let userLevel: 'beginner' | 'intermediate' | 'advanced' = experience;
    
    // 몸무게 대비 1RM 비율 계산하여 레벨 보정
    if (gender === 'male') {
      // 남성 기준
      if (oneRepMaxes.squat && oneRepMaxes.deadlift) {
        if (oneRepMaxes.squat >= weight * 1.8 && oneRepMaxes.deadlift >= weight * 2.3) {
          userLevel = 'advanced';
        } else if (oneRepMaxes.squat >= weight * 1.3 && oneRepMaxes.deadlift >= weight * 1.7) {
          userLevel = 'intermediate';
        } else {
          userLevel = 'beginner';
        }
      }
    } else {
      // 여성 기준
      if (oneRepMaxes.squat && oneRepMaxes.deadlift) {
        if (oneRepMaxes.squat >= weight * 1.3 && oneRepMaxes.deadlift >= weight * 1.8) {
          userLevel = 'advanced';
        } else if (oneRepMaxes.squat >= weight * 0.9 && oneRepMaxes.deadlift >= weight * 1.3) {
          userLevel = 'intermediate';
        } else {
          userLevel = 'beginner';
        }
      }
    }
    
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
        type: preferredSetConfig,
        description: setConfigDetails[preferredSetConfig].description,
        advantages: setConfigDetails[preferredSetConfig].advantages
      },
      percentageOfOneRM
    });
    
    // 결과 페이지로 이동
    setCurrentStep(4);
  };

  const renderBasicInfoStep = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">기본 정보 입력</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">성별</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={guideInfo.gender === 'male'}
              onChange={handleInputChange}
              className="mr-2"
            />
            남자
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={guideInfo.gender === 'female'}
              onChange={handleInputChange}
              className="mr-2"
            />
            여자
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          나이
        </label>
        <input
          type="number"
          name="age"
          value={guideInfo.age}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          min="15"
          max="100"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          몸무게 (kg)
        </label>
        <input
          type="number"
          name="weight"
          value={guideInfo.weight}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          min="30"
          max="200"
        />
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
      
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleNextStep}>
          다음
        </Button>
      </div>
    </Card>
  );
  
  const renderOneRMInputStep = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">부위별 1RM 무게 입력</h2>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          1RM(One Repetition Maximum)은 한 번에 들 수 있는 최대 무게를 의미합니다.
          정확한 수치를 모르신다면 오른쪽의 1RM 계산기를 이용하세요.
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
            value={guideInfo.oneRepMaxes.squat}
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
            value={guideInfo.oneRepMaxes.deadlift}
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
            value={guideInfo.oneRepMaxes.bench}
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
            value={guideInfo.oneRepMaxes.overheadPress}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <Button
          variant="secondary"
          onClick={handleOneRmCalculator}
          className="w-full md:w-auto"
        >
          1RM 계산기 사용하기
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrevStep}>
          이전
        </Button>
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
        <Button variant="ghost" onClick={handlePrevStep}>
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
        
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setCurrentStep(3)}>
            설정 변경
          </Button>
          <Button variant="primary" onClick={() => navigate('/settings')}>
            설정 페이지로 돌아가기
          </Button>
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
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step}
              className={`flex items-center ${
                step < 4 ? 'flex-1' : ''
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
              
              {step < 4 && (
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
          <span>기본 정보</span>
          <span>1RM 입력</span>
          <span>세트 설정</span>
          <span>결과</span>
        </div>
      </div>
      
      {currentStep === 1 && renderBasicInfoStep()}
      {currentStep === 2 && renderOneRMInputStep()}
      {currentStep === 3 && renderSetConfigStep()}
      {currentStep === 4 && renderResultStep()}
    </Layout>
  );
};

export default WorkoutGuidePage; 