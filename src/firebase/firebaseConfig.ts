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
  User,
  setPersistence,
  browserLocalPersistence
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
  updateDoc,
  addDoc,
  serverTimestamp,
  enableIndexedDbPersistence,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 환경 설정 - Firebase 콘솔에서 확인한 웹 API 키로 업데이트
const firebaseConfig = {
  apiKey: "AIzaSyAVTueD8Zu_yWoSH4FLMx-Sd5KZpqzu-dk",
  authDomain: "corevia-fitness-tracking.firebaseapp.com",
  projectId: "corevia-fitness-tracking",
  storageBucket: "corevia-fitness-tracking.appspot.com",
  messagingSenderId: "911855936443",
  appId: "1:911855936443:web:a074c26f018859ffe1a76b",
  measurementId: "G-YL2PE4ZJK3"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 초기화
export const db = getFirestore(app);

// 오프라인 지원 활성화
const enableOfflineSupport = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore 오프라인 지원이 활성화되었습니다.');
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.warn('여러 탭에서 실행 중일 때는 오프라인 지원이 활성화되지 않습니다.');
    } else if (error.code === 'unimplemented') {
      console.warn('현재 브라우저는 오프라인 지원을 지원하지 않습니다.');
    } else {
      console.error('Firestore 오프라인 지원 활성화 오류:', error);
    }
  }
};

// 오프라인 지원 활성화 호출
enableOfflineSupport();

// Firebase 인증 초기화
export const auth = getAuth(app);

// 로컬 인증 상태 유지 설정
const setupLocalPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('로컬 인증 상태 유지가 설정되었습니다.');
  } catch (error) {
    console.error('로컬 인증 상태 유지 설정 오류:', error);
  }
};

// 로컬 인증 상태 유지 설정 호출
setupLocalPersistence();

// Firebase 스토리지 초기화
export const storage = getStorage(app);

// Analytics는 조건부로 초기화 (네트워크 오류 무시)
export const getAnalyticsInstance = async () => {
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        // Analytics는 필요할 때만 동적으로 임포트
        const { getAnalytics } = await import('firebase/analytics');
        const analytics = getAnalytics(app);
        console.log('Firebase Analytics 초기화 성공');
        return analytics;
      } catch (error) {
        // Analytics 초기화 오류는 무시하고 앱 실행 계속
        console.warn('Analytics 초기화 실패, 앱은 계속 실행됩니다:', error);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.warn('Analytics 모듈 로드 오류, 앱은 계속 실행됩니다:', error);
    return null;
  }
};

// Google 로그인 설정
const provider = new GoogleAuthProvider();

// 사용자 로그인 함수
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithRedirect(auth, provider);
    return result;
  } catch (error) {
    console.error("Google 로그인 오류:", error);
    throw error;
  }
};

// 로그인 처리 결과
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("리디렉션 처리 오류:", error);
    throw error;
  }
};

// 이메일/비밀번호 로그인
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error("이메일 로그인 오류:", error);
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log("프로필이 존재하지 않습니다!");
      return null;
    }
  } catch (error) {
    console.error("프로필 가져오기 오류:", error);
    throw error;
  }
};

// 사용자 프로필 저장
export const saveUserProfile = async (userId: string, profileData: UserProfile) => {
  try {
    await setDoc(doc(db, "users", userId), profileData, { merge: true });
  } catch (error) {
    console.error("프로필 저장 오류:", error);
    throw error;
  }
};

// 인증 상태 모니터링
export const monitorAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 자주 묻는 질문 가져오기
export const getFAQs = async () => {
  try {
    const q = query(collection(db, "faqs"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    const faqs: FAQ[] = [];
    
    querySnapshot.forEach((doc) => {
      faqs.push({
        id: doc.id,
        ...doc.data() as Omit<FAQ, 'id'>
      });
    });
    
    return faqs;
  } catch (error) {
    console.error("FAQ 가져오기 오류:", error);
    throw error;
  }
};

// 세션 기록 저장
export const saveSession = async (userId: string, session: Session) => {
  try {
    const sessionsRef = collection(db, "users", userId, "sessions");
    await addDoc(sessionsRef, {
      ...session,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("세션 저장 오류:", error);
    throw error;
  }
};
