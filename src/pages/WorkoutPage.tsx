import { useEffect, useState, useRef } from 'react';
import { ExercisePart, Session, AccessoryExercise, Exercise } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession } from '../services/firebaseService';
import Layout from '../components/common/Layout';
import logoSrc from '../assets/Corevia-logo.png';
import { addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/firebaseConfig';
import { exercises } from '../data/exerciseData';

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪' },
  { value: 'back',     label: '등',     icon: '🔙' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️' },
  { value: 'leg',      label: '하체',   icon: '🦵' }
];

// 각 부위별 메인 운동 목록
const mainExercises: Record<ExercisePart, Exercise[]> = {
  chest: [
    exercises.find(e => e.id === 'benchPress'),
    exercises.find(e => e.id === 'machineBenchPress')
  ].filter(Boolean) as Exercise[],
  back: [
    exercises.find(e => e.id === 'deadlift'),
    exercises.find(e => e.id === 'barbellRow'),
    exercises.find(e => e.id === 'pullUp'),
    exercises.find(e => e.id === 'tBarRow')
  ].filter(Boolean) as Exercise[],
  shoulder: [
    exercises.find(e => e.id === 'overheadPress'),
    exercises.find(e => e.id === 'machineOverheadPress')
  ].filter(Boolean) as Exercise[],
  leg: [
    exercises.find(e => e.id === 'squat'),
    exercises.find(e => e.id === 'legPress')
  ].filter(Boolean) as Exercise[],
  biceps: [
    exercises.find(e => e.id === 'dumbbellCurl'),
    exercises.find(e => e.id === 'barbellCurl'),
    exercises.find(e => e.id === 'hammerCurl')
  ].filter(Boolean) as Exercise[],
  triceps: [
    exercises.find(e => e.id === 'cablePushdown'),
    exercises.find(e => e.id === 'overheadExtension'),
    exercises.find(e => e.id === 'lyingTricepsExtension')
  ].filter(Boolean) as Exercise[],
  abs: [],
  cardio: [],
  complex: []
};

// 휴식 타이머의 기본 시간 (2분 = 120초)
const DEFAULT_REST_TIME = 120;

const WorkoutPage = () => {
  const { user } = useAuthStore();
  const [selectedPart, setSelectedPart] = useState<ExercisePart | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [sets, setSets] = useState<Array<{ reps: number; isSuccess: boolean; weight: number }>>([{ reps: 0, isSuccess: false, weight: 0 }]);
  const [accessoryExercises, setAccessoryExercises] = useState<AccessoryExercise[]>([]);
  const [accessoryNames, setAccessoryNames] = useState<string[]>([]);
  const [isAllSuccess, setIsAllSuccess] = useState<boolean>(false);
  const [successSets, setSuccessSets] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  // 휴식 타이머 상태
  const [restTime, setRestTime] = useState<number>(DEFAULT_REST_TIME);
  const [isResting, setIsResting] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const {
    setPart,
    resetSession,
    cacheLastSession,
    lastSessionCache
  } = useSessionStore();

  // ✅ 1. user가 아직 없으면 렌더링 지연
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">로그인 정보를 불러오는 중...</div>
      </Layout>
    );
  }

  useEffect(() => {
    resetSession();
    
    // 알람 사운드 요소 생성
    try {
      alarmRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3');
    } catch (error) {
      console.error('알람 사운드 로드 실패:', error);
    }
    
    return () => {
      // 컴포넌트 언마운트 시 타이머 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetSession]);

  // 휴식 타이머 시작
  const startRestTimer = () => {
    // 이미 실행 중인 타이머가 있으면 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // 타이머 시작 알림
    toast.success('휴식 타이머가 시작되었습니다.', {
      icon: '⏱️',
      duration: 2000
    });
    
    setRestTime(DEFAULT_REST_TIME);
    setIsResting(true);
    
    timerRef.current = setInterval(() => {
      setRestTime(prevTime => {
        if (prevTime <= 1) {
          // 타이머 종료
          clearInterval(timerRef.current!);
          setIsResting(false);
          
          // 알람 재생
          if (alarmRef.current) {
            alarmRef.current.play().catch(err => {
              console.error('알람 재생 실패:', err);
              // 알람 실패 시 진동 API 사용 시도
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            });
          }
          
          // 알림 표시
          toast.success('휴식 시간이 종료되었습니다!', {
            icon: '⏰',
            duration: 5000
          });
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // 휴식 타이머 중지
  const stopRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsResting(false);
    }
  };
  
  // 시간 형식 변환 (초 -> MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (part: ExercisePart) => {
    setPart(part);
    setSelectedPart(part);

    if (lastSessionCache[part] === undefined) {
      getLastSession(user.uid, part)
        .then((s) => cacheLastSession(part, s ?? null))
        .catch(console.error);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSelectedPart(exercise.part as ExercisePart);
  };

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleAddSet = () => {
    setSets([...sets, { reps: 0, isSuccess: false, weight: 0 }]);
  };

  const handleRemoveSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const handleSetSuccess = (index: number) => {
    const newSets = [...sets];
    newSets[index].isSuccess = !newSets[index].isSuccess;
    setSets(newSets);
    
    // 모든 세트가 성공했는지 확인
    const allSuccess = newSets.every(set => set.isSuccess);
    setIsAllSuccess(allSuccess);
    
    // 성공한 세트 수 계산
    const successCount = newSets.filter(set => set.isSuccess).length;
    setSuccessSets(successCount);
  };

  const handleAccessorySetSuccess = (exerciseIndex: number, setIndex: number) => {
    const newAccessoryExercises = [...accessoryExercises];
    if (newAccessoryExercises[exerciseIndex].sets) {
      newAccessoryExercises[exerciseIndex].sets![setIndex].isSuccess = 
        !newAccessoryExercises[exerciseIndex].sets![setIndex].isSuccess;
      setAccessoryExercises(newAccessoryExercises);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedPart) return;

    if (!selectedExercise) {
      toast.error('메인 운동을 선택해주세요.');
      return;
    }

    // 최근 7일 내의 기록만 저장
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionData: Session = {
      userId: user.uid,
      date: new Date(),
      part: selectedPart,
      mainExercise: {
        part: selectedPart,
        name: selectedExercise.name,
        weight: weight,
        sets: sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          isSuccess: set.isSuccess
        }))
      },
      accessoryExercises: accessoryExercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets?.map(set => ({
          reps: set.reps,
          weight: set.weight,
          isSuccess: set.isSuccess
        }))
      })),
      notes,
      isAllSuccess,
      successSets,
      accessoryNames
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
      resetForm();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('운동 기록 저장에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setSelectedPart('chest');
    setSelectedExercise(null);
    setWeight(0);
    setSets([{ reps: 0, isSuccess: false, weight: 0 }]);
    setAccessoryExercises([]);
    setAccessoryNames([]);
    setNotes('');
    setIsAllSuccess(false);
    setSuccessSets(0);
  };

  if (!selectedPart) {
    return (
      <Layout>
        <img src={logoSrc} alt="Corevia Fitness" className="mx-auto mb-6 w-48" />

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            안녕하세요, {user.displayName || '회원'}님!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{today}</p>
        </div>

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
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">운동 기록</h1>
        
        {/* 휴식 타이머 */}
        {isResting && (
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">휴식 시간</h3>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatTime(restTime)}</p>
            </div>
            <button 
              onClick={stopRestTimer}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              중지
            </button>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">메인 운동</h2>
          
          <div className="mb-6">
            {/* 운동 선택 컴포넌트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedExercise ? '선택된 운동: ' + selectedExercise.name : '운동 선택'}
              </label>
              
              {/* 버튼형 운동 선택 UI */}
              {!selectedExercise ? (
                <div className="space-y-4">
                  {/* 부위별 운동 목록 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mainExercises[selectedPart].map(exercise => (
                      <button
                        key={exercise.id}
                        onClick={() => handleExerciseSelect(exercise)}
                        className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                      >
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 mb-2">
                          {exercise.part === 'chest' && '💪'}
                          {exercise.part === 'back' && '🔙'}
                          {exercise.part === 'shoulder' && '🏋️'}
                          {exercise.part === 'leg' && '🦵'}
                          {exercise.part === 'biceps' && '💪'}
                          {exercise.part === 'triceps' && '💪'}
                        </div>
                        <span className="text-sm font-medium text-center">{exercise.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {exercise.level === 'beginner' ? '초급' : 
                          exercise.level === 'intermediate' ? '중급' : '고급'}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* 부위 변경 버튼 */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">부위 변경</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(exercisePartOptions).map(([key, option]) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedPart(option.value as ExercisePart)}
                          className={`p-2 rounded-md text-center text-sm ${
                            selectedPart === option.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <div>
                    <h3 className="font-medium">{selectedExercise.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedExercise.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="text-blue-500 hover:text-blue-700 ml-2"
                  >
                    변경
                  </button>
                </div>
              )}
            </div>
          </div>

          {selectedExercise && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">무게 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">세트</label>
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-4 mb-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleSetChange(index, 'reps', Number(e.target.value))}
                      className="w-20 p-2 border rounded"
                      placeholder="횟수"
                    />
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleSetChange(index, 'weight', Number(e.target.value))}
                      className="w-20 p-2 border rounded"
                      placeholder="무게"
                    />
                    <button
                      onClick={() => handleSetSuccess(index)}
                      className={`flex items-center justify-center w-24 p-2 rounded border ${
                        set.isSuccess 
                          ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 mr-2 flex items-center justify-center rounded-sm border ${
                        set.isSuccess 
                          ? 'bg-green-500 border-green-600 text-white' 
                          : 'bg-white border-gray-400 dark:bg-gray-600 dark:border-gray-500'
                      }`}>
                        {set.isSuccess && <span>✓</span>}
                      </div>
                      완료
                    </button>
                    <button
                      onClick={() => {
                        handleRemoveSet(index);
                        stopRestTimer(); // 세트 삭제 시 타이머 중지
                      }}
                      className="p-2 text-red-500"
                    >
                      삭제
                    </button>
                    <button
                      onClick={startRestTimer}
                      className="p-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                    >
                      휴식
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddSet}
                  className="mt-2 p-2 bg-blue-500 text-white rounded"
                >
                  세트 추가
                </button>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">보조 운동</label>
            {accessoryExercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="mb-4 p-4 border rounded">
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => {
                      const newExercises = [...accessoryExercises];
                      newExercises[exerciseIndex].name = e.target.value;
                      setAccessoryExercises(newExercises);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="보조 운동 이름"
                  />
                  <button
                    onClick={() => {
                      const newExercises = [...accessoryExercises];
                      newExercises.splice(exerciseIndex, 1);
                      setAccessoryExercises(newExercises);
                    }}
                    className="p-2 text-red-500"
                  >
                    삭제
                  </button>
                </div>
                
                {exercise.sets?.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-4 mb-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => {
                        const newExercises = [...accessoryExercises];
                        if (newExercises[exerciseIndex].sets) {
                          newExercises[exerciseIndex].sets![setIndex].reps = Number(e.target.value);
                          setAccessoryExercises(newExercises);
                        }
                      }}
                      className="w-20 p-2 border rounded"
                      placeholder="횟수"
                    />
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => {
                        const newExercises = [...accessoryExercises];
                        if (newExercises[exerciseIndex].sets) {
                          newExercises[exerciseIndex].sets![setIndex].weight = Number(e.target.value);
                          setAccessoryExercises(newExercises);
                        }
                      }}
                      className="w-20 p-2 border rounded"
                      placeholder="무게"
                    />
                    <button
                      onClick={() => handleAccessorySetSuccess(exerciseIndex, setIndex)}
                      className={`flex items-center justify-center w-24 p-2 rounded border ${
                        set.isSuccess 
                          ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 mr-2 flex items-center justify-center rounded-sm border ${
                        set.isSuccess 
                          ? 'bg-green-500 border-green-600 text-white' 
                          : 'bg-white border-gray-400 dark:bg-gray-600 dark:border-gray-500'
                      }`}>
                        {set.isSuccess && <span>✓</span>}
                      </div>
                      완료
                    </button>
                    <button
                      onClick={() => {
                        const newExercises = [...accessoryExercises];
                        if (newExercises[exerciseIndex].sets) {
                          newExercises[exerciseIndex].sets!.splice(setIndex, 1);
                          setAccessoryExercises(newExercises);
                        }
                      }}
                      className="p-2 text-red-500"
                    >
                      삭제
                    </button>
                    <button
                      onClick={startRestTimer}
                      className="p-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                    >
                      휴식
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newExercises = [...accessoryExercises];
                    if (!newExercises[exerciseIndex].sets) {
                      newExercises[exerciseIndex].sets = [];
                    }
                    newExercises[exerciseIndex].sets!.push({
                      reps: 0,
                      weight: 0,
                      isSuccess: false
                    });
                    setAccessoryExercises(newExercises);
                  }}
                  className="mt-2 p-2 bg-blue-500 text-white rounded"
                >
                  세트 추가
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setAccessoryExercises([...accessoryExercises, { name: '', sets: [] }]);
              }}
              className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
              보조 운동 추가
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                전체 성공: {isAllSuccess ? '성공' : '실패'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                성공한 세트: {successSets} / {sets.length}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!selectedExercise}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutPage; 