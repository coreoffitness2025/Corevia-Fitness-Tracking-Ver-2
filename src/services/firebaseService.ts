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
  return snap.docs.map((d) => {
    const s = d.data() as Session & { date: Timestamp };
    return {
      date: s.date.toDate(),
      weight: s.mainExercise.weight,
      sets: s.mainExercise.sets            // ⬅️ 그대로 내려줌
    };
  });
};
