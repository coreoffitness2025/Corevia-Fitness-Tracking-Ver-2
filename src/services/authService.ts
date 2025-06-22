import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
  OAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { UserProfile } from '../types';

// 모바일 기기 감지
export const isMobileDevice = (): boolean => {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

// 현재 도메인 정보 가져오기
export const getCurrentDomain = (): string => {
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// 디버그 정보 기록
export const logAuthDebugInfo = (message: string, data?: any): void => {
  console.log(`[AUTH DEBUG] ${message}`, data || '');
  
  // 로컬 스토리지에 디버그 로그 저장 (나중에 문제 해결에 사용 가능)
  try {
    const logs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      message,
      data: data || null
    });
    
    // 최대 50개 로그만 유지
    if (logs.length > 50) {
      logs.shift();
    }
    
    localStorage.setItem('authDebugLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('디버그 로그 저장 중 오류:', error);
  }
};

// Google 로그인 프로세스 (모바일 최적화)
export const signInWithGoogleOptimized = async (): Promise<UserCredential | null> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  try {
    // 모바일 감지
    const isMobile = isMobileDevice();
    logAuthDebugInfo('기기 유형 감지', { isMobile, userAgent: navigator.userAgent });
    
    if (isMobile) {
      // 모바일에서는 리디렉션 방식 사용
      logAuthDebugInfo('모바일 기기에서 리디렉션 방식 사용');
      await signInWithRedirect(auth, provider);
      return null; // 리디렉션 후에는 결과를 즉시 반환할 수 없음
    } else {
      // 데스크탑에서는 팝업 방식 시도 후 실패 시 리디렉션
      logAuthDebugInfo('데스크탑에서 팝업 방식 시도');
      try {
        const result = await signInWithPopup(auth, provider);
        logAuthDebugInfo('팝업 방식 로그인 성공');
        return result;
      } catch (error: any) {
        logAuthDebugInfo('팝업 방식 실패, 오류:', error);
        logAuthDebugInfo('리디렉션 방식으로 전환');
        await signInWithRedirect(auth, provider);
        return null;
      }
    }
  } catch (error: any) {
    logAuthDebugInfo('로그인 프로세스 중 오류 발생', error);
    
    if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = getCurrentDomain();
      throw new Error(`현재 도메인(${currentDomain})이 Firebase 인증에 허용되지 않았습니다. Firebase 콘솔에서 인증 설정을 확인해주세요.`);
    }
    
    if (error.code === 'auth/disallowed-useragent') {
      throw new Error('현재 사용 중인 브라우저는 Google 로그인 정책에 의해 제한되었습니다. 다른 브라우저를 사용하거나 Firebase 콘솔에서 설정을 변경해주세요.');
    }
    
    throw error;
  }
};

// 리디렉션 결과 처리 (향상된 오류 처리)
export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    logAuthDebugInfo('리디렉션 결과 확인 시작');
    const result = await getRedirectResult(auth);
    
    if (result) {
      logAuthDebugInfo('리디렉션 로그인 성공', { uid: result.user.uid });
      await ensureUserProfile(result.user);
    } else {
      logAuthDebugInfo('리디렉션 결과 없음');
    }
    
    return result;
  } catch (error: any) {
    logAuthDebugInfo('리디렉션 결과 처리 중 오류', error);
    throw error;
  }
};

// 사용자 프로필 생성/확인
export const ensureUserProfile = async (user: User): Promise<UserProfile> => {
  const userDocRef = doc(db, 'users', user.uid);
  
  try {
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      // 기본 프로필 생성
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        height: 170,
        weight: 70, 
        age: 25,
        gender: 'male',
        activityLevel: 'moderate',
        fitnessGoal: 'maintain',
        experience: {
          years: 0,
          level: 'beginner',
          squat: {
            maxWeight: 0,
            maxReps: 0
          }
        },
        isPremium: false
      };
      
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    console.error('사용자 프로필 확인/생성 중 오류:', error);
    throw error;
  }
};

// 인증 상태 변경 감지 (Promise 방식)
export const checkAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}; 