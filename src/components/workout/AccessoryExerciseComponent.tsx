import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { ExercisePart, Set } from '../../types';
import { Plus, Trash, X, CheckCircle, Clock } from 'lucide-react';
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
    if (newSets[setIndex].isSuccess === true) {
      newSets[setIndex].isSuccess = false;
    } else if (newSets[setIndex].isSuccess === false) {
      newSets[setIndex].isSuccess = null;
    } else {
      newSets[setIndex].isSuccess = true;
    }
    onChange(index, { ...exercise, sets: newSets });
  };

  const handleStartTimer = (setIndex: number) => {
    const timerId = `accessory_${index}_${setIndex}`;
    startGlobalTimer(timerId);
    toast.success(`${exercise.name} 세트 ${setIndex + 1} 타이머 시작`, {
      duration: 2000,
      position: 'top-center',
    });
  };

  const addSet = () => {
    const newSets = [...exercise.sets, { reps: 0, weight: 0, isSuccess: null }];
    onChange(index, { ...exercise, sets: newSets });
  };

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
        <select
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="p-2 border-gray-300 rounded-md dark:bg-gray-700 text-sm font-semibold flex-grow mr-2"
        >
          <option value="">운동 선택</option>
          {filteredAccessoryExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="p-2">
          <Trash size={18} className="text-red-500" />
        </Button>
      </div>

      <div className="space-y-3">
        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-600 dark:text-gray-300">세트 {setIndex + 1}</span>
              <button
                onClick={() => removeSet(setIndex)}
                className="p-1 text-red-500"
                aria-label="세트 삭제"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <input
                  type="number"
                  value={set.weight}
                  onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))}
                  className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
                  placeholder="무게"
                  inputMode="decimal"
                />
                <span className="ml-1 text-gray-400">kg</span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))}
                  className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
                  placeholder="횟수"
                  inputMode="numeric"
                />
                <span className="ml-1 text-gray-400">회</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleAccessorySetCompletion(setIndex)}
                className={`flex-1 p-2 rounded-md flex items-center justify-center ${
                  set.isSuccess === true 
                    ? 'bg-green-500 text-white' 
                    : set.isSuccess === false 
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <CheckCircle size={18} className="mr-1" />
                {set.isSuccess === true ? '완료' : set.isSuccess === false ? '실패' : '체크'}
              </button>
              
              <button
                onClick={() => handleStartTimer(setIndex)}
                className="p-2 rounded-md bg-blue-500 text-white flex items-center justify-center"
                aria-label="타이머 시작"
              >
                <Clock size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addSet}
            className="w-full py-2 flex items-center justify-center gap-1"
          >
            <Plus size={18} /> 세트 추가
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessoryExerciseComponent; 