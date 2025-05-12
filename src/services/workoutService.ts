import { WorkoutGuideInfo, WorkoutGuideResult } from '../types';

/**
 * 사용자 정보와 선호도에 따라 운동 가이드를 생성합니다.
 */
export const getWorkoutGuide = async (
  guideInfo: WorkoutGuideInfo
): Promise<WorkoutGuideResult> => {
  // 이 함수는 실제로는 Firebase 함수를 호출하거나 API에 요청을 보낼 수 있습니다.
  // 여기서는 간단한 예시 구현만 제공합니다.
  
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
    squat: guideInfo.oneRepMaxes?.squat ? Math.round(guideInfo.oneRepMaxes.squat * percentageOfOneRM) : 0,
    deadlift: guideInfo.oneRepMaxes?.deadlift ? Math.round(guideInfo.oneRepMaxes.deadlift * percentageOfOneRM) : 0,
    bench: guideInfo.oneRepMaxes?.bench ? Math.round(guideInfo.oneRepMaxes.bench * percentageOfOneRM) : 0,
    overheadPress: guideInfo.oneRepMaxes?.overheadPress ? Math.round(guideInfo.oneRepMaxes.overheadPress * percentageOfOneRM) : 0,
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