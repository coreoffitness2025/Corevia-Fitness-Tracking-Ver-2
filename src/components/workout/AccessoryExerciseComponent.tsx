import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { ExercisePart, Set } from '../../types';
import { Plus, Trash, X, CheckCircle, Timer, Clock } from 'lucide-react';
import { accessoryExercisesByPart } from '../../data/accessoryExerciseData';
import { toast } from 'react-hot-toast';
import { getPartLabel } from '../../utils/workoutUtils';

interface AccessoryExerciseProps {
  index: number;
  exercise: {
    name: string;
    sets: Array<Set>;
  };
  onChange: (index: number, updatedExercise: AccessoryExerciseProps['exercise']) => void;
  onRemove: (index: number) => void;
  currentExercisePart: ExercisePart;
  timerMinutes: number;
  timerSeconds: number;
  onTimerChange: (type: 'minutes' | 'seconds', value: string) => void;
  adjustTimerValue: (type: 'minutes' | 'seconds', amount: number) => void;
  startTimer: (sectionId: string) => void;
  resetTimer: () => void;
}

const AccessoryExerciseComponent: React.FC<AccessoryExerciseProps> = ({
  index,
  exercise,
  onChange,
  onRemove,
  currentExercisePart,
  timerMinutes,
  timerSeconds,
  onTimerChange,
  adjustTimerValue,
  startTimer,
  resetTimer,
}) => {
  const [filteredAccessoryExercises, setFilteredAccessoryExercises] = useState<any[]>([]);
  const componentSectionId = `accessory_${index}`;

  useEffect(() => {
    if (currentExercisePart && accessoryExercisesByPart[currentExercisePart]) {
      setFilteredAccessoryExercises(accessoryExercisesByPart[currentExercisePart]);
    } else {
      setFilteredAccessoryExercises([]);
    }
  }, [currentExercisePart]);

  const handleAccessoryNameSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(index, { ...exercise, name: event.target.value });
  };

  const handleSetChange = (setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: Math.max(0, value) } : s
    );
    onChange(index, { ...exercise, sets: newSets });
  };

  const handleAccessorySetCompletion = (setIndex: number, newState: boolean | null) => {
    const newSets = [...exercise.sets];
    newSets[setIndex].isSuccess = newState;
    onChange(index, { ...exercise, sets: newSets });
  };

  // 세트 완료 및 타이머 시작 통합 함수
  const handleSetCompletionAndTimer = (setIndex: number) => {
    // 현재 세트의 상태 확인
    const currentSet = exercise.sets[setIndex];
    const currentState = currentSet.isSuccess;
    
    if (currentState === null || currentState === false) {
      handleAccessorySetCompletion(setIndex, true);
      // 부모로부터 받은 타이머 시작 함수 호출
      startTimer(`accessory_${index}`);
    } else {
      handleAccessorySetCompletion(setIndex, null);
      // 부모로부터 받은 타이머 리셋 함수 호출
      resetTimer();
    }
  };

  // 세트 추가 함수
  const addSet = () => {
    const newSets = [...exercise.sets, { reps: 0, weight: 0, isSuccess: null }];
    onChange(index, { ...exercise, sets: newSets });
  };

  // 세트 삭제 함수
  const removeSet = (setIndex: number) => {
    if (exercise.sets.length <= 1) {
      toast.error('최소 1개의 세트가 필요합니다.');
      return;
    }
    const newSets = exercise.sets.filter((_, i) => i !== setIndex);
    onChange(index, { ...exercise, sets: newSets });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-gray-800 dark:text-white">보조 운동 {index + 1}</h3>
        <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
          <Trash size={16} className="text-red-500" />
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <select
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="p-1 border-gray-300 rounded-md dark:bg-gray-700 text-sm font-semibold w-full sm:w-1/2"
        >
          <option value="">운동 선택</option>
          {filteredAccessoryExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        
        {/* 휴식 타이머 설정 UI */}
        <div className="w-full sm:w-auto">
          <span className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">휴식 시간 설정</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
              <Clock size={18} className="text-gray-500" />
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => adjustTimerValue('minutes', 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >+</button>
                <input
                  type="number"
                  value={timerMinutes}
                  onChange={(e) => onTimerChange('minutes', e.target.value)}
                  className="w-10 p-1 text-center text-lg font-bold bg-transparent focus:outline-none"
                  inputMode="numeric"
                />
                <button 
                  onClick={() => adjustTimerValue('minutes', -1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >-</button>
                <span className="font-bold text-lg">:</span>
                <button 
                  onClick={() => adjustTimerValue('seconds', 10)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >+</button>
                <input
                  type="number"
                  value={timerSeconds.toString().padStart(2, '0')}
                  onChange={(e) => onTimerChange('seconds', e.target.value)}
                  className="w-12 p-1 text-center text-lg font-bold bg-transparent focus:outline-none"
                  inputMode="numeric"
                />
                <button 
                  onClick={() => adjustTimerValue('seconds', -10)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >-</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
            <span className="w-6 text-center font-semibold text-gray-500">{setIndex + 1}</span>
            <input
              type="number"
              value={set.weight}
              onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))}
              className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
              placeholder="무게"
              inputMode="decimal"
            />
            <span className="text-gray-400">kg</span>
            <input
              type="number"
              value={set.reps}
              onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))}
              className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
              placeholder="횟수"
              inputMode="numeric"
            />
            <span className="text-gray-400">회</span>
            <button
              onClick={() => handleSetCompletionAndTimer(setIndex)}
              className={`p-2 rounded-full ${set.isSuccess ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}
              title="세트 완료 체크 (타이머 자동 시작)"
            >
              <CheckCircle size={20} />
            </button>
            <button
              onClick={() => removeSet(setIndex)}
              className="p-1 text-red-500"
              aria-label="세트 삭제"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      
      {/* 세트 추가 버튼 개선 */}
      <div className="mt-2">
        <button 
          onClick={addSet}
          className="w-full py-2 flex items-center justify-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Plus size={16} /> 세트 추가
        </button>
      </div>
    </div>
  );
};

export default AccessoryExerciseComponent; 