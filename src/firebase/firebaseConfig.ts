import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { UserProfile, FAQ, ExercisePart, Session } from '../types';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "corevia-fitness-tracking.firebaseapp.com",
  projectId: "corevia-fitness-tracking",
  storageBucket: "corevia-fitness-tracking.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-3HT5SN1CDP"
};

// Firebase 초기화
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Firebase 초기화 실패');
}

if (!app) {
  throw new Error('Firebase 앱이 초기화되지 않았습니다');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// 인증 관련 함수들
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

// 사용자 프로필 관련 함수들
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, profile, { merge: true });
};

// 운동 기록 관련 함수들
export const getLastSession = async (userId: string): Promise<Session | null> => {
  const sessionsRef = collection(db, 'workoutSessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  const doc = querySnapshot.docs[0];
  
  if (!doc) return null;
  
  const data = doc.data();
  return {
    userId: data.userId,
    date: data.date.toDate(),
    part: data.part,
    mainExercise: data.mainExercise,
    accessoryExercises: data.accessoryExercises || [],
    notes: data.notes || '',
    isAllSuccess: data.isAllSuccess || false,
    successSets: data.successSets || 0,
    accessoryNames: data.accessoryNames || []
  } as Session;
};

// FAQ 관련 함수들
export const getFAQs = async (part?: ExercisePart, type?: 'method' | 'sets'): Promise<FAQ[]> => {
  try {
    const faqsRef = collection(db, 'faqs');
    let q = query(faqsRef, orderBy('order'));
    
    if (part) {
      q = query(q, where('part', '==', part));
    }
    if (type) {
      q = query(q, where('type', '==', type));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question || '',
        answer: data.answer || '',
        videoUrl: data.videoUrl,
        type: data.type || 'method',
        part: data.part || 'chest',
        category: data.category || 'general'
      } as FAQ;
    });
  } catch (error) {
    console.error('FAQ 로드 실패:', error);
    return [];
  }
};
