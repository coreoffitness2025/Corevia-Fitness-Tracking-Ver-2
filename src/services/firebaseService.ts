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

/* ───────── 세션 저장 (고속화) ───────── */
export const saveSession = async (session: Session): Promise<string> => {
  try {
    const id = crypto.randomUUID();
    
    // 데이터 최소화 - 필요한 데이터만 저장
    const minimalSession = {
      userId: session.userId,
      date: serverTimestamp(),
      part: session.part,
      // 메인 운동 데이터 최소화
      mainExercise: {
        part: session.mainExercise.part,
        weight: session.mainExercise.weight,
        sets: session.mainExercise.sets.map(s => ({
          reps: s.reps,
          isSuccess: s.isSuccess
        }))
      },
      // 보조 운동 데이터 최소화
      accessoryExercises: session.accessoryExercises ? session.accessoryExercises.map(a => ({
        name: a.name,
        sets: a.sets.map(s => ({
          reps: s.reps, 
          weight: s.weight
        }))
      })) : [],
      // 노트 길이 제한
      notes: session.notes ? session.notes.substring(0, 300) : '',
      isAllSuccess: session.mainExercise.sets.every(s => s.isSuccess)
    };
    
    // Firebase에 최소화된 데이터 저장
    await setDoc(doc(db, 'sessions', id), minimalSession);
    
    return id;
  } catch (error) {
    console.error('세션 저장 중 오류:', error);
    throw error;
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
// 페이지네이션을 위한 마지막 문서 캐시
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
        startAfter(lastDocMap[cacheKey]),
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
      
      // 그래프 데이터로 변환 (필요한 정보만)
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
