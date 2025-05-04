import { useState, useEffect } from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { ExercisePart } from '../../types';
import { saveProgress } from '../../services/firebaseService';

interface Set {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

interface AccessoryExercise {
  name: string;
  sets: Set[];
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
      // 휴식이 끝나면 알림음 재생
      new Audio('/rest-end.mp3').play().catch(console.error);
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

const WorkoutLog = () => {
  const { part, lastSessionCache } = useSessionStore();
  const [weight, setWeight] = useState<number>(0);
  const [sets, setSets] = useState<Set[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessoryExercises, setAccessoryExercises] = useState<AccessoryExercise[]>([]);
  const [newAccessoryName, setNewAccessoryName] = useState<string>('');

  // 운동 부위별 주요 운동 종목 매핑
  const exerciseNameByPart: Record<ExercisePart, string> = {
    chest: '벤치 프레스',
    back: '데드리프트',
    shoulder: '오버헤드 프레스',
    leg: '스쿼트'
  };

  // 이전 세션 데이터 로드
  const lastSession = lastSessionCache[part];
  if (lastSession && weight === 0) {
    setWeight(lastSession.weight);
  }

  const handleAddSet = () => {
    setSets([...sets, { reps: 0, weight: weight, isSuccess: false }]);
  };

  const handleSetChange = (index: number, field: keyof Set, value: number | boolean) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleAddAccessoryExercise = () => {
    if (!newAccessoryName.trim()) return;
    setAccessoryExercises([
      ...accessoryExercises,
      {
        name: newAccessoryName.trim(),
        sets: [{ reps: 0, weight: 0, isSuccess: false }]
      }
    ]);
    setNewAccessoryName('');
  };

  const handleAccessorySetChange = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number | boolean) => {
    const newExercises = [...accessoryExercises];
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setAccessoryExercises(newExercises);
  };

  const handleAddAccessorySet = (exerciseIndex: number) => {
    const newExercises = [...accessoryExercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, isSuccess: false });
    setAccessoryExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!part || weight === 0 || sets.length === 0) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const progress = {
        part,
        weight,
        sets,
        notes,
        date: new Date().toISOString(),
        isSuccess: sets.some(set => set.isSuccess),
        accessoryExercises
      };

      await saveProgress(progress);
      alert('운동 기록이 저장되었습니다.');
      setSets([]);
      setNotes('');
      setAccessoryExercises([]);
    } catch (error) {
      console.error('운동 기록 저장 실패:', error);
      alert('운동 기록 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {exerciseNameByPart[part]}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            무게 (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              세트
            </label>
            <button
              onClick={handleAddSet}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              + 세트 추가
            </button>
          </div>
          
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div key={index}>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleSetChange(index, 'reps', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      placeholder="횟수"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleSetChange(index, 'weight', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      step="0.5"
                      placeholder="무게"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">성공</label>
                    <input
                      type="checkbox"
                      checked={set.isSuccess}
                      onChange={(e) => handleSetChange(index, 'isSuccess', e.target.checked)}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                {/* 세트 사이에 휴식 타이머 추가 */}
                <RestTimer setNumber={index + 1} isLastSet={index === sets.length - 1} />
              </div>
            ))}
          </div>
        </div>

        {/* 보조 운동 섹션 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              보조 운동
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAccessoryName}
                onChange={(e) => setNewAccessoryName(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="운동 이름"
              />
              <button
                onClick={handleAddAccessoryExercise}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + 추가
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {accessoryExercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <button
                    onClick={() => handleAddAccessorySet(exerciseIndex)}
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + 세트 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleAccessorySetChange(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          min="0"
                          placeholder="횟수"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleAccessorySetChange(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          min="0"
                          step="0.5"
                          placeholder="무게"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">성공</label>
                        <input
                          type="checkbox"
                          checked={set.isSuccess}
                          onChange={(e) => handleAccessorySetChange(exerciseIndex, setIndex, 'isSuccess', e.target.checked)}
                          className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            메모
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
            placeholder="운동에 대한 메모를 입력하세요..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
};

export default WorkoutLog; 