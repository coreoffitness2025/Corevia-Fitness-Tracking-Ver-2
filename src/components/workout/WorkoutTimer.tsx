import React, { useState, useEffect } from 'react';

interface WorkoutTimerProps {
  onComplete?: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2분
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
    setTimeLeft(120);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg">
      <div className="text-6xl font-bold mb-4">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            시작
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            일시정지
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          리셋
        </button>
      </div>
      <p className="mt-4 text-gray-600">
        다음 세트 준비 시간
      </p>
    </div>
  );
};

export default WorkoutTimer; 