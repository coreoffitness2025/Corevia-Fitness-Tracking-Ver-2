import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Food } from '../types';

/**
 * 특정 날짜의 식단 기록을 가져옵니다.
 */
export const fetchFoodsByDate = async (userId: string, date: Date): Promise<Food[]> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'foods'),
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const foodData: Food[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    foodData.push({
      id: doc.id,
      userId: data.userId,
      date: data.date.toDate(),
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      imageUrl: data.imageUrl,
      notes: data.notes
    });
  });
  
  return foodData;
};

/**
 * 새로운 식단을 저장합니다.
 */
export const saveFoodRecord = async (foodData: Omit<Food, 'id'>): Promise<Food> => {
  const docRef = await addDoc(collection(db, 'foods'), foodData);
  return {
    id: docRef.id,
    ...foodData
  };
}; 