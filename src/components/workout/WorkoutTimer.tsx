import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface WorkoutTimerProps {
  onComplete?: () => void;
  initialTime?: number; // 초 단위 초기 시간 (기본값: 120초)
  title?: string; // 타이머 제목 (기본값: '다음 세트 준비 시간')
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ 
  onComplete, 
  initialTime = 120, 
  title = '다음 세트 준비 시간' 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onComplete?.();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
      <div className="text-6xl font-bold mb-6 text-blue-600 dark:text-blue-400">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 shadow-md transition-all"
          >
            <Play size={20} />
            <span>시작</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2 shadow-md transition-all"
          >
            <Pause size={20} />
            <span>일시정지</span>
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 shadow-md transition-all"
        >
          <RotateCcw size={20} />
          <span>리셋</span>
        </button>
      </div>
    </div>
  );
};

export default WorkoutTimer; 