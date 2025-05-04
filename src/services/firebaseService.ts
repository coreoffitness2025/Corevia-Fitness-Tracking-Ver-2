import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
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
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import { UserProfile, Session, FAQ, User, Progress } from '../types';
import { auth, db } from '../firebase';
import { ExercisePart } from '../types';

/* ───────── 로그인 & 로그아웃 ───────── */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    return {
      uid: user.uid,
      displayName: user.displayName || '사용자',
      email: user.email || '',
      photoURL: user.photoURL || undefined
    };
  } catch (e) {
    console.error('Google 로그인 에러:', e);
    throw new Error('Google 로그인에 실패했습니다. 다시 시도해주세요.');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (e) {
    console.error('로그아웃 에러:', e);
    throw new Error('로그아웃에 실패했습니다. 다시 시도해주세요.');
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
export const getLastSession = async (
  userId: string,
  part: ExercisePart
): Promise<Session | null> => {
  try {
    const cacheKey = `${userId}-${part}`;
    const now = Date.now();
    if (sessionCache[cacheKey] && now - sessionCache[cacheKey].timestamp < CACHE_DURATION) {
      return sessionCache[cacheKey].data;
    }
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      sessionCache[cacheKey] = { data: null, timestamp: now };
      return null;
    }
    const docSnap = snap.docs[0];
    const data = docSnap.data() as Omit<Session, 'id' | 'date'> & { date: Timestamp };
    const session = { ...data, id: docSnap.id, date: data.date.toDate() };
    sessionCache[cacheKey] = { data: session, timestamp: now };
    return session;
  } catch (e) {
    console.error('최근 세션 조회 에러:', e);
    return null;
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
export const getProgressData = async (
  uid: string,
  part: ExercisePart,
  limitCount = 10,
  startAfterIndex = 0,
  forceRefresh = false
): Promise<Progress[]> => {
  try {
    const cacheKey = `${uid}-${part}-${startAfterIndex}-${limitCount}`;
    const now = Date.now();
    if (
      startAfterIndex === 0 &&
      progressCache[cacheKey] &&
      now - progressCache[cacheKey].timestamp < CACHE_DURATION &&
      !forceRefresh
    ) {
      return progressCache[cacheKey].data;
    }
    if (startAfterIndex === 0) lastDocMap[`${uid}-${part}`] = null;
    let q = query(
      collection(db, 'sessions'),
      where('userId', '==', uid),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const lastDocKey = `${uid}-${part}`;
    if (startAfterIndex > 0 && lastDocMap[lastDocKey]) {
      q = query(
        collection(db, 'sessions'),
        where('userId', '==', uid),
        where('part', '==', part),
        orderBy('date', 'desc'),
        startAfter(lastDocMap[lastDocKey]),
        limit(limitCount)
      );
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      lastDocMap[lastDocKey] = snap.docs[snap.docs.length - 1];
    }
    const progressData = snap.docs.map(docSnap => {
      const d = docSnap.data() as Session & { date: Timestamp };
      const successSets = Array.isArray(d.mainExercise.sets)
        ? d.mainExercise.sets.filter((s: any) => s.isSuccess).length
        : 0;
      return {
        date: d.date.toDate(),
        weight: d.mainExercise.weight,
        successSets,
        isSuccess: d.isAllSuccess || successSets === 5,
        sets: d.mainExercise.sets,
        // 메모 필드 추가
        notes: d.notes || '',
        // 전체 보조 운동 데이터 추가
        accessoryExercises: Array.isArray(d.accessoryExercises)
          ? d.accessoryExercises.map((a: any) => ({
              name: a.name,
              sets: Array.isArray(a.sets) ? a.sets : []
            }))
          : [],
        // 기존 이름 배열은 그대로 유지
        accessoryNames: Array.isArray(d.accessoryExercises)
          ? d.accessoryExercises.map((a: any) => a.name)
          : []
      } as Progress;
    });
    if (startAfterIndex === 0) {
      progressCache[cacheKey] = { data: progressData, timestamp: now };
      try {
        localStorage.setItem(
          `progress-${cacheKey}`,
          JSON.stringify({ data: progressData, timestamp: now })
        );
      } catch {}
    }
    return progressData;
  } catch (error) {
    console.error('진행 데이터 가져오기 오류:', error);
    return [];
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
      // method 타입은 부위별 필터링
      q = query(
        faqCollection, 
        where('type', '==', 'method'),
        where('part', '==', part)
      );
    } else {
      // sets 타입은 부위 관계없이 필터링
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
        part: data.part
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
