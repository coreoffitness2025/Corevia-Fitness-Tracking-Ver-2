import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB 스키마 정의
 */
interface CoreViaDB extends DBSchema {
  'food-cache': {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
    indexes: { 'by-timestamp': number };
  };
  'workout-cache': {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
    indexes: { 'by-timestamp': number };
  };
  'user-cache': {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  'image-cache': {
    key: string;
    value: {
      dataUrl: string;
      timestamp: number;
      expiresAt: number;
    };
  };
}

// 캐시 만료 시간 (밀리초)
const CACHE_DURATIONS = {
  FOOD: 24 * 60 * 60 * 1000, // 24시간
  WORKOUT: 24 * 60 * 60 * 1000, // 24시간
  USER: 7 * 24 * 60 * 60 * 1000, // 7일
  IMAGE: 7 * 24 * 60 * 60 * 1000 // 7일
};

// DB 인스턴스
let dbInstance: IDBPDatabase<CoreViaDB> | null = null;

/**
 * IndexedDB 인스턴스 가져오기
 */
export const getDB = async (): Promise<IDBPDatabase<CoreViaDB>> => {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<CoreViaDB>('corevia-cache-db', 1, {
    upgrade(db) {
      // 식단 캐시 저장소
      if (!db.objectStoreNames.contains('food-cache')) {
        const foodStore = db.createObjectStore('food-cache', { keyPath: 'key' });
        foodStore.createIndex('by-timestamp', 'timestamp');
      }
      
      // 운동 캐시 저장소
      if (!db.objectStoreNames.contains('workout-cache')) {
        const workoutStore = db.createObjectStore('workout-cache', { keyPath: 'key' });
        workoutStore.createIndex('by-timestamp', 'timestamp');
      }
      
      // 사용자 정보 캐시 저장소
      if (!db.objectStoreNames.contains('user-cache')) {
        db.createObjectStore('user-cache', { keyPath: 'key' });
      }
      
      // 이미지 캐시 저장소
      if (!db.objectStoreNames.contains('image-cache')) {
        db.createObjectStore('image-cache', { keyPath: 'key' });
      }
    }
  });
  
  return dbInstance;
};

/**
 * 캐시에 데이터 저장
 * @param storeName 저장소 이름
 * @param key 캐시 키
 * @param data 캐시할 데이터
 * @param duration 캐시 만료 시간 (밀리초)
 */
export const setCache = async (
  storeName: 'food-cache' | 'workout-cache' | 'user-cache' | 'image-cache',
  key: string,
  data: any,
  duration: number = CACHE_DURATIONS.FOOD
): Promise<void> => {
  try {
    const db = await getDB();
    const timestamp = Date.now();
    const expiresAt = timestamp + duration;
    
    if (storeName === 'image-cache') {
      await db.put('image-cache', {
        key,
        dataUrl: data,
        timestamp,
        expiresAt
      });
    } else {
      await db.put(storeName, {
        key,
        data,
        timestamp,
        expiresAt
      });
    }
  } catch (error) {
    console.error(`캐시 저장 중 오류 (${storeName}/${key}):`, error);
  }
};

/**
 * 캐시에서 데이터 가져오기
 * @param storeName 저장소 이름
 * @param key 캐시 키
 * @returns 캐시된 데이터 또는 null (만료된 경우)
 */
export const getCache = async <T>(
  storeName: 'food-cache' | 'workout-cache' | 'user-cache' | 'image-cache',
  key: string
): Promise<T | null> => {
  try {
    const db = await getDB();
    const cachedItem = await db.get(storeName, key);
    
    if (!cachedItem) return null;
    
    const now = Date.now();
    if (cachedItem.expiresAt < now) {
      // 캐시가 만료되었으면 삭제
      await db.delete(storeName, key);
      return null;
    }
    
    return (storeName === 'image-cache' ? cachedItem.dataUrl : cachedItem.data) as T;
  } catch (error) {
    console.error(`캐시 조회 중 오류 (${storeName}/${key}):`, error);
    return null;
  }
};

/**
 * 캐시 키로 시작하는 모든 캐시 항목 가져오기
 * @param storeName 저장소 이름
 * @param keyPrefix 캐시 키 접두사
 * @returns 캐시된 데이터 배열
 */
export const getCacheByPrefix = async <T>(
  storeName: 'food-cache' | 'workout-cache' | 'user-cache',
  keyPrefix: string
): Promise<T[]> => {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const allItems = await store.getAll();
    const now = Date.now();
    
    // 만료되지 않고 키 접두사가 일치하는 항목만 필터링
    const validItems = allItems
      .filter(item => item.key.startsWith(keyPrefix) && item.expiresAt > now)
      .map(item => item.data);
    
    return validItems as T[];
  } catch (error) {
    console.error(`캐시 접두사 조회 중 오류 (${storeName}/${keyPrefix}):`, error);
    return [];
  }
};

/**
 * 오래된 캐시 정리
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  try {
    const db = await getDB();
    const now = Date.now();
    const storeNames: (keyof CoreViaDB)[] = ['food-cache', 'workout-cache', 'user-cache', 'image-cache'];
    
    for (const storeName of storeNames) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const allItems = await store.getAll();
      
      // 만료된 항목 삭제
      for (const item of allItems) {
        if (item.expiresAt < now) {
          await store.delete(item.key);
        }
      }
    }
    
    console.log('만료된 캐시 정리 완료');
  } catch (error) {
    console.error('캐시 정리 중 오류:', error);
  }
};

/**
 * 식단 데이터 캐싱 헬퍼 함수
 * @param userId 사용자 ID
 * @param date 날짜 문자열 (YYYY-MM-DD)
 * @param foodData 식단 데이터
 */
export const cacheFoodData = async (userId: string, date: string, foodData: any[]): Promise<void> => {
  await setCache('food-cache', `food_${userId}_${date}`, foodData, CACHE_DURATIONS.FOOD);
};

/**
 * 식단 데이터 캐시에서 가져오기
 * @param userId 사용자 ID
 * @param date 날짜 문자열 (YYYY-MM-DD)
 */
export const getCachedFoodData = async <T>(userId: string, date: string): Promise<T | null> => {
  return getCache<T>('food-cache', `food_${userId}_${date}`);
};

/**
 * 이미지 캐싱 헬퍼 함수
 * @param imageId 이미지 ID
 * @param dataUrl 이미지 dataUrl
 */
export const cacheImageData = async (imageId: string, dataUrl: string): Promise<void> => {
  await setCache('image-cache', `img_${imageId}`, dataUrl, CACHE_DURATIONS.IMAGE);
};

/**
 * 이미지 캐시에서 가져오기
 * @param imageId 이미지 ID
 */
export const getCachedImageData = async (imageId: string): Promise<string | null> => {
  return getCache<string>('image-cache', `img_${imageId}`);
}; 