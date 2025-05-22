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
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      alarmRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3');
    } catch (error) {
      console.error('[Accessory] 알람 사운드 로드 실패:', error);
    }

    if (currentExercisePart && accessoryExercisesByPart[currentExercisePart]) {
      setFilteredAccessoryExercises(accessoryExercisesByPart[currentExercisePart]);
    } else {
      setFilteredAccessoryExercises([]);
    }
    return () => { Object.values(timerRefs.current).forEach(intervalId => { if (intervalId) clearInterval(intervalId); }); };
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
  
  const handleAccessorySetCompletionAndTimer = (setIndex: number) => {
    const newSets = [...exercise.sets];
    const currentSet = newSets[setIndex];
    const timerKey = `accessory_${index}_${setIndex}`;

    if (currentSet.isSuccess === null) {
      currentSet.isSuccess = true;
      const isAnyTimerActive = Object.values(activeTimers).some(timer => timer && timer.timeLeft > 0 && !timer.isPaused);
      if (!isAnyTimerActive) {
        startAccessoryTimer(timerKey, 120);
      }
    } else {
      currentSet.isSuccess = null;
      clearAccessoryTimer(timerKey);
    }
    onChange(index, { ...exercise, sets: newSets });
  };

  const startAccessoryTimer = (timerKey: string, duration: number) => {
    clearAccessoryTimer(timerKey);
    setActiveTimers(prev => ({ ...prev, [timerKey]: { timeLeft: duration, isPaused: false } }));
    toast.success('휴식 타이머가 시작되었습니다.', {
      icon: '⏱️',
      duration: 2000,
      position: 'top-center'
    });
    timerRefs.current[timerKey] = setInterval(() => {
      setActiveTimers(prev => {
        const currentTimerState = prev[timerKey];
        if (currentTimerState && !currentTimerState.isPaused) {
          if (currentTimerState.timeLeft <= 1) {
            clearAccessoryTimer(timerKey);
            toast.success('휴식 시간이 끝났습니다!', { position: 'top-center', icon: '⏰', duration: 5000 });
            
            if (alarmRef.current) {
              alarmRef.current.play().catch(err => {
                console.error('[Accessory] 알람 재생 실패:', err);
                if ('vibrate' in navigator) {
                  navigator.vibrate([200, 100, 200, 100, 200]);
                }
              });
            }
            const newState = {...prev};
            delete newState[timerKey];
            return newState;
          }
          return { ...prev, [timerKey]: { ...currentTimerState, timeLeft: currentTimerState.timeLeft - 1 } };
        }
        return prev;
      });
    }, 1000);
  };

  const togglePauseAccessoryTimer = (timerKey: string) => {
    setActiveTimers(prev => {
      const current = prev[timerKey];
      if (current) return { ...prev, [timerKey]: { ...current, isPaused: !current.isPaused } };
      return prev;
    });
  };

  const clearAccessoryTimer = (timerKey: string) => {
    if (timerRefs.current[timerKey]) {
      clearInterval(timerRefs.current[timerKey]);
      delete timerRefs.current[timerKey];
    }
    setActiveTimers(prev => { const newState = {...prev}; delete newState[timerKey]; return newState; });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
        <h4 className="text-lg font-semibold">보조 운동 {index + 1}</h4>
        <Button variant="danger" size="sm" onClick={() => onRemove(index)} icon={<Trash size={16} />}>삭제</Button>
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
                  onClick={() => handleAccessorySetCompletionAndTimer(setIndex)}
                  className={`h-10 w-10 flex items-center justify-center rounded-md transition-colors duration-200 ${
                    set.isSuccess === true ? 'bg-green-500 text-white hover:bg-green-600' :
                    'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={set.isSuccess === true ? "세트 성공" : "세트 미완료"}
                >
                  {set.isSuccess === true ? <CheckCircle size={20} /> : <Square size={20} />}
                </Button>
                {activeTimers[`accessory_${index}_${setIndex}`] && (
                  <div className="flex items-center text-xs mt-1">
                    <span className={`font-semibold ${activeTimers[`accessory_${index}_${setIndex}`]?.isPaused ? 'text-gray-500' : 'text-primary-600 animate-pulse'}`}>
                        {formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}
                    </span>
                    <button onClick={() => togglePauseAccessoryTimer(`accessory_${index}_${setIndex}`)} className="p-0.5 ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none">
                      {activeTimers[`accessory_${index}_${setIndex}`]?.isPaused ? <Play size={12} /> : <Pause size={12} className="text-primary-600 dark:text-primary-400"/>}
                    </button>
                  </div>
                )}
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