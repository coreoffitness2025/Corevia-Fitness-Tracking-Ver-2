import { Food } from '../types';
import { openDB } from 'idb';
// Firestore 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
// Storage 플러그인 import
import { FirebaseStorage, GetDownloadUrlOptions, UploadFileOptions } from '@capacitor-firebase/storage';

// 웹 SDK 관련 import는 모두 제거되었습니다.

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
    await FirebaseFirestore.addDocument({
      collection: 'imageReferences',
      data: {
        foodId,
        imageId,
        createdAt: new Date()
      }
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
 * 특정 날짜의 식단 기록을 가져옵니다. (플러그인 사용)
 */
export const fetchFoodsByDate = async (userId: string, date: Date): Promise<Food[]> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const { docs } = await FirebaseFirestore.getCollection({
    collection: 'foods',
    queries: [
      {
        type: 'where',
        fieldPath: 'userId',
        operator: '==',
        value: userId,
      },
      {
        type: 'where',
        fieldPath: 'date',
        operator: '>=',
        value: startDate,
      },
      {
        type: 'where',
        fieldPath: 'date',
        operator: '<=',
        value: endDate,
      },
      {
        type: 'orderBy',
        fieldPath: 'date',
        direction: 'desc',
      },
    ],
  });

  return docs.map((doc) => {
    const data = doc.data;
    return {
      id: doc.id,
      userId: data.userId,
      date: new Date(data.date.seconds * 1000), // Timestamp 변환
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      imageUrl: data.imageUrl,
      notes: data.notes,
    };
  });
};

/**
 * 새로운 식단을 저장합니다. (플러그인 사용)
 */
export const saveFoodRecord = async (foodData: Omit<Food, 'id'>): Promise<Food> => {
  // 로컬 이미지인 경우 처리
  if (foodData.imageUrl && foodData.imageUrl.startsWith('local_')) {
    // 이미지 URL은 그대로 유지 (로컬 식별자)
    console.log(`로컬 이미지 식별자를 사용하여 식단 기록 저장: ${foodData.imageUrl}`);
  }
  
  const result = await FirebaseFirestore.addDocument({
    collection: 'foods',
    data: foodData,
  });
  
  // 이미지 참조 저장 (이미지 ID와 식단 ID 연결)
  if (foodData.imageUrl && foodData.imageUrl.startsWith('local_')) {
    await saveImageReference(result.id, foodData.imageUrl);
  }
  
  return {
    id: result.id,
    ...foodData
  };
};

// 식단 기록 저장 함수 (플러그인 사용)
export const saveFoodEntry = async (
  userId: string,
  foodData: Omit<Food, 'id' | 'imageUrl'> & { imageFile?: File }
): Promise<string> => {
  try {
    let imageUrl = '';
    
    // 이미지 파일이 있으면 네이티브 플러그인을 통해 스토리지에 업로드
    if (foodData.imageFile) {
      const timestamp = new Date().getTime();
      const path = `food-images/${userId}/${timestamp}_${foodData.imageFile.name}`;
      
      // 파일 업로드
      const uploadOptions: UploadFileOptions = {
        path,
        blob: foodData.imageFile,
      };
      await FirebaseStorage.uploadFile(uploadOptions);
      
      // 업로드된 이미지 URL 가져오기
      const urlOptions: GetDownloadUrlOptions = { path };
      const { url } = await FirebaseStorage.getDownloadUrl(urlOptions);
      imageUrl = url;
      console.log('네이티브 플러그인을 통해 이미지 업로드 성공:', imageUrl);
    } else if (foodData.image && typeof foodData.image === 'string' && foodData.image.startsWith('data:image')) {
      // Base64 이미지는 그대로 사용 (이 부분은 변경 없음)
      imageUrl = foodData.image;
    }
    
    // Firestore에 식단 데이터 저장
    const foodEntry = {
      userId,
      name: foodData.name,
      calories: foodData.calories || 0,
      date: foodData.date || FirebaseFirestore.Timestamp.fromDate(new Date()),
      description: foodData.description || '',
      imageUrl,
      nutrients: foodData.nutrients || null,
      mealType: foodData.mealType || '식사 기록'
    };
    
    // Firestore에 기록 저장 (이미 네이티브로 전환됨)
    const docRef = await FirebaseFirestore.addDocument({
      collection: 'foods',
      data: { ...foodEntry, imageUrl },
    });
    console.log('식단 기록 저장 성공:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('식단 기록 저장 오류:', error);
    throw error;
  }
};

// 식단 기록 조회 함수 (플러그인 사용)
export const getFoodEntries = async (userId: string, startDate?: Date, endDate?: Date): Promise<Food[]> => {
  const queries: any[] = [
    { type: 'where', fieldPath: 'userId', operator: '==', value: userId },
    { type: 'orderBy', fieldPath: 'date', direction: 'desc' },
  ];

  if (startDate && endDate) {
    queries.push({ type: 'where', fieldPath: 'date', operator: '>=', value: startDate });
    queries.push({ type: 'where', fieldPath: 'date', operator: '<=', value: endDate });
  }

  const { docs } = await FirebaseFirestore.getCollection({
    collection: 'foods',
    queries,
  });

  const foods: Food[] = docs.map((doc) => {
    const data = doc.data;
    return {
      id: doc.id,
      name: data.name,
      calories: data.calories,
      date: data.date?.seconds ? new Date(data.date.seconds * 1000) : new Date(),
      description: data.description,
      imageUrl: data.imageUrl,
      nutrients: data.nutrients,
      mealType: data.mealType || '식사 기록',
    };
  });
  
  // 이미지 URL에 캐시 방지를 위한 타임스탬프 추가
  for (const food of foods) {
    if (food.imageUrl && !food.imageUrl.startsWith('data:image')) {
      const timestamp = new Date().getTime();
      food.imageUrl = `${food.imageUrl}?t=${timestamp}`;
    }
  }
  
  return foods;
};

// 식단 기록 삭제 함수 (플러그인 사용)
export const deleteFoodEntry = async (userId: string, foodId: string, imageUrl?: string): Promise<void> => {
  try {
    // Firestore에서 기록 삭제
    await FirebaseFirestore.deleteDocument({
      collection: 'foods',
      id: foodId,
    });
    
    // 이미지가 있고 firebase 스토리지 URL인 경우 이미지도 삭제
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // URL에서 경로 추출
        const path = new URL(imageUrl).pathname.split('/o/')[1].split('?')[0];
        const decodedPath = decodeURIComponent(path);
        
        await FirebaseStorage.deleteFile({ path: decodedPath });
        console.log('네이티브 플러그인을 통해 이미지 삭제 성공');
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

// 특정 날짜의 식단 기록을 가져오는 함수 (플러그인 사용)
export const getFoodEntriesByDate = async (userId: string, date: Date): Promise<Food[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { docs } = await FirebaseFirestore.getCollection({
    collection: 'foods',
    queries: [
      { type: 'where', fieldPath: 'userId', operator: '==', value: userId },
      { type: 'where', fieldPath: 'date', operator: '>=', value: startOfDay },
      { type: 'where', fieldPath: 'date', operator: '<=', value: endOfDay },
      { type: 'orderBy', fieldPath: 'date', direction: 'asc' },
    ],
  });

  const foods: Food[] = docs.map((doc) => {
    const data = doc.data;
    return {
      id: doc.id,
      name: data.name,
      calories: data.calories,
      date: data.date?.seconds ? new Date(data.date.seconds * 1000) : new Date(),
      description: data.description,
      imageUrl: data.imageUrl,
      nutrients: data.nutrients,
      mealType: data.mealType || '식사 기록',
    };
  });
  
  // 이미지 URL에 캐시 방지를 위한 타임스탬프 추가
  for (const food of foods) {
    if (food.imageUrl && !food.imageUrl.startsWith('data:image')) {
      const timestamp = new Date().getTime();
      food.imageUrl = `${food.imageUrl}?t=${timestamp}`;
    }
  }
  
  return foods;
};

// 식단 이미지 데이터를 저장 (하이브리드 방식)
export const saveFoodImage = async (imageId: string, userId: string, file: File, imageInfo?: { filePath?: string, isNative?: boolean }): Promise<void> => {
  try {
    // 네이티브 앱 환경이고 파일 경로가 있는 경우 (갤러리 이미지)
    if (imageInfo?.isNative && imageInfo.filePath) {
      // 갤러리 이미지 경로 저장
      await openFoodImagesDatabase().then(db => {
        db.put('foodImages', {
          id: imageId,
          userId,
          filePath: imageInfo.filePath,
          isNative: true,
          data: null, // 데이터는 저장하지 않음 (경로만 저장)
          createdAt: new Date()
        });
      });
      console.log('갤러리 이미지 경로 저장됨:', imageInfo.filePath);
      return;
    }

    // 웹 환경 또는 파일 경로가 없는 경우 (기존 방식)
    const db = await openFoodImagesDatabase();
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    await new Promise<void>((resolve, reject) => {
      reader.onload = async () => {
        try {
          await db.put('foodImages', {
            id: imageId,
            userId,
            data: reader.result,
            isNative: false,
            filePath: null,
            createdAt: new Date()
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
    });
  } catch (error) {
    console.error('이미지 저장 오류:', error);
    throw error;
  }
};

// 식단 이미지를 Firebase Storage에 업로드
export const uploadFoodImageToFirebase = async (imageId: string, userId: string, file: File): Promise<string | null> => {
  try {
    // Firebase Storage 참조 생성
    const storageRef = FirebaseStorage.ref(storage, `users/${userId}/food/${imageId}`);
    
    // 파일 업로드
    const snapshot = await FirebaseStorage.uploadBytes(storageRef, file);
    
    // 다운로드 URL 가져오기
    const downloadURL = await FirebaseStorage.getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase 이미지 업로드 오류:', error);
    return null;
  }
};

// IndexedDB에서 이미지 가져오기 (하이브리드 방식)
export const getFoodImage = async (imageId: string): Promise<string | null> => {
  try {
    const db = await openFoodImagesDatabase();
    const image = await db.get('foodImages', imageId);
    
    if (!image) {
      console.error('이미지를 찾을 수 없음:', imageId);
      return null;
    }

    // 네이티브 앱 환경에서 갤러리 이미지인 경우
    if (image.isNative && image.filePath) {
      try {
        // Capacitor Filesystem을 사용하여 갤러리 이미지 읽기
        const { Filesystem } = await import('@capacitor/filesystem');
        const { data } = await Filesystem.readFile({
          path: image.filePath
        });
        return `data:image/jpeg;base64,${data}`;
      } catch (fileError) {
        console.error('갤러리 이미지 읽기 실패:', fileError);
        return null;
      }
    }
    
    // 웹 환경에서는 저장된 데이터 사용
    return image.data as string;
  } catch (error) {
    console.error('이미지 가져오기 오류:', error);
    return null;
  }
};

// IndexedDB 데이터베이스 열기
const openFoodImagesDatabase = async () => {
  return openDB('corevia-fitness-food-images', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('foodImages')) {
        const store = db.createObjectStore('foodImages', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    }
  });
};

// 식단 기록 업데이트 함수 (플러그인 사용)
export const updateFoodRecord = async (foodId: string, updatedFood: Partial<Food>): Promise<void> => {
    await FirebaseFirestore.updateDocument({
        collection: 'foods',
        id: foodId,
        data: updatedFood,
    });
    console.log('식단 기록이 성공적으로 업데이트되었습니다.');
}; 