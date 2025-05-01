export interface Progress {
  date: Date | string;
  weight: number;
  successSets: number;
  isSuccess: boolean;
  sets: ExerciseSet[];        // 🔸 세트 배열 (그래프 상세용)
  accessoryNames: string[];   // 🔸 보조 운동 이름
}
