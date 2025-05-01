import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession, saveSession } from '../services/firebaseService';
import Layout from '../components/common/Layout';
import MainExerciseForm from '../components/exercise/MainExerciseForm';
import AccessoryExerciseForm from '../components/exercise/AccessoryExerciseForm';

const partNames = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체'
};

const coreExerciseNames = {
  chest: '벤치프레스',
  back: '데드리프트',
  shoulder: '오버헤드 프레스',
  leg: '스쿼트'
};

const RecordPage = () => {
  const { user } = useAuthStore();
  const { part, mainExercise, accessoryExercises, notes, setNotes, setMainExercise } = useSessionStore();
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!part) {
      navigate('/');
      return;
    }
    
    const fetchLastSession = async () => {
      if (user && part) {
        setIsLoading(true);
        const session = await getLastSession(user.uid, part);
        setLastSession(session);
        
        if (session && session.mainExercise) {
          const allSuccess = session.mainExercise.sets.every(set => set.isSuccess);
          const suggestedWeight = allSuccess
            ? session.mainExercise.weight + 2.5
            : session.mainExercise.weight;
          
          setMainExercise({
            part,
            weight: suggestedWeight,
            sets: [
              { reps: 0, isSuccess: false },
              { reps: 0, isSuccess: false },
              { reps: 0, isSuccess: false },
              { reps: 0, isSuccess: false },
              { reps: 0, isSuccess: false }
            ]
          });
        }
        
        setIsLoading(false);
      }
    };
    
    fetchLastSession();
  }, [user, part, navigate, setMainExercise]);
  
  const handleSave = async () => {
    if (!user || !part || !mainExercise) return;
    
    const session: Session = {
      userId: user.uid,
      date: new Date(),
      part,
      mainExercise,
      accessoryExercises,
      notes,
      isAllSuccess: mainExercise.sets.every(set => set.isSuccess)
    };
    
    const sessionId = await saveSession(session);
    
    if (sessionId) {
      navigate('/feedback');
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {partNames[part!] || '운동'} 기록하기
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 핵심 운동명 표시 */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          오늘의 핵심 운동: <span className="text-blue-600 dark:text-blue-300">{coreExerciseNames[part!]}</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {partNames[part!]} 부위의 대표적인 복합 운동이에요. 집중해서 진행해보세요!
        </p>
      </div>
      
      {lastSession && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            이전 세션 정보
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            일자: {new Date(lastSession.date).toLocaleDateString('ko-KR')}
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            무게: {lastSession.mainExercise.weight}kg
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            성공 세트: {lastSession.mainExercise.sets.filter(set => set.isSuccess).length}/
            {lastSession.mainExercise.sets.length}
          </p>
        </div>
      )}
      
      <MainExerciseForm
        initialWeight={
          lastSession?.mainExercise.weight
            ? lastSession.mainExercise.sets.every(set => set.isSuccess)
              ? lastSession.mainExercise.weight + 2.5
              : lastSession.mainExercise.weight
            : 20
        }
      />
      
      {part && <AccessoryExerciseForm part={part} />}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">메모</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘의 컨디션이나 특이사항을 기록해보세요."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          rows={3}
        ></textarea>
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={!mainExercise || mainExercise.sets.every(set => set.reps === 0)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          저장하기
        </button>
      </div>
    </Layout>
  );
};

export default RecordPage;
