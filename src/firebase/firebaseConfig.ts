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

// Firebase 환경 설정 - GitHub Secrets에서 관리되는 환경 변수 사용
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage(); // 브라우저 언어 설정 사용
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google 제공자 설정
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 인증 관련 함수들
export const signInWithGoogle = async () => {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    try {
      // 리디렉션 방식 사용 (쿠키 문제 해결)
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('리디렉션 로그인 오류:', error);
      throw error;
    }
  }
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
    await updateDoc(userRef, profile);
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
