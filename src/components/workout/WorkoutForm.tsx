import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ExercisePart, 
  Session, 
  // ChestMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
  // BackMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
  // ShoulderMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
  // LegMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
  // BicepsMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
  // TricepsMainExercise, // 사용되지 않으므로 주석 처리 또는 삭제 가능
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
import { Plus, X, Clock, CheckCircle, XCircle, Save, Info, AlertTriangle, ChevronUp, ChevronDown, RotateCcw, Trash } from 'lucide-react';
import { getSetConfiguration } from '../../utils/workoutUtils';

interface WorkoutFormProps {
  onSuccess?: () => void; // 저장 성공 시 호출될 콜백
}

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   icon: '💪', mainExerciseName: '벤치 프레스' },
  { value: 'back',     label: '등',     icon: '🔙', mainExerciseName: '데드리프트' },
  { value: 'shoulder', label: '어깨',   icon: '🏋️', mainExerciseName: '오버헤드 프레스' },
  { value: 'leg',      label: '하체',   icon: '🦵', mainExerciseName: '스쿼트' },
  { value: 'biceps',   label: '이두',   icon: '💪', mainExerciseName: '덤벨 컬' },
  { value: 'triceps',  label: '삼두',   icon: '💪', mainExerciseName: '케이블 푸시다운' }
];

// 각 부위별 메인 운동 옵션
const mainExerciseOptions: Record<ExercisePart, {value: MainExerciseType, label: string}[]> = {
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    // { value: 'inclineBenchPress', label: '인클라인 벤치 프레스' }, // 주석 처리
    // { value: 'declineBenchPress', label: '디클라인 벤치 프레스' } // 주석 처리
  ],
  back: [
    { value: 'barbellRow', label: '바벨로우' }, // 'bentOverRow' 대신 또는 추가 (types.ts에 BackMainExercise 업데이트 필요할 수 있음)
    { value: 'deadlift', label: '데드리프트' },
    { value: 'tBarRow', label: '티바로우' }    // 신규 (types.ts에 BackMainExercise 업데이트 필요할 수 있음)
    // { value: 'pullUp', label: '턱걸이' }, // 주석 처리
  ],
  shoulder: [
    { value: 'overheadPress', label: '오버헤드 프레스' },
    // { value: 'lateralRaise', label: '레터럴 레이즈' }, // 주석 처리
    // { value: 'facePull', label: '페이스 풀' } // 주석 처리
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    // { value: 'lungue', label: '런지' } // 'lungue' -> 'lunge' 오타 수정 및 주석 처리
  ],
  biceps: [ // 이두는 기존 유지
    { value: 'dumbbellCurl', label: '덤벨 컬' },
    { value: 'barbellCurl', label: '바벨 컬' },
    { value: 'hammerCurl', label: '해머 컬' }
  ],
  triceps: [ // 삼두는 기존 유지
    { value: 'cablePushdown', label: '케이블 푸시다운' },
    { value: 'overheadExtension', label: '오버헤드 익스텐션' },
    { value: 'lyingTricepsExtension', label: '라잉 트라이셉스 익스텐션' } // 'lyingExtension' -> 'lyingTricepsExtension' (일관성 및 명확성)
  ]
};

// 웜업 세트 추천 운동
const warmupExercises = {
  chest: ['가벼운 푸시업 10-15회', '라이트 벤치프레스 15회', '밴드 풀 아파트 15-20회'],
  back: ['경량 데드리프트 10-15회', '밴드 풀다운 15-20회', '슈퍼맨 홀드 3세트 x 10초'],
  shoulder: ['월 슬라이드 10-15회', '페이스 풀 15-20회', '밴드 외전 운동 15-20회'],
  leg: ['맨몸 스쿼트 15-20회', '카프 레이즈 20회', '랭킹 런지 10회(양쪽)'],
  biceps: ['가벼운 덤벨 컬 15-20회', '밴드 컬 15-20회', '손목 유연성 운동 10회'],
  triceps: ['가벼운 푸시업 10-15회', '가벼운 덤벨 킥백 15-20회', '밴드 푸시다운 15-20회']
};

// 선호하는 세트 구성에 '15x5' 추가
type WorkoutGuidePreferredConfig = '10x5' | '6x3' | '15x5';

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [selectedMainExercise, setSelectedMainExercise] = useState<MainExerciseType>(mainExerciseOptions.chest[0].value);
  const [mainExercise, setMainExercise] = useState({
    name: mainExerciseOptions.chest[0].label,
    sets: [{ reps: 0, weight: 0, isSuccess: null as boolean | null }]
  });
  const [accessoryExercises, setAccessoryExercises] = useState<Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 웜업 및 스트레칭 완료 상태 관리
  const [stretchingCompleted, setStretchingCompleted] = useState(false);
  const [warmupCompleted, setWarmupCompleted] = useState(false);

  // 타이머 관련 상태
  const [activeTimers, setActiveTimers] = useState<Record<string, { timeLeft: number; isPaused: boolean }>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // 웜업 팁 표시 상태
  const [showWarmupTips, setShowWarmupTips] = useState(true);
  
  // 추가 상태 변수 정의
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ExercisePart>('chest');
  const [preferredExercises, setPreferredExercises] = useState<Record<string, string>>({});
  const [selectedSetConfiguration, setSelectedSetConfiguration] = useState<SetConfiguration>('5x5');
  const [sets, setSets] = useState<number>(5);
  const [reps, setReps] = useState<number>(5);
  const [customSets, setCustomSets] = useState<number>(5);
  const [customReps, setCustomReps] = useState<number>(5);

  // 컴포넌트 마운트 시 사용자 프로필에서 선호 운동과 세트 설정을 가져와 초기화
  useEffect(() => {
    if (userProfile) {
      console.log('운동 컴포넌트: 사용자 프로필 로드됨, 운동 설정 적용:', userProfile);
      
      if (userProfile.preferredExercises) {
        console.log('운동 컴포넌트: 선호 운동 설정 적용:', userProfile.preferredExercises);
        
        // 초기 부위는 가슴으로 설정하고 해당 부위의 선호 운동 적용
        const prefExercises = userProfile.preferredExercises;
        
        // 부위별 선호 운동 설정
        if (prefExercises.chest) {
          setSelectedMainExercise(prefExercises.chest as MainExerciseType);
        }
        
        // 부위 변경 시 해당 부위의 선호 운동 적용을 위해 저장
        setPreferredExercises(prefExercises);
      }
      
      // 세트 구성 설정
      if (userProfile.setConfiguration) {
        console.log('운동 컴포넌트: 세트 구성 설정 적용:', userProfile.setConfiguration);
        const config = userProfile.setConfiguration;
        
        if (config.preferredSetup) {
          setSelectedSetConfiguration(config.preferredSetup);
          applySetConfiguration(config);
        }
      } else {
        // 기본값으로 10x5 설정
        setSelectedSetConfiguration('10x5');
        applySetConfiguration({ preferredSetup: '10x5' });
      }
    }
  }, [userProfile]);

  // 부위(part) 변경 시 해당 부위의 첫 번째 메인 운동으로 selectedMainExercise와 mainExercise.name 업데이트
  useEffect(() => {
    const newSelectedPart = part as ExercisePart; // 타입 단언
    if (mainExerciseOptions[newSelectedPart] && mainExerciseOptions[newSelectedPart].length > 0) {
      const firstExerciseForPart = mainExerciseOptions[newSelectedPart][0];
      setSelectedMainExercise(firstExerciseForPart.value);
      setMainExercise(prev => ({
        ...prev,
        name: firstExerciseForPart.label
      }));
    } else {
      // 해당 부위에 운동이 없는 경우 (예: 잘못된 'part' 값), 기본값 또는 오류 처리
      setSelectedMainExercise(mainExerciseOptions.chest[0].value); // 예시: 가슴 운동으로 기본 설정
      setMainExercise(prev => ({
          ...prev,
          name: mainExerciseOptions.chest[0].label
      }));
    }
  }, [part]);

  // 선택된 메인 운동(selectedMainExercise) 변경 시 mainExercise.name 업데이트
  useEffect(() => {
    const currentPartExercises = mainExerciseOptions[part as ExercisePart];
    const foundExercise = currentPartExercises.find(ex => ex.value === selectedMainExercise);
    if (foundExercise) {
      setMainExercise(prev => ({
        ...prev,
        name: foundExercise.label
      }));
    }
  }, [selectedMainExercise, part]);

  // 세트 구성 변경 핸들러
  const handleSetConfigChange = (configType: SetConfiguration) => {
    setSelectedSetConfiguration(configType);
    
    // 세트 구성 객체 생성
    const config = {
      preferredSetup: configType,
      customSets: customSets || 5,
      customReps: customReps || 5
    };
    
    // 세트 구성 적용
    applySetConfiguration(config);
  };

  // 커스텀 세트/횟수 변경 시 적용 함수
  const applyCustomConfiguration = () => {
    if (selectedSetConfiguration === 'custom') {
      const config = {
        preferredSetup: 'custom',
        customSets,
        customReps
      };
      
      applySetConfiguration(config);
    }
  };

  // 폼 유효성 검사
  useEffect(() => {
    // 메인 운동에 최소 한 개의 세트가 있고, 각 세트에 무게와 반복 수가 0보다 큰지 확인
    const isMainExerciseValid = mainExercise.sets.length > 0 && 
      mainExercise.sets.every(set => set.weight > 0 && set.reps > 0);

    // 보조 운동이 있는 경우, 각 운동에 이름이 있고 최소 한 개의 세트가 있으며, 각 세트에 무게와 반복 수가 0보다 큰지 확인
    const areAccessoryExercisesValid = accessoryExercises.length === 0 || 
      accessoryExercises.every(exercise => 
        exercise.name.trim() !== '' && 
        exercise.sets.length > 0 && 
        exercise.sets.every(set => set.weight > 0 && set.reps > 0)
      );
    
    console.log('Form Validity Check:', { isMainExerciseValid, areAccessoryExercisesValid });
    setIsFormValid(isMainExerciseValid && areAccessoryExercisesValid);
  }, [mainExercise, accessoryExercises]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = (exerciseIndex: number = -1, setIndex: number) => {
    const timerKey = exerciseIndex === -1 ? `main_${setIndex}` : `accessory_${exerciseIndex}_${setIndex}`;
    
    if (!activeTimers[timerKey]) {
      // 타이머 시작
      const newTimers = { ...activeTimers };
      newTimers[timerKey] = { timeLeft: 60, isPaused: false };
      setActiveTimers(newTimers);
      
      timerRefs.current[timerKey] = setInterval(() => {
        setActiveTimers(prev => {
          const updated = { ...prev };
          if (updated[timerKey] && !updated[timerKey].isPaused) {
            updated[timerKey].timeLeft -= 1;
            
            if (updated[timerKey].timeLeft <= 0) {
              clearInterval(timerRefs.current[timerKey]);
              toast.success('휴식 시간이 끝났습니다!', { position: 'top-center' });
              delete updated[timerKey];
              return updated;
            }
          }
          return updated;
        });
      }, 1000);
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

  const addSet = (exerciseIndex: number = -1) => {
    if (exerciseIndex === -1) {
      setMainExercise(prev => ({
        ...prev,
        sets: [...prev.sets, { reps: 0, weight: 0, isSuccess: null }]
      }));
    } else {
      setAccessoryExercises(prev => {
        const newExercises = [...prev];
        newExercises[exerciseIndex].sets = [
          ...newExercises[exerciseIndex].sets,
          { reps: 0, weight: 0, isSuccess: null }
        ];
        return newExercises;
      });
    }
  };

  const removeSet = (exerciseIndex: number = -1, setIndex: number) => {
    if (exerciseIndex === -1) {
      // 메인 운동의 세트가 하나만 남았으면 삭제하지 않음
      if (mainExercise.sets.length <= 1) return;
      
      setMainExercise(prev => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== setIndex)
      }));
    } else {
      setAccessoryExercises(prev => {
        const newExercises = [...prev];
        // 세트가 하나만 남았으면 삭제하지 않음
        if (newExercises[exerciseIndex].sets.length <= 1) return newExercises;
        
        newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
        return newExercises;
      });
    }
  };

  const addAccessoryExercise = () => {
    setAccessoryExercises(prev => [
      ...prev,
      { 
        name: '', 
        weight: 0,
        reps: 0,
        sets: [{ reps: 0, weight: 0, isSuccess: null }] 
      }
    ]);
  };

  const removeAccessoryExercise = (index: number) => {
    setAccessoryExercises(prev => prev.filter((_, i) => i !== index));
  };

  // 횟수 자동 성공 처리 함수 수정
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    // 횟수 제한: 선택된 세트 구성에 따라 다른 최대값 적용
    const { repsCount: maxReps } = getSetConfiguration(
      selectedSetConfiguration, 
      customSets, 
      customReps
    );
    
    const limitedReps = Math.max(1, Math.min(maxReps, newReps));
    
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

  // 훈련 완료 처리 함수 수정
  const handleTrainingComplete = (setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      
      // 이미 상태가 있으면 초기 상태로 되돌리기 (토글 기능)
      if (newSets[setIndex].isSuccess !== null) {
        newSets[setIndex].isSuccess = null;
      } else {
        // 목표 횟수 달성 시 성공, 그렇지 않으면 실패
        const { repsCount: targetReps } = getSetConfiguration(
          selectedSetConfiguration, 
          customSets, 
          customReps
        );
        
        newSets[setIndex].isSuccess = newSets[setIndex].reps >= targetReps;
      }
      
      setMainExercise(prev => ({ ...prev, sets: newSets }));
    } else if (accessoryIndex !== undefined) {
      const newExercises = [...accessoryExercises];
      
      // 이미 상태가 있으면 초기 상태로 되돌리기 (토글 기능)
      if (newExercises[accessoryIndex].sets[setIndex].isSuccess !== null) {
        newExercises[accessoryIndex].sets[setIndex].isSuccess = null;
      } else {
        // 목표 횟수 달성 시 성공, 그렇지 않으면 실패
        const { repsCount: targetReps } = getSetConfiguration(
          selectedSetConfiguration, 
          customSets, 
          customReps
        );
        
        newExercises[accessoryIndex].sets[setIndex].isSuccess = 
          newExercises[accessoryIndex].sets[setIndex].reps >= targetReps;
      }
      
      setAccessoryExercises(newExercises);
    }
  };
  
  // 커스텀 이벤트 핸들러 - 세션 저장 이벤트 발생 시 프로필 업데이트
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('커스텀 이벤트 발생: profileUpdated', event.detail);
      // 필요한 경우, 여기서 추가 로직 처리
    };

    // 커스텀 이벤트 리스너 추가
    window.addEventListener('profileUpdated' as any, handleProfileUpdate as EventListener);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate as EventListener);
    };
  }, []);

  // 세트 구성 적용 함수
  const applySetConfiguration = (config: any) => {
    console.log('세트 구성 적용:', config);
    
    // 세트 구성에 따라 초기 세트 수 설정
    const { setsCount, repsCount } = getSetConfiguration(
      config.preferredSetup, 
      config.customSets, 
      config.customReps
    );
    
    // 상태 업데이트
    setSets(setsCount);
    setReps(repsCount);
    
    // 해당 세트 수만큼 초기 세트 배열 생성
    const initialSets = Array(setsCount).fill(0).map(() => ({
      reps: repsCount,  // 선호 반복 수로 초기화
      weight: 0,        // 무게는 사용자가 입력
      isSuccess: null as boolean | null
    }));
    
    console.log(`세트 구성 적용: ${setsCount} 세트 x ${repsCount} 회`);
    setMainExercise(prev => ({
      ...prev,
      sets: initialSets.map(set => ({ ...set, isSuccess: null }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('WorkoutForm: handleSubmit triggered');

    if (!userProfile) {
      toast.error('로그인이 필요합니다.');
      console.log('WorkoutForm: User not logged in');
      return;
    }
    console.log('WorkoutForm: User profile available:', userProfile);

    console.log('WorkoutForm: Final isFormValid state before submitting:', isFormValid);
    if (!isFormValid) {
      toast.error('필수 필드를 모두 입력해주세요. (각 세트의 무게와 횟수는 0보다 커야 합니다)');
      console.log('WorkoutForm: Form is not valid. Main exercise:', mainExercise, 'Accessory:', accessoryExercises);
      return;
    }

    try {
      console.log('WorkoutForm: Preparing session data...');
      // 일주일 전 날짜 계산
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // 메인 운동 데이터 정리: 무게와 반복 수가 0인 세트 제외 (isFormValid에서 이미 체크하지만, 안전장치)
      const cleanMainExercise = {
        part,
        name: mainExercise.name, 
        // weight: mainExercise.sets && mainExercise.sets.length > 0 ? mainExercise.sets[0].weight : 0, // 세트별 무게를 사용하므로 이 필드는 불필요할 수 있음
        sets: mainExercise.sets.map(set => ({
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess === null ? false : set.isSuccess // null이면 false로 처리
        }))
      };
      console.log('Cleaned main exercise:', cleanMainExercise);

      const cleanAccessoryExercises = accessoryExercises.map(exercise => ({
        name: exercise.name || '',
        // weight: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].weight : 0, // 세트별 무게
        // reps: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].reps : 0, // 세트별 횟수
        sets: (exercise.sets || []).map(set => ({
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess === null ? false : set.isSuccess // null이면 false로 처리
        }))
      }));
      console.log('Cleaned accessory exercises:', cleanAccessoryExercises);

      const sessionData: Session = {
        userId: userProfile.uid,
        date: new Date(), // Timestamp로 변환은 Firestore가 자동으로 처리하거나, Timestamp.fromDate(new Date()) 사용
        part,
        mainExercise: cleanMainExercise,
        accessoryExercises: cleanAccessoryExercises,
        notes: notes || '',
        isAllSuccess: mainExercise.sets.every(set => set.isSuccess === true), // isSuccess가 true인 경우만 전체 성공
        successSets: mainExercise.sets.filter(set => set.isSuccess === true).length, // isSuccess가 true인 세트 수
        accessoryNames: cleanAccessoryExercises.map(ex => ex.name)
      };

      console.log('WorkoutForm: Attempting to save session data to Firestore. Data:', JSON.stringify(sessionData, null, 2));

      // 기존 기록 확인
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', userProfile.uid),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const querySnapshot = await getDocs(q);
      console.log('WorkoutForm: Existing sessions in last 7 days:', querySnapshot.size);
      
      // 주석 처리: 현재는 7일 제한 없이 저장 테스트
      // if (querySnapshot.size >= 7) {
      //   toast.error('최근 7일 동안의 기록만 저장할 수 있습니다.');
      //   console.log('WorkoutForm: Save limit reached (7 days).');
      //   return;
      // }

      await addDoc(collection(db, 'sessions'), sessionData);
      console.log('WorkoutForm: Session data saved successfully to Firestore.');
      
      // 저장 완료 토스트 메시지
      toast.success('저장 완료!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '1.2rem',
          minWidth: '250px',
          textAlign: 'center',
        },
        icon: '✅'
      });
      
      // 성공/실패에 따른 다른 메시지 표시
      const successSets = mainExercise.sets.filter(set => set.isSuccess).length;
      const failedSets = mainExercise.sets.filter(set => set.isSuccess === false).length;
      const totalSets = mainExercise.sets.length;
      
      // 전체 세트의 70% 이상 성공 시 증량 권장 메시지
      if (successSets >= Math.ceil(totalSets * 0.7)) {
        toast.success(`훈련에 성공했습니다! 다음 세션에서 ${mainExercise.name}의 무게를 2.5kg 증량해보세요. 💪`, {
          duration: 5000,
          icon: '🏋️',
          style: {
            background: '#3B82F6',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px'
          }
        });
      }
      // 실패 세트가 절반 이상인 경우 격려 메시지
      else if (failedSets > Math.floor(totalSets * 0.5)) {
        toast.info('오늘 운동이 어려웠나요? 다음에는 더 잘할 수 있어요! 무게를 조금 낮추거나 충분한 휴식을 취해보세요. 🙂', {
          duration: 5000,
          icon: '💪',
          style: {
            background: '#8B5CF6',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px'
          }
        });
      }
      // 그 외의 경우 기본 메시지
      else {
        toast.info('꾸준한 훈련이 좋은 결과를 가져옵니다. 다음 세션도 화이팅! 💯', {
          duration: 5000,
          icon: '🔥',
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px'
          }
        });
      }
      
      // 폼 초기화
      setPart('chest');
      setMainExercise({
        name: mainExerciseOptions.chest[0].label,
        sets: [{ reps: 0, weight: 0, isSuccess: null }]
      });
      setAccessoryExercises([]);
      setNotes('');
      
      // 성공 콜백 호출 - 운동 기록 페이지로 이동
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('WorkoutForm: Error saving session:', error); // 전체 에러 객체 로깅
      toast.error('운동 기록 저장에 실패했습니다. 콘솔을 확인해주세요.'); // 사용자에게 콘솔 확인 안내
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">새 운동 기록</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 웜업 안내 카드 */}
          {showWarmupTips && (
            <Card className="border-2 border-yellow-400 mb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-yellow-600">
                  <AlertTriangle size={20} className="mr-2" />
                  웜업 세트 안내
                </CardTitle>
                <Button 
                  type="button" 
                  size="sm"
                  className="bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300"
                  onClick={() => setShowWarmupTips(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                부상 방지와 최적의 운동 효과를 위해 충분한 웜업 세트와 스트레칭을 완료한 후에 시작해주세요.
              </p>
              <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                  {part.charAt(0).toUpperCase() + part.slice(1)} 웜업 세트 추천
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {warmupExercises[part].map((exercise, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">{exercise}</li>
                  ))}
                </ul>
                <div className="flex space-x-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className={`flex items-center ${
                      stretchingCompleted ? 'bg-green-100 text-green-700 border-green-500' : 'bg-white'
                    }`}
                    onClick={() => setStretchingCompleted(!stretchingCompleted)}
                  >
                    {stretchingCompleted ? <CheckCircle className="mr-2" size={16} /> : null}
                    스트레칭 완료
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`flex items-center ${
                      warmupCompleted ? 'bg-green-100 text-green-700 border-green-500' : 'bg-white'
                    }`}
                    onClick={() => setWarmupCompleted(!warmupCompleted)}
                  >
                    {warmupCompleted ? <CheckCircle className="mr-2" size={16} /> : null}
                    웜업 세트 완료
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 세트 구성 선택 섹션 수정 */}
          <Card className="animate-slideUp">
            <CardTitle>세트 구성 설정</CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedSetConfiguration === '10x5'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                size="sm"
                onClick={() => handleSetConfigChange('10x5')}
              >
                10회 x 5세트
              </Button>
              <Button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedSetConfiguration === ('15x5' as SetConfiguration)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                size="sm"
                onClick={() => handleSetConfigChange('15x5' as SetConfiguration)}
              >
                15회 x 5세트
              </Button>
              <Button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedSetConfiguration === ('6x3' as SetConfiguration)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                size="sm"
                onClick={() => handleSetConfigChange('6x3' as SetConfiguration)}
              >
                6회 x 3세트
              </Button>
              <Button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedSetConfiguration === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                size="sm"
                onClick={() => handleSetConfigChange('custom')}
              >
                커스텀
              </Button>
            </div>
            
            {selectedSetConfiguration === 'custom' && (
              <div className="flex gap-4 mb-4 items-end">
                <div className="flex flex-col">
                  <label htmlFor={`customSetsInput`} className="text-xs text-gray-500 mb-1">세트 수</label>
                  <input
                    type="number"
                    id={`customSetsInput`}
                    min="1"
                    max="20"
                    value={customSets}
                    onChange={(e) => setCustomSets(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor={`customRepsInput`} className="text-xs text-gray-500 mb-1">반복 횟수</label>
                  <input
                    type="number"
                    id={`customRepsInput`}
                    min="1"
                    max="30"
                    value={customReps}
                    onChange={(e) => setCustomReps(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={applyCustomConfiguration}
                >
                  적용
                </Button>
              </div>
            )}
          </Card>

          <Card className="animate-slideUp">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {exercisePartOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPart(option.value as ExercisePart)}
                    className={`
                      py-2 px-4 rounded-lg flex items-center transition-all duration-300 text-sm font-medium
                      ${part === option.value 
                        ? 'bg-[#4285F4] text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <CardSection>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <CardTitle className="mb-2 md:mb-0">
                    <span className="flex items-center">
                      메인 운동: <span className="font-bold ml-2">{mainExercise.name}</span>
                      <Badge
                        variant={mainExercise.sets.some(set => set.isSuccess) ? "success" : "gray"}
                        className="ml-2"
                        size="sm"
                      >
                        {mainExercise.sets.filter(set => set.isSuccess).length}/{mainExercise.sets.length} 세트
                      </Badge>
                    </span>
                  </CardTitle>
                  
                  {/* 메인 운동 선택 드롭다운 */}
                  <div className="w-full md:w-auto">
                    <select
                      id={`mainExerciseSelect-${part}`}
                      value={selectedMainExercise}
                      onChange={(e) => setSelectedMainExercise(e.target.value as MainExerciseType)}
                      className="w-full md:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      style={{ paddingRight: '2.5rem', backgroundPosition: 'right 0.75rem center' }}
                    >
                      {mainExerciseOptions[part].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {mainExercise.sets.map((set, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fadeIn transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center space-x-2">
                          <Badge variant="primary" size="sm" rounded>{index + 1}</Badge>
                          <span className="font-medium text-gray-800 dark:text-white">세트</span>
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor={`mainExerciseWeight-${index}`} className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                          <input
                            type="number"
                            id={`mainExerciseWeight-${index}`}
                            value={set.weight}
                            onChange={(e) => {
                              const newSets = [...mainExercise.sets];
                              newSets[index].weight = Number(e.target.value);
                              setMainExercise(prev => ({ ...prev, sets: newSets }));
                            }}
                            placeholder="kg"
                            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor={`mainExerciseReps-${index}`} className="text-xs text-gray-500 mb-1">
                            횟수 (최대 {selectedSetConfiguration === '10x5' ? 10 : 
                             selectedSetConfiguration === '15x5' ? 15 : 
                             selectedSetConfiguration === '6x3' ? 6 : 
                             selectedSetConfiguration === 'custom' ? customReps : 10})
                          </label>
                          <input
                            type="number"
                            id={`mainExerciseReps-${index}`}
                            value={set.reps}
                            onChange={(e) => handleRepsChange(Number(e.target.value), index, true)}
                            placeholder="횟수"
                            min="1"
                            max={selectedSetConfiguration === '10x5' ? 10 : 
                                 selectedSetConfiguration === '15x5' ? 15 : 
                                 selectedSetConfiguration === '6x3' ? 6 : 
                                 selectedSetConfiguration === 'custom' ? customReps : 10}
                            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <Button
                          type="button"
                          className={
                            !activeTimers[`main_${index}`] 
                              ? "px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg" 
                              : activeTimers[`main_${index}`].isPaused 
                                ? "px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg" 
                                : "px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                          }
                          size="sm"
                          onClick={() => toggleTimer(-1, index)}
                          icon={<Clock size={16} />}
                        >
                          {!activeTimers[`main_${index}`]
                            ? '휴식 타이머' 
                            : activeTimers[`main_${index}`].isPaused
                              ? `▶️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}` 
                              : `⏸️ ${formatTime(activeTimers[`main_${index}`].timeLeft)}`
                          }
                        </Button>

                        {/* 훈련 완료 버튼 */}
                        <Button
                          type="button"
                          className={
                            set.isSuccess === null
                              ? "px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                              : set.isSuccess
                                ? "px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg"
                                : "px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                          }
                          size="sm"
                          onClick={() => handleTrainingComplete(index, true)}
                          icon={set.isSuccess === null ? undefined : set.isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        >
                          {set.isSuccess === null
                            ? '훈련 완료'
                            : set.isSuccess
                              ? '성공'
                              : '실패'
                          }
                        </Button>

                        {/* 커스텀 세트의 경우만 삭제 버튼 표시 */}
                        {(selectedSetConfiguration === 'custom' && mainExercise.sets.length > 1) && (
                          <Button
                            type="button"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-transparent"
                            onClick={() => removeSet(-1, index)}
                            icon={<X size={16} className="text-danger-500" />}
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSet()}
                    icon={<Plus size={16} />}
                    className="mt-2"
                  >
                    세트 추가
                  </Button>
                </div>
              </CardSection>

              {accessoryExercises.map((exercise, index) => (
                <CardSection key={index} className="animate-slideUp">
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="mb-0 pb-0 border-b-0">
                      보조 운동 {index + 1}
                    </CardTitle>
                    <Button
                      type="button"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-transparent"
                      onClick={() => removeAccessoryExercise(index)}
                      icon={<X size={16} className="text-danger-500" />}
                    >
                      삭제
                    </Button>
                  </div>
                  <input
                    type="text"
                    id={`accessoryExerciseName-${index}`}
                    value={exercise.name}
                    onChange={(e) => {
                      const newExercises = [...accessoryExercises];
                      newExercises[index].name = e.target.value;
                      setAccessoryExercises(newExercises);
                    }}
                    placeholder="운동 이름"
                    className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="space-y-4">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fadeIn transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" size="sm" rounded>{setIndex + 1}</Badge>
                            <span className="font-medium text-gray-800 dark:text-white">세트</span>
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor={`accessoryExerciseWeight-${index}-${setIndex}`} className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                            <input
                              type="number"
                              id={`accessoryExerciseWeight-${index}-${setIndex}`}
                              value={set.weight}
                              onChange={(e) => {
                                const newExercises = [...accessoryExercises];
                                newExercises[index].sets[setIndex].weight = Number(e.target.value);
                                setAccessoryExercises(newExercises);
                              }}
                              placeholder="kg"
                              className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor={`accessoryExerciseReps-${index}-${setIndex}`} className="text-xs text-gray-500 mb-1">
                              횟수 (최대 {selectedSetConfiguration === '10x5' ? 10 : 
                               selectedSetConfiguration === '15x5' ? 15 : 
                               selectedSetConfiguration === '6x3' ? 6 : 
                               selectedSetConfiguration === 'custom' ? customReps : 100})
                            </label>
                            <input
                              type="number"
                              id={`accessoryExerciseReps-${index}-${setIndex}`}
                              value={set.reps}
                              onChange={(e) => handleRepsChange(Number(e.target.value), setIndex, false, index)}
                              placeholder="횟수"
                              min="1"
                              max={selectedSetConfiguration === '10x5' ? 10 : 
                                   selectedSetConfiguration === '15x5' ? 15 : 
                                   selectedSetConfiguration === '6x3' ? 6 : 
                                   selectedSetConfiguration === 'custom' ? customReps : 100}
                              className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <Button
                            type="button"
                            className={
                              !activeTimers[`accessory_${index}_${setIndex}`] 
                                ? "px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg" 
                                : activeTimers[`accessory_${index}_${setIndex}`].isPaused 
                                  ? "px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg" 
                                  : "px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            }
                            size="sm"
                            onClick={() => toggleTimer(index, setIndex)}
                            icon={<Clock size={16} />}
                          >
                            {!activeTimers[`accessory_${index}_${setIndex}`]
                              ? '휴식 타이머' 
                              : activeTimers[`accessory_${index}_${setIndex}`].isPaused
                                ? `▶️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}` 
                                : `⏸️ ${formatTime(activeTimers[`accessory_${index}_${setIndex}`].timeLeft)}`
                            }
                          </Button>

                          {/* 훈련 완료 버튼 */}
                          <Button
                            type="button"
                            className={
                              set.isSuccess === null
                                ? "px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                                : set.isSuccess
                                  ? "px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg"
                                  : "px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            }
                            size="sm"
                            onClick={() => handleTrainingComplete(setIndex, false, index)}
                            icon={set.isSuccess === null ? undefined : set.isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          >
                            {set.isSuccess === null
                              ? '훈련 완료'
                              : set.isSuccess
                                ? '성공'
                                : '실패'
                            }
                          </Button>

                          {/* 커스텀 세트의 경우만 삭제 버튼 표시 */}
                          {(selectedSetConfiguration === 'custom' && exercise.sets.length > 1) && (
                            <Button
                              type="button"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-transparent"
                              onClick={() => removeSet(index, setIndex)}
                              icon={<X size={16} className="text-danger-500" />}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSet(index)}
                      icon={<Plus size={16} />}
                      className="mt-2"
                    >
                      세트 추가
                    </Button>
                  </div>
                </CardSection>
              ))}

              <Button
                type="button"
                className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#4285F4] rounded-md shadow-sm hover:bg-[#3b78db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                onClick={addAccessoryExercise}
                icon={<Plus size={16} />}
              >
                보조 운동 추가
              </Button>
            </div>
          </Card>

          <Card className="animate-slideUp">
            <CardTitle>메모</CardTitle>
            <textarea
              id="workoutNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="오늘의 운동에 대한 메모를 남겨보세요"
              className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </Card>

          <Button
            type="submit"
            className={`w-full px-4 py-3 text-lg font-medium text-white rounded-md shadow-sm transition-all duration-500 ${
              !isFormValid 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#4285F4] hover:bg-[#3b78db] focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]'
            }`}
            disabled={!isFormValid}
            icon={<Save size={20} />}
          >
            저장하기
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default WorkoutForm;