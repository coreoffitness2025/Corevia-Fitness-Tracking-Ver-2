export interface Progress {
  /** 세션 날짜 */
  date: Date | string;

  /** 메인 운동 무게(kg) */
  weight: number;

  /** (기존) 성공 세트 수 */
  successSets: number;

  /** 🔥 새 필드 – 세트 상세 */
  sets: {
    reps: number;
    isSuccess: boolean;
  }[];
}
