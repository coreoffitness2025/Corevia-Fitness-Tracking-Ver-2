import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutGuideInfo } from '../../types/index';
import { toast } from 'react-hot-toast';
import { useWorkoutSettings, WorkoutSettings } from '../../hooks/useWorkoutSettings';

interface WorkoutSetConfigProps {
  onConfigSaved?: () => void;
}

const WorkoutSetConfig: React.FC<WorkoutSetConfigProps> = ({ onConfigSaved }) => {
  const { currentUser, userProfile } = useAuth();
  const { settings, updateSettings, isLoading, isUpdating } = useWorkoutSettings();
  
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
    preferredSetConfig: settings.preferredSetup,
  });
  
  // 설정이 변경되면 guideInfo 업데이트
  useEffect(() => {
    setGuideInfo(prev => ({
      ...prev,
      preferredSetConfig: settings.preferredSetup
    }));
  }, [settings]);

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

  // 개인화 설정에 적용하는 함수 (React Query 사용 버전)
  const applyToProfile = async () => {
    if (!currentUser) return;
    
    try {
      console.log('세트 설정 적용 시작:', guideInfo.preferredSetConfig);
      
      // 세트 구성에 따라 적절한 세트 수와 반복 횟수 설정
      let customSets = 5;
      let customReps = 10;
      
      switch (guideInfo.preferredSetConfig) {
        case '5x5':
          // 5회 5세트 (근력-근비대 균형)
          customSets = 5;
          customReps = 5;
          break;
        case '6x3':
          // 6회 3세트 (근력 향상 - 스트렝스 초점)
          customSets = 3;
          customReps = 6;
          break;
        case '10x5':
          // 10회 5세트 (근비대-보디빌딩 초점)
          customSets = 5;
          customReps = 10;
          break;
        case '15x5':
          // 15회 5세트 (근육 성장 자극)
          customSets = 5;
          customReps = 15;
          break;
        default:
          // 기본값: 10회 5세트
          customSets = 5;
          customReps = 10;
      }
      
      // 새 설정 구성
      const newSettings: WorkoutSettings = {
        preferredSetup: guideInfo.preferredSetConfig,
        customSets,
        customReps
      };
      
      console.log('설정할 세트 구성:', newSettings);
      
      // React Query 뮤테이션 사용하여 설정 업데이트
      updateSettings(newSettings);
      
      // 경험 정보 업데이트 - 이 부분은 기존 방식 유지
      if (userProfile?.experience) {
        const profileUpdate: Partial<UserProfile> = {
          experience: {
            ...userProfile.experience,
            level: guideInfo.experience
          }
        };
        
        // updateProfile 함수를 직접 호출하는 대신, 나중에 확장 필요
      }
      
      // 콜백 함수 호출
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      // 에러 처리는 React Query에서 이미 처리됨
    }
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">메인 운동 세트 설정</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="5x5"
              checked={guideInfo.preferredSetConfig === '5x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">5x5세트 (5회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근력과 근비대 균형</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근력과 근비대 균형에 최적화된 구성</li>
              <li>초보자부터 중급자까지 적합한 세트 구성</li>
              <li>기초 근력을 키우면서 적절한 부피 확보 가능</li>
              <li>무게 증가에 집중하기 좋은 반복 횟수</li>
              <li>주요 복합 운동(스쿼트, 데드리프트, 벤치프레스 등)에 이상적</li>
            </ul>
          </div>
        </div>
        
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
      
      <div className="flex justify-end mt-6">
        <Button 
          variant="primary" 
          onClick={applyToProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              적용 중...
            </>
          ) : '적용하기'}
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutSetConfig; 