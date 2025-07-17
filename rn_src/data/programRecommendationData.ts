import { Omit } from 'react';
import { WorkoutProgram, ProgramExercise } from '../features/workout/types';

// 추천 프로그램용 타입 정의 (사용자 정보 등 일부 필드 제외)
export type RecommendedProgram = Omit<WorkoutProgram, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
    goal: '근력 향상' | '근비대' | '체지방 감소';
    level: '초급' | '중급' | '고급';
    duration: string; // 예: "8주"
};

export const RECOMMENDED_PROGRAMS: RecommendedProgram[] = [
    {
        name: '초급자를 위한 전신 근력 프로그램',
        goal: '근력 향상',
        level: '초급',
        duration: '8주',
        description: '이제 막 헬스를 시작한 분들을 위한 기본 근력 프로그램입니다. 주요 다관절 운동을 통해 전신의 근육을 균형있게 발달시킵니다.',
        exercises: [
            { id: 'squat', name: '스쿼트', type: 'main', targetSets: 3, targetReps: 8, order: 0 },
            { id: 'benchPress', name: '벤치 프레스', type: 'main', targetSets: 3, targetReps: 8, order: 1 },
            { id: 'barbellRow', name: '바벨 로우', type: 'main', targetSets: 3, targetReps: 8, order: 2 },
            { id: 'overheadPress', name: '오버헤드 프레스', type: 'accessory', targetSets: 3, targetReps: 10, order: 3 },
            { id: 'latPulldown', name: '랫 풀다운', type: 'accessory', targetSets: 3, targetReps: 12, order: 4 },
        ]
    },
    {
        name: '4분할 근비대 프로그램',
        goal: '근비대',
        level: '중급',
        duration: '12주',
        description: '각 부위를 주 2회 효과적으로 자극하여 근육 사이즈를 키우는 것을 목표로 하는 중급자용 4분할 프로그램입니다.',
        exercises: [
            // 이 예제에서는 한 파트만 보여줍니다. 실제로는 분할에 맞게 여러 운동이 포함됩니다.
            { id: 'dumbbellBenchPress', name: '덤벨 벤치 프레스', type: 'main', targetSets: 4, targetReps: 12, order: 0 },
            { id: 'inclineDumbbellPress', name: '인클라인 덤벨 프레스', type: 'accessory', targetSets: 3, targetReps: 12, order: 1 },
            { id: 'cableCrossover', name: '케이블 크로스오버', type: 'accessory', targetSets: 3, targetReps: 15, order: 2 },
            { id: 'dips', name: '딥스', type: 'main', targetSets: 3, targetReps: 15, order: 3 },
            { id: 'tricepsPushdown', name: '트라이셉스 푸시다운', type: 'accessory', targetSets: 3, targetReps: 15, order: 4 },
        ]
    },
    {
        name: '고강도 인터벌 체지방 감소 프로그램',
        goal: '체지방 감소',
        level: '고급',
        duration: '6주',
        description: '서킷 트레이닝과 HIIT를 결합하여 짧은 시간 안에 최대한의 칼로리를 소모하고 운동 후에도 대사를 활성화시키는 고급자용 프로그램입니다.',
        exercises: [
            { id: 'burpee', name: '버피 테스트', type: 'main', targetSets: 5, targetReps: 15, order: 0 },
            { id: 'kettlebellSwing', name: '케틀벨 스윙', type: 'main', targetSets: 5, targetReps: 20, order: 1 },
            { id: 'battleRope', name: '배틀 로프', type: 'main', targetSets: 5, targetReps: 30, order: 2, notes: "30초 수행" },
            { id: 'boxJump', name: '박스 점프', type: 'main', targetSets: 5, targetReps: 12, order: 3 },
        ]
    }
]; 