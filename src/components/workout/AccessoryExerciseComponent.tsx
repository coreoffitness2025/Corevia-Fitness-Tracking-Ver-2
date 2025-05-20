import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import { ExercisePart, Set, SetConfiguration } from '../../types';
import { Plus, Trash, X, Clock, CheckCircle, Square } from 'lucide-react';
import { accessoryExercisePartOptions, accessoryExercisesByPart } from '../../data/accessoryExerciseData';
import { toast } from 'react-hot-toast';

interface AccessoryExerciseProps {
  index: number;
  exercise: {
    name: string;
    sets: Array<Set>; 
  };
  onChange: (index: number, updatedExercise: AccessoryExerciseProps['exercise']) => void; 
  onRemove: (index: number) => void;
  currentExercisePart: ExercisePart;
}

const AccessoryExerciseComponent: React.FC<AccessoryExerciseProps> = ({
  index,
  exercise,
  onChange,
  onRemove,
  currentExercisePart,
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
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number; isPaused: boolean }>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

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
      newSetsArray = [...exercise.sets];
    } else {
      const parts = config.split('x');
      const repsCount = parseInt(parts[0]);
      const setsCount = parseInt(parts[1]);
      
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
  
  const handleSetStatusToggle = (setIndex: number) => {
    const currentSet = exercise.sets[setIndex];
    let newStatus: boolean | null = null;
    if (currentSet.isSuccess === null) newStatus = true;
    else if (currentSet.isSuccess === true) newStatus = false;
    else newStatus = null;
    const newSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, isSuccess: newStatus } : s
    );
    onChange(index, { ...exercise, sets: newSets });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = (setIndex: number) => {
    const timerKey = `accessory_${index}_${setIndex}`;
    if (timerRefs.current[timerKey]) {
      clearInterval(timerRefs.current[timerKey]);
      delete timerRefs.current[timerKey];
      setActiveTimers(prev => { const updated = { ...prev }; delete updated[timerKey]; return updated; });
      return;
    }
    setActiveTimers(prev => ({ ...prev, [timerKey]: { timeLeft: 120, isPaused: false } }));
    timerRefs.current[timerKey] = setInterval(() => {
      setActiveTimers(prev => {
        const currentTimer = prev[timerKey];
        if (currentTimer && !currentTimer.isPaused) {
          if (currentTimer.timeLeft <= 1) {
            clearInterval(timerRefs.current[timerKey]!);
            delete timerRefs.current[timerKey];
            toast.success('휴식 시간이 끝났습니다!', { position: 'top-center', icon: '⏰' });
            const updated = { ...prev }; delete updated[timerKey]; return updated;
          }
          return { ...prev, [timerKey]: { ...currentTimer, timeLeft: currentTimer.timeLeft - 1 } };
        }
        return prev;
      });
    }, 1000);
  };
  
  const pauseResumeTimer = (setIndex: number) => {
    const timerKey = `accessory_${index}_${setIndex}`;
    setActiveTimers(prev => {
      const currentTimer = prev[timerKey];
      if (currentTimer) return { ...prev, [timerKey]: { ...currentTimer, isPaused: !currentTimer.isPaused } };
      return prev;
    });
  };

  useEffect(() => {
    return () => { Object.values(timerRefs.current).forEach(intervalId => { if (intervalId) clearInterval(intervalId); }); };
  }, []);

  const addSetToExercise = () => {
    if (selectedSetConfig !== 'custom') {
      setSelectedSetConfig('custom');
    }
    const newSet: Set = { reps: 10, weight: 0, isSuccess: null };
    onChange(index, { ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSetFromExercise = (setIndex: number) => {
    if (exercise.sets.length <= 1) { toast.error('최소 한 개의 세트는 유지해야 합니다.'); return; }
    if (selectedSetConfig !== 'custom') {
      setSelectedSetConfig('custom');
    }
    const newSets = exercise.sets.filter((_, sIdx) => sIdx !== setIndex);
    onChange(index, { ...exercise, sets: newSets });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 shadow">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold">보조 운동 {index + 1}</h4>
        <Button variant="danger" size="sm" onClick={() => onRemove(index)} icon={<Trash size={16} />}>삭제</Button>
      </div>
      <div className="mb-3">
        <label htmlFor={`accessory-exercise-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          운동 선택 ({currentExercisePart ? accessoryExercisePartOptions.find(p => p.value === currentExercisePart)?.label : '부위 선택 필요'})
        </label>
        <select
          id={`accessory-exercise-name-${index}`}
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
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
                  ? 'bg-blue-600 text-white shadow-md'
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
          <div key={setIndex} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-800 dark:text-gray-200">세트 {setIndex + 1}</div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="icon" onClick={() => handleSetStatusToggle(setIndex)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-200 ${set.isSuccess === true ? 'bg-green-500 text-white hover:bg-green-600' : set.isSuccess === false ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                  aria-label={set.isSuccess === null ? "세트 미완료" : set.isSuccess ? "세트 성공" : "세트 실패"}
                >{set.isSuccess === true ? <CheckCircle size={18} /> : set.isSuccess === false ? <CheckCircle size={18} /> : <Square size={18} />}</Button>
                <Button size="xs" variant="secondary" onClick={() => activeTimers[`accessory_${index}_${setIndex}`] ? pauseResumeTimer(setIndex) : toggleTimer(setIndex)}
                  className="h-8 min-w-[60px] px-2" icon={activeTimers[`accessory_${index}_${setIndex}`] && !activeTimers[`accessory_${index}_${setIndex}`].isPaused ? undefined : <Clock size={16} />}
                >{activeTimers[`accessory_${index}_${setIndex}`] ? `${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)} ${activeTimers[`accessory_${index}_${setIndex}`].isPaused ? '(||)' : '(▶)'}` : '휴식'}</Button>
                <Button size="xs" variant="danger" onClick={() => removeSetFromExercise(setIndex)} className="h-8 w-8" icon={<X size={16} />} aria-label="세트 삭제" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">무게 (kg)</label>
                <input type="number" value={set.weight || ''} onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))} className="w-full md:w-2/3 p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">횟수</label>
                <input type="number" value={set.reps || ''} onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))} className="w-full md:w-2/3 p-2 border rounded-md text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {(selectedSetConfig === 'custom' || exercise.sets.length < 5 ) && (
         <Button size="sm" variant="outline" onClick={addSetToExercise} className="mt-3 w-full" icon={<Plus size={16} />}>세트 추가</Button>
      )}
    </div>
  );
};

export default AccessoryExerciseComponent; 