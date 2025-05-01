export interface Progress {
  /** 세션 날짜 */
  date: Date | string;

  /** 메인 운동 무게(kg) */
  weight: number;

  /** 성공 세트 수(0 ~ 5) */
  successSets: number;

  /** 모든 세트 상세 */
  sets: { reps: number; isSuccess: boolean }[];

  /** 🔥 추가: 그날 전체 성공 여부 (successSets === 5) */
  isSuccess: boolean;
}
