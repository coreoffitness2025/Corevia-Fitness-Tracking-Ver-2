import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ExercisePart, 
  Session, 
  ChestMainExercise, 
  BackMainExercise, 
  ShoulderMainExercise, 
  LegMainExercise,
  BicepsMainExercise,
  TricepsMainExercise,
  MainExerciseType,
  SetConfiguration
} from '../../types';
import { addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Layout from '../common/Layout';
import Card, { CardTitle, CardSection } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Plus, X, Clock, CheckCircle, XCircle, Save, Info, AlertTriangle } from 'lucide-react';

const WorkoutForm: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number, isPaused: boolean }>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const [trainingComplete, setTrainingComplete] = useState<Record<string, boolean>>({});
  const [selectedSetConfiguration, setSelectedSetConfiguration] = useState<SetConfiguration>('10x5');
  const [customSets, setCustomSets] = useState<number | undefined>(undefined);
  const [customReps, setCustomReps] = useState<number | undefined>(undefined);

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

  // 세트 구성에 따른 최대 횟수 계산 함수 추가
  const getMaxRepsForConfig = (configType: SetConfiguration) => {
    switch(configType) {
      case '10x5': return 10;
      case '15x5': return 15;
      case '6x3': return 6;
      case 'custom': return 0; // 커스텀은 제한 없음
      default: return 10;
    }
  };

  // 세트 구성 변경 핸들러 수정
  const handleSetConfigChange = (configType: SetConfiguration) => {
    setSelectedSetConfiguration(configType);
    
    // 세트 구성 객체 생성
    const config = {
      preferredSetup: configType,
      customSets: customSets || 5,
      customReps: customReps || 5
    };
    
    // 세트 구성 적용 - 새 세트 생성
    applySetConfiguration(config);
    
    // 훈련 완료 상태 초기화
    setTrainingComplete({});
  };

  // 횟수 자동 성공 처리 함수 수정
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    // 횟수 제한: 세트 구성에 맞는 최대값으로 제한
    const maxReps = getMaxRepsForConfig(selectedSetConfiguration);
    // 커스텀인 경우는 제한 없음, 아닌 경우 maxReps로 제한
    const limitedReps = selectedSetConfiguration === 'custom' 
      ? Math.max(1, newReps) 
      : Math.max(1, Math.min(maxReps, newReps));
    
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      newSets[setIndex].reps = limitedReps;
      setMainExercise(prev => ({ ...prev, sets: newSets }));
    } else if (accessoryIndex !== undefined) {
      const newExercises = [...accessoryExercises];
      newExercises[accessoryIndex].sets[setIndex].reps = limitedReps;
      setAccessoryExercises(newExercises);
    }
  };

  // 훈련 완료 처리 함수 - 완전히 새로 작성
  const handleTrainingComplete = (setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    // 각 세트 구성에 맞는 최대 횟수
    const maxReps = getMaxRepsForConfig(selectedSetConfiguration);
    
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      // 성공/실패 자동 판정 - 횟수가 최대치면 성공, 그렇지 않으면 실패
      // 커스텀의 경우 입력한 값이 있으면 무조건 성공으로 처리
      newSets[setIndex].isSuccess = selectedSetConfiguration === 'custom' 
        ? true 
        : newSets[setIndex].reps >= maxReps;
      
      setMainExercise(prev => ({ ...prev, sets: newSets }));
      
      // 훈련 완료 상태로 변경
      setTrainingComplete(prev => ({
        ...prev,
        [`main_${setIndex}`]: true
      }));
    } else if (accessoryIndex !== undefined) {
      const newExercises = [...accessoryExercises];
      // 성공/실패 자동 판정
      newExercises[accessoryIndex].sets[setIndex].isSuccess = selectedSetConfiguration === 'custom'
        ? true
        : newExercises[accessoryIndex].sets[setIndex].reps >= maxReps;
      
      setAccessoryExercises(newExercises);
      
      // 훈련 완료 상태로 변경
      setTrainingComplete(prev => ({
        ...prev,
        [`accessory_${accessoryIndex}_${setIndex}`]: true
      }));
    }
  };

  // 세트 구성 적용 함수 수정
  const applySetConfiguration = (config: any) => {
    console.log('세트 구성 적용:', config);
    
    // 세트 구성에 따라 초기 세트 수 설정
    let setsCount = 5; // 기본값
    let repsCount = 10; // 기본값
    
    // 설정된 세트 구성에 따라 세트 수와 반복 수 결정
    if (config.preferredSetup === '10x5') {
      setsCount = 5;
      repsCount = 10;
    } else if (config.preferredSetup === '15x5') {
      setsCount = 5;
      repsCount = 15;
    } else if (config.preferredSetup === '6x3') {
      setsCount = 3;
      repsCount = 6;
    } else if (config.preferredSetup === 'custom' && config.customSets && config.customReps) {
      setsCount = config.customSets;
      repsCount = config.customReps;
    }
    
    // 상태 업데이트
    setSets(setsCount);
    setReps(repsCount);
    
    // 해당 세트 수만큼 초기 세트 배열 생성
    const initialSets = Array(setsCount).fill(0).map(() => ({
      reps: repsCount,  // 선호 반복 수로 초기화
      weight: 0,        // 무게는 사용자가 입력
      isSuccess: false
    }));
    
    console.log(`세트 구성 적용: ${setsCount} 세트 x ${repsCount} 회`);
    setMainExercise(prev => ({
      ...prev,
      sets: initialSets
    }));
    
    // 훈련 완료 상태 초기화
    setTrainingComplete({});
    
    // 보조 운동도 초기화 (이전 보조 운동 구성 유지)
    const updatedAccessoryExercises = accessoryExercises.map(exercise => {
      const sets = Array(setsCount).fill(0).map(() => ({
        reps: repsCount,
        weight: 0,
        isSuccess: false
      }));
      return { ...exercise, sets };
    });
    
    setAccessoryExercises(updatedAccessoryExercises);
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