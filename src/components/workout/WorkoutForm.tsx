import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const WorkoutForm: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number, isPaused: boolean }>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // 타이머 효과
  useEffect(() => {
    // 활성화된 타이머들에 대한 처리
    Object.entries(activeTimers).forEach(([timerId, timerInfo]) => {
      // 일시정지 상태면 타이머를 진행하지 않음
      if (timerInfo.isPaused) {
        if (timerRefs.current[timerId]) {
          clearInterval(timerRefs.current[timerId]);
          delete timerRefs.current[timerId];
        }
        return;
      }
      
      if (timerInfo.timeLeft > 0 && !timerRefs.current[timerId]) {
        timerRefs.current[timerId] = setInterval(() => {
          setActiveTimers(prev => {
            const prevTimerInfo = prev[timerId];
            if (!prevTimerInfo) return prev;
            
            const newTime = prevTimerInfo.timeLeft - 1;
            if (newTime <= 0) {
              clearInterval(timerRefs.current[timerId]);
              delete timerRefs.current[timerId];
              // 타이머 종료 알림
              toast('휴식 시간이 끝났습니다. 다음 세트를 진행해주세요!', {
                icon: '⏰',
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
              });
              
              // 타이머 제거
              const newTimers = { ...prev };
              delete newTimers[timerId];
              return newTimers;
            }
            return { ...prev, [timerId]: { ...prevTimerInfo, timeLeft: newTime } };
          });
        }, 1000);
      }
    });
    
    return () => {
      // 모든 타이머 정리
      Object.values(timerRefs.current).forEach(timer => clearInterval(timer));
    };
  }, [activeTimers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = (exerciseIndex: number = -1, setIndex: number) => {
    // 타이머 ID 생성 (메인 운동 또는 보조 운동에 따라 다름)
    const timerId = exerciseIndex === -1 
      ? `main_${setIndex}` 
      : `accessory_${exerciseIndex}_${setIndex}`;
    
    setActiveTimers(prev => {
      // 타이머가 이미 존재하는 경우
      if (prev[timerId]) {
        const currentTimer = prev[timerId];
        
        // 타이머가 일시정지 상태인 경우 => 재개
        if (currentTimer.isPaused) {
          toast.success('타이머 재개됨', { duration: 1500 });
          return { ...prev, [timerId]: { ...currentTimer, isPaused: false } };
        } 
        // 타이머가 실행 중인 경우 => 일시정지
        else {
          toast.success('타이머 일시정지됨', { duration: 1500 });
          return { ...prev, [timerId]: { ...currentTimer, isPaused: true } };
        }
      } 
      // 새 타이머 시작 (2분 = 120초)
      else {
        toast.success('타이머 시작됨', { duration: 1500 });
        return { ...prev, [timerId]: { timeLeft: 120, isPaused: false } };
      }
    });
  };

  return (
    <div>
      {/* 메인 운동 세트 정보 입력 부분 안의 타이머 버튼 */}
      <button
        type="button"
        onClick={() => toggleTimer(-1, index)}
        className={`ml-2 px-3 py-1 rounded ${
          !activeTimers[`main_${index}`] 
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : activeTimers[`main_${index}`]?.isPaused
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
        }`}
      >
        {!activeTimers[`main_${index}`] 
          ? '휴식 타이머' 
          : activeTimers[`main_${index}`]?.isPaused
            ? `▶️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}`
            : `⏸️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}`
        }
      </button>

      {/* 보조 운동 세트 정보 입력 부분 안의 타이머 버튼 */}
      <button
        type="button"
        onClick={() => toggleTimer(index, setIndex)}
        className={`ml-2 px-3 py-1 rounded ${
          !activeTimers[`accessory_${index}_${setIndex}`] 
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : activeTimers[`accessory_${index}_${setIndex}`]?.isPaused
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
        }`}
      >
        {!activeTimers[`accessory_${index}_${setIndex}`] 
          ? '휴식 타이머' 
          : activeTimers[`accessory_${index}_${setIndex}`]?.isPaused
            ? `▶️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}`
            : `⏸️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}`
        }
      </button>
    </div>
  );
};

export default WorkoutForm; 