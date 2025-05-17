import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SetConfiguration } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

// 기본 세트 설정 값
const defaultSetConfiguration = {
  preferredSetup: '10x5' as SetConfiguration,
  customSets: 5,
  customReps: 10
};

export interface WorkoutSettings {
  preferredSetup: SetConfiguration;
  customSets: number;
  customReps: number;
}

/**
 * 세트 설정을 관리하는 훅
 * React Query를 사용하여 서버 상태와 클라이언트 상태 분리
 */
export function useWorkoutSettings() {
  const { currentUser, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const userId = currentUser?.uid;

  // 세트 설정 가져오기
  const fetchWorkoutSettings = async (): Promise<WorkoutSettings> => {
    if (!userId) {
      console.log('사용자가 로그인하지 않았습니다. 기본 설정 반환');
      return defaultSetConfiguration;
    }

    try {
      console.log(`[useWorkoutSettings] 사용자 ${userId}의 세트 설정 불러오기`);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists() && userDoc.data().setConfiguration) {
        const settings = userDoc.data().setConfiguration;
        console.log('[useWorkoutSettings] 설정 로드 성공:', settings);
        return settings as WorkoutSettings;
      }
      
      console.log('[useWorkoutSettings] 설정이 없어 기본값 사용');
      return defaultSetConfiguration;
    } catch (error) {
      console.error('[useWorkoutSettings] 설정 로드 실패:', error);
      throw error;
    }
  };

  // 설정 가져오기 쿼리
  const { data: settings, isLoading, error } = useQuery<WorkoutSettings>({
    queryKey: ['workoutSettings', userId],
    queryFn: fetchWorkoutSettings,
    enabled: !!userId, // 사용자 ID가 있을 때만 쿼리 실행
    // 로컬 스토리지 폴백 구현
    staleTime: 1000 * 10, // 10초로 줄임 (원래 5분)
    gcTime: 1000 * 60 * 10    // 10분으로 줄임 (원래 1시간)
  });
  
  // 로컬 스토리지 폴백 처리
  useEffect(() => {
    if (error) {
      console.error('설정 로드 오류, 로컬 스토리지 사용 시도:', error);
      
      // 로컬 스토리지에서 설정 가져오기 시도
      try {
        const cachedSettings = localStorage.getItem('workoutSettings');
        if (cachedSettings) {
          const parsedSettings = JSON.parse(cachedSettings);
          queryClient.setQueryData(['workoutSettings', userId], parsedSettings);
        }
      } catch (cacheError) {
        console.error('로컬 캐시 로드 실패:', cacheError);
      }
    }
  }, [error, queryClient, userId]);

  // 설정 업데이트 뮤테이션
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: async (newSettings: WorkoutSettings) => {
      if (!userId) {
        throw new Error('사용자가 로그인하지 않았습니다.');
      }

      console.log('[useWorkoutSettings] 설정 업데이트 시작:', newSettings);
      
      // 로컬 스토리지에 설정 저장 (오프라인 지원)
      localStorage.setItem('workoutSettings', JSON.stringify(newSettings));
      
      // Firebase 프로필 업데이트
      await updateProfile({ setConfiguration: newSettings });
      
      // 즉시 queryClient 무효화 추가
      queryClient.invalidateQueries({ queryKey: ['workoutSettings', userId] });
      
      console.log('[useWorkoutSettings] 설정 업데이트 성공');
      return newSettings;
    },
    // 낙관적 업데이트: 서버 응답 전에 UI 업데이트
    onMutate: async (newSettings) => {
      // 이전 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['workoutSettings', userId] });
      
      // 이전 설정 값 저장
      const previousSettings = queryClient.getQueryData<WorkoutSettings>(['workoutSettings', userId]);
      
      // 새 값으로 캐시 업데이트
      queryClient.setQueryData(['workoutSettings', userId], newSettings);
      
      // 롤백을 위해 이전 값 반환
      return { previousSettings };
    },
    // 성공 시 처리
    onSuccess: () => {
      toast.success('세트 설정이 저장되었습니다', {
        duration: 3000,
        position: 'top-center'
      });
    },
    // 오류 시 롤백
    onError: (err, newSettings, context: any) => {
      console.error('[useWorkoutSettings] 설정 업데이트 실패:', err);
      if (context?.previousSettings) {
        queryClient.setQueryData(['workoutSettings', userId], context.previousSettings);
      }
      toast.error('설정 적용 중 오류가 발생했습니다');
    },
    // 성공/실패 후 쿼리 데이터 리프레시
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSettings', userId] });
    }
  });

  return {
    settings: settings || defaultSetConfiguration,
    isLoading,
    error,
    updateSettings,
    isUpdating
  };
} 