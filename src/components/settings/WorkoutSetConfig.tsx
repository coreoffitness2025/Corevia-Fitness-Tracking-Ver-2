import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutGuideInfo, UserProfile, SetConfiguration } from '../../types';
import { toast } from 'react-hot-toast';
import { useWorkoutSettings, WorkoutSettings } from '../../hooks/useWorkoutSettings';

// guideInfo 초기 설정 함수
const getInitialGuideInfo = (userProfile: any, settings: WorkoutSettings): WorkoutGuideInfo => {
  return {
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
    preferredSetConfig: settings?.preferredSetup || '10x5',
  };
};

interface WorkoutSetConfigProps {
  onConfigSaved?: () => void;
}

const WorkoutSetConfig: React.FC<WorkoutSetConfigProps> = ({ onConfigSaved }) => {
  const { currentUser, userProfile } = useAuth();
  const { settings, updateSettings, isLoading, isUpdating } = useWorkoutSettings();
  
  // 초기화된 guideInfo 상태
  const [guideInfo, setGuideInfo] = useState<WorkoutGuideInfo>(() => 
    getInitialGuideInfo(userProfile, settings || { 
      preferredSetup: '10x5' as SetConfiguration, 
      customSets: 5, 
      customReps: 10 
    })
  );
  
  // 설정이 변경되면 guideInfo 업데이트
  useEffect(() => {
    if (settings) {
      setGuideInfo(prev => ({
        ...prev,
        preferredSetConfig: settings.preferredSetup
      }));
    }
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
      
      // 문자열 리터럴 타입 비교 문제 해결을 위한 타입 가드
      const setConfig = guideInfo.preferredSetConfig as SetConfiguration;
      
      switch (setConfig) {
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
        preferredSetup: setConfig,
        customSets,
        customReps
      };
      
      console.log('설정할 세트 구성:', newSettings);
      
      // React Query 뮤테이션 사용하여 설정 업데이트
      updateSettings(newSettings);
      
      // 경험 정보 업데이트 - 이 부분은 기존 방식 유지
      if (userProfile?.experience) {
        // 타입 단언을 사용하여 타입 오류 해결
        const profileUpdate = {
          experience: {
            ...userProfile.experience,
            level: guideInfo.experience
          }
        };
        
        // 여기에서 추가 업데이트 로직을 구현할 수 있습니다.
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
    <Card className="p-3 sm:p-5">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-5">메인 운동 세트 설정</h2>
      
      <div className="space-y-3 sm:space-y-5">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <label className="flex items-center w-full p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 mr-2 sm:mr-3">
              <input
                type="radio"
                name="preferredSetConfig"
                value="5x5"
                checked={guideInfo.preferredSetConfig === '5x5'}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base">5x5세트 (5회 5세트)</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">근력과 근비대 균형</p>
            </div>
          </label>
          
          <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 text-xs sm:text-sm">
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
              <li>근력과 근비대 균형에 최적화</li>
              <li>초보자부터 중급자까지 적합</li>
              <li>무게 증가에 집중하기 좋음</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <label className="flex items-center w-full p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 mr-2 sm:mr-3">
              <input
                type="radio"
                name="preferredSetConfig"
                value="10x5"
                checked={guideInfo.preferredSetConfig === '10x5'}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base">10x5세트 (10회 5세트)</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">근비대-보디빌딩 초점</p>
            </div>
          </label>
          
          <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 text-xs sm:text-sm">
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
              <li>근비대에 최적화된 구성</li>
              <li>중량과 볼륨의 균형</li>
              <li>근육 성장 자극에 효과적</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <label className="flex items-center w-full p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 mr-2 sm:mr-3">
              <input
                type="radio"
                name="preferredSetConfig"
                value="6x3"
                checked={guideInfo.preferredSetConfig === '6x3'}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base">6x3세트 (6회 3세트)</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">근력 향상 - 스트렝스 초점</p>
            </div>
          </label>
          
          <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 text-xs sm:text-sm">
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
              <li>근력 향상에 중점</li>
              <li>신경근 효율성 개선</li>
              <li>관절 부담이 적음</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <label className="flex items-center w-full p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 mr-2 sm:mr-3">
              <input
                type="radio"
                name="preferredSetConfig"
                value="15x5"
                checked={guideInfo.preferredSetConfig === '15x5'}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base">15x5세트 (15회 5세트)</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">근육 성장 자극</p>
            </div>
          </label>
          
          <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 text-xs sm:text-sm">
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
              <li>근지구력 향상에 탁월</li>
              <li>젖산 내성 증가</li>
              <li>느린 근섬유 발달에 효과적</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
        <Button 
          variant="primary" 
          onClick={applyToProfile}
          disabled={isUpdating}
          className="w-full sm:w-auto py-2 sm:py-3"
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