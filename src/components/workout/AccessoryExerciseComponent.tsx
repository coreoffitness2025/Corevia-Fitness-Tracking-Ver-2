import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { SetConfiguration } from '../../types';
import { Plus, Trash, X, Clock } from 'lucide-react';

interface AccessoryExerciseProps {
  index: number;
  exercise: {
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  };
  onChange: (index: number, updatedExercise: any) => void;
  onRemove: (index: number) => void;
  previousExercises?: Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>;
}

const AccessoryExerciseComponent: React.FC<AccessoryExerciseProps> = ({
  index,
  exercise,
  onChange,
  onRemove,
  previousExercises = []
}) => {
  // 세트 구성 옵션
  const setConfigOptions = [
    { value: '6x3', label: '6회 x 3세트' },
    { value: '5x5', label: '5회 x 5세트' },
    { value: '10x5', label: '10회 x 5세트' },
    { value: '15x5', label: '15회 x 5세트' },
    { value: 'custom', label: '커스텀' }
  ];

  // 상태 관리
  const [selectedSetConfig, setSelectedSetConfig] = useState<SetConfiguration | 'custom'>('6x3');
  const [showPreviousExercises, setShowPreviousExercises] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number; isPaused: boolean }>>({});
  const [timerIntervals, setTimerIntervals] = useState<Record<string, NodeJS.Timeout>>({});

  // 세트 구성 변경 처리
  const handleSetConfigChange = (config: SetConfiguration | 'custom') => {
    setSelectedSetConfig(config);
    
    // 새로운 세트 배열 생성
    let newSets = [];
    
    if (config === 'custom') {
      // 커스텀인 경우 기존 세트 유지
      newSets = [...exercise.sets];
    } else {
      // 정해진 세트 구성에 따라 새로운 세트 배열 생성
      const setsCount = config === '6x3' ? 3 : 5;
      const repsCount = config === '6x3' ? 6 : config === '5x5' ? 5 : config === '10x5' ? 10 : 15;
      
      // 이전 세트의 무게 값을 유지하면서 새 세트 생성
      newSets = Array.from({ length: setsCount }, (_, i) => {
        return {
          weight: i < exercise.sets.length ? exercise.sets[i].weight : 0,
          reps: repsCount,
          isSuccess: null
        };
      });
    }
    
    // 부모 컴포넌트에 변경 사항 전달
    onChange(index, { ...exercise, sets: newSets });
  };

  // 세트 추가
  const addSet = () => {
    if (selectedSetConfig !== 'custom') {
      setSelectedSetConfig('custom');
    }
    
    const newSets = [
      ...exercise.sets,
      { reps: 10, weight: 0, isSuccess: null }
    ];
    
    onChange(index, { ...exercise, sets: newSets });
  };

  // 세트 삭제
  const removeSet = (setIndex: number) => {
    if (exercise.sets.length <= 1) return;
    
    const newSets = exercise.sets.filter((_, i) => i !== setIndex);
    onChange(index, { ...exercise, sets: newSets });
  };

  // 이전 운동 선택
  const selectPreviousExercise = (prevExercise: any) => {
    onChange(index, { ...prevExercise });
    setShowPreviousExercises(false);
  };

  // 운동 이름 변경
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...exercise, name: e.target.value });
  };

  // 무게 변경
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>, setIndex: number) => {
    const newWeight = parseInt(e.target.value) || 0;
    const newSets = [...exercise.sets];
    newSets[setIndex].weight = newWeight;
    onChange(index, { ...exercise, sets: newSets });
  };

  // 횟수 변경
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>, setIndex: number) => {
    const newReps = parseInt(e.target.value) || 0;
    const newSets = [...exercise.sets];
    newSets[setIndex].reps = newReps;
    onChange(index, { ...exercise, sets: newSets });
  };

  // 타이머 기능
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = (setIndex: number) => {
    const timerKey = `accessory_${index}_${setIndex}`;
    
    if (!activeTimers[timerKey]) {
      // 타이머 시작
      const newTimers = { ...activeTimers };
      newTimers[timerKey] = { timeLeft: 60, isPaused: false };
      setActiveTimers(newTimers);
      
      const interval = setInterval(() => {
        setActiveTimers(prev => {
          const updated = { ...prev };
          if (updated[timerKey] && !updated[timerKey].isPaused) {
            updated[timerKey].timeLeft -= 1;
            
            if (updated[timerKey].timeLeft <= 0) {
              clearInterval(timerIntervals[timerKey]);
              const newIntervals = { ...timerIntervals };
              delete newIntervals[timerKey];
              setTimerIntervals(newIntervals);
              delete updated[timerKey];
              return updated;
            }
          }
          return updated;
        });
      }, 1000);
      
      setTimerIntervals(prev => ({ ...prev, [timerKey]: interval }));
    } else if (activeTimers[timerKey].isPaused) {
      // 타이머 재개
      setActiveTimers(prev => ({
        ...prev,
        [timerKey]: { ...prev[timerKey], isPaused: false }
      }));
    } else {
      // 타이머 일시정지
      setActiveTimers(prev => ({
        ...prev,
        [timerKey]: { ...prev[timerKey], isPaused: true }
      }));
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [timerIntervals]);

  return (
    <div className="space-y-4 mb-4">
      <div className="p-3 border rounded-lg bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">보조 운동 {index + 1}</h3>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => onRemove(index)}
            icon={<Trash size={16} />}
          >
            삭제
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={exercise.name}
              onChange={handleNameChange}
              placeholder="운동 이름"
              className="flex-grow p-2 border rounded-md"
            />
            
            {previousExercises.length > 0 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowPreviousExercises(!showPreviousExercises)}
                >
                  이전 운동
                </Button>
                
                {showPreviousExercises && (
                  <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                    <div className="flex justify-between items-center p-2 border-b">
                      <h4 className="font-medium">최근 보조 운동</h4>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPreviousExercises(false)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {previousExercises.map((prevExercise, i) => (
                        <div
                          key={i}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => selectPreviousExercise(prevExercise)}
                        >
                          <div className="font-medium">{prevExercise.name}</div>
                          <div className="text-sm text-gray-500">
                            {prevExercise.sets.length} 세트 x {prevExercise.sets[0]?.reps || 0} 회
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">세트 구성</label>
          <div className="flex flex-wrap gap-2">
            {setConfigOptions.map(option => (
              <button
                key={option.value}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedSetConfig === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
                onClick={() => handleSetConfigChange(option.value as SetConfiguration | 'custom')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          {exercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">세트 {setIndex + 1}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => toggleTimer(setIndex)}
                    className="h-8"
                    icon={<Clock size={16} />}
                  >
                    {activeTimers[`accessory_${index}_${setIndex}`]
                      ? formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)
                      : '휴식'}
                  </Button>
                  
                  {selectedSetConfig === 'custom' && exercise.sets.length > 1 && (
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => removeSet(setIndex)}
                      className="h-8"
                      icon={<X size={16} />}
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    무게 (kg)
                  </label>
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => handleWeightChange(e, setIndex)}
                    className="w-full p-2 border rounded-md"
                    placeholder="kg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    횟수
                  </label>
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => handleRepsChange(e, setIndex)}
                    className="w-full p-2 border rounded-md"
                    placeholder="횟수"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedSetConfig === 'custom' && (
          <Button
            size="sm"
            variant="primary"
            onClick={addSet}
            className="mt-3"
            icon={<Plus size={16} />}
          >
            세트 추가
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessoryExerciseComponent; 