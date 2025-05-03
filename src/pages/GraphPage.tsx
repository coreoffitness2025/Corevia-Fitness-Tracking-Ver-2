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
    
    // 데이터 최소화 - 필요한 데이터만 저장
    const minimalSession = {
      userId: session.userId,
      date: new Date(), // serverTimestamp() 대신 클라이언트 타임스탬프 사용
      part: session.part,
      // 메인 운동 데이터 최소화
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
      // 보조 운동 데이터 최소화 - 타입 수정
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
      // 노트 길이 제한
      notes: session.notes ? session.notes.substring(0, 300) : '',
      isAllSuccess: session.mainExercise.sets.every((s: any) => s.isSuccess)
    };
    
    // Firebase에 최소화된 데이터 저장
    await setDoc(doc(db, 'sessions', id), minimalSession);
    
    return id;
  } catch (error) {
    console.error('세션 저장 중 오류:', error);
    throw error;
  }
};

/* ───────── 최근 세션 조회 - 최적화 ───────── */
// 세션 캐시 (메모리)
const sessionCache: Record<string, { data: Session | null, timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

export const getLastSession = async (
  userId: string,
  part: ExercisePart
): Promise<Session | null> => {
  try {
    const cacheKey = `${userId}-${part}`;
    const now = Date.now();
    
    // 캐시된 데이터가 있고 유효한지 확인
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
    
    const session = {
      ...data,
      id: docSnap.id,
      date: data.date.toDate()
    };
    
    // 결과 캐싱
    sessionCache[cacheKey] = { data: session, timestamp: now };
    
    return session;
  } catch (e) {
    console.error('최근 세션 조회 에러:', e);
    return null;
  }
};

// 캐시 무효화 함수 추가
export const invalidateCache = (userId: string, part?: ExercisePart) => {
  console.log('캐시 무효화 요청:', userId, part);
  
  if (part) {
    // 특정 부위 캐시만 무효화
    const cacheKey = `${userId}-${part}`;
    delete sessionCache[cacheKey];
    
    // Progress 캐시도 무효화
    Object.keys(progressCache).forEach(key => {
      if (key.startsWith(`${userId}-${part}`)) {
        delete progressCache[key];
      }
    });
    console.log(`${part} 부위 캐시 무효화 완료`);
  } else {
    // 사용자의 모든 캐시 무효화
    Object.keys(sessionCache).forEach(key => {
      if (key.startsWith(`${userId}`)) {
        delete sessionCache[key];
      }
    });
    
    Object.keys(progressCache).forEach(key => {
      if (key.startsWith(`${userId}`)) {
        delete progressCache[key];
      }
    });
    console.log('모든 캐시 무효화 완료');
  }
};

/* ───────── 진행 데이터 (그래프) ───────── */
// 페이지네이션을 위한 마지막 문서 캐시
const lastDocMap: Record<string, QueryDocumentSnapshot | null> = {};
// 진행 데이터 캐시
const progressCache: Record<string, { data: Progress[], timestamp: number }> = {};

export const getProgressData = async (
  uid: string,
  part: ExercisePart,
  limitCount = 10,
  startAfterIndex = 0,
  forceRefresh = false  // 강제 새로고침 옵션 추가
): Promise<Progress[]> => {
  try {
    const cacheKey = `${uid}-${part}-${startAfterIndex}-${limitCount}`;
    const now = Date.now();
    
    // 초기 로드이고 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 반환
    if (startAfterIndex === 0 && 
        progressCache[cacheKey] && 
        now - progressCache[cacheKey].timestamp < CACHE_DURATION &&
        !forceRefresh) {
      console.log('캐시된 데이터 반환:', progressCache[cacheKey].data.length);
      return progressCache[cacheKey].data;
    }
    
    // 초기 쿼리 또는 처음부터 시작하는 경우 마지막 문서 캐시 초기화
    if (startAfterIndex === 0) {
      lastDocMap[`${uid}-${part}`] = null;
    }
    
    let q = query(
      collection(db, 'sessions'),
      where('userId', '==', uid),
      where('part', '==', part),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    // 페이지네이션을 위해 이전 마지막 문서 이후부터 쿼리
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
    console.log('Firebase 쿼리 완료, 결과 개수:', snap.docs.length);
    
    // 마지막 문서 저장 (다음 쿼리를 위해)
    if (!snap.empty) {
      lastDocMap[lastDocKey] = snap.docs[snap.docs.length - 1];
    }
    
    // 데이터 변환 및 최적화
    const progressData = snap.docs.map((docSnap) => {
      try {
        const d = docSnap.data() as Session & { date: Timestamp };
        
        // 데이터 유효성 검사
        if (!d.mainExercise || !d.mainExercise.sets) {
          console.warn('유효하지 않은 세션 데이터:', docSnap.id);
          return null;
        }
        
        const successSets = Array.isArray(d.mainExercise.sets) 
          ? d.mainExercise.sets.filter((s: any) => s.isSuccess).length
          : 0;
        
        // 그래프 데이터로 변환 (필요한 정보만)
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
      } catch (e) {
        console.error('데이터 변환 오류:', e);
        return null;
      }
    }).filter(Boolean) as Progress[]; // null 값 제거
    
    // 결과 캐싱 (초기 로드만)
    if (startAfterIndex === 0) {
      progressCache[cacheKey] = { data: progressData, timestamp: now };
    }
    
    // 결과 반환
    return progressData;
  } catch (error) {
    console.error('진행 데이터 가져오기 오류:', error);
    return [];
  }
};

/* ───────── FAQ ───────── */
const faqCache: Record<string, { data: FAQ[], timestamp: number }> = {};

export const getFAQs = async (part: ExercisePart): Promise<FAQ[]> => {
  try {
    const cacheKey = `faq-${part}`;
    const now = Date.now();
    
    // 캐시된 데이터가 있고 유효한지 확인
    if (faqCache[cacheKey] && now - faqCache[cacheKey].timestamp < CACHE_DURATION) {
      return faqCache[cacheKey].data;
    }
    
    const q = query(collection(db, 'faqs'), where('part', '==', part));
    const snap = await getDocs(q);
    
    const faqs = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FAQ, 'id'>)
    }));
    
    // 결과 캐싱
    faqCache[cacheKey] = { data: faqs, timestamp: now };
    
    return faqs;
  } catch (e) {
    console.error('FAQ 조회 에러:', e);
    return [];
  }
};
