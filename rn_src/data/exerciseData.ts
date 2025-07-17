export interface Exercise {
  id: string;
  name: string;
  description: string;
  part: 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps' | 'abs' | 'cardio';
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  equipment: string[]; // 추가
  muscles: string[]; // 추가
  videoUrl?: string; // 추가
}

export const EXERCISE_DATA: Exercise[] = [
  {
    id: 'bench-press',
    name: '벤치 프레스',
    description: '가슴 근육을 발달시키는 대표적인 운동입니다.',
    part: 'chest',
    level: 'intermediate',
    instructions: [
      '벤치에 누워 엉덩이와 어깨를 단단히 고정합니다.',
      '어깨너비보다 약간 넓게 바벨을 잡습니다.',
      '가슴 중앙까지 바벨을 천천히 내리고, 폭발적으로 밀어 올립니다.',
    ],
    equipment: ['바벨', '벤치'],
    muscles: ['대흉근', '전면 삼각근', '상완 삼두근'],
    videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE'
  },
  {
    id: 'squat',
    name: '스쿼트',
    description: '하체 근육을 강화하는 복합적인 운동입니다.',
    part: 'leg',
    level: 'beginner',
    instructions: [
      '넓은 발을 베이스로 두고, 엉덩이와 허리를 버티며 무릎을 앞으로 빼면서 내려갑니다.',
      '무릎이 벽에 닿거나 넘어지지 않도록 주의합니다.',
      '무릎이 벽에 닿거나 넘어지지 않도록 주의합니다.',
    ],
    equipment: ['바벨', '벤치'],
    muscles: ['대퇴사두근', '대퇴이두근', '대퇴두근', '대퇴뒤근'],
    videoUrl: 'https://www.youtube.com/watch?v=d_7H53l4u_c'
  },
  {
    id: 'deadlift',
    name: '데드리프트',
    description: '무게를 들어 올리는 운동입니다.',
    part: 'back',
    level: 'advanced',
    instructions: [
      '바벨을 몸 중앙에 위치시킵니다.',
      '몸을 굽혀 바벨을 잡습니다.',
      '허리를 버티고 엉덩이를 뒤로 빼면서 무게를 들어올립니다.',
    ],
    equipment: ['바벨'],
    muscles: ['대흉근', '뒷면 삼각근', '대퇴사두근', '대퇴이두근', '대퇴두근', '대퇴뒤근'],
    videoUrl: 'https://www.youtube.com/watch?v=d_7H53l4u_c'
  },
  // Add more exercises as needed
]; 