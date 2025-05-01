import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Session, ExercisePart, Progress, FAQ } from '../types';

// 로그인 함수
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
  } catch (error) {
    console.error('Google 로그인 에러:', error);
    return null;
  }
};

export const signInWithKakao = async (): Promise<User | null> => {
  try {
    const provider = new OAuthProvider('oidc.kakao');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    return {
      uid: user.uid,
      displayName: user.displayName || '사용자',
      email: user.email || '',
      photoURL: user.photoURL || undefined
    };
  } catch (error) {
    console.error('Kakao 로그인 에러:', error);
    return null;
  }
};

// 로그아웃 함수
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('로그아웃 에러:', error);
  }
};

// 세션 저장
export const saveSession = async (session: Session): Promise<string | null> => {
  try {
    const sessionData = {
      ...session,
      date: Timestamp.fromDate(new Date(session.date))
    };
    
    const docRef = await addDoc(collection(db, 'sessions'), sessionData);
    return docRef.id;
  } catch (error) {
    console.error('세션 저장 에러:', error);
    return null;
  }
};

// 최근 세션 조회
export const getLastSession = async (userId: string, part: ExercisePart): Promise<Session | null> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data() as Omit<Session, 'id' | 'date'> & { date: Timestamp };
    
    return {
      ...data,
      id: doc.id,
      date: data.date.toDate()
    };
  } catch (error) {
    console.error('최근 세션 조회 에러:', error);
    return null;
  }
};

// 진행 상황 데이터 조회
export const getProgressData = async (userId: string, part: ExercisePart): Promise<Progress[]> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('part', '==', part),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Session & { date: Timestamp };
      const successSets = data.mainExercise.sets.filter(set => set.isSuccess).length;
      
      return {
        date: data.date.toDate(),
        weight: data.mainExercise.weight,
        successSets
      };
    });
  } catch (error) {
    console.error('진행 상황 데이터 조회 에러:', error);
    return [];
  }
};

// FAQ 데이터 조회
export const getFAQs = async (part: ExercisePart): Promise<FAQ[]> => {
  try {
    const q = query(
      collection(db, 'faqs'),
      where('part', '==', part)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Omit<FAQ, 'id'>;
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('FAQ 조회 에러:', error);
    return [];
  }
};
