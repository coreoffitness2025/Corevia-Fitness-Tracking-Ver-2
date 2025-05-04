import { useState, useEffect } from 'react';
import { useSessionStore } from '../../stores/sessionStore';

interface ExerciseSet {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

// 휴식 타이머 컴포넌트 프롭스
interface RestTimerProps {
  setNumber: number;
  isLastSet: boolean;
}

// 휴식 타이머 컴포넌트
const RestTimer = ({ setNumber, isLastSet }: RestTimerProps) => {
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2분 = 120초
  const [restCompleted, setRestCompleted] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isResting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isResting && timeLeft === 0) {
      setRestCompleted(true);
      setIsResting(false);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isResting, timeLeft]);
  
  const startRest = () => {
    setIsResting(true);
    setRestCompleted(false);
    setTimeLeft(120); // 타이머 초기화
  };
  
  // 마지막 세트 이후에는 표시하지 않음
  if (isLastSet) return null;
  
  return (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700">
      {!isResting && !restCompleted ? (
        <button
          onClick={startRest}
          className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {setNumber}세트 후 휴식 시작 (2:00)
        </button>
      ) : isResting ? (
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold mb-2">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
              style={{ width: `${(timeLeft / 120) * 100}%` }}
            ></div>
          </div>
          <button 
            onClick={() => setIsResting(false)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            건너뛰기
          </button>
        </div>
      ) : (
        <div className="text-center py-2 text-red-500 font-medium animate-pulse">
          휴식 완료, {setNumber + 1}세트를 시작해주세요
        </div>
      )}
    </div>
  );
};

interface MainExerciseFormProps {
  initialWeight?: number;
}

const MainExerciseForm = ({ initialWeight = 20 }: MainExerciseFormProps) => {
  const { mainExercise, updateReps, toggleSuccess } = useSessionStore();
  const [weight, setWeight] = useState(initialWeight);
  
  useEffect(() => {
    if (!mainExercise && weight) {
      useSessionStore.setState({
        mainExercise: {
          part: useSessionStore.getState().part!,
          weight,
          sets: [
            { reps: 0, weight, isSuccess: false },
            { reps: 0, weight, isSuccess: false },
            { reps: 0, weight, isSuccess: false },
            { reps: 0, weight, isSuccess: false },
            { reps: 0, weight, isSuccess: false }
          ]
        }
      });
    }
  }, [mainExercise, weight]);
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Number(e.target.value);
    setWeight(newWeight);
    if (mainExercise) {
      useSessionStore.setState({
        mainExercise: {
          ...mainExercise,
          weight: newWeight
        }
      });
    }
  };
  
  const handleRepsChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const reps = Number(e.target.value);
    updateReps(setIndex, reps);
  };
  
  if (!mainExercise) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          무게 (kg)
        </label>
        <input
          type="number"
          value={weight}
          onChange={handleWeightChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="0"
          step="2.5"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">세트</h3>
        
        {/* 세트 1 */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-8">
            <span className="font-medium text-gray-700 dark:text-gray-300">1</span>
          </div>
          
          <div className="flex-grow">
            <input
              type="number"
              value={mainExercise.sets[0].reps || ''}
              onChange={(e) => handleRepsChange(0, e)}
              placeholder="반복 횟수"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleSuccess(0)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mainExercise.sets[0].isSuccess
                  ? 'bg-green-500 text-white focus:ring-green-500'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
              }`}
            >
              {mainExercise.sets[0].isSuccess ? '성공' : '실패'}
            </button>
          </div>
        </div>
        
        {/* 휴식 타이머 1-2 세트 사이 */}
        <RestTimer setNumber={1} isLastSet={false} />
        
        {/* 세트 2 */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-8">
            <span className="font-medium text-gray-700 dark:text-gray-300">2</span>
          </div>
          
          <div className="flex-grow">
            <input
              type="number"
              value={mainExercise.sets[1].reps || ''}
              onChange={(e) => handleRepsChange(1, e)}
              placeholder="반복 횟수"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleSuccess(1)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mainExercise.sets[1].isSuccess
                  ? 'bg-green-500 text-white focus:ring-green-500'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
              }`}
            >
              {mainExercise.sets[1].isSuccess ? '성공' : '실패'}
            </button>
          </div>
        </div>
        
        {/* 휴식 타이머 2-3 세트 사이 */}
        <RestTimer setNumber={2} isLastSet={false} />
        
        {/* 세트 3 */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-8">
            <span className="font-medium text-gray-700 dark:text-gray-300">3</span>
          </div>
          
          <div className="flex-grow">
            <input
              type="number"
              value={mainExercise.sets[2].reps || ''}
              onChange={(e) => handleRepsChange(2, e)}
              placeholder="반복 횟수"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleSuccess(2)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mainExercise.sets[2].isSuccess
                  ? 'bg-green-500 text-white focus:ring-green-500'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
              }`}
            >
              {mainExercise.sets[2].isSuccess ? '성공' : '실패'}
            </button>
          </div>
        </div>
        
        {/* 휴식 타이머 3-4 세트 사이 */}
        <RestTimer setNumber={3} isLastSet={false} />
        
        {/* 세트 4 */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-8">
            <span className="font-medium text-gray-700 dark:text-gray-300">4</span>
          </div>
          
          <div className="flex-grow">
            <input
              type="number"
              value={mainExercise.sets[3].reps || ''}
              onChange={(e) => handleRepsChange(3, e)}
              placeholder="반복 횟수"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleSuccess(3)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mainExercise.sets[3].isSuccess
                  ? 'bg-green-500 text-white focus:ring-green-500'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
              }`}
            >
              {mainExercise.sets[3].isSuccess ? '성공' : '실패'}
            </button>
          </div>
        </div>
        
        {/* 휴식 타이머 4-5 세트 사이 */}
        <RestTimer setNumber={4} isLastSet={false} />
        
        {/* 세트 5 */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-8">
            <span className="font-medium text-gray-700 dark:text-gray-300">5</span>
          </div>
          
          <div className="flex-grow">
            <input
              type="number"
              value={mainExercise.sets[4].reps || ''}
              onChange={(e) => handleRepsChange(4, e)}
              placeholder="반복 횟수"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleSuccess(4)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mainExercise.sets[4].isSuccess
                  ? 'bg-green-500 text-white focus:ring-green-500'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
              }`}
            >
              {mainExercise.sets[4].isSuccess ? '성공' : '실패'}
            </button>
          </div>
        </div>
        
        {/* 5세트 이후에는 휴식 타이머 표시하지 않음 */}
      </div>
    </div>
  );
};

export default MainExerciseForm;
