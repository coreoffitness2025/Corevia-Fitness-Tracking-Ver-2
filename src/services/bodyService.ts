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