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
  successSets: number;
  isSuccess: boolean;
  sets: ExerciseSet[];        // ✅ 세트 배열
  accessoryNames: string[];   // ✅ 보조 운동 이름 목록
}

/* ---------- FAQ ---------- */
export interface FAQ {
  id: string;
  part: ExercisePart;
  question: string;
  answer: string;
  videoUrl?: string;
}
