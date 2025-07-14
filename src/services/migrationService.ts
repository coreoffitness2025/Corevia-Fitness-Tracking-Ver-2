// 네이티브 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';

/**
 * 데이터 마이그레이션 상태를 추적하는 인터페이스
 */
interface MigrationState {
  userId: string;
  lastMigration?: string;
  versions: { 
    [key: string]: {
      completedAt: Date;
      success: boolean;
      details?: string;
    }
  };
}

/**
 * 데이터베이스 스키마 버전
 * 새 버전을 추가할 때마다 이 객체를 업데이트하세요
 */
export const DB_VERSIONS = {
  INITIAL: '1.0.0',
  ADD_PREMIUM_FLAG: '1.0.1',
  ADD_MUSCLE_MASS: '1.0.2',
  CURRENT: '1.0.2' // 항상 최신 버전으로 유지
};

/**
 * 사용자의 데이터 마이그레이션 상태 가져오기
 * @param userId 사용자 ID
 * @returns 마이그레이션 상태 객체
 */
export const getMigrationState = async (userId: string): Promise<MigrationState | null> => {
  try {
    const { data } = await FirebaseFirestore.getDocument({
      collection: 'migrations',
      id: userId,
    });
    return data || { userId, versions: {} };
  } catch (error) {
    console.error('마이그레이션 상태 로드 중 오류:', error);
    return null;
  }
};

/**
 * 사용자의 데이터 마이그레이션 상태 업데이트
 * @param userId 사용자 ID
 * @param version 마이그레이션 버전
 * @param success 성공 여부
 * @param details 상세 정보
 */
export const updateMigrationState = async (
  userId: string,
  version: string,
  success: boolean,
  details?: string
): Promise<void> => {
  try {
    const migrationData = {
      lastMigration: version,
      [`versions.${version}`]: { completedAt: new Date(), success, details },
    };
    await FirebaseFirestore.updateDocument({
      collection: 'migrations',
      id: userId,
      data: migrationData,
      merge: true,
    });
  } catch (error) {
    console.error('마이그레이션 상태 업데이트 중 오류:', error);
  }
};

/**
 * 사용자 프로필에 isPremium 필드 추가 마이그레이션
 * @param userId 사용자 ID
 */
export const migrateAddPremiumFlag = async (userId: string): Promise<boolean> => {
  try {
    const { data: userData, exists } = await FirebaseFirestore.getDocument({
      collection: 'users',
      id: userId,
    });

    if (!exists) {
      console.error('사용자 프로필을 찾을 수 없습니다.');
      return false;
    }
    
    if (userData.isPremium === undefined) {
      await FirebaseFirestore.updateDocument({
        collection: 'users',
        id: userId,
        data: { isPremium: false },
      });
      
      console.log('프리미엄 플래그 마이그레이션 완료:', userId);
      return true;
    } else {
      console.log('프리미엄 플래그가 이미 존재함:', userId);
      return true; // 이미 필드가 있으므로 성공으로 간주
    }
  } catch (error) {
    console.error('프리미엄 플래그 마이그레이션 중 오류:', error);
    return false;
  }
};

/**
 * 모든 사용자에 대해 특정 마이그레이션 실행
 * @param migrationFn 마이그레이션 함수
 * @param versionTag 버전 태그
 */
export const runMigrationForAllUsers = async (
  migrationFn: (userId: string) => Promise<boolean>,
  versionTag: string
): Promise<{ success: number, failed: number }> => {
  const result = { success: 0, failed: 0 };
  
  try {
    const { docs } = await FirebaseFirestore.getCollection({ collection: 'users' });
    
    for (const userDoc of docs) {
      const userId = userDoc.id;
      
      try {
        const success = await migrationFn(userId);
        
        // 마이그레이션 상태 업데이트
        await updateMigrationState(
          userId,
          versionTag,
          success,
          success ? '성공적으로 마이그레이션됨' : '마이그레이션 실패'
        );
        
        if (success) {
          result.success++;
        } else {
          result.failed++;
        }
      } catch (error) {
        result.failed++;
        console.error(`사용자 ${userId}의 마이그레이션 중 오류:`, error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('전체 사용자 마이그레이션 중 오류:', error);
    throw error;
  }
};

/**
 * 로그인한 사용자의 데이터 마이그레이션 상태 확인 및 필요시 마이그레이션 실행
 * 앱 시작 시 호출됨
 * @param userId 사용자 ID
 */
export const checkAndRunMigrations = async (userId: string): Promise<void> => {
  try {
    const migrationState = await getMigrationState(userId);
    
    // 마이그레이션이 필요한지 확인
    const lastMigration = migrationState?.lastMigration || '';
    
    // 프리미엄 플래그 마이그레이션
    if (lastMigration < DB_VERSIONS.ADD_PREMIUM_FLAG) {
      const success = await migrateAddPremiumFlag(userId);
      await updateMigrationState(userId, DB_VERSIONS.ADD_PREMIUM_FLAG, success);
    }
    
    // 향후 추가 마이그레이션...
    // 예: 근육량 필드 추가 등
    
  } catch (error) {
    console.error('마이그레이션 확인/실행 중 오류:', error);
  }
}; 