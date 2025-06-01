import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import { ExercisePart, Set, SetConfiguration } from '../../types';
import { Plus, Trash, X, Clock, CheckCircle, Square, Play, Pause } from 'lucide-react';
import { accessoryExercisePartOptions, accessoryExercisesByPart } from '../../data/accessoryExerciseData';
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
    initialTime: number;
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
  const [filteredAccessoryExercises, setFilteredAccessoryExercises] = useState<typeof accessoryExercisesByPart[keyof typeof accessoryExercisesByPart]>([]);
  const setConfigOptions: Array<{ value: SetConfiguration | 'custom'; label: string }> = [
    { value: '6x3', label: '6회 x 3세트' },
    { value: '5x5', label: '5회 x 5세트' },
    { value: '10x5', label: '10회 x 5세트' },
    { value: '15x5', label: '15회 x 5세트' },
    { value: 'custom', label: '커스텀' }
  ];
  const [selectedSetConfig, setSelectedSetConfig] = useState<SetConfiguration | 'custom'>('6x3');

  const componentSectionId = `accessory_${index}`;

  useEffect(() => {
    if (currentExercisePart && accessoryExercisesByPart[currentExercisePart]) {
      setFilteredAccessoryExercises(accessoryExercisesByPart[currentExercisePart]);
    } else {
      setFilteredAccessoryExercises([]);
    }
  }, [currentExercisePart]);

  const handleSetConfigChange = (configValue: string) => {
    const config = configValue as SetConfiguration | 'custom';
    setSelectedSetConfig(config);
    
    let newSetsArray: Set[] = [];
    
    if (config === 'custom') {
      newSetsArray = exercise.sets.length > 0 ? [...exercise.sets] : [{ reps: 10, weight: 0, isSuccess: null }];
    } else {
      const configParts = config.split('x');
      const repsCount = parseInt(configParts[0]);
      const setsCount = parseInt(configParts[1]);
      
      newSetsArray = Array.from({ length: setsCount }, (_, i) => ({
        reps: repsCount,
        weight: exercise.sets[i]?.weight || 0,
        isSuccess: null,
      }));
    }
    onChange(index, { ...exercise, sets: newSetsArray });
  };

  const handleAccessoryNameSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(index, { ...exercise, name: event.target.value });
  };

  const handleSetChange = (setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: value } : s
    );
    onChange(index, { ...exercise, sets: newSets });
  };
  
  const handleAccessorySetCompletion = (setIndex: number) => {
    const newSets = [...exercise.sets];
    const currentSet = newSets[setIndex];

    if (currentSet.isSuccess === null) {
      currentSet.isSuccess = true;
    } else {
      currentSet.isSuccess = null;
    }
    onChange(index, { ...exercise, sets: newSets });
  };

  const addSetToExercise = () => {
    if (selectedSetConfig !== 'custom') {
      toast.error('커스텀 모드에서만 세트를 추가할 수 있습니다.');
      return;
    }
    const newSet: Set = { reps: 10, weight: 0, isSuccess: null };
    onChange(index, { ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSetFromExercise = (setIndex: number) => {
    if (selectedSetConfig !== 'custom') {
      return;
    }
    if (exercise.sets.length <= 1) { toast.error('최소 한 개의 세트는 유지해야 합니다.'); return; }
    const newSets = exercise.sets.filter((_, sIdx) => sIdx !== setIndex);
    onChange(index, { ...exercise, sets: newSets });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 shadow">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold">{exercise.name || `보조 운동 ${index + 1}`}</h4>
        <div className="flex items-center gap-2">
          {globalTimer.sectionId !== componentSectionId && (!globalTimer.isRunning || globalTimer.sectionId !== componentSectionId) && (
            <Button size="xs" variant="outline" onClick={() => startGlobalTimer(componentSectionId)} icon={<Play size={14}/>} className="py-1 px-2 text-xs">
              휴식 ({formatTime(globalTimer.initialTime)})
            </Button>
          )}
          {globalTimer.sectionId === componentSectionId && globalTimer.isRunning && (
            <Button size="xs" variant="danger" onClick={resetGlobalTimer} icon={<X size={14}/>} className="py-1 px-2 text-xs">
              중지
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => onRemove(index)} icon={<Trash size={16} />}>삭제</Button>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor={`accessory-exercise-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          운동 선택 ({currentExercisePart ? getPartLabel(currentExercisePart) : '부위 먼저'})
        </label>
        <select
          id={`accessory-exercise-name-${index}`}
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-400 focus:border-primary-400"
          disabled={!currentExercisePart || filteredAccessoryExercises.length === 0}
        >
          <option value="">-- 운동 선택 --</option>
          {filteredAccessoryExercises.map(ex => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        {!currentExercisePart && <p className="text-xs text-red-500 mt-1">메인 운동의 부위를 먼저 선택해주세요.</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">세트 구성</label>
        <div className="flex flex-wrap gap-2">
          {setConfigOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSetConfigChange(option.value)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                selectedSetConfig === option.value
                  ? 'bg-primary-400 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50 relative">
            {selectedSetConfig === 'custom' && (
                <Button 
                    size="xs" 
                    variant="danger" 
                    onClick={() => removeSetFromExercise(setIndex)} 
                    className="absolute top-1 right-1 h-7 w-7 p-1"
                    icon={<X size={14} />} 
                    aria-label="세트 삭제" 
                />
            )}
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-800 dark:text-gray-200">세트 {setIndex + 1}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">무게 (kg)</label>
                <input type="number" value={set.weight || ''} onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))} className="w-full p-2 border rounded-md text-sm focus:border-primary-400 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">횟수</label>
                <input type="number" value={set.reps || ''} onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))} className="w-full p-2 border rounded-md text-sm focus:border-primary-400 focus:ring-primary-400" />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Button
                  size="sm"
                  variant="icon"
                  onClick={() => handleAccessorySetCompletion(setIndex)}
                  className={`h-10 w-10 flex items-center justify-center rounded-md transition-colors duration-200 ${
                    set.isSuccess === true ? 'bg-green-500 text-white hover:bg-green-600' :
                    'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={set.isSuccess === true ? "세트 성공" : "세트 미완료"}
                >
                  {set.isSuccess === true ? <CheckCircle size={20} /> : <Square size={20} />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedSetConfig === 'custom' && (
         <Button size="sm" variant="outline" onClick={addSetToExercise} className="mt-3 w-full" icon={<Plus size={16} />}>세트 추가</Button>
      )}
    </div>
  );
};

export default AccessoryExerciseComponent; 