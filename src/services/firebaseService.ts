import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp
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

/* ───────── 세션 CRUD ───────── */

export const saveSession = async (session: Session): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      ...session,
      date: Timestamp.fromDate(new Date(session.date))
    });
    return docRef.id;
  } catch (e) {
    console.error('세션 저장 에러:', e);
    return null;
  }
};

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
    const doc = snap.docs[0];
    const data = doc.data() as Omit<Session, 'id' | 'date'> & { date: Timestamp };
    return {
      ...data,
      id: doc.id,
      date: data.date.toDate()
    };
  } catch (e) {
    console.error('최근 세션 조회 에러:', e);
    return null;
  }
};

/* ───────── 진행 데이터 (그래프) ───────── */

export const getProgressData = async (
  uid: string,
  part: ExercisePart,
  limitCount = 20
): Promise<Progress[]> => {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', uid),
    where('part', '==', part),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const d = doc.data() as Session & { date: Timestamp };
    const successSets = d.mainExercise.sets.filter((s) => s.isSuccess).length;
    return {
      date: d.date.toDate(),
      weight: d.mainExercise.weight,
      successSets,
      sets: d.mainExercise.sets,
      isSuccess: successSets === 5
    };
  });
};

/* ───────── FAQ ───────── */

export const getFAQs = async (part: ExercisePart): Promise<FAQ[]> => {
  try {
    const q = query(collection(db, 'faqs'), where('part', '==', part));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FAQ, 'id'>)
    }));
  } catch (e) {
    console.error('FAQ 조회 에러:', e);
    return [];
  }
};
