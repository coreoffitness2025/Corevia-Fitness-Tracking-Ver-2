import { UserProfile, FAQ, ExercisePart, Session } from '../types';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  updateDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase 환경 설정 - 하드코딩된 값 사용 (임시 해결책)
const firebaseConfig = {
  apiKey: "AIzaSyDLxrXiRhbvQj1qe4Ys9rCvkGq4nLwQGRc",
  authDomain: "corevia-fitness.firebaseapp.com",
  projectId: "corevia-fitness",
  storageBucket: "corevia-fitness.appspot.com",
  messagingSenderId: "1005083013880",
  appId: "1:1005083013880:web:c7b3b2d9a4f8f45a6d0d9a",
  measurementId: "G-XVPZJJR1JE"
};

// Firebase 초기화 전 config 확인
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase 필수 환경 변수가 누락되었습니다. 인증이 작동하지 않을 수 있습니다.');
}

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage(); // 브라우저 언어 설정 사용

// CORS 및 쿠키 설정 (Firebase Functions용, 직접적인 효과는 없지만 설정)
if (typeof window !== 'undefined') {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google 제공자 설정
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 모바일 기기 감지 함수
const isMobileDevice = (): boolean => {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

// 인증 관련 함수들
export const signInWithGoogle = async () => {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    try {
      // 모바일 기기 감지
      const isMobile = isMobileDevice();
      console.log('기기 유형:', isMobile ? '모바일' : '데스크탑');

      if (isMobile) {
        // 모바일 기기에서는 항상 리디렉션 방식 사용
        console.log('모바일 기기에서 리디렉션 방식 사용');
        await signInWithRedirect(auth, googleProvider);
        return null; // 리디렉션 후에는 결과를 즉시 반환할 수 없음
      } else {
        // 데스크탑에서는 팝업 방식 사용
        console.log('데스크탑에서 팝업 방식 사용');
        try {
          return await signInWithPopup(auth, googleProvider);
        } catch (error) {
          console.error('팝업 인증 실패, 리디렉션 시도:', error);
          // 팝업이 실패하면 리디렉션으로 시도
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
      }
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      
      // 도메인 인증 오류인 경우 더 명확한 오류 메시지
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.origin;
        throw new Error(`현재 도메인(${currentDomain})이 Firebase 인증에 허용되지 않았습니다. Firebase 콘솔에서 '인증 > 설정 > 승인된 도메인'에 이 도메인을 추가해주세요.`);
      }
      
      throw error;
    }
  }
  return null;
};

// 리디렉션 결과 처리
export const getGoogleRedirectResult = async () => {
  if (typeof window !== 'undefined') {
    try {
      return await getRedirectResult(auth);
    } catch (error) {
      console.error('리디렉션 결과 처리 오류:', error);
      throw error;
    }
  }
  return null;
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

// 사용자 프로필 관련 함수들
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // 새 문서 생성 시 전체 데이터 한번에 저장 (merge 옵션 없음)
      await setDoc(userRef, profile);
    } else {
      // 기존 문서 업데이트 시 merge 옵션 사용
      console.log('프로필 저장 전:', profile);
      await setDoc(userRef, profile, { merge: true });
      console.log('프로필 저장 후 재확인:');
      const verifyDoc = await getDoc(userRef);
      console.log(verifyDoc.data());
    }

    // 업데이트 후 명시적으로 최신 데이터 가져오기
    const updateAndRefresh = async () => {
      await setDoc(userRef, profile, { merge: true });
      // 강제로 최신 데이터 다시 로드
      const freshData = await getDoc(userRef);
      return freshData.data() as UserProfile;
    };

    return updateAndRefresh();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// 운동 기록 관련 함수들
export const getLastSession = async (userId: string): Promise<Session | null> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      date: data.date.toDate(),
    } as Session;
  } catch (error) {
    console.error('Error getting last session:', error);
    return null;
  }
};

// FAQ 관련 함수들
export const getFAQs = async (part?: ExercisePart, type?: 'method' | 'sets'): Promise<FAQ[]> => {
  try {
    const faqsCollection = collection(db, 'faqs');
    
    let faqQuery;
    if (part || type) {
      let conditions = [];
      if (part) conditions.push(where('part', '==', part));
      if (type) conditions.push(where('type', '==', type));
      
      faqQuery = query(faqsCollection, ...conditions);
    } else {
      faqQuery = query(faqsCollection);
    }
    
    const querySnapshot = await getDocs(faqQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQ));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};
