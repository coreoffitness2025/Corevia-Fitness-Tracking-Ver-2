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
  startAfter as fbStartAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  ExercisePart,
  Session,
  FAQ,
  User,
  Progress
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

/* ───────── 세션 저장 (고속) ───────── */
export const saveSession = async (session: Session): Promise<string> => {
  try {
    const id = crypto.randomUUID();                               // 클라이언트에서 ID 생성
    await setDoc(doc(db, 'sessions', id), {
      ...session,
      date: serverTimestamp()                                     // 서버 타임스탬프
    });
    return id;
  } catch (error) {
    console.error('세션 저장 중 오류:', error);
    throw error; // UI가 오류를 처리할 수 있도록 다시 throw
  }
};

/* ───────── 최근 세션 조회 ───────── */
export const getLastSession = async (
  userId: string,
  part: ExercisePart
): Promise<Session | null> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const data = docSnap.data() as Omit<Session, 'id' | 'date'> & { date: Timestamp };
    return {
      ...data,
      id: docSnap.id,
      date: data.date.toDate()
    };
  } catch (e) {
    console.error('최근 세션 조회 에러:', e);
    return null;
  }
};

/* ───────── 진행 데이터 (그래프) ───────── */
// lastDoc 변수를 모듈 레벨에서 저장 (페이지네이션 최적화)
const lastDocMap: Record<string, QueryDocumentSnapshot | null> = {};

export const getProgressData = async (
  uid: string,
  part: ExercisePart,
  limitCount = 10,
  startAfterIndex = 0
): Promise<Progress[]> => {
  try {
    const cacheKey = `${uid}-${part}`;
    
    // 초기 쿼리 또는 처음부터 시작하는 경우 마지막 문서 캐시 초기화
    if (startAfterIndex === 0) {
      lastDocMap[cacheKey] = null;
    }
    
    let q = query(
      collection(db, 'sessions'),
      where('userId', '==', uid),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    // 페이지네이션을 위해 이전 마지막 문서 이후부터 쿼리
    if (startAfterIndex > 0 && lastDocMap[cacheKey]) {
      q = query(
        collection(db, 'sessions'),
        where('userId', '==', uid),
        where('part', '==', part),
        orderBy('date', 'desc'),
        fbStartAfter(lastDocMap[cacheKey]),
        limit(limitCount)
      );
    }
    
    const snap = await getDocs(q);
    
    // 마지막 문서 저장 (다음 쿼리를 위해)
    if (!snap.empty) {
      lastDocMap[cacheKey] = snap.docs[snap.docs.length - 1];
    }
    
    return snap.docs.map((docSnap) => {
      const d = docSnap.data() as Session & { date: Timestamp };
      const successSets = d.mainExercise.sets.filter((s) => s.isSuccess).length;
      
      return {
        date: d.date.toDate(),
        weight: d.mainExercise.weight,
        successSets,
        isSuccess: successSets === 5,
        sets: d.mainExercise.sets,
        accessoryNames: d.accessoryExercises?.map((a) => a.name) ?? []
      } as Progress;
    });
  } catch (error) {
    console.error('진행 데이터 가져오기 오류:', error);
    return [];
  }
};

/* ───────── FAQ ───────── */
export const getFAQs = async (part: ExercisePart): Promise<FAQ[]> => {
  try {
    const q = query(collection(db, 'faqs'), where('part', '==', part));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FAQ, 'id'>)
    }));
  } catch (e) {
    console.error('FAQ 조회 에러:', e);
    return [];
  }
};
