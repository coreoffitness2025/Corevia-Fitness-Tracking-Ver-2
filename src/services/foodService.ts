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
 * 로컬 이미지를 관리하기 위한 유틸리티 함수
 */
export const saveLocalImage = (imageId: string, dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 로컬 스토리지에 이미지 저장
      localStorage.setItem(`food_image_${imageId}`, dataUrl);
      console.log(`이미지가 로컬 저장소에 저장됨: food_image_${imageId}`);
      
      // 이미지 ID 반환 (실제 URL이 아닌 로컬 식별자)
      resolve(imageId);
    } catch (error) {
      console.error('로컬 이미지 저장 실패:', error);
      reject(error);
    }
  });
};

/**
 * 로컬 이미지 가져오기
 */
export const getLocalImage = (imageId: string): string | null => {
  // 로컬 스토리지에서 이미지 데이터 가져오기
  if (imageId.startsWith('local_')) {
    return localStorage.getItem(`food_image_${imageId}`) || null;
  }
  return null;
};

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
  // 로컬 이미지인 경우 처리
  if (foodData.imageUrl && foodData.imageUrl.startsWith('local_')) {
    // 이미지 URL은 그대로 유지 (로컬 식별자)
    console.log(`로컬 이미지 식별자를 사용하여 식단 기록 저장: ${foodData.imageUrl}`);
  }
  
  const docRef = await addDoc(collection(db, 'foods'), foodData);
  return {
    id: docRef.id,
    ...foodData
  };
}; 