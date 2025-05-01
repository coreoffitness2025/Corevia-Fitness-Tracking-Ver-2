import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ExercisePart, Progress, Session } from '../types';

/** 진행 데이터: 최근 N회(기본 20) */
export const getProgressData = async (
  uid: string,
  part: ExercisePart,
  limitCount = 20
): Promise<Progress[]> => {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', uid),
    where('part', '==', part),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const d = doc.data() as Session & { date: Timestamp };

    // ▶︎ 성공 세트 수 계산
    const successSets = d.mainExercise.sets.filter((s) => s.isSuccess).length;

    return {
      date: d.date.toDate(),           // 날짜
      weight: d.mainExercise.weight,   // 사용한 무게
      successSets,                     // 성공 세트 수 (0~5)
      sets: d.mainExercise.sets,       // 세트 상세 (reps, isSuccess)
      isSuccess: successSets === 5     // 5세트 모두 성공 여부
    };
  });
};
