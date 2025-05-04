/* ---------- 사용자 ---------- */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

/* ---------- 운동 타입 ---------- */
export type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg';

export interface ExerciseSet {
  reps: number;
  isSuccess: boolean;
}

export interface MainExercise {
  part: ExercisePart;
  weight: number;
  sets: ExerciseSet[];
}

export interface AccessoryExercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
}

/* ---------- 세션 ---------- */
export interface Session {
  id?: string;
  userId: string;
  date: Date | string;
  part: ExercisePart;
  mainExercise: MainExercise;
  accessoryExercises?: AccessoryExercise[];
  notes?: string;
  isAllSuccess?: boolean;
}

/* ---------- 그래프용 진행 데이터 ---------- */
export interface Progress {
  date: Date | string;
  weight: number;
  isSuccess: boolean;
  sets: Array<{
    reps: number;
    isSuccess: boolean;
  }>;
  
  // 추가된 속성들
  accessoryExercises?: Array<{
    name: string;
    sets?: Array<{
      reps: number;
      weight: number;
    }>;
    weight?: number;
    reps?: number;
  }>;
  notes?: string;
  successSets?: number;
  accessoryNames?: string[];
}

/* ---------- FAQ ---------- */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  videoUrl?: string;
  type: 'method' | 'sets';
  part?: ExercisePart;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  profile: {
    height: number;      // 키 (cm)
    weight: number;      // 몸무게 (kg)
    age: number;         // 나이
    gender: 'male' | 'female';  // 성별
    experience: {        // 운동 경력
      years: number;     // 운동 경력 (년)
      level: 'beginner' | 'intermediate' | 'advanced';  // 운동 수준
      squat: {           // 스쿼트 기록
        maxWeight: number;  // 최대 중량 (kg)
        maxReps: number;    // 최대 횟수
      }
    }
  }
}
