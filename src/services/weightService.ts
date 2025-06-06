import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// 체중 기록 인터페이스
export interface WeightRecord {
  id: string;
  userId: string;
  date: Date;
  weight: number;
  notes?: string;
  createdAt: Date;
}

/**
 * 체중 기록을 저장합니다.
 * @param userId 사용자 ID
 * @param weight 체중 (kg)
 * @param date 날짜
 * @param notes 메모 (선택사항)
 * @returns 저장된 기록의 ID
 */
export const saveWeightRecord = async (
  userId: string,
  weight: number,
  date: Date = new Date(),
  notes?: string
): Promise<string> => {
  try {
    const weightData = {
      userId,
      date: Timestamp.fromDate(date),
      weight,
      notes: notes || null,
      createdAt: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(db, 'weightRecords'), weightData);
    console.log('체중 기록 저장 완료:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('체중 기록 저장 오류:', error);
    throw error;
  }
};

/**
 * 사용자의 체중 기록 이력을 가져옵니다.
 * @param userId 사용자 ID
 * @returns 체중 기록 배열
 */
export const getWeightHistory = async (userId: string): Promise<WeightRecord[]> => {
  try {
    const weightQuery = query(
      collection(db, 'weightRecords'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(weightQuery);
    
    const records: WeightRecord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        userId: data.userId,
        date: data.date.toDate(),
        weight: data.weight,
        notes: data.notes || undefined,
        createdAt: data.createdAt.toDate()
      });
    });

    return records;
  } catch (error) {
    console.error('체중 기록 조회 오류:', error);
    throw error;
  }
}; 