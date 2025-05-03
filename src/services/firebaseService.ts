import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
  serverTimestamp,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  ExercisePart,
  Session,
  FAQ,
  User,
  Progress,
  AccessoryExercise
} from '../types';

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
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (e) {
    console.error('로그아웃 에러:', e);
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
    throw error;
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
        isSuccess: successSets === 5,
        sets: d.mainExercise.sets,
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
export const getFAQs = async (
  part: ExercisePart,
  type: 'method' | 'sets'
): Promise<FAQ[]> => {
  try {
    const cacheKey = `faq-${part}-${type}`;
    const now = Date.now();
    if (faqCache[cacheKey] && now - faqCache[cacheKey].timestamp < CACHE_DURATION) {
      return faqCache[cacheKey].data;
    }
    const filters = [where('type', '==', type)];
    if (type === 'method') filters.push(where('part', '==', part));
    const q = query(collection(db, 'faqs'), ...filters);
    const snap = await getDocs(q);
    const results = snap.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as FAQ) }));
    faqCache[cacheKey] = { data: results, timestamp: now };
    return results;
  } catch (e) {
    console.error('FAQ 조회 에러:', e);
    return [];
  }
};
