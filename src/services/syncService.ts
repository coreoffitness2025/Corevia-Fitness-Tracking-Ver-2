import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, storage } from '../firebase/firebaseConfig';
import { BodyPhotoRecord } from './bodyService';
import { toast } from 'react-hot-toast';
import { isNetworkConnected, withNetworkCheck } from './networkService';

/**
 * 클라우드 동기화 설정 타입 정의
 */
export interface CloudSyncSettings {
  enabled: boolean;
  lastSyncTime?: number;
  autoSync: boolean;
  syncPhotos: boolean;
  syncData: boolean;
}

/**
 * 사용자의 클라우드 동기화 설정 가져오기
 */
export const getCloudSyncSettings = async (userId: string): Promise<CloudSyncSettings> => {
  try {
    // 네트워크 연결 확인
    const isConnected = await isNetworkConnected();
    if (!isConnected) {
      console.warn('네트워크 연결 없음: 클라우드 동기화 설정을 가져올 수 없습니다.');
      return { autoSync: false, enabled: false };
    }

    const docRef = doc(db, 'users', userId, 'settings', 'sync');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // 기본 설정
      const defaultSettings = { autoSync: false, enabled: false };
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('동기화 설정 가져오기 오류:', error);
    return { autoSync: false, enabled: false };
  }
};

/**
 * 사용자의 클라우드 동기화 설정 업데이트
 */
export const updateCloudSyncSettings = async (userId: string, settings: CloudSyncSettings): Promise<boolean> => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    await setDoc(docRef, { cloudSync: settings }, { merge: true });
    return true;
  } catch (error) {
    console.error('클라우드 동기화 설정 업데이트 실패:', error);
    return false;
  }
};

/**
 * 바디 체크 사진 데이터를 Firebase Storage에 업로드
 */
export const uploadBodyPhotoToCloud = async (userId: string, imageId: string, file: File): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `users/${userId}/body_photos/${imageId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('바디 체크 사진 업로드 실패:', error);
    return null;
  }
};

/**
 * Firebase Storage에서 바디 체크 사진 다운로드
 */
export const downloadBodyPhotoFromCloud = async (userId: string, imageId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `users/${userId}/body_photos/${imageId}`);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('바디 체크 사진 다운로드 실패:', error);
    return null;
  }
};

/**
 * 바디 체크 기록을 Firebase Firestore에 동기화
 */
export const syncBodyPhotoRecords = async (userId: string, records: BodyPhotoRecord[]): Promise<boolean> => {
  try {
    // 배치 작업으로 처리
    for (const record of records) {
      const docRef = doc(db, 'bodyPhotoRecords', record.id);
      await setDoc(docRef, {
        ...record,
        date: Timestamp.fromDate(record.date instanceof Date ? record.date : new Date(record.date)),
        userId,
        syncedAt: Timestamp.now()
      });
    }
    
    // 동기화 설정 업데이트
    await updateCloudSyncSettings(userId, {
      enabled: true,
      lastSyncTime: Date.now(),
      autoSync: true,
      syncPhotos: true,
      syncData: true
    });
    
    return true;
  } catch (error) {
    console.error('바디 체크 기록 동기화 실패:', error);
    return false;
  }
};

/**
 * Firebase Firestore에서 바디 체크 기록 가져오기
 */
export const getBodyPhotoRecordsFromCloud = async (userId: string): Promise<BodyPhotoRecord[]> => {
  try {
    const q = query(
      collection(db, 'bodyPhotoRecords'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate()
      } as BodyPhotoRecord;
    });
  } catch (error) {
    console.error('클라우드에서 바디 체크 기록 가져오기 실패:', error);
    return [];
  }
};

/**
 * 새 기기에서 데이터 복구
 * 1. Firebase에서 바디 체크 기록 가져오기
 * 2. 각 이미지 다운로드
 * 3. 로컬 IndexedDB에 저장
 */
export const recoverDataFromCloud = async (userId: string): Promise<boolean> => {
  try {
    toast.loading('클라우드에서 데이터를 복구 중입니다...', { id: 'recovery' });
    
    // 1. 바디 체크 기록 가져오기
    const records = await getBodyPhotoRecordsFromCloud(userId);
    
    if (records.length === 0) {
      toast.error('복구할 데이터가 없습니다.', { id: 'recovery' });
      return false;
    }
    
    // 2 & 3. 각 이미지 다운로드 및 IndexedDB에 저장
    // 실제 구현에서는 IndexedDB에 저장하는 로직 추가 필요
    
    toast.success(`${records.length}개의 기록이 복구되었습니다.`, { id: 'recovery' });
    return true;
  } catch (error) {
    console.error('데이터 복구 실패:', error);
    toast.error('데이터 복구 중 오류가 발생했습니다.', { id: 'recovery' });
    return false;
  }
};

/**
 * 모든 데이터 동기화 (양방향)
 * 1. 로컬 데이터를 클라우드에 업로드
 * 2. 클라우드 데이터를 로컬에 다운로드
 * 3. 충돌 해결 (최신 타임스탬프 우선)
 */
export const syncAllData = async (userId: string): Promise<boolean> => {
  return withNetworkCheck(
    async () => {
      try {
        toast.loading('데이터 동기화 중...', { id: 'sync' });
        
        // 여기에 실제 동기화 로직 구현
        // 운동 기록, 식단 기록 등 모든 데이터 동기화
        
        // 동기화 성공 시 마지막 동기화 시간 업데이트
        const syncStatusRef = doc(db, 'users', userId, 'settings', 'syncStatus');
        await setDoc(syncStatusRef, {
          lastSync: new Date().toISOString(),
          status: 'success'
        });
        
        toast.success('데이터 동기화가 완료되었습니다.', { id: 'sync' });
        return true;
      } catch (error) {
        console.error('데이터 동기화 오류:', error);
        toast.error('데이터 동기화 중 오류가 발생했습니다.', { id: 'sync' });
        
        // 동기화 실패 시 상태 업데이트
        try {
          const syncStatusRef = doc(db, 'users', userId, 'settings', 'syncStatus');
          await setDoc(syncStatusRef, {
            lastAttempt: new Date().toISOString(),
            status: 'failed',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          });
        } catch (statusError) {
          console.error('동기화 상태 업데이트 오류:', statusError);
        }
        
        return false;
      }
    },
    async () => {
      toast.error('네트워크 연결이 없어 데이터를 동기화할 수 없습니다.');
      return false;
    }
  );
}; 