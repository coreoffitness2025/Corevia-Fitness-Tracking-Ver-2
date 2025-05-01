export const getProgressData = async (
  userId: string,
  part: ExercisePart,
  limitCount = 50        // 기본 50, GraphPage는 10으로 호출
): Promise<Progress[]> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(limitCount)   // 🔥
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Session & { date: Timestamp };
      return {
        date: data.date.toDate(),
        weight: data.mainExercise.weight,
        successSets: data.mainExercise.sets.filter((s) => s.isSuccess).length
      };
    });
  } catch (e) {
    console.error('progress fetch error', e);
    return [];
  }
};
