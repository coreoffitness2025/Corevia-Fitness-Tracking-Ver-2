// 네이티브 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { WeightRecord } from '../types';

export const getWeightHistory = async (userId: string): Promise<WeightRecord[]> => {
  try {
    const { docs } = await FirebaseFirestore.getCollection({
      collection: 'weightRecords',
      queries: [
        { type: 'where', fieldPath: 'userId', operator: '==', value: userId },
        { type: 'orderBy', fieldPath: 'date', direction: 'asc' },
      ],
    });
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data,
      date: new Date(doc.data.date.seconds * 1000),
      createdAt: new Date(doc.data.createdAt.seconds * 1000),
    } as WeightRecord));
  } catch (error) {
    console.error("체중 기록 조회 오류:", error);
    throw error;
  }
};

export const saveWeightRecord = async (userId: string, weight: number, date: Date = new Date(), notes?: string): Promise<string> => {
  try {
    const weightData = {
      userId,
      date,
      weight,
      notes: notes || null,
      createdAt: new Date(),
    };
    const { id } = await FirebaseFirestore.addDocument({
      collection: 'weightRecords',
      data: weightData,
    });
    return id;
  } catch (error) {
    console.error("체중 기록 저장 오류:", error);
    throw error;
  }
}; 