import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, collection, query, where, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import toast from 'react-hot-toast';
import { ExercisePart, WorkoutSession, Progress } from '../types/workout';
import Layout from '../components/common/Layout';

const CACHE_VERSION = 'v1';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간 캐시 유효 기간

const getLocalStorageKey = (userId: string, part: ExercisePart) => 
  `progress-${userId}-${part}-${CACHE_VERSION}`;

// 최근 세션 가져오기
const getLatestSessionFromLocalStorage = (userId: string, part: ExercisePart): Progress | null => {
  try {
    const key = `session-${userId}-${part}`;
    const sessionData = localStorage.getItem(key);
    if (!sessionData) return null;
    
    return JSON.parse(sessionData) as Progress;
  } catch (e) {
    console.error('로컬 스토리지 데이터 로드 실패:', e);
    return null;
  }
};

// 캐시된 데이터 가져오기
const getCachedProgressData = (userId: string, part: ExercisePart): {
  data: Progress[];
  timestamp: number;
} | null => {
  try {
    const key = getLocalStorageKey(userId, part);
    const cachedData = localStorage.getItem(key);
    
    if (!cachedData) return null;
    
    const parsed = JSON.parse(cachedData);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed;
  } catch (e) {
    console.error('캐시 로드 실패:', e);
    return null;
  }
};

// 캐시 저장
const setCachedProgressData = (userId: string, part: ExercisePart, data: Progress[]) => {
  try {
    const key = getLocalStorageKey(userId, part);
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (e) {
    console.error('캐시 저장 실패:', e);
  }
};

// 데이터 병합 및 중복 제거 함수
const mergeAndDeduplicate = (localData: Progress[], remoteData: Progress[]): Progress[] => {
  const allData = [...localData, ...remoteData];
  const uniqueMap = new Map();
  
  allData.forEach(item => {
    const key = `${item.weight}-${item.isSuccess}-${new Date(item.date).toDateString()}`;
    if (!uniqueMap.has(key) || new Date(item.date) > new Date(uniqueMap.get(key).date)) {
      uniqueMap.set(key, item);
    }
  });
  
  return Array.from(uniqueMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const WorkoutRecordPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!currentUser) return;

    try {
      const sessionsRef = collection(db, 'workoutSessions');
      const q = query(sessionsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedSessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutSession[];
      
      setSessions(fetchedSessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      setError('운동 기록을 불러오는데 실패했습니다.');
      console.error('운동 기록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const saveSession = async (session: Omit<WorkoutSession, 'id'>) => {
    if (!currentUser) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const sessionRef = doc(collection(db, 'workoutSessions'));
      await setDoc(sessionRef, {
        ...session,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      await fetchSessions();
      toast.success('운동 기록이 저장되었습니다!');
    } catch (err) {
      setError('운동 기록 저장에 실패했습니다.');
      console.error('운동 기록 저장 실패:', err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!currentUser) return;

    try {
      const sessionRef = doc(db, 'workoutSessions', sessionId);
      await deleteDoc(sessionRef);
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('운동 기록이 삭제되었습니다!');
    } catch (err) {
      setError('운동 기록 삭제에 실패했습니다.');
      console.error('운동 기록 삭제 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">운동 기록</h1>
        </div>

        {userProfile && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-lg font-medium mb-2">프로필 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">성별</p>
                <p className="font-medium">{userProfile.gender === 'male' ? '남성' : '여성'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">나이</p>
                <p className="font-medium">{userProfile.age}세</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">키</p>
                <p className="font-medium">{userProfile.height}cm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">체중</p>
                <p className="font-medium">{userProfile.weight}kg</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">
                  {new Date(session.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="font-medium mb-2">{session.mainExercise.name}</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">세트</p>
                      <p>{session.mainExercise.sets.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">무게</p>
                      <p>{session.mainExercise.weight}kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">휴식</p>
                      <p>{session.mainExercise.rest}초</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">성공률</p>
                      <p>{session.mainExercise.sets.filter(set => set.isSuccess).length}/{session.mainExercise.sets.length}</p>
                    </div>
                  </div>
                </div>

                {session.accessoryExercises.map((exercise, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="font-medium mb-2">{exercise.name}</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">세트</p>
                        <p>{exercise.sets.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">무게</p>
                        <p>{exercise.weight}kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">휴식</p>
                        <p>{exercise.rest}초</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">성공률</p>
                        <p>{exercise.sets.filter(set => set.isSuccess).length}/{exercise.sets.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {session.notes && (
                  <div>
                    <h4 className="font-medium mb-2">메모</h4>
                    <p className="text-gray-600 dark:text-gray-400">{session.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutRecordPage; 