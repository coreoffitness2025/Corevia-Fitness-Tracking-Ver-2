import React, { useState, useEffect } from 'react';
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
  { value: 'chest',    label: '가슴',   icon: '💪' },
  { value: 'back',     label: '등',     icon: '🔙' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️' },
  { value: 'leg',      label: '하체',   icon: '🦵' }
];

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [mainExercise, setMainExercise] = useState({
    name: '',
    sets: [{ reps: 0, weight: 0, isSuccess: false }]
  });
  const [accessoryExercises, setAccessoryExercises] = useState<Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean }>;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      toast.success('운동 기록이 저장되었습니다.');
      
      // 폼 초기화
      setPart('chest');
      setMainExercise({
        name: '',
        sets: [{ reps: 0, weight: 0, isSuccess: false }]
      });
      setAccessoryExercises([]);
      setNotes('');
      setTimer(0);
      setIsTimerRunning(false);
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
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
            <div className="flex justify-between items-center mb-6">
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
              <div className="text-2xl font-mono text-gray-800 dark:text-white">
                {formatTime(timer)}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">메인 운동</h3>
                <input
                  type="text"
                  value={mainExercise.name}
                  onChange={(e) => setMainExercise(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="운동 이름"
                  className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="space-y-4">
                  {mainExercise.sets.map((set, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="font-medium text-gray-800 dark:text-white">세트 {index + 1}</span>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => {
                          const newSets = [...mainExercise.sets];
                          newSets[index].weight = Number(e.target.value);
                          setMainExercise(prev => ({ ...prev, sets: newSets }));
                        }}
                        placeholder="무게"
                        className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          const newSets = [...mainExercise.sets];
                          newSets[index].reps = Number(e.target.value);
                          setMainExercise(prev => ({ ...prev, sets: newSets }));
                        }}
                        placeholder="횟수"
                        className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
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
                      <div key={setIndex} className="flex items-center gap-4">
                        <span className="font-medium text-gray-800 dark:text-white">세트 {setIndex + 1}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => {
                            const newExercises = [...accessoryExercises];
                            newExercises[index].sets[setIndex].weight = Number(e.target.value);
                            setAccessoryExercises(newExercises);
                          }}
                          placeholder="무게"
                          className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => {
                            const newExercises = [...accessoryExercises];
                            newExercises[index].sets[setIndex].reps = Number(e.target.value);
                            setAccessoryExercises(newExercises);
                          }}
                          placeholder="횟수"
                          className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
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