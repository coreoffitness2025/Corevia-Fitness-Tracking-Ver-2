import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

// 바디 체크 기록 타입 정의
export interface BodyPhotoRecord {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  imageId: string;
  createdAt: Date;
  isNative?: boolean;
  filePath?: string;
}

// IndexedDB 데이터베이스 열기
const openBodyDatabase = async () => {
  return openDB('corevia-fitness-body-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('bodyPhotos')) {
        const store = db.createObjectStore('bodyPhotos', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('imageId', 'imageId', { unique: false });
      }
    }
  });
};

// 바디 체크 기록 저장
export const saveBodyPhotoRecord = async (record: Omit<BodyPhotoRecord, 'id' | 'createdAt'>): Promise<string> => {
  const db = await openBodyDatabase();
  
  const id = uuidv4();
  const fullRecord: BodyPhotoRecord = {
    ...record,
    id,
    createdAt: new Date()
  };
  
  await db.add('bodyPhotos', fullRecord);
  
  return id;
};

// 이미지 정보가 포함된 바디 체크 기록 저장
export const saveBodyPhotoWithImage = async (record: Omit<BodyPhotoRecord, 'id' | 'createdAt'>, imageInfo?: { isNative?: boolean, filePath?: string }): Promise<string> => {
  const db = await openBodyDatabase();
  
  // 하이브리드 이미지 저장 방식 적용
  const id = uuidv4();
  const fullRecord: BodyPhotoRecord = {
    ...record,
    id,
    createdAt: new Date(),
    isNative: imageInfo?.isNative || false,
    filePath: imageInfo?.filePath || undefined
  };
  
  await db.add('bodyPhotos', fullRecord);
  
  return id;
};

// 사용자의 바디 체크 기록 조회
export const getBodyPhotoRecords = async (userId: string): Promise<BodyPhotoRecord[]> => {
  const db = await openBodyDatabase();
  
  const records = await db.getAllFromIndex('bodyPhotos', 'userId', userId);
  
  // 날짜 객체로 변환 (IDB는 날짜를 문자열로 저장할 수 있음)
  return records.map(record => ({
    ...record,
    date: record.date instanceof Date ? record.date : new Date(record.date),
    createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt)
  }));
};

// 특정 바디 체크 기록 조회
export const getBodyPhotoRecord = async (recordId: string): Promise<BodyPhotoRecord | null> => {
  const db = await openBodyDatabase();
  
  const record = await db.get('bodyPhotos', recordId);
  
  if (!record) {
    return null;
  }
  
  // 날짜 객체로 변환
  return {
    ...record,
    date: record.date instanceof Date ? record.date : new Date(record.date),
    createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt)
  };
};

// 바디 체크 기록 삭제
export const deleteBodyPhotoRecord = async (recordId: string): Promise<boolean> => {
  const db = await openBodyDatabase();
  
  await db.delete('bodyPhotos', recordId);
  
  return true;
};

// 바디 체크 기록 업데이트
export const updateBodyPhotoRecord = async (record: BodyPhotoRecord): Promise<boolean> => {
  const db = await openBodyDatabase();
  
  await db.put('bodyPhotos', record);
  
  return true;
};

// 바디 체크 이미지 가져오기
export const getBodyPhotoImage = async (record: BodyPhotoRecord): Promise<string | null> => {
  try {
    // 네이티브 앱 환경에서 갤러리 이미지인 경우
    if (record.isNative && record.filePath) {
      try {
        // Capacitor Filesystem을 동적으로 임포트하여 갤러리 이미지 읽기
        const { Filesystem } = await import('@capacitor/filesystem');
        const { data } = await Filesystem.readFile({
          path: record.filePath
        });
        return `data:image/jpeg;base64,${data}`;
      } catch (fileError) {
        console.error('갤러리 이미지 읽기 실패:', fileError);
        return null;
      }
    }
    
    // 웹 환경에서는 foodService의 getFoodImage 사용 (이미지 스토어 공유)
    const { getFoodImage } = await import('./foodService');
    return getFoodImage(record.imageId);
  } catch (error) {
    console.error('바디 체크 이미지 가져오기 오류:', error);
    return null;
  }
}; 