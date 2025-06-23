import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { ExercisePart, Set, SetConfiguration } from '../../types';
import { Plus, Trash, X, Clock, CheckCircle, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { accessoryExercisesByPart } from '../../data/accessoryExerciseData';
import { toast } from 'react-hot-toast';
import { getSetConfiguration, getPartLabel } from '../../utils/workoutUtils';

interface AccessoryExerciseProps {
  index: number;
  exercise: {
    name: string;
    sets: Array<Set>;
  };
  onChange: (index: number, updatedExercise: AccessoryExerciseProps['exercise']) => void;
  onRemove: (index: number) => void;
  currentExercisePart: ExercisePart;
  globalTimer: {
    sectionId: string | null;
    timeLeft: number;
    timerMinutes: number;
    timerSeconds: number;
    isPaused: boolean;
    isRunning: boolean;
  };
  startGlobalTimer: (sectionId: string) => void;
  resetGlobalTimer: () => void;
  formatTime: (seconds: number) => string;
}

const AccessoryExerciseComponent: React.FC<AccessoryExerciseProps> = ({
  index,
  exercise,
  onChange,
  onRemove,
  currentExercisePart,
  globalTimer,
  startGlobalTimer,
  resetGlobalTimer,
  formatTime,
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

  const handleAccessorySetCompletion = (setIndex: number) => {
    const newSets = [...exercise.sets];
    newSets[setIndex].isSuccess = !newSets[setIndex].isSuccess;
    onChange(index, { ...exercise, sets: newSets });
  };

  // 세트 완료 및 타이머 시작 통합 함수
  const handleSetCompletionAndTimer = (setIndex: number) => {
    // 세트 완료 처리
    handleAccessorySetCompletion(setIndex);
    
    // 타이머 시작
    const timerId = `accessory_${index}_${setIndex}`;
    startGlobalTimer(timerId);
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
      <div className="flex justify-between items-center">
        <select
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="p-1 border-gray-300 rounded-md dark:bg-gray-700 text-sm font-semibold"
        >
          <option value="">운동 선택</option>
          {filteredAccessoryExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
          <Trash size={16} className="text-red-500" />
        </Button>
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
      
      {/* 타이머 표시 영역 */}
      {globalTimer.isRunning && globalTimer.sectionId && globalTimer.sectionId.startsWith(`accessory_${index}_`) && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {formatTime(globalTimer.timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => globalTimer.isPaused ? startGlobalTimer(globalTimer.sectionId!) : resetGlobalTimer()}
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
            >
              {globalTimer.isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button 
              onClick={resetGlobalTimer}
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoryExerciseComponent; 