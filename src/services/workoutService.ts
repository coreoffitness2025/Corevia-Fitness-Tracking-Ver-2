import { WorkoutGuideInfo, WorkoutGuideResult } from '../types';

// 1. API 통신 레이어 - 네트워크 요청을 담당
export const workoutAPI = {
  /**
   * 서버에서 운동 가이드 데이터를 가져옵니다.
   * React Native로 마이그레이션 시에도 동일한 인터페이스 유지 가능
   */
  fetchWorkoutGuide: async (guideInfo: WorkoutGuideInfo): Promise<WorkoutGuideResult> => {
    // API 호출 코드 - 실제 환경에서는 fetch 또는 axios 등으로 구현
    // 여기서는 목업 데이터를 사용
    return mockGenerateWorkoutGuide(guideInfo);
  },

  // 운동 히스토리 저장
  saveWorkoutHistory: async (userId: string, data: any): Promise<boolean> => {
    // API 호출 코드
    return true;
  },
};

// 2. 비즈니스 로직 레이어 - 데이터 처리 및 변환
export const workoutService = {
  /**
   * 사용자 정보와 선호도에 따라 운동 가이드를 생성합니다.
   */
  getWorkoutGuide: async (guideInfo: WorkoutGuideInfo): Promise<WorkoutGuideResult> => {
    try {
      // API 레이어를 통해 데이터 요청
      const result = await workoutAPI.fetchWorkoutGuide(guideInfo);
      return result;
    } catch (error) {
      console.error('운동 가이드 가져오기 실패:', error);
      throw error;
    }
  },

  // 사용자 경험 레벨에 따른 권장 세트/반복 횟수 계산
  calculateRecommendedVolume: (experience: string, exercise: string): { sets: number; reps: string } => {
    switch (experience) {
      case 'beginner':
        return { sets: 3, reps: '8-12' };
      case 'intermediate':
        return { sets: 4, reps: '6-10' };
      case 'advanced':
        return { sets: 5, reps: '4-8' };
      default:
        return { sets: 3, reps: '10-12' };
    }
  },

  // 1RM 기반 무게 계산 - 플랫폼 독립적 순수 함수
  calculateWeight: (oneRM: number, percentage: number): number => {
    return Math.round(oneRM * percentage);
  },
};

// 3. 헬퍼 함수 및 유틸리티 - 순수 함수로 구현
// 목업 데이터 생성 함수 - 실제 API 연동 전까지 사용
const mockGenerateWorkoutGuide = (guideInfo: WorkoutGuideInfo): WorkoutGuideResult => {
  // 사용자 레벨 결정 (경험과 1RM 기준으로)
  const userLevel = guideInfo.experience;
  
  // 성별, 연령, 숙련도에 따른 1RM 백분율 결정
  let percentageOfOneRM = 0.7; // 기본값
  
  // 세트 유형에 따른 설명
  const setConfigDetails = {
    '10x5': {
      type: '10x5',
      description: '10회 5세트',
      advantages: [
        '근비대(muscle hypertrophy)에 최적화된 구성',
        '중량과 볼륨 사이의 균형이 좋음'
      ]
    },
    '6x3': {
      type: '6x3',
      description: '6회 3세트',
      advantages: [
        '근력 향상에 중점을 둔 구성',
        '중추신경계 활성화 및 신경근 효율성 개선'
      ]
    },
    '15x5': {
      type: '15x5',
      description: '15회 5세트',
      advantages: [
        '근지구력 향상에 탁월',
        '젖산 내성 증가'
      ]
    }
  };
  
  // 권장 무게 계산
  const recommendedWeights = {
    squat: guideInfo.oneRepMaxes?.squat ? workoutService.calculateWeight(guideInfo.oneRepMaxes.squat, percentageOfOneRM) : 0,
    deadlift: guideInfo.oneRepMaxes?.deadlift ? workoutService.calculateWeight(guideInfo.oneRepMaxes.deadlift, percentageOfOneRM) : 0,
    bench: guideInfo.oneRepMaxes?.bench ? workoutService.calculateWeight(guideInfo.oneRepMaxes.bench, percentageOfOneRM) : 0,
    overheadPress: guideInfo.oneRepMaxes?.overheadPress ? workoutService.calculateWeight(guideInfo.oneRepMaxes.overheadPress, percentageOfOneRM) : 0,
  };
  
  // 회복 시간 설정
  const recoveryTime = guideInfo.preferredSetConfig === '6x3' ? '세트 간 3분' : '세트 간 2분';
  
  return {
    programName: `${userLevel} 운동 프로그램`,
    description: `${userLevel} 레벨을 위한 맞춤형 운동 프로그램`,
    schedule: [
      {
        day: '월요일',
        focus: '가슴',
        exercises: [
          {
            name: '벤치 프레스',
            sets: 5,
            reps: '8-10',
            rest: '2분',
          }
        ]
      }
    ],
    tips: ['운동 전 충분한 웜업을 하세요.'],
    estimatedProgress: {
      weeks: 8,
      strengthGain: '10-15%',
    },
    // 추가 속성
    userLevel,
    recommendedWeights,
    recoveryTime,
    percentageOfOneRM,
    setConfig: setConfigDetails[guideInfo.preferredSetConfig as keyof typeof setConfigDetails] || setConfigDetails['10x5']
  };
}; 