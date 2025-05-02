import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '../types';
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

export default function RecordPage() {
  const { user } = useAuthStore();
  const {
    part, mainExercise, accessoryExercises, notes,
    setNotes, setMainExercise
  } = useSessionStore();

  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

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

  // 타임아웃 래퍼 - 시간 단축 (15초로 변경)
  const withTimeout = <T,>(p: Promise<T>, ms = 15000): Promise<T> =>
    new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('timeout')), ms);
      p.then((v) => { clearTimeout(t); res(v); })
       .catch((e) => { clearTimeout(t); rej(e); });
    });

  // 저장 - 간소화된 데이터만 저장
const handleSave = async () => {
  if (!user || !part || !mainExercise) return;

  setSaving(true);
  setDone(false);

  const sess: Session = {
    userId: user.uid,
    date: new Date(),
    part,
    mainExercise,
    accessoryExercises: accessoryExercises, // 실제 accessoryExercises 데이터 사용
    notes,
    isAllSuccess: mainExercise.sets.every(s => s.isSuccess)
  };

  try {
    toast.success('✅ 저장 중...');
    
    // Firebase에 저장하고 결과 기다리기
    const id = await withTimeout(saveSession(sess));
    
    // 저장 성공 후 UI 업데이트
    setSaving(false);
    setDone(true);
    toast.success('✅ 저장 완료!');
    
    setTimeout(() => {
      navigate('/feedback', { replace: true });
    }, 500);
  } catch (e: any) {
    console.error('[saveSession error]', e?.message || e);
    setSaving(false);
    toast.error(
      e?.message === 'timeout'
        ? '⏱️ 서버 응답 지연, 잠시 후 다시 시도하세요.'
        : '❌ 저장 실패! 네트워크를 확인하세요.'
    );
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
        />
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
              ? 'w-full bg-gray-400 cursor-wait text-white py-3 rounded'
              : 'w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded'
          }
        >
          {saving ? '저장 중…' : '저장하기'}
        </button>
      </div>
    </Layout>
  );
}
