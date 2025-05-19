// IndexedDB를 사용하여 식단 기록 및 이미지를 로컬에 저장하는 유틸리티

const DB_NAME = 'coreviaFoodDB';
const DB_VERSION = 1;
const FOOD_STORE = 'foodRecords';
const IMAGE_STORE = 'foodImages';

interface FoodRecord {
  id?: number;
  userId: string;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: Date;
  imageId?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: Date;
}

// IndexedDB 초기화
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB 오류:', event);
      reject('IndexedDB를 열 수 없습니다.');
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 식단 기록 저장소 생성
      if (!db.objectStoreNames.contains(FOOD_STORE)) {
        const foodStore = db.createObjectStore(FOOD_STORE, { keyPath: 'id', autoIncrement: true });
        foodStore.createIndex('userId', 'userId', { unique: false });
        foodStore.createIndex('date', 'date', { unique: false });
        foodStore.createIndex('mealType', 'mealType', { unique: false });
        foodStore.createIndex('userIdAndDate', ['userId', 'date'], { unique: false });
      }
      
      // 이미지 저장소 생성
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        const imageStore = db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
        imageStore.createIndex('userId', 'userId', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

// 식단 기록 저장
export const saveFoodRecord = async (food: FoodRecord): Promise<number> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FOOD_STORE], 'readwrite');
      const store = transaction.objectStore(FOOD_STORE);
      
      // 날짜 객체가 제대로 저장되도록 변환
      const foodToSave = {
        ...food,
        date: food.date.toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const request = store.add(foodToSave);
      
      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest).result as number;
        resolve(id);
      };
      
      request.onerror = (event) => {
        console.error('식단 저장 오류:', event);
        reject('식단을 저장할 수 없습니다.');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('식단 저장 중 오류 발생:', error);
    throw error;
  }
};

// 이미지 저장
export const saveFoodImage = async (imageId: string, userId: string, imageBlob: Blob): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_STORE);
      
      const request = store.put({
        id: imageId,
        userId,
        blob: imageBlob,
        createdAt: new Date().toISOString()
      });
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('이미지 저장 오류:', event);
        reject('이미지를 저장할 수 없습니다.');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('이미지 저장 중 오류 발생:', error);
    throw error;
  }
};

// 특정 날짜의 식단 기록 조회
export const getFoodRecordsByDate = async (userId: string, date: Date): Promise<FoodRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FOOD_STORE], 'readonly');
      const store = transaction.objectStore(FOOD_STORE);
      const index = store.index('userIdAndDate');
      
      // 날짜 범위 계산 (하루)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const range = IDBKeyRange.bound(
        [userId, startDate.toISOString()],
        [userId, endDate.toISOString()]
      );
      
      const request = index.getAll(range);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        // ISO 문자열을 다시 Date 객체로 변환
        const foods = result.map(food => ({
          ...food,
          date: new Date(food.date),
          createdAt: new Date(food.createdAt)
        }));
        resolve(foods);
      };
      
      request.onerror = (event) => {
        console.error('식단 조회 오류:', event);
        reject('식단 기록을 조회할 수 없습니다.');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('식단 조회 중 오류 발생:', error);
    throw error;
  }
};

// 이미지 조회
export const getFoodImage = async (imageId: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], 'readonly');
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.get(imageId);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('이미지 조회 오류:', event);
        reject('이미지를 조회할 수 없습니다.');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('이미지 조회 중 오류 발생:', error);
    throw error;
  }
};

// 식단 기록 삭제 (이미지 함께 삭제)
export const deleteFoodRecord = async (id: number): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FOOD_STORE, IMAGE_STORE], 'readwrite');
      const foodStore = transaction.objectStore(FOOD_STORE);
      
      // 먼저 식단 기록 조회
      const getRequest = foodStore.get(id);
      
      getRequest.onsuccess = (event) => {
        const food = (event.target as IDBRequest).result;
        if (!food) {
          resolve();
          return;
        }
        
        // 식단 기록 삭제
        const deleteRequest = foodStore.delete(id);
        
        deleteRequest.onsuccess = () => {
          // 이미지 있으면 함께 삭제
          if (food.imageId) {
            const imageStore = transaction.objectStore(IMAGE_STORE);
            imageStore.delete(food.imageId);
          }
          resolve();
        };
        
        deleteRequest.onerror = (event) => {
          console.error('식단 삭제 오류:', event);
          reject('식단을 삭제할 수 없습니다.');
        };
      };
      
      getRequest.onerror = (event) => {
        console.error('식단 조회 오류:', event);
        reject('식단을 조회할 수 없습니다.');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('식단 삭제 중 오류 발생:', error);
    throw error;
  }
};

// DB 상태 확인 (디버깅용)
export const checkDbStatus = async (): Promise<{ status: string, stores: string[] }> => {
  try {
    const db = await initDB();
    const stores = Array.from(db.objectStoreNames);
    db.close();
    return {
      status: '정상',
      stores
    };
  } catch (error) {
    console.error('DB 상태 확인 오류:', error);
    return {
      status: '오류',
      stores: []
    };
  }
};

export type { FoodRecord }; 