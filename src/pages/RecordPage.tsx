import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession, saveSession } from '../services/firebaseService';
import Layout from '../components/common/Layout';
import MainExerciseForm from '../components/exercise/MainExerciseForm';
import AccessoryExerciseForm from '../components/exercise/AccessoryExerciseForm';

const partNames = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' } as const;
const coreNames = { chest: '벤치프레스', back: '데드리프트', shoulder: '오버헤드 프레스', leg: '스쿼트' } as const;

const RecordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    part,
    mainExercise,
    setMainExercise,
    accessoryExercises,
    notes,
    setNotes,
    lastSessionCache,
    cacheLastSession
  } = useSessionStore();

  /* ① 캐시된 최근 세션 (undefined = 아직 안 불러옴, null = 없음) */
  const lastSession = part ? lastSessionCache[part] : undefined;

  /* ② 캐시에 없으면 백그라운드에서 불러오고 캐싱 */
  useEffect(() => {
    if (!part) {
      navigate('/');
      return;
    }
    if (lastSession === undefined && user) {
      getLastSession(user.uid, part).then((s) => cacheLastSession(part, s ?? null));
    }
  }, [part, user, lastSession, cacheLastSession, navigate]);

  /* ③ 메인 운동 초기 세팅 (캐시 도착 후 1회) */
  useEffect(() => {
    if (!part || !lastSession || mainExercise) return;

    const successAll = lastSession.mainExercise.sets.every((x) => x.isSuccess);
    setMainExercise({
      part,
      weight: successAll ? lastSession.mainExercise.weight + 2.5 : lastSession.mainExercise.weight,
      sets: Array(5).fill({ reps: 0, isSuccess: false })
    });
  }, [part, lastSession, mainExercise, setMainExercise]);

  /* ---------- 저장 ---------- */
  const handleSave = async () => {
    if (!user || !part || !mainExercise) return;

    const session: Session = {
      userId: user.uid,
      date: new Date(),
      part,
      mainExercise,
      accessoryExercises,
      notes,
      isAllSuccess: mainExercise.sets.every((s) => s.isSuccess)
    };

    const id = await saveSession(session);
    if (id) navigate('/feedback');
  };

  /* ---------- 라우팅 보호 ---------- */
  if (!part) return null;

  /* ---------- JSX ---------- */
  return (
    <Layout>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{partNames[part]} 기록하기</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString('ko-KR')}</p>
      </div>

      {/* 핵심 운동 */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold">
          오늘의 핵심 운동:{' '}
          <span className="text-blue-600 dark:text-blue-300">{coreNames[part]}</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {partNames[part]} 부위 대표 복합 운동입니다. 집중해서 진행해보세요!
        </p>
      </div>

      {/* 이전 세션 / 로딩 */}
      {lastSession === undefined ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
          이전 세션 정보를 불러오는 중…
        </div>
      ) : lastSession ? (
        <div className="bg-blue-50 dark:bg-blue-900 rounded p-4 mb-6">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">이전 세션 정보</h3>
          <p>일자: {new Date(lastSession.date).toLocaleDateString('ko-KR')}</p>
          <p>무게: {lastSession.mainExercise.weight}kg</p>
          <p>
            성공 세트:{' '}
            {lastSession.mainExercise.sets.filter((s) => s.isSuccess).length}/
            {lastSession.mainExercise.sets.length}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mb-6 text-sm">
          이전 세션이 없습니다. 오늘이 첫 기록이에요!
        </div>
      )}

      {/* 메인/액세서리 입력 */}
      <MainExerciseForm
        initialWeight={
          lastSession?.mainExercise.weight
            ? lastSession.mainExercise.sets.every((s) => s.isSuccess)
              ? lastSession.mainExercise.weight + 2.5
              : lastSession.mainExercise.weight
            : 20
        }
      />
      <AccessoryExerciseForm part={part} />

      {/* 메모 */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-6">
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="오늘 컨디션·특이사항 메모"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t">
        <button
          className="w-full bg-blue-500 text-white py-3 rounded disabled:opacity-50"
          disabled={!mainExercise || mainExercise.sets.every((s) => s.reps === 0)}
          onClick={handleSave}
        >
          저장하기
        </button>
      </div>
    </Layout>
  );
};

export default RecordPage;
