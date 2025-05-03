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
