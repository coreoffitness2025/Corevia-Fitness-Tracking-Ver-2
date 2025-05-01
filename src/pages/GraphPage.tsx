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

/* ⚠️ TS6133 방지용 : 한 번이라도 값을 평가하면 “사용됨”으로 간주된다 */
void [MainExerciseForm, AccessoryExerciseForm];

const PART_LABEL = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' } as const;
const CORE_LABEL = {
  chest: '벤치프레스',
  back: '데드리프트',
  shoulder: '오버헤드 프레스',
  leg: '스쿼트'
} as const;

/* 역시 ‘사용됨’으로 표시 */
void [PART_LABEL, CORE_LABEL];

export default function RecordPage() {
  const { user } = useAuthStore();
  const {
    part, mainExercise, accessoryExercises, notes,
    setNotes, setMainExercise
  } = useSessionStore();

  /* setNotes는 아래 textarea에서, lastSession은 JSX에서 실제로 사용되지만
     컴파일 오류가 계속된다면 이 한 줄이 방패 역할을 합니다 */
  const [lastSession, setLastSession] = useState<Session | null>(null);
  void lastSession;  // TS6133 방지용 형식적 참조

  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);
  const navigate = useNavigate();

  /* ───── 이전 세션 로드 ───── */
  useEffect(() => {
    if (!part || !user) return;

    getLastSession(user.uid, part).then((s) => {
      setLastSession(s);
      if (s?.mainExercise) {
        const inc = s.mainExercise.sets.every(x => x.isSuccess) ? 2.5 : 0;
        setMainExercise({
          part,
          weight: s.mainExercise.weight + inc,
          sets: Array(5).fill({ reps: 0, isSuccess: false })
        });
      }
    });
  }, [user, part, setMainExercise]);

  /* ───── 저장 핸들러 ───── */
  const handleSave = async () => {
    if (!user || !part || !mainExercise) return;

    setSaving(true);
    setDone(false);

    const sess: Session = {
      userId: user.uid,
      date: new Date(),
      part,
      mainExercise,
      accessoryExercises,
      notes,
      isAllSuccess: mainExercise.sets.every(x => x.isSuccess)
    };

    const withTimeout = <T,>(p: Promise<T>, ms = 10_000) =>
      Promise.race([
        p,
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error('timeout')), ms))
      ]);

    try {
      await withTimeout(saveSession(sess));
      setDone(true);
      setSaving(false);
      toast.success('✅ 저장 완료!');
      setTimeout(() => navigate('/feedback', { replace: true }), 0);
    } catch (e: any) {
      console.error('[saveSession]', e);
      setSaving(false);
      toast.error(
        e?.message === 'timeout'
          ? '⏱️ 서버 응답 지연 중입니다.'
          : '❌ 저장 실패! 네트워크를 확인하세요.'
      );
    }
  };

  /* ───── JSX ───── */
  return (
    <Layout>
      <Toaster position="top-center" gutter={12} />

      {saving && !done && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="h-12 w-12 border-4 border-white/60 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white mb-2">
          {part ? PART_LABEL[part] : '운동'} 기록하기
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR')}
        </p>
      </header>

      {part && (
        <section className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
          오늘의 핵심 운동:&nbsp;
          <span className="text-blue-600 dark:text-blue-300">
            {CORE_LABEL[part]}
          </span>
        </section>
      )}

      {lastSession && (
        <section className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
          <p>일자: {new Date(lastSession.date).toLocaleDateString('ko-KR')}</p>
          <p>무게: {lastSession.mainExercise.weight}kg</p>
          <p>
            성공 세트:{' '}
            {lastSession.mainExercise.sets.filter(x => x.isSuccess).length}/5
          </p>
        </section>
      )}

      <MainExerciseForm
        initialWeight={
          lastSession?.mainExercise.weight
            ? lastSession.mainExercise.sets.every(x => x.isSuccess)
              ? lastSession.mainExercise.weight + 2.5
              : lastSession.mainExercise.weight
            : 20
        }
      />

      {part && <AccessoryExerciseForm part={part} />}

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">메모</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘의 컨디션이나 특이사항을 기록해보세요."
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          rows={3}
        />
      </section>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={
            saving || !mainExercise || mainExercise.sets.every(x => x.reps === 0)
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

/* isolatedModules 대비 */
export {};
