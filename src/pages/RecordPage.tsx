import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, ExercisePart, AccessoryExercise, Progress } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession, saveSession } from '../services/firebaseService';
import Layout from '../components/common/Layout';
import MainExerciseForm from '../components/exercise/MainExerciseForm';
import AccessoryExerciseForm from '../components/exercise/AccessoryExerciseForm';
import toast, { Toaster } from 'react-hot-toast';

const partNames = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' };
const coreExerciseNames = {
  chest: '벤치프레스',
  back: '데드리프트',
  shoulder: '오버헤드 프레스',
  leg: '스쿼트'
};

// 오프라인 저장을 위한 인터페이스 정의
interface OfflineSession extends Session {
  offlineId?: string;
  pendingSync?: boolean;
  createdAt?: string;
}

// 세션 데이터를 직접 로컬 스토리지에 저장
const saveSessionToLocalStorage = (session: Session) => {
  try {
    // 키 생성
    const key = `session-${session.userId}-${session.part}`;
    
    // 세션을 Progress 형태로 변환
    const progressData = {
      date: session.date,
      weight: session.mainExercise.weight,
      successSets: session.mainExercise.sets.filter(s => s.isSuccess).length,
      isSuccess: session.mainExercise.sets.filter(s => s.isSuccess).length === 5,
      sets: session.mainExercise.sets,
      accessoryNames: session.accessoryExercises ? session.accessoryExercises.map(a => a.name) : []
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem(key, JSON.stringify(progressData));
    
    // 그래프 새로고침 플래그 설정
    localStorage.setItem('shouldRefreshGraph', 'true');
    
    console.log('세션 데이터를 로컬 스토리지에 저장 완료');
  } catch (e) {
    console.error('로컬 스토리지 저장 실패:', e);
  }
};

// 오프라인 데이터 관리 유틸리티
const offlineStorage = {
  // 세션 저장
  saveSession: (session: Session): boolean => {
    try {
      const offlineSessions = offlineStorage.getAllSessions();
      offlineSessions.push({
        ...session,
        offlineId: Date.now().toString(),
        pendingSync: true,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('offlineSessions', JSON.stringify(offlineSessions));
      localStorage.setItem('hasPendingSessions', 'true');
      
      // 로컬 스토리지에도 직접 저장 (그래프용)
      saveSessionToLocalStorage(session);
      
      return true;
    } catch (e) {
      console.error('오프라인 저장 실패:', e);
      return false;
    }
  },
  
  // 모든 세션 가져오기
  getAllSessions: (): OfflineSession[] => {
    try {
      const data = localStorage.getItem('offlineSessions');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('오프라인 데이터 조회 실패:', e);
      return [];
    }
  },
  
  // 동기화 대기 중인 세션 수
  getPendingCount: (): number => {
    try {
      const sessions = offlineStorage.getAllSessions();
      return sessions.filter(s => s.pendingSync).length;
    } catch (e) {
      return 0;
    }
  },
  
  // 저장 공간 정리 (너무 오래된 데이터 제거)
  cleanupOldData: (): boolean => {
    try {
      const sessions = offlineStorage.getAllSessions();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filtered = sessions.filter(s => {
        const createdAt = s.createdAt ? new Date(s.createdAt) : new Date(0);
        return createdAt > thirtyDaysAgo;
      });
      
      localStorage.setItem('offlineSessions', JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  }
};

const saveOfflineData = async (data: any) => {
  try {
    const offlineData = await getOfflineData();
    offlineData.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
  } catch (e) {
    console.error('오프라인 저장 실패:', e);
    toast.error('오프라인 저장에 실패했습니다. 데이터가 손실될 수 있습니다.');
  }
};

const getOfflineData = async () => {
  try {
    const data = localStorage.getItem('offlineData');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('오프라인 데이터 조회 실패:', e);
    toast.error('오프라인 데이터를 불러오는데 실패했습니다.');
    return [];
  }
};

export default function RecordPage() {
  const { user } = useAuthStore();
  const {
    part, mainExercise, accessoryExercises, notes,
    setNotes, setMainExercise
  } = useSessionStore();

  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('인터넷에 다시 연결되었습니다');
      
      // 오프라인 데이터가 있으면 백그라운드에서 자동 동기화
      if (localStorage.getItem('hasPendingSessions') === 'true') {
        syncOfflineSessionsInBackground();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('오프라인 모드로 전환되었습니다');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 세션 로딩 - 마지막 세션 정보만 가져오기 (최적화)
  useEffect(() => {
    if (!part) { navigate('/'); return; }
    if (!user) return;

    let mounted = true;
    
    getLastSession(user.uid, part).then((session) => {
      if (!mounted) return;
      
      setLastSession(session);
      if (session?.mainExercise) {
        const inc = session.mainExercise.sets.every(s => s.isSuccess) ? 2.5 : 0;
        setMainExercise({
          part,
          weight: session.mainExercise.weight + inc,
          sets: Array(5).fill({ reps: 0, isSuccess: false })
        });
      }
    });
    
    return () => { mounted = false; };
  }, [user, part, navigate, setMainExercise]);

  // 로그인 시 오프라인 데이터 동기화
  useEffect(() => {
    if (!user) return;
    
    // 오프라인 데이터가 있으면 백그라운드에서 자동 동기화
    if (localStorage.getItem('hasPendingSessions') === 'true' && navigator.onLine) {
      syncOfflineSessionsInBackground();
    }
    
    // 30일 이상 된 오래된 데이터 정리
    offlineStorage.cleanupOldData();
  }, [user]);

  // 백그라운드에서 오프라인 데이터 동기화
  const syncOfflineSessionsInBackground = async () => {
    if (!navigator.onLine || !user) return;
    
    const pendingSessions = offlineStorage.getAllSessions().filter(s => s.pendingSync);
    if (pendingSessions.length === 0) {
      localStorage.removeItem('hasPendingSessions');
      return;
    }
    
    // 작은 표시만 한 번 노출
    const toastId = toast.loading(`오프라인 데이터 동기화 중...`, {
      duration: 3000  // 3초만 표시
    });
    
    let syncedCount = 0;
    const failedSessions: OfflineSession[] = [];
    
    // 동기화 병렬 처리 (최대 3개 동시에)
    const batchSize = 3;
    for (let i = 0; i < pendingSessions.length; i += batchSize) {
      const batch = pendingSessions.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(session => saveSession(session))
      );
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          syncedCount++;
          batch[index].pendingSync = false;
        } else {
          failedSessions.push(batch[index]);
        }
      });
    }
    
    // 동기화 결과 저장
    const allSessions = offlineStorage.getAllSessions();
    const updatedSessions = allSessions.map(s => {
      // pendingSync 플래그 업데이트
      if (pendingSessions.includes(s) && !failedSessions.includes(s)) {
        return { ...s, pendingSync: false };
      }
      return s;
    });
    
    localStorage.setItem('offlineSessions', JSON.stringify(updatedSessions));
    
    if (failedSessions.length === 0) {
      localStorage.removeItem('hasPendingSessions');
      toast.success(`${syncedCount}개 데이터 동기화 완료`, { id: toastId, duration: 2000 });
    } else {
      localStorage.setItem('hasPendingSessions', 'true');
    }
  };

  // 세션 오프라인 저장
  const saveSessionOffline = (session: Session) => {
    try {
      if (offlineStorage.saveSession(session)) {
        toast.success('✅ 오프라인에 저장되었습니다');
        setSaving(false);
        setDone(true);
        
        setTimeout(() => {
          navigate('/feedback', { replace: true });
        }, 500);
        return true;
      }
      return false;
    } catch (e) {
      console.error('오프라인 저장 실패:', e);
      toast.error('❌ 저장에 실패했습니다');
      setSaving(false);
      return false;
    }
  };

  // 저장 - 데이터 최소화 (Fire-and-Forget 패턴)
  const handleSave = async () => {
    if (!user || !part || !mainExercise) return;

    setSaving(true);
    setDone(false);

    try {
      // 데이터 최소화 - 메인 운동
      const minimizedMainExercise = {
        part,
        weight: mainExercise.weight,
        sets: mainExercise.sets.map((set: any) => ({
          reps: set.reps,
          isSuccess: set.isSuccess
        }))
      };

      // 보조 운동 데이터 최소화 - 타입 문제 해결
      const minimizedAccessoryExercises = Array.isArray(accessoryExercises) 
        ? accessoryExercises.map((acc: any) => ({
            name: acc.name,
            sets: Array.isArray(acc.sets) 
              ? acc.sets.map((set: any) => ({
                  reps: set.reps,
                  weight: set.weight
                })) 
              : [],
            weight: acc.weight || 0,  // AccessoryExercise에 필요한 속성 추가
            reps: acc.reps || 0       // AccessoryExercise에 필요한 속성 추가
          })) as AccessoryExercise[]  // 명시적으로 타입 지정
        : [];

      // 세션 객체 최소화
      const sess: Session = {
        userId: user.uid,
        date: new Date(),
        part,
        mainExercise: minimizedMainExercise,
        accessoryExercises: minimizedAccessoryExercises,
        notes: notes ? notes.substring(0, 300) : '', // 노트 길이 제한
        isAllSuccess: mainExercise.sets.every(s => s.isSuccess)
      };

      // 오프라인 상태면 즉시 오프라인 저장
      if (!navigator.onLine) {
        saveSessionOffline(sess);
        return;
      }

      // 저장 시작 - 성공 알림 표시
      toast.success('✅ 저장 중...');
      
      // 로컬 스토리지에 직접 저장 (그래프용)
      saveSessionToLocalStorage(sess);
      
      // 중요: 저장 요청을 보내고 곧바로 피드백 페이지로 이동
      // 서버 응답을 기다리지 않고 진행 (Fire-and-Forget)
      await saveSession(sess);
      
      toast.success('✅ 저장 완료!');
      
      // 저장 요청을 보내고 즉시 피드백 페이지로 이동
      setSaving(false);
      setDone(true);
      
      // 0.5초 후 페이지 이동 (알림 노출을 위해)
      setTimeout(() => {
        navigate('/feedback', { replace: true });
      }, 500);
    } catch (e: any) {
      console.error('[saveSession 오류]', e?.message || e);
      
      // 예외 발생 시 오프라인 저장 시도
      toast.error('❌ 저장 실패! 오프라인으로 저장합니다.');
      
      // 실패한 세션 데이터 재사용 (오류 수정된 버전)
      const minimizedMainExercise = {
        part,
        weight: mainExercise.weight,
        sets: mainExercise.sets.map((set: any) => ({
          reps: set.reps,
          isSuccess: set.isSuccess
        }))
      };

      const minimizedAccessoryExercises = Array.isArray(accessoryExercises) 
        ? accessoryExercises.map((acc: any) => ({
            name: acc.name,
            sets: Array.isArray(acc.sets) 
              ? acc.sets.map((set: any) => ({
                  reps: set.reps,
                  weight: set.weight
                })) 
              : [],
            weight: acc.weight || 0,
            reps: acc.reps || 0
          })) as AccessoryExercise[]
        : [];

      const offlineSession: Session = {
        userId: user.uid,
        date: new Date(),
        part,
        mainExercise: minimizedMainExercise,
        accessoryExercises: minimizedAccessoryExercises,
        notes: notes ? notes.substring(0, 300) : '',
        isAllSuccess: mainExercise.sets.every(s => s.isSuccess)
      };
      
      try {
        await saveOfflineData(offlineSession);
        toast.warning('⚠️ 오프라인으로 저장되었습니다. 인터넷 연결 후 자동으로 동기화됩니다.');
      } catch (offlineError: any) {
        console.error('[saveSession 오류]', offlineError?.message || offlineError);
        toast.error('❌ 저장 실패! 오프라인 저장도 실패했습니다.');
      }
    }
  };

  return (
    <Layout>
      <Toaster position="top-center" gutter={12} />

      {saving && !done && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="h-12 w-12 border-4 border-white/60 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 오프라인 모드 알림 */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-4 rounded">
          <p className="text-sm font-medium">오프라인 모드 - 인터넷 연결이 없습니다</p>
          <p className="text-xs">데이터는 기기에 임시 저장되고 인터넷 연결 시 동기화됩니다</p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {partNames[part!] || '운동'} 기록하기
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          오늘의 핵심 운동:{' '}
          <span className="text-blue-600 dark:text-blue-300">
            {coreExerciseNames[part!]}
          </span>
        </h2>
      </div>

      {lastSession && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
          <p className="text-blue-700 dark:text-blue-300">
            일자: {new Date(lastSession.date).toLocaleDateString('ko-KR')}
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            무게: {lastSession.mainExercise.weight}kg
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            성공 세트: {lastSession.mainExercise.sets.filter(s => s.isSuccess).length}/5
          </p>
        </div>
      )}

      <MainExerciseForm
        initialWeight={
          lastSession?.mainExercise.weight
            ? lastSession.mainExercise.sets.every(s => s.isSuccess)
              ? lastSession.mainExercise.weight + 2.5
              : lastSession.mainExercise.weight
            : 20
        }
      />

      {part && <AccessoryExerciseForm part={part} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">메모</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘의 컨디션이나 특이사항을 기록해보세요."
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {notes ? notes.length : 0}/300
        </p>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={
            saving ||
            !mainExercise ||
            mainExercise.sets.every(s => s.reps === 0)
          }
          className={
            saving
              ? 'w-full bg-gray-400 cursor-wait text-white py-3 rounded flex justify-center items-center'
              : `w-full ${isOnline ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white py-3 rounded`
          }
        >
          {saving ? (
            <>
              <span>저장 중</span>
              <span className="ml-2 dot-flashing"></span>
            </>
          ) : isOnline ? '저장하기' : '오프라인 저장'}
        </button>
      </div>

      <style>{`
        .dot-flashing {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background-color: #fff;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: .5s;
        }
        
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        
        .dot-flashing::before {
          left: -10px;
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background-color: #fff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        
        .dot-flashing::after {
          left: 10px;
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background-color: #fff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        
        @keyframes dot-flashing {
          0% { background-color: #fff; }
          50%, 100% { background-color: rgba(255, 255, 255, 0.2); }
        }
      `}</style>
    </Layout>
  );
}
