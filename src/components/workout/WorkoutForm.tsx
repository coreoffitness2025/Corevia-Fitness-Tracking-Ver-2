import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { ExercisePart, Session } from '../../types';
import { addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Layout from '../common/Layout';

interface WorkoutFormProps {
  onSuccess?: () => void; // 저장 성공 시 호출될 콜백
}

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪', mainExerciseName: '벤치 프레스' },
  { value: 'back',     label: '등',     icon: '🔙', mainExerciseName: '데드리프트' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️', mainExerciseName: '오버헤드 프레스' },
  { value: 'leg',      label: '하체',   icon: '🦵', mainExerciseName: '스쿼트' }
];

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [mainExercise, setMainExercise] = useState({
    name: exercisePartOptions[0].mainExerciseName,
    sets: [{ reps: 0, weight: 0, isSuccess: false }]
  });
  const [accessoryExercises, setAccessoryExercises] = useState<Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean }>;
  }>>([]);
  const [notes, setNotes] = useState('');
  
  // 타이머 관련 상태
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number; isPaused: boolean }>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});
  
  // 파트가 변경될 때 메인 운동 이름 자동 변경
  useEffect(() => {
    const selectedPart = exercisePartOptions.find(option => option.value === part);
    if (selectedPart) {
      setMainExercise(prev => ({
        ...prev,
        name: selectedPart.mainExerciseName
      }));
    }
  }, [part]);

  // 타이머 효과
  useEffect(() => {
    // 활성화된 타이머들에 대한 처리
    Object.entries(activeTimers).forEach(([timerId, timerInfo]) => {
      // 일시정지 상태면 타이머를 진행하지 않음
      if (timerInfo.isPaused) {
        if (timerRefs.current[timerId]) {
          clearInterval(timerRefs.current[timerId]);
          delete timerRefs.current[timerId];
        }
        return;
      }
      
      if (timerInfo.timeLeft > 0 && !timerRefs.current[timerId]) {
        timerRefs.current[timerId] = setInterval(() => {
          setActiveTimers(prev => {
            const prevTimer = prev[timerId];
            if (!prevTimer) return prev;
            
            const newTime = prevTimer.timeLeft - 1;
            if (newTime <= 0) {
              clearInterval(timerRefs.current[timerId]);
              delete timerRefs.current[timerId];
              // 타이머 종료 알림
              toast('휴식 시간이 끝났습니다. 다음 세트를 진행해주세요!', {
                icon: '⏰',
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
              });
              
              // 타이머 제거
              const newTimers = { ...prev };
              delete newTimers[timerId];
              return newTimers;
            }
            return { ...prev, [timerId]: { ...prevTimer, timeLeft: newTime } };
          });
        }, 1000);
      }
    });
    
    return () => {
      // 모든 타이머 정리
      Object.values(timerRefs.current).forEach(timer => clearInterval(timer));
    };
  }, [activeTimers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = (exerciseIndex: number = -1, setIndex: number) => {
    // 타이머 ID 생성 (메인 운동 또는 보조 운동에 따라 다름)
    const timerId = exerciseIndex === -1 
      ? `main_${setIndex}` 
      : `accessory_${exerciseIndex}_${setIndex}`;
    
    setActiveTimers(prev => {
      // 타이머가 이미 존재하는 경우
      if (prev[timerId]) {
        const currentTimer = prev[timerId];
        
        // 타이머가 일시정지 상태인 경우 => 재개
        if (currentTimer.isPaused) {
          toast.success('타이머 재개됨', { duration: 1500 });
          return { ...prev, [timerId]: { ...currentTimer, isPaused: false } };
        } 
        // 타이머가 실행 중인 경우 => 일시정지
        else {
          toast.success('타이머 일시정지됨', { duration: 1500 });
          return { ...prev, [timerId]: { ...currentTimer, isPaused: true } };
        }
      } 
      // 새 타이머 시작 (2분 = 120초)
      else {
        toast.success('타이머 시작됨', { duration: 1500 });
        return { ...prev, [timerId]: { timeLeft: 120, isPaused: false } };
      }
    });
  };

  const addSet = (exerciseIndex: number = -1) => {
    const newSet = { reps: 0, weight: 0, isSuccess: false };
    if (exerciseIndex === -1) {
      setMainExercise(prev => ({
        ...prev,
        sets: [...prev.sets, newSet]
      }));
    } else {
      setAccessoryExercises(prev => {
        const newExercises = [...prev];
        newExercises[exerciseIndex].sets.push(newSet);
        return newExercises;
      });
    }
  };

  const addAccessoryExercise = () => {
    setAccessoryExercises(prev => [
      ...prev,
      { 
        name: '', 
        weight: 0,
        reps: 0,
        sets: [{ reps: 0, weight: 0, isSuccess: false }] 
      }
    ]);
  };

  // 횟수 자동 성공 처리
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      newSets[setIndex].reps = newReps;
      // 10회 이상이면 자동으로 성공 처리
      newSets[setIndex].isSuccess = newReps >= 10;
      setMainExercise(prev => ({ ...prev, sets: newSets }));
    } else if (accessoryIndex !== undefined) {
      const newExercises = [...accessoryExercises];
      newExercises[accessoryIndex].sets[setIndex].reps = newReps;
      // 10회 이상이면 자동으로 성공 처리
      newExercises[accessoryIndex].sets[setIndex].isSuccess = newReps >= 10;
      setAccessoryExercises(newExercises);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 최근 7일 내의 기록만 저장
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionData: Session = {
      userId: user.uid,
      date: new Date(),
      part,
      mainExercise: {
        part,
        weight: mainExercise.sets[0].weight,
        sets: mainExercise.sets
      },
      accessoryExercises,
      notes,
      isAllSuccess: mainExercise.sets.every(set => set.isSuccess),
      successSets: mainExercise.sets.filter(set => set.isSuccess).length,
      accessoryNames: accessoryExercises.map(ex => ex.name)
    };

    try {
      // 기존 기록 확인
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', user.uid),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.size >= 7) {
        toast.error('최근 7일 동안의 기록만 저장할 수 있습니다.');
        return;
      }

      await addDoc(collection(db, 'sessions'), sessionData);
      
      // 저장 완료 토스트 메시지
      toast.success('저장 완료!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '1.2rem',
          minWidth: '250px',
          textAlign: 'center',
        },
        icon: '✅'
      });
      
      // 5회 이상 10세트 성공 시 증량 추천 메시지
      const successSets = mainExercise.sets.filter(set => set.isSuccess).length;
      if (successSets >= 5 && mainExercise.sets.length >= 10) {
        toast.success('훈련에 성공했습니다. 2.5kg 증량을 추천드립니다!', {
          duration: 5000,
          icon: '🏋️',
          style: {
            background: '#3B82F6',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
      }
      
      // 폼 초기화
      setPart('chest');
      setMainExercise({
        name: exercisePartOptions[0].mainExerciseName,
        sets: [{ reps: 0, weight: 0, isSuccess: false }]
      });
      setAccessoryExercises([]);
      setNotes('');
      
      // 성공 콜백 호출 - 운동 기록 페이지로 이동
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('운동 기록 저장에 실패했습니다.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">새 운동 기록</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <select
                value={part}
                onChange={(e) => setPart(e.target.value as ExercisePart)}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {exercisePartOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  메인 운동: {mainExercise.name}
                </h3>
                <div className="space-y-4">
                  {mainExercise.sets.map((set, index) => (
                    <div key={index} className="flex items-center gap-4 flex-wrap">
                      <span className="font-medium text-gray-800 dark:text-white w-16">세트 {index + 1}</span>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => {
                            const newSets = [...mainExercise.sets];
                            newSets[index].weight = Number(e.target.value);
                            setMainExercise(prev => ({ ...prev, sets: newSets }));
                          }}
                          placeholder="kg"
                          className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">횟수</label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleRepsChange(Number(e.target.value), index, true)}
                          placeholder="횟수"
                          className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSets = [...mainExercise.sets];
                          newSets[index].isSuccess = !newSets[index].isSuccess;
                          setMainExercise(prev => ({ ...prev, sets: newSets }));
                        }}
                        className={`px-3 py-1 rounded ${
                          set.isSuccess 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                        }`}
                      >
                        {set.isSuccess ? '성공' : '실패'}
                      </button>
                      <span className="text-xs text-gray-500 italic ml-2">(* 10회 이상 성공시 성공으로 계산)</span>
                      
                      <button
                        type="button"
                        onClick={() => toggleTimer(-1, index)}
                        className={`ml-2 px-3 py-1 rounded ${
                          !activeTimers[`main_${index}`] 
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : activeTimers[`main_${index}`].isPaused
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                        }`}
                      >
                        {!activeTimers[`main_${index}`]
                          ? '휴식 타이머' 
                          : activeTimers[`main_${index}`].isPaused
                            ? `▶️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}` 
                            : `⏸️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}`
                        }
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSet()}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + 세트 추가
                  </button>
                </div>
              </div>

              {accessoryExercises.map((exercise, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    보조 운동 {index + 1}
                  </h3>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => {
                      const newExercises = [...accessoryExercises];
                      newExercises[index].name = e.target.value;
                      setAccessoryExercises(newExercises);
                    }}
                    placeholder="운동 이름"
                    className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="space-y-4">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-4 flex-wrap">
                        <span className="font-medium text-gray-800 dark:text-white w-16">세트 {setIndex + 1}</span>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => {
                              const newExercises = [...accessoryExercises];
                              newExercises[index].sets[setIndex].weight = Number(e.target.value);
                              setAccessoryExercises(newExercises);
                            }}
                            placeholder="kg"
                            className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">횟수</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleRepsChange(Number(e.target.value), setIndex, false, index)}
                            placeholder="횟수"
                            className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newExercises = [...accessoryExercises];
                            newExercises[index].sets[setIndex].isSuccess = !newExercises[index].sets[setIndex].isSuccess;
                            setAccessoryExercises(newExercises);
                          }}
                          className={`px-3 py-1 rounded ${
                            set.isSuccess 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                          }`}
                        >
                          {set.isSuccess ? '성공' : '실패'}
                        </button>
                        <span className="text-xs text-gray-500 italic ml-2">(* 10회 이상 성공시 성공으로 계산)</span>
                        
                        <button
                          type="button"
                          onClick={() => toggleTimer(index, setIndex)}
                          className={`ml-2 px-3 py-1 rounded ${
                            !activeTimers[`accessory_${index}_${setIndex}`] 
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : activeTimers[`accessory_${index}_${setIndex}`].isPaused
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                          }`}
                        >
                          {!activeTimers[`accessory_${index}_${setIndex}`]
                            ? '휴식 타이머' 
                            : activeTimers[`accessory_${index}_${setIndex}`].isPaused
                              ? `▶️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}` 
                              : `⏸️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}`
                          }
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSet(index)}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + 세트 추가
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAccessoryExercise}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                보조 운동 추가
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">메모</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="오늘의 운동에 대한 메모를 남겨보세요"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            저장하기
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default WorkoutForm;