import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExercisePart } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import Layout from '../components/common/Layout';

const exercisePartOptions = [
  { value: 'chest', label: '가슴', icon: '💪' },
  { value: 'back', label: '등', icon: '🔙' },
  { value: 'shoulder', label: '어깨', icon: '🏋️' },
  { value: 'leg', label: '하체', icon: '🦵' }
];

const SelectPage = () => {
  const { user } = useAuthStore();
  const { setPart, resetSession } = useSessionStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // 세션 초기화 (이전 세션 데이터 제거)
    resetSession();
  }, [resetSession]);
  
  const handleSelect = (part: ExercisePart) => {
    setPart(part);
    navigate('/record');
  };
  
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          안녕하세요, {user?.displayName || '회원'}님!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{today}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          오늘은 어떤 운동을 하시나요?
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {exercisePartOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value as ExercisePart)}
              className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-4xl mb-3">{option.icon}</span>
              <span className="text-lg font-medium text-gray-800 dark:text-white">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SelectPage;
