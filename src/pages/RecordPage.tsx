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

  /* ───── 이전 세션 불러오기 ───── */
  useEffect(() => {
    if (!part) { navigate('/'); return; }
    if (!user) return;

    getLastSession(user.uid, part).then((session) => {
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
  }, [user, part, navigate, setMainExercise]);

  /* ───── 25초 타임아웃 래퍼 ───── */
  const withTimeout = <T,>(p: Promise<T>, ms = 25_000): Promise<T> =>
    new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('timeout')), ms);
      p.then((v) => { clearTimeout(t); res(v); })
       .catch((e) => { clearTimeout(t); rej(e); });
    });

  /* ───── 저장 ───── */
  const handleSave = async () => {
    if (!user || !part || !mainExercise) return;

    setSaving(true);
    setDone(false);

    const sess: Session = {
      userId: user.uid,
      date: new Date(),
      part,
      mainExercise,
      accessoryExercises,         // ✅ 보조 운동도 함께 저장
      notes,
      isAllSuccess: mainExercise.sets.every(s => s.isSuccess)
    };

    try {
      await withTimeout(saveSession(sess));        // 25초 제한
      setDone(true);
      setSaving(false);

      toast.success('✅ 저장 완료!');
      setTimeout(() => navigate('/feedback', { replace: true }), 0);
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

      {/* --- 나머지 JSX(헤더·폼·버튼) 동일 --- */}
      {/* …중략 (기존 코드 그대로)… */}
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
