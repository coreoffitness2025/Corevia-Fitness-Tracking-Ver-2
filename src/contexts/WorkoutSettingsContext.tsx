import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SetConfiguration } from '../types';
import { toast } from 'react-hot-toast';

// Context에서 제공할 값들의 타입 정의
interface WorkoutSettingsContextType {
  setConfiguration: {
    preferredSetup: SetConfiguration;
    customSets: number;
    customReps: number;
  };
  updateSetConfiguration: (newConfig: {
    preferredSetup: SetConfiguration;
    customSets: number;
    customReps: number;
  }) => Promise<void>;
}

// 기본값으로 사용할 세트 설정
const defaultSetConfiguration = {
  preferredSetup: '10x5' as SetConfiguration,
  customSets: 5,
  customReps: 10
};

// Context 생성
const WorkoutSettingsContext = createContext<WorkoutSettingsContextType | null>(null);

// Provider 컴포넌트
export const WorkoutSettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { userProfile, updateProfile } = useAuth();
  const [setConfiguration, setSetConfiguration] = useState(
    userProfile?.setConfiguration || defaultSetConfiguration
  );

  // 사용자 프로필이 로드되면 설정 업데이트
  useEffect(() => {
    if (userProfile?.setConfiguration) {
      setSetConfiguration(userProfile.setConfiguration);
      console.log('[WorkoutSettingsContext] 사용자 프로필에서 세트 설정 로드:', userProfile.setConfiguration);
    }
  }, [userProfile?.setConfiguration]);

  // 세트 설정 업데이트 함수
  const updateSetConfiguration = async (newConfig: {
    preferredSetup: SetConfiguration;
    customSets: number;
    customReps: number;
  }) => {
    try {
      console.log('[WorkoutSettingsContext] 세트 설정 업데이트 시작:', newConfig);
      
      // 로컬 상태 먼저 업데이트 - 즉시 반영
      setSetConfiguration(newConfig);
      console.log('[WorkoutSettingsContext] 로컬 상태 업데이트 완료');
      
      // Firebase 사용자 프로필 업데이트
      await updateProfile({ setConfiguration: newConfig });
      console.log('[WorkoutSettingsContext] Firebase 업데이트 완료');
      
      // 성공 메시지
      toast.success('세트 설정이 저장되었습니다', {
        duration: 3000,
        position: 'top-center'
      });
      
      // 업데이트 완료 로그
      console.log('[WorkoutSettingsContext] 세트 설정 업데이트 완전히 완료됨:', newConfig);
      
      return Promise.resolve();
    } catch (error) {
      console.error('[WorkoutSettingsContext] 세트 설정 업데이트 실패:', error);
      toast.error('설정 적용 중 오류가 발생했습니다');
      return Promise.reject(error);
    }
  };

  // Context 값
  const value = {
    setConfiguration,
    updateSetConfiguration
  };

  return (
    <WorkoutSettingsContext.Provider value={value}>
      {children}
    </WorkoutSettingsContext.Provider>
  );
};

// 커스텀 훅
export const useWorkoutSettings = () => {
  const context = useContext(WorkoutSettingsContext);
  if (!context) {
    throw new Error('useWorkoutSettings must be used within a WorkoutSettingsProvider');
  }
  return context;
}; 