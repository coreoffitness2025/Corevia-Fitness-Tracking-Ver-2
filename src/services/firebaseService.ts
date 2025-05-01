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
    const successSets = d.mainExercise.sets.filter((s) => s.isSuccess).length;

    return {
      date: d.date.toDate(),
      weight: d.mainExercise.weight,
      successSets,
      sets: d.mainExercise.sets,
      isSuccess: successSets === 5
    };
  });
};
