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
import { ExercisePart, Session, FAQ, User } from '../types';

/** ✅ Google 로그인 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
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

/** ✅ 로그아웃 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (e) {
    console.error('로그아웃 에러:', e);
  }
};

/** ✅ 세션 저장 */
export const saveSession = async (session: Session): Promise<string | null> => {
  try {
    const sessionData = {
      ...session,
      date: Timestamp.fromDate(new Date(session.date))
    };
    const docRef = await addDoc(collection(db, 'sessions'), sessionData);
    return docRef.id;
  } catch (e) {
    console.error('세션 저장 에러:', e);
    return null;
  }
};

/** ✅ 가장 최근 세션 불러오기 */
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
    console.error('최근 세션 불러오기 에러:', e);
    return null;
  }
};

/** ✅ FAQ 불러오기 */
export const getFAQs = async (part: ExercisePart): Promise<FAQ[]> => {
  try {
    const q = query(collection(db, 'faqs'), where('part', '==', part));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FAQ, 'id'>)
    }));
  } catch (e) {
    console.error('FAQ 로딩 에러:', e);
    return [];
  }
};
