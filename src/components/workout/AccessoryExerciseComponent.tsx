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
    let finalValue = value;
    
    // 반복 횟수 제한 (reps field만)
    if (field === 'reps') {
      // 표준 세트 구성의 경우 최대 반복 횟수 제한
      if (selectedSetConfig === '5x5') {
        finalValue = Math.min(value, 5);
      } else if (selectedSetConfig === '6x3') {
        finalValue = Math.min(value, 6);
      } else if (selectedSetConfig === '10x5') {
        finalValue = Math.min(value, 10);
      } else if (selectedSetConfig === '15x5') {
        finalValue = Math.min(value, 15);
      }
      
      // 최소값 체크 (0 이하 방지)
      finalValue = Math.max(1, finalValue);
    }
    
    const newSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: finalValue } : s
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
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{exercise.name || `보조 운동 ${index + 1}`}</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-3 shadow-inner min-w-[380px]">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">휴식 시간:</span>
            
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex flex-col items-center w-12">
                <button
                  onClick={() => {
                    // 실제 타이머 조정은 상위 컴포넌트에서 처리
                  }}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ▲
                </button>
                <span className="text-base font-mono text-gray-800 dark:text-gray-200 text-center py-1 w-8">
                  {String(globalTimer.timerMinutes).padStart(2, '0')}
                </span>
                <button
                  onClick={() => {
                    // 실제 타이머 조정은 상위 컴포넌트에서 처리
                  }}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ▼
                </button>
              </div>
              <span className="text-gray-800 dark:text-gray-200 mx-2 text-lg font-bold">:</span>
              <div className="flex flex-col items-center w-12">
                <button
                  onClick={() => {
                    // 실제 타이머 조정은 상위 컴포넌트에서 처리
                  }}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ▲
                </button>
                <span className="text-base font-mono text-gray-800 dark:text-gray-200 text-center py-1 w-8">
                  {String(globalTimer.timerSeconds).padStart(2, '0')}
                </span>
                <button
                  onClick={() => {
                    // 실제 타이머 조정은 상위 컴포넌트에서 처리
                  }}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ▼
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={globalTimer.isPaused || !globalTimer.isRunning ? "success" : "warning"}
                size="sm" 
                onClick={() => {
                  if (!globalTimer.isRunning) {
                    startGlobalTimer(componentSectionId);
                  } else {
                    resetGlobalTimer();
                  }
                }}
                icon={globalTimer.isPaused || !globalTimer.isRunning ? <Play size={16} /> : <Pause size={16} />}
                className="font-medium shadow-lg whitespace-nowrap"
              >
                {globalTimer.isPaused || !globalTimer.isRunning ? '시작' : '일시정지'}
              </Button>
              <Button variant="outline" size="sm" onClick={resetGlobalTimer} icon={<X size={16} />} className="font-medium whitespace-nowrap">
                초기화
              </Button>
            </div>
          </div>
          
          <Button variant="danger" size="sm" onClick={() => onRemove(index)} icon={<Trash size={18} />} className="font-medium shadow-lg">
            삭제
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor={`accessory-exercise-name-${index}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          운동 선택 ({currentExercisePart ? getPartLabel(currentExercisePart) : '부위 먼저'})
        </label>
        <select
          id={`accessory-exercise-name-${index}`}
          value={exercise.name}
          onChange={handleAccessoryNameSelect}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all font-medium"
          disabled={!currentExercisePart || filteredAccessoryExercises.length === 0}
        >
          <option value="">-- 운동 선택 --</option>
          {filteredAccessoryExercises.map(ex => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        {!currentExercisePart && <p className="text-sm text-red-500 mt-2 font-medium">메인 운동의 부위를 먼저 선택해주세요.</p>}
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">세트 구성</label>
        <div className="flex flex-wrap gap-3">
          {setConfigOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSetConfigChange(option.value)}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap shadow-sm ${
                selectedSetConfig === option.value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex} className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 shadow-sm relative">
            {selectedSetConfig === 'custom' && (
                <Button 
                    size="xs" 
                    variant="danger" 
                    onClick={() => removeSetFromExercise(setIndex)} 
                    className="absolute top-2 right-2 h-8 w-8 p-1 shadow-lg"
                    icon={<X size={16} />} 
                    aria-label="세트 삭제" 
                />
            )}
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-lg">세트 {setIndex + 1}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">무게 (kg)</label>
                <input 
                  type="number" 
                  value={set.weight || ''} 
                  onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  횟수
                  {selectedSetConfig !== 'custom' && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      (최대 {
                        selectedSetConfig === '5x5' ? '5회' :
                        selectedSetConfig === '6x3' ? '6회' :
                        selectedSetConfig === '10x5' ? '10회' :
                        selectedSetConfig === '15x5' ? '15회' : ''
                      })
                    </span>
                  )}
                </label>
                <input 
                  type="number" 
                  value={set.reps || ''} 
                  onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-800" 
                />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Button
                  size="sm"
                  variant="icon"
                  onClick={() => handleAccessorySetCompletion(setIndex)}
                  className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-200 shadow-lg ${
                    set.isSuccess === true ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform scale-105' :
                    'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  aria-label={set.isSuccess === true ? "세트 성공" : "세트 미완료"}
                >
                  {set.isSuccess === true ? <CheckCircle size={24} /> : <Square size={24} />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedSetConfig === 'custom' && (
         <Button size="sm" variant="outline" onClick={addSetToExercise} className="mt-4 w-full font-medium shadow-lg" icon={<Plus size={18} />}>세트 추가</Button>
      )}
    </div>
  );
};

export default AccessoryExerciseComponent; 