import { useEffect, useState } from 'react';
import { ExercisePart, Session, AccessoryExercise } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getLastSession } from '../firebase/firebaseConfig';
import Layout from '../components/common/Layout';
import logoSrc from '../assets/Corevia-logo.png';
import { addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/firebaseConfig';

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪' },
  { value: 'back',     label: '등',     icon: '🔙' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️' },
  { value: 'leg',      label: '하체',   icon: '🦵' }
];

const WorkoutPage = () => {
  const { user } = useAuthStore();
  const [selectedPart, setSelectedPart] = useState<ExercisePart | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [sets, setSets] = useState<Array<{ reps: number; isSuccess: boolean; weight: number }>>([{ reps: 0, isSuccess: false, weight: 0 }]);
  const [accessoryExercises, setAccessoryExercises] = useState<AccessoryExercise[]>([]);
  const [accessoryNames, setAccessoryNames] = useState<string[]>([]);
  const [isAllSuccess, setIsAllSuccess] = useState<boolean>(false);
  const [successSets, setSuccessSets] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

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
  }, [resetSession]);

  const handleSelect = (part: ExercisePart) => {
    setPart(part);
    setSelectedPart(part);

    if (lastSessionCache[part] === undefined) {
      getLastSession(user.uid, part)
        .then((s) => cacheLastSession(part, s ?? null))
        .catch(console.error);
    }
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

    // 최근 7일 내의 기록만 저장
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionData: Session = {
      userId: user.uid,
      date: new Date(),
      part: selectedPart,
      mainExercise: {
        part: selectedPart,
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
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">메인 운동</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">운동 부위</label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
              className="w-full p-2 border rounded"
            >
              <option value="chest">가슴</option>
              <option value="back">등</option>
              <option value="shoulder">어깨</option>
              <option value="leg">하체</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">무게 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">세트</label>
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
                  className={`p-2 rounded ${
                    set.isSuccess ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {set.isSuccess ? '성공' : '실패'}
                </button>
                <button
                  onClick={() => handleRemoveSet(index)}
                  className="p-2 text-red-500"
                >
                  삭제
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">보조 운동</label>
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
                      className={`p-2 rounded ${
                        set.isSuccess ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {set.isSuccess ? '성공' : '실패'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                전체 성공: {isAllSuccess ? '성공' : '실패'}
              </p>
              <p className="text-sm text-gray-600">
                성공한 세트: {successSets} / {sets.length}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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