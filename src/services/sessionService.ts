// 네이티브 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { Session } from '../types';

export const getLastSession = async (userId: string, part: string): Promise<Session | null> => {
  try {
    const { docs } = await FirebaseFirestore.getCollection({
      collection: 'sessions',
      queries: [
        { type: 'where', fieldPath: 'userId', operator: '==', value: userId },
        { type: 'where', fieldPath: 'part', operator: '==', value: part },
        { type: 'orderBy', fieldPath: 'date', direction: 'desc' },
        { type: 'limit', value: 1 },
      ],
    });

    if (docs.length === 0) {
      return null;
    }

    const data = docs[0].data;
    return {
      ...data,
      date: new Date(data.date.seconds * 1000),
    } as Session;
  } catch (error) {
    console.error('Error getting last session:', error);
    return null;
  }
}; 