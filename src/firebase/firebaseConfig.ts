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
  // Firebase 초기화 실패 시에도 앱이 계속 실행되도록 함
  app = null;
}

// Firebase 서비스 객체 생성 (초기화 실패 시에도 빈 객체 반환)
export const auth = app ? getAuth(app) : {
  currentUser: null,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    callback(null);
    return () => {};
  }
} as any;

export const db = app ? getFirestore(app) : {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      update: async () => {}
    }),
    where: () => ({
      orderBy: () => ({
        limit: () => ({
          get: async () => ({ docs: [] })
        })
      })
    })
  })
} as any;

export const storage = app ? getStorage(app) : {} as any;
export const analytics = app ? getAnalytics(app) : {} as any;

// 인증 관련 함수들
export const signInWithGoogle = async () => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 로그인을 수행합니다.');
    return { user: null };
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 로그인을 수행합니다.');
    return { user: null };
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 로그아웃을 수행합니다.');
    return;
  }
  return signOut(auth);
};

// 사용자 프로필 관련 함수들
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 프로필을 반환합니다.');
    return {
      uid: userId,
      displayName: '테스트 사용자',
      email: 'test@example.com',
      photoURL: null,
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
      }
    };
  }
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 프로필 업데이트를 건너뜁니다.');
    return;
  }
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, profile, { merge: true });
};

// 운동 기록 관련 함수들
export const getLastSession = async (userId: string): Promise<Session | null> => {
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 세션을 반환합니다.');
    return null;
  }
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
  if (!app) {
    console.log('Firebase가 초기화되지 않았습니다. 더미 FAQ를 반환합니다.');
    return [
      {
        id: '1',
        question: '운동을 시작하기 전에 준비해야 할 것은 무엇인가요?',
        answer: '운동 전에는 충분한 준비운동과 스트레칭이 필요합니다.',
        videoUrl: undefined,
        type: 'method',
        part: 'chest',
        category: 'chest'
      },
      {
        id: '2',
        question: '운동 후에는 어떤 식사를 해야 하나요?',
        answer: '운동 후에는 단백질과 탄수화물을 골고루 섭취하는 것이 좋습니다.',
        videoUrl: undefined,
        type: 'method',
        part: 'chest',
        category: 'chest'
      }
    ];
  }
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
