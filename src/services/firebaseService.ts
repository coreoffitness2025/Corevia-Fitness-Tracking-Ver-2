import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { UserProfile, Session, FAQ, User, Progress } from '../types';
import { ExercisePart } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ───────── 로그인 & 로그아웃 ───────── */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('구글 로그인 실패:', error);
    throw new Error('구글 로그인에 실패했습니다. 다시 시도해주세요.');
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw new Error('로그아웃에 실패했습니다. 다시 시도해주세요.');
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('이메일 로그인 에러:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // 사용자 프로필 업데이트
    if (user) {
      await updateProfile(user, { displayName });
    }
    
    return user;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.');
  }
};

// 세트 타입 정의
interface ExerciseSet {
  reps: number;
  isSuccess?: boolean;
  weight?: number;
}

/* ───────── 세션 저장 (고속화) ───────── */
export const saveSession = async (session: Session): Promise<string> => {
  try {
    const id = crypto.randomUUID();
    const minimalSession = {
      userId: session.userId,
      date: new Date(),
      part: session.part,
      mainExercise: {
        part: session.mainExercise.part,
        weight: session.mainExercise.weight,
        sets: Array.isArray(session.mainExercise.sets)
          ? session.mainExercise.sets.map((s: any) => ({
              reps: s.reps,
              isSuccess: s.isSuccess
            }))
          : []
      },
      accessoryExercises: Array.isArray(session.accessoryExercises)
        ? session.accessoryExercises.map((a: any) => ({
            name: a.name,
            weight: a.weight || 0,
            reps: a.reps || 0,
            sets: Array.isArray(a.sets)
              ? a.sets.map((s: any) => ({
                  reps: s.reps,
                  weight: s.weight
                }))
              : []
          }))
        : [],
      notes: session.notes ? session.notes.substring(0, 300) : '',
      isAllSuccess: session.mainExercise.sets.every((s: any) => s.isSuccess)
    };
    await setDoc(doc(db, 'sessions', id), minimalSession);
    return id;
  } catch (error) {
    console.error('세션 저장 중 오류:', error);
    throw new Error('운동 기록 저장에 실패했습니다. 다시 시도해주세요.');
  }
};

/* ───────── 최근 세션 조회 - 최적화 ───────── */
const sessionCache: Record<string, { data: Session | null; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000;
export const getLastSession = async (userId: string, part: string): Promise<Session | null> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as Session;
  } catch (error) {
    console.error('마지막 세션 조회 실패:', error);
    throw new Error('마지막 세션 정보를 불러오는데 실패했습니다.');
  }
};

export const invalidateCache = (userId: string, part?: ExercisePart) => {
  if (part) {
    const cacheKey = `${userId}-${part}`;
    delete sessionCache[cacheKey];
    Object.keys(progressCache).forEach(key => {
      if (key.startsWith(`${userId}-${part}`)) delete progressCache[key];
    });
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`progress-${userId}-${part}`)) localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('로컬 스토리지 캐시 무효화 실패:', e);
    }
    console.log(`${part} 부위 캐시 무효화 완료`);
  } else {
    Object.keys(sessionCache).forEach(key => { if (key.startsWith(`${userId}`)) delete sessionCache[key]; });
    Object.keys(progressCache).forEach(key => { if (key.startsWith(`${userId}`)) delete progressCache[key]; });
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`progress-${userId}`)) localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('로컬 스토리지 캐시 무효화 실패:', e);
    }
    console.log('모든 캐시 무효화 완료');
  }
};

/* ───────── 진행 데이터 (그래프) ───────── */
const lastDocMap: Record<string, QueryDocumentSnapshot | null> = {};
const progressCache: Record<string, { data: Progress[]; timestamp: number }> = {};
export const getProgressData = async (userId: string, part: string): Promise<Progress[]> => {
  try {
    const progressRef = collection(db, 'progress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Progress[];
  } catch (error) {
    console.error('진행 상황 조회 실패:', error);
    throw new Error('진행 상황 정보를 불러오는데 실패했습니다.');
  }
};

/* ───────── FAQ ───────── */
const faqCache: Record<string, { data: FAQ[]; timestamp: number }> = {};

/**
 * FAQ를 가져옵니다. 'method' 또는 'sets' 타입과 부위(part)를 넘겨주세요.
 */

// firebaseService.ts 파일에서 getFAQs 함수를 찾아 다음과 같이 수정하세요
export const getFAQs = async (part: ExercisePart, type: 'method' | 'sets' = 'method'): Promise<FAQ[]> => {
  try {
    const faqCollection = collection(db, 'faqs');
    let q;
    
    if (type === 'method') {
      q = query(
        faqCollection, 
        where('type', '==', 'method'),
        where('part', '==', part)
      );
    } else {
      q = query(
        faqCollection, 
        where('type', '==', 'sets')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        answer: data.answer,
        videoUrl: data.videoUrl,
        type: data.type,
        part: data.part,
        category: data.category || 'general'
      } as FAQ;
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};

export const saveUserProfile = async (user: UserProfile) => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      ...user,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('사용자 프로필 저장 실패:', error);
    throw new Error('프로필 저장에 실패했습니다. 다시 시도해주세요.');
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('사용자 프로필 조회 실패:', error);
    throw new Error('프로필 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
  }
};

export const saveProgress = async (progress: Omit<Progress, 'id'>) => {
  const progressRef = collection(db, 'progress');
  const docRef = await addDoc(progressRef, progress);
  return { ...progress, id: docRef.id };
};
