import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ExercisePart, 
  MainExerciseType,
  SetConfiguration
} from '../../types';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Card, { CardSection, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { Plus, X, Trash } from 'lucide-react';
import { getSetConfiguration } from '../../utils/workoutUtils';
import ComplexWorkoutModal from './ComplexWorkoutModal';

// 운동 부위 옵션 (복합 운동 컴포넌트에서만 사용)
const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪', mainExerciseName: '벤치 프레스' },
  { value: 'back',     label: '등',     icon: '🔙', mainExerciseName: '데드리프트' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️', mainExerciseName: '오버헤드 프레스' },
  { value: 'leg',      label: '하체',   icon: '🦵', mainExerciseName: '스쿼트' },
  { value: 'biceps',   label: '이두',   icon: '💪', mainExerciseName: '덤벨 컬' },
  { value: 'triceps',  label: '삼두',   icon: '💪', mainExerciseName: '케이블 푸시다운' }
];

export interface MainExerciseItem {
  name: string;
  part?: ExercisePart;
  sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
}

export interface AccessoryExerciseItem {
  name: string;
  weight: number;
  reps: number;
  sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
}

export interface ComplexWorkout {
  id: string;
  name: string;
  mainExercises: MainExerciseItem[];
  accessoryExercises: AccessoryExerciseItem[];
}

interface ComplexWorkoutFormProps {
  mainExercise: MainExerciseItem;
  accessoryExercises: AccessoryExerciseItem[];
  setConfiguration: SetConfiguration;
  customSets: number;
  customReps: number;
  onWorkoutLoaded: (
    mainExercises: MainExerciseItem[], 
    accessoryExercises: AccessoryExerciseItem[]
  ) => void;
}

const ComplexWorkoutForm: React.FC<ComplexWorkoutFormProps> = ({
  mainExercise,
  accessoryExercises,
  setConfiguration,
  customSets,
  customReps,
  onWorkoutLoaded
}) => {
  const { userProfile } = useAuth();
  const [mainExercises, setMainExercises] = useState<MainExerciseItem[]>([]);
  const [complexWorkoutName, setComplexWorkoutName] = useState('');
  const [savedComplexWorkouts, setSavedComplexWorkouts] = useState<ComplexWorkout[]>([]);
  const [showComplexWorkoutModal, setShowComplexWorkoutModal] = useState(false);
  const [selectedComplexWorkout, setSelectedComplexWorkout] = useState<string | null>(null);
  const [isLoadingComplexWorkouts, setIsLoadingComplexWorkouts] = useState(false);
  const [isSavingComplexWorkout, setIsSavingComplexWorkout] = useState(false);
  const [mainExercisePart, setMainExercisePart] = useState<ExercisePart>('chest');

  // 컴포넌트 마운트 시 복합 운동 목록 가져오기
  useEffect(() => {
    fetchComplexWorkouts();
  }, [userProfile]);

  // 복합 운동 저장 기능
  const saveComplexWorkout = async () => {
    if (!userProfile || !complexWorkoutName.trim()) {
      toast.error('복합 운동 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSavingComplexWorkout(true);
      
      // 메인 운동 데이터와 보조 운동 데이터 준비
      const complexWorkoutData = {
        userId: userProfile.uid,
        name: complexWorkoutName,
        date: new Date(),
        // 현재 메인 운동과 추가 메인 운동들을 모두 포함
        mainExercises: [mainExercise, ...mainExercises].filter(ex => 
          ex.name && ex.name.trim() !== '' && ex.name !== '복합 운동 불러오기'
        ),
        accessoryExercises: accessoryExercises,
        part: 'complex' // 부위를 명시적으로 'complex'로 저장
      };

      // 메인 운동이 하나도 없으면 오류 메시지 표시
      if (complexWorkoutData.mainExercises.length === 0) {
        toast.error('최소 하나 이상의 메인 운동이 필요합니다.');
        setIsSavingComplexWorkout(false);
        return;
      }

      // Firestore에 저장
      await addDoc(collection(db, 'complexWorkouts'), complexWorkoutData);
      
      toast.success('복합 운동이 저장되었습니다.');
      fetchComplexWorkouts(); // 목록 새로고침
      setComplexWorkoutName(''); // 입력 필드 초기화
      
    } catch (error) {
      console.error('복합 운동 저장 중 오류 발생:', error);
      toast.error('복합 운동 저장에 실패했습니다.');
    } finally {
      setIsSavingComplexWorkout(false);
    }
  };

  // 복합 운동 목록 가져오기
  const fetchComplexWorkouts = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoadingComplexWorkouts(true);
      const complexWorkoutsCollection = collection(db, 'complexWorkouts');
      const q = query(complexWorkoutsCollection, where('userId', '==', userProfile.uid));
      const snapshot = await getDocs(q);
      
      const workouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any
      }));
      
      setSavedComplexWorkouts(workouts);
    } catch (error) {
      console.error('복합 운동 목록 가져오기 실패:', error);
      toast.error('복합 운동 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingComplexWorkouts(false);
    }
  };

  // 복합 운동 불러오기
  const loadComplexWorkout = (workoutId: string) => {
    const workout = savedComplexWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // 첫 번째 메인 운동으로 설정하고 나머지는 mainExercises에 추가
    if (workout.mainExercises && workout.mainExercises.length > 0) {
      const [firstMain, ...restMains] = workout.mainExercises;
      
      // 나머지 메인 운동에도 part 속성이 없으면 추가
      const restMainsWithPart = restMains.map(exercise => ({
        ...exercise,
        part: exercise.part || 'chest' as ExercisePart
      }));
      
      setMainExercises(restMainsWithPart);
      
      // 보조 운동 설정
      if (workout.accessoryExercises && workout.accessoryExercises.length > 0) {
        // onWorkoutLoaded 콜백을 통해 부모 컴포넌트에 데이터 전달
        onWorkoutLoaded(
          [firstMain, ...restMainsWithPart], 
          workout.accessoryExercises
        );
      }
    }
    
    toast.success(`"${workout.name}" 복합 운동을 불러왔습니다.`);
  };

  // 메인 운동 추가
  const addMainExercise = () => {
    // 세트 구성 정보 가져오기
    const { setsCount, repsCount } = getSetConfiguration(
      setConfiguration,
      customSets,
      customReps
    );
    
    // 부위별 메인 운동 이름 찾기
    const mainExerciseNameForPart = exercisePartOptions.find(
      opt => opt.value === mainExercisePart
    )?.mainExerciseName || '';
    
    // 새 메인 운동 생성
    const newExercise: MainExerciseItem = {
      name: mainExerciseNameForPart, // 선택된 부위에 맞는 메인 운동 이름 사용
      part: mainExercisePart, // 부위 정보 추가
      sets: Array.from({ length: setsCount }, () => ({
        reps: repsCount,
        weight: 0,
        isSuccess: null
      }))
    };
    
    setMainExercises([...mainExercises, newExercise]);
  };

  // 메인 운동 제거
  const removeMainExercise = (index: number) => {
    setMainExercises(prev => prev.filter((_, i) => i !== index));
  };

  // 메인 운동 변경
  const handleMainExerciseChange = (index: number, updatedExercise: MainExerciseItem) => {
    setMainExercises(prev => {
      const newExercises = [...prev];
      newExercises[index] = updatedExercise;
      return newExercises;
    });
  };

  // 메인 운동 세트 추가
  const addSetToMainExercise = (exerciseIndex: number) => {
    const { repsCount } = getSetConfiguration(
      setConfiguration,
      customSets,
      customReps
    );
    
    const newExercises = [...mainExercises];
    if (newExercises[exerciseIndex]) {
      newExercises[exerciseIndex].sets = [
        ...newExercises[exerciseIndex].sets,
        {
          reps: repsCount,
          weight: 0,
          isSuccess: null
        }
      ];
      setMainExercises(newExercises);
    }
  };

  // 메인 운동 세트 제거
  const removeSetFromMainExercise = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...mainExercises];
    if (newExercises[exerciseIndex] && newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      setMainExercises(newExercises);
    } else {
      toast.warn('최소 한 개의 세트가 필요합니다.');
    }
  };

  // 부위별 메인 운동 선택 처리
  const handleMainExercisePartChange = (index: number, part: ExercisePart) => {
    // 부위별 메인 운동 이름 찾기
    const mainExerciseNameForPart = exercisePartOptions.find(
      opt => opt.value === part
    )?.mainExerciseName || '';
    
    // 해당 인덱스의 메인 운동 이름 업데이트
    const updatedExercise = {
      ...mainExercises[index],
      name: mainExerciseNameForPart,
      part: part
    };
    
    handleMainExerciseChange(index, updatedExercise);
  };

  return (
    <>
      {/* 복합 운동 모달 */}
      <ComplexWorkoutModal
        isOpen={showComplexWorkoutModal}
        onClose={() => setShowComplexWorkoutModal(false)}
        savedWorkouts={savedComplexWorkouts}
        isLoading={isLoadingComplexWorkouts}
        onSelect={loadComplexWorkout}
        selectedWorkoutId={selectedComplexWorkout}
      />

      {/* 복합 운동 로드 버튼 */}
      <div className="w-full mb-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">운동 선택</label>
            <button
              onClick={() => setShowComplexWorkoutModal(true)}
              className="w-full p-2 border rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
            >
              복합 운동 불러오기
            </button>
          </div>
          
          {/* 복합 운동 저장 섹션 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">복합 운동 이름</label>
              <button
                onClick={saveComplexWorkout}
                disabled={isSavingComplexWorkout}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg disabled:opacity-50"
              >
                {isSavingComplexWorkout ? '저장 중...' : '복합 운동 저장'}
              </button>
            </div>
            <input
              type="text"
              value={complexWorkoutName}
              onChange={(e) => setComplexWorkoutName(e.target.value)}
              placeholder="저장할 복합 운동 이름을 입력하세요"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* 추가 메인 운동 섹션 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">추가 메인 운동</h3>
        
        {/* 새 메인 운동 부위 선택 UI */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">새 메인 운동 부위 선택</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {exercisePartOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setMainExercisePart(option.value as ExercisePart)}
                className={`
                  py-2 px-3 text-center text-sm rounded-lg transition-colors
                  ${mainExercisePart === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 추가된 메인 운동 목록 */}
        <div className="space-y-4">
          {mainExercises.map((exercise, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                {/* 부위 선택 UI */}
                <div className="flex-1 mr-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    운동 부위
                  </label>
                  <select
                    value={exercise.part || 'chest'}
                    onChange={(e) => handleMainExercisePartChange(idx, e.target.value as ExercisePart)}
                    className="p-2 border rounded-md bg-white dark:bg-gray-700 w-full"
                  >
                    {exercisePartOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.mainExerciseName})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    운동 이름
                  </label>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => {
                      const updatedExercise = { ...exercise, name: e.target.value };
                      handleMainExerciseChange(idx, updatedExercise);
                    }}
                    placeholder="운동 이름"
                    className="p-2 border rounded-md w-full"
                  />
                </div>
                
                <button
                  onClick={() => removeMainExercise(idx)}
                  className="ml-2 mt-6 text-red-500 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">세트 {setIdx + 1}</div>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => removeSetFromMainExercise(idx, setIdx)}
                        className="h-8"
                        icon={<Trash size={16} />}
                      >
                        삭제
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          무게 (kg)
                        </label>
                        <input
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => {
                            const newSets = [...exercise.sets];
                            newSets[setIdx].weight = Number(e.target.value) || 0;
                            const updatedExercise = { ...exercise, sets: newSets };
                            handleMainExerciseChange(idx, updatedExercise);
                          }}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          횟수
                        </label>
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => {
                            const newSets = [...exercise.sets];
                            newSets[setIdx].reps = Number(e.target.value) || 0;
                            const updatedExercise = { ...exercise, sets: newSets };
                            handleMainExerciseChange(idx, updatedExercise);
                          }}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  className="mt-2 flex items-center justify-center w-full p-2 border border-dashed rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => addSetToMainExercise(idx)}
                >
                  <Plus size={16} className="mr-1" /> 세트 추가
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          className="mt-3 flex items-center justify-center w-full p-2 border border-dashed rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          onClick={addMainExercise}
        >
          <Plus size={18} className="mr-1" /> {mainExercisePart !== 'chest' ? exercisePartOptions.find(opt => opt.value === mainExercisePart)?.label + ' ' : ''}메인 운동 추가
        </button>
      </div>
    </>
  );
};

export default ComplexWorkoutForm; 