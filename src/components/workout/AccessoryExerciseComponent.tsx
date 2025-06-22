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
          <div key={setIndex} className="flex items-center gap-2">
            <span className="w-6 text-center font-semibold text-gray-500">{setIndex + 1}</span>
            <input
              type="number"
              value={set.weight}
              onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))}
              className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
              placeholder="무게"
            />
            <span className="text-gray-400">kg</span>
            <input
              type="number"
              value={set.reps}
              onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))}
              className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-800"
              placeholder="횟수"
            />
            <span className="text-gray-400">회</span>
            <button
              onClick={() => handleAccessorySetCompletion(setIndex)}
              className={`p-2 rounded-full ${set.isSuccess ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <CheckCircle size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessoryExerciseComponent; 