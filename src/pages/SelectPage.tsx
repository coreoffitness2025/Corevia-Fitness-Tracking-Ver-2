import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExercisePart } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession } from '../services/firebaseService';
import Layout from '../components/common/Layout';

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪' },
  { value: 'back',     label: '등',     icon: '🔙' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️' },
  { value: 'leg',      label: '하체',   icon: '🦵' }
];

const SelectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    setPart,
    resetSession,
    cacheLastSession,
    lastSessionCache
  } = useSessionStore();

  /* 페이지 진입 시 세션 상태 초기화(캐시는 유지) */
  useEffect(() => {
    resetSession();
  }, [resetSession]);

  /* 파트 선택 */
  const handleSelect = async (part: ExercisePart) => {
    setPart(part);

    // 캐시에 없으면 Firestore 한 번만 호출
    if (lastSessionCache[part] === undefined && user) {
      const session = await getLastSession(user.uid, part);
      cacheLastSession(part, session ?? null);
    }

    navigate('/record');            // 즉시 페이지 전환
  };

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  /* ---------------- JSX ---------------- */
  return (
    <Layout>
      {/* ───── Corevia 로고 ───── */}
      <img
        src="/corevia-logo.png"          /* public 폴더 경로 */
        alt="Corevia Fitness Logo"
        className="mx-auto mb-6 w-48"    /* 가운데 정렬 · 아래 여백 · 폭 12rem */
      />

      {/* 인사말 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          안녕하세요, {user?.displayName || '회원'}님!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{today}</p>
      </div>

      {/* 운동 파트 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          오늘은 어떤 운동을 하시나요?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {exercisePartOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSelect(o.value as ExercisePart)}
              className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-4xl mb-3">{o.icon}</span>
              <span className="text-lg font-medium text-gray-800 dark:text-white">
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SelectPage;
