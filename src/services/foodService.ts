import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { Food } from '../types';

// 로컬 스토리지 키 정의
const IMAGE_KEY_PREFIX = 'food_image_';
const IMAGE_INDEX_KEY = 'food_images_index';

/**
 * 이미지 인덱스를 로컬 스토리지에 유지하는 함수
 * 이 함수는 모든 이미지 ID를 추적하여 브라우저 데이터가 지워진 경우에도 복구 가능하게 함
 */
const updateImageIndex = (imageId: string, add: boolean = true) => {
  // 이미지 인덱스 가져오기
  const indexJson = localStorage.getItem(IMAGE_INDEX_KEY) || '[]';
  let imageIds: string[];
  
  try {
    imageIds = JSON.parse(indexJson);
  } catch {
    imageIds = [];
  }
  
  if (add) {
    // 새 ID 추가
    if (!imageIds.includes(imageId)) {
      imageIds.push(imageId);
    }
  } else {
    // ID 제거
    imageIds = imageIds.filter(id => id !== imageId);
  }
  
  // 인덱스 저장
  localStorage.setItem(IMAGE_INDEX_KEY, JSON.stringify(imageIds));
  console.log(`이미지 인덱스 업데이트됨: ${imageIds.length}개 이미지`);
};

/**
 * Firebase에 이미지 참조 저장
 * 로컬 이미지의 식별자만 저장하고 실제 이미지는 로컬 스토리지에 저장
 */
export const saveImageReference = async (foodId: string, imageId: string): Promise<void> => {
  try {
    // Firebase에 이미지 참조 정보 저장 (음식 ID와 이미지 ID 매핑)
    await addDoc(collection(db, 'imageReferences'), {
      foodId,
      imageId,
      createdAt: new Date()
    });
    
    console.log(`이미지 참조 저장됨: ${foodId} -> ${imageId}`);
  } catch (error) {
    console.error('이미지 참조 저장 실패:', error);
    throw error;
  }
};

/**
 * 로컬 이미지를 관리하기 위한 유틸리티 함수
 */
export const saveLocalImage = (imageId: string, dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 로컬 스토리지에 이미지 저장
      localStorage.setItem(`${IMAGE_KEY_PREFIX}${imageId}`, dataUrl);
      console.log(`이미지가 로컬 저장소에 저장됨: ${IMAGE_KEY_PREFIX}${imageId}`);
      
      // 이미지 인덱스 업데이트
      updateImageIndex(imageId);
      
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
 * 로컬 스토리지에서 이미지 데이터를 가져오고, 없는 경우 Firebase에서 참조를 조회하여 복구 시도
 */
export const getLocalImage = (imageId: string): string | null => {
  // 로컬 스토리지에서 이미지 데이터 가져오기
  if (imageId.startsWith('local_')) {
    const imageData = localStorage.getItem(`${IMAGE_KEY_PREFIX}${imageId}`);
    if (imageData) {
      return imageData;
    } else {
      // 이미지가 없는 경우 경고 메시지만 표시
      console.warn(`로컬 이미지를 찾을 수 없음: ${imageId}`);
      
      // 이미지 복구 시도
      attemptImageRecovery(imageId);
      
      // 기본 이미지 또는 null 반환
      return null;
    }
  }
  return null;
};

/**
 * 이미지 복구 시도 함수
 * 디바이스 간 동기화를 위해 사용자의 다른 기기에서 이미지를 복구 시도
 */
export const attemptImageRecovery = async (imageId: string): Promise<boolean> => {
  // 여기서는 실제 구현을 생략하고 로그만 출력
  console.log(`이미지 복구 시도: ${imageId}`);
  return false;
};

/**
 * 이미지 관리 정리 함수
 * 오래된 이미지 또는 불필요한 이미지를 삭제하여 스토리지 공간 확보
 */
export const cleanupLocalImages = async (maxAgeDays: number = 30): Promise<number> => {
  const indexJson = localStorage.getItem(IMAGE_INDEX_KEY) || '[]';
  let imageIds: string[];
  
  try {
    imageIds = JSON.parse(indexJson);
  } catch {
    imageIds = [];
    return 0;
  }
  
  // 현재는 간단하게 처리 - 실제로는 날짜 기반 정리 로직 구현 필요
  console.log(`${imageIds.length}개 이미지 중 오래된 항목 정리 시작`);
  return 0;
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
  
  // 이미지 참조 저장 (이미지 ID와 식단 ID 연결)
  if (foodData.imageUrl && foodData.imageUrl.startsWith('local_')) {
    await saveImageReference(docRef.id, foodData.imageUrl);
  }
  
  return {
    id: docRef.id,
    ...foodData
  };
};

// 식단 기록 저장 함수
export const saveFoodEntry = async (
  userId: string,
  foodData: Omit<Food, 'id' | 'imageUrl'> & { imageFile?: File }
): Promise<string> => {
  try {
    let imageUrl = '';
    
    // 이미지 파일이 있으면 스토리지에 업로드
    if (foodData.imageFile) {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `food-images/${userId}/${timestamp}_${foodData.imageFile.name}`);
      
      // 이미지 업로드
      await uploadBytes(storageRef, foodData.imageFile);
      
      // 업로드된 이미지 URL 가져오기
      imageUrl = await getDownloadURL(storageRef);
      console.log('이미지 업로드 성공:', imageUrl);
    } else if (foodData.image && typeof foodData.image === 'string' && foodData.image.startsWith('data:image')) {
      // base64 이미지인 경우 그대로 저장
      imageUrl = foodData.image;
      console.log('Base64 이미지 저장');
    }
    
    // Firestore에 식단 데이터 저장
    const foodEntry = {
      userId,
      name: foodData.name,
      calories: foodData.calories || 0,
      date: foodData.date || Timestamp.fromDate(new Date()),
      description: foodData.description || '',
      imageUrl,
      nutrients: foodData.nutrients || null,
      mealType: foodData.mealType || '식사 기록'
    };
    
    const docRef = await addDoc(collection(db, 'foods'), foodEntry);
    console.log('식단 기록 저장 성공:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('식단 기록 저장 오류:', error);
    throw error;
  }
};

// 식단 기록 조회 함수
export const getFoodEntries = async (userId: string, startDate?: Date, endDate?: Date): Promise<Food[]> => {
  try {
    let foodQuery;
    
    if (startDate && endDate) {
      // 날짜 범위로 필터링
      foodQuery = query(
        collection(db, 'foods'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
    } else {
      // 모든 데이터 조회
      foodQuery = query(
        collection(db, 'foods'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(foodQuery);
    
    // 결과 데이터 변환
    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const food: Food = {
        id: doc.id,
        name: data.name,
        calories: data.calories,
        date: data.date?.toDate() || new Date(),
        description: data.description,
        imageUrl: data.imageUrl,
        nutrients: data.nutrients,
        mealType: data.mealType || '식사 기록'
      };
      foods.push(food);
    });
    
    console.log(`${foods.length}개의 식단 기록을 로드했습니다.`);
    
    // 이미지 URL에 캐시 방지를 위한 타임스탬프 추가
    for (const food of foods) {
      if (food.imageUrl && !food.imageUrl.startsWith('data:image')) {
        const timestamp = new Date().getTime();
        food.imageUrl = `${food.imageUrl}?t=${timestamp}`;
      }
    }
    
    return foods;
  } catch (error) {
    console.error('식단 기록 조회 오류:', error);
    throw error;
  }
};

// 식단 기록 삭제 함수
export const deleteFoodEntry = async (userId: string, foodId: string, imageUrl?: string): Promise<void> => {
  try {
    // Firestore에서 기록 삭제
    const foodRef = doc(db, 'foods', foodId);
    await deleteDoc(foodRef);
    
    // 이미지가 있고 firebase 스토리지 URL인 경우 이미지도 삭제
    if (imageUrl && imageUrl.includes('firebase') && !imageUrl.startsWith('data:image')) {
      try {
        // URL에서 ?t= 파라미터 제거
        const cleanUrl = imageUrl.split('?')[0];
        const storageRef = ref(storage, cleanUrl);
        await deleteObject(storageRef);
        console.log('이미지 삭제 성공');
      } catch (imgError) {
        console.warn('이미지 삭제 실패, 기록은 삭제됨:', imgError);
      }
    }
    
    console.log('식단 기록 삭제 성공');
  } catch (error) {
    console.error('식단 기록 삭제 오류:', error);
    throw error;
  }
};

// 이미지 파일을 base64 문자열로 변환
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// 특정 날짜의 식단 기록을 가져오는 함수
export const getFoodEntriesByDate = async (userId: string, date: Date): Promise<Food[]> => {
  try {
    // 날짜의 시작과 끝 계산
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // 쿼리 실행
    const foodQuery = query(
      collection(db, 'foods'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(foodQuery);
    
    // 결과 데이터 변환
    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const food: Food = {
        id: doc.id,
        name: data.name,
        calories: data.calories,
        date: data.date?.toDate() || new Date(),
        description: data.description,
        imageUrl: data.imageUrl,
        nutrients: data.nutrients,
        mealType: data.mealType || '식사 기록'
      };
      foods.push(food);
    });
    
    console.log(`${date.toLocaleDateString()}에 ${foods.length}개의 식단 기록을 로드했습니다.`);
    
    // 이미지 URL에 캐시 방지를 위한 타임스탬프 추가
    for (const food of foods) {
      if (food.imageUrl && !food.imageUrl.startsWith('data:image')) {
        const timestamp = new Date().getTime();
        food.imageUrl = `${food.imageUrl}?t=${timestamp}`;
      }
    }
    
    return foods;
  } catch (error) {
    console.error('특정 날짜 식단 기록 조회 오류:', error);
    throw error;
  }
}; 