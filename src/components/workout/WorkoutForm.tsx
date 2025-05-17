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
import { addDoc, collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
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
  const { userProfile, updateProfile } = useAuth();
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
  const [showWarmupTips, setShowWarmupTips] = useState(false);
  
  // 추가 상태 변수 정의
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ExercisePart>('chest');
  const [preferredExercises, setPreferredExercises] = useState<Record<string, string>>({});
  const [selectedSetConfiguration, setSelectedSetConfiguration] = useState<SetConfiguration>('5x5');
  const [sets, setSets] = useState<number>(5);
  const [reps, setReps] = useState<number>(5);
  const [customSets, setCustomSets] = useState<number>(5);
  const [customReps, setCustomReps] = useState<number>(5);
  
  // 최근 운동 이력 정보 저장 상태 추가
  const [latestWorkoutInfo, setLatestWorkoutInfo] = useState<{
    date: Date | null;
    weight: number;
    allSuccess: boolean;
    exists: boolean;
    exerciseName: string;
    sets: number;
    reps: number;
  }>({
    date: null,
    weight: 0,
    allSuccess: false,
    exists: false,
    exerciseName: '',
    sets: 0,
    reps: 0
  });

  // 컴포넌트 마운트 시 초기화 로직 수정
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
      
      // 세트 구성 설정 - 컴포넌트 마운트 시 한 번만 설정
      // 로컬 스토리지에 저장된 설정이 있으면 그것을 우선 사용
      const savedConfig = localStorage.getItem('lastSetConfiguration');
      
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          console.log('로컬 스토리지에서 세트 설정 로드:', config);
          
          // 상태 업데이트
          setSelectedSetConfiguration(config.preferredSetup as SetConfiguration);
          setCustomSets(config.customSets || 5);
          setCustomReps(config.customReps || 10);
          
          // 세트 구성 적용
          applySetConfiguration(config);
          
          // 부위에 따른 최근 운동 기록 조회
          fetchLatestWorkout(part);
          return;  // 로컬 스토리지에서 설정을 로드했으면 프로필 설정은 무시
        } catch (error) {
          console.error('저장된 세트 설정 로드 실패:', error);
        }
      }
      
      // 로컬 스토리지에 설정이 없는 경우 프로필 설정 사용
      if (userProfile.setConfiguration) {
        console.log('운동 컴포넌트: 세트 구성 설정 적용:', userProfile.setConfiguration);
        const config = userProfile.setConfiguration;
        
        if (config.preferredSetup) {
          // 선호하는 세트 구성 적용
          setSelectedSetConfiguration(config.preferredSetup as SetConfiguration);
          setCustomSets(config.customSets || 5);
          setCustomReps(config.customReps || 10);
          applySetConfiguration(config);
        }
      } else {
        // 기본값으로 10x5 설정
        console.log('운동 컴포넌트: 세트 구성 설정이 없어 기본값(10x5) 적용');
        const defaultConfig = {
          preferredSetup: '10x5',
          customSets: 5,
          customReps: 10
        };
        setSelectedSetConfiguration(defaultConfig.preferredSetup as SetConfiguration);
        applySetConfiguration(defaultConfig);
      }
      
      // 부위에 따른 최근 운동 기록 조회
      fetchLatestWorkout(part);
    }
  }, [userProfile?.uid]); // 의존성 배열에 userProfile.uid만 포함하여 로그인 시에만 실행

  // 부위(part) 변경 시 운동 이름만 업데이트하고, 세트 설정은 그대로 유지
  useEffect(() => {
    console.log(`부위 변경: ${part}, 세트 설정 유지`);
    const newSelectedPart = part as ExercisePart; // 타입 단언
    if (mainExerciseOptions[newSelectedPart] && mainExerciseOptions[newSelectedPart].length > 0) {
      const firstExerciseForPart = mainExerciseOptions[newSelectedPart][0];
      setSelectedMainExercise(firstExerciseForPart.value);
      
      // 운동 이름만 변경하고 세트 유지
      setMainExercise(prev => ({
        ...prev,
        name: firstExerciseForPart.label
      }));
    } else {
      // 해당 부위에 운동이 없는 경우 (예: 잘못된 'part' 값), 기본값 또는 오류 처리
      setSelectedMainExercise(mainExerciseOptions.chest[0].value);
      setMainExercise(prev => ({
        ...prev,
        name: mainExerciseOptions.chest[0].label
      }));
    }

    // 부위 변경 시 최근 운동 기록 가져오기
    fetchLatestWorkout(newSelectedPart);
    
    // 세트는 변경하지 않음 - 기존 세트 유지
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

      // 메인 운동 변경 시 해당 운동의 최근 기록 가져오기
      fetchLatestWorkout(part, selectedMainExercise);
    }
  }, [selectedMainExercise, part]);

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

  // 세트 추가/삭제 기능 제거 (WorkoutGuidePage에서 세트 구성 설정으로만 관리)

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

  // 횟수 자동 성공 처리 함수
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    // 횟수 제한: 선택된 세트 구성에 따라 다른 최대값 적용
    const { repsCount: maxReps } = getSetConfiguration(
      selectedSetConfiguration, 
      customSets, 
      customReps
    );
    
    // 입력된 값이 최대 반복 횟수를 초과하지 않도록 제한
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
        
        // 현재 입력된 횟수가 목표 횟수 이상이면 성공, 그렇지 않으면 실패
        const currentReps = newSets[setIndex].reps;
        const isSuccess = currentReps >= targetReps;
        newSets[setIndex].isSuccess = isSuccess;
        
        console.log(`세트 ${setIndex+1} 완료: ${currentReps}/${targetReps}회, 결과: ${isSuccess ? '성공' : '실패'}`);
        
        // 성공한 세트인 경우 1RM 예상 계산 및 프로필 업데이트
        if (isSuccess) {
          const weight = newSets[setIndex].weight;
          const reps = newSets[setIndex].reps;
          
          // 브레찌키 공식으로 1RM 계산
          if (weight > 0 && reps > 0 && reps < 37) {
            const estimatedOneRM = Math.round(weight * (36 / (37 - reps)));
            console.log(`세트 성공: ${weight}kg x ${reps}회, 예상 1RM: ${estimatedOneRM}kg`);
            
            // 메인 운동 종류에 따라 1RM 업데이트
            updateOneRMIfHigher(selectedMainExercise, estimatedOneRM);
          }
        }
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
        
        // 현재 입력된 횟수가 목표 횟수 이상이면 성공, 그렇지 않으면 실패
        const currentReps = newExercises[accessoryIndex].sets[setIndex].reps;
        const isSuccess = currentReps >= targetReps;
        newExercises[accessoryIndex].sets[setIndex].isSuccess = isSuccess;
        
        console.log(`보조운동 ${accessoryIndex+1}, 세트 ${setIndex+1} 완료: ${currentReps}/${targetReps}회, 결과: ${isSuccess ? '성공' : '실패'}`);
      }
      
      setAccessoryExercises(newExercises);
    }
  };
  
  // 새로운 1RM이 기존보다 높은 경우 프로필 업데이트
  const updateOneRMIfHigher = async (exerciseType: MainExerciseType, newOneRM: number) => {
    if (!userProfile) return;
    
    // 현재 프로필의 1RM 정보
    const currentOneRM = userProfile.oneRepMax || {
      bench: 0,
      squat: 0,
      deadlift: 0,
      overheadPress: 0
    };
    let shouldUpdate = false;
    let exerciseKey = '';
    
    // 운동 종류에 따라 해당하는 1RM 키 결정
    // 벤치프레스 계열
    if (
      exerciseType === 'benchPress' || 
      exerciseType === 'inclineBenchPress' || 
      exerciseType === 'declineBenchPress'
    ) {
      exerciseKey = 'bench';
      if (!currentOneRM.bench || newOneRM > currentOneRM.bench) {
        shouldUpdate = true;
      }
    }
    // 스쿼트 계열
    else if (exerciseType === 'squat') {
      exerciseKey = 'squat';
      if (!currentOneRM.squat || newOneRM > currentOneRM.squat) {
        shouldUpdate = true;
      }
    }
    // 데드리프트 계열
    else if (exerciseType === 'deadlift') {
      exerciseKey = 'deadlift';
      if (!currentOneRM.deadlift || newOneRM > currentOneRM.deadlift) {
        shouldUpdate = true;
      }
    }
    // 오버헤드프레스 계열
    else if (exerciseType === 'overheadPress') {
      exerciseKey = 'overheadPress';
      if (!currentOneRM.overheadPress || newOneRM > currentOneRM.overheadPress) {
        shouldUpdate = true;
      }
    }
    
    // 업데이트가 필요한 경우
    if (shouldUpdate && exerciseKey) {
      try {
        const updatedOneRM = { ...currentOneRM, [exerciseKey]: newOneRM };
        
        // AuthContext의 updateProfile 함수를 사용하여 프로필 업데이트
        await updateProfile({ 
          oneRepMax: updatedOneRM as {
            bench: number;
            squat: number;
            deadlift: number;
            overheadPress: number;
          }
        });
        
        // 성공 토스트 메시지
        toast.success(
          `새로운 ${exerciseKey === 'bench' ? '벤치프레스' : 
            exerciseKey === 'squat' ? '스쿼트' : 
            exerciseKey === 'deadlift' ? '데드리프트' : '오버헤드프레스'
          } 1RM: ${newOneRM}kg!`, 
          { duration: 3000 }
        );
        
        console.log(`1RM 업데이트 성공: ${exerciseKey} = ${newOneRM}kg`);
      } catch (error) {
        console.error('1RM 업데이트 실패:', error);
      }
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

  // 최근 운동 기록 가져오기
  const fetchLatestWorkout = async (exercisePart: ExercisePart, mainExerciseType?: MainExerciseType) => {
    if (!userProfile) return;

    try {
      console.log(`fetchLatestWorkout 실행: 부위=${exercisePart}, 운동타입=${mainExerciseType || '없음'}`);
      
      // 1. 특정 부위와 운동 타입에 대한 최근 기록 쿼리
      const sessionsCollection = collection(db, 'sessions');
      
      // 복합 인덱스 오류 해결: orderBy 제거하고 기본 쿼리만 사용
      const q = query(
        sessionsCollection,
        where('userId', '==', userProfile.uid),
        where('part', '==', exercisePart)
        // orderBy 제거 - Firestore 복합 인덱스 오류 해결
      );

      console.log('Firestore 쿼리 실행 중...');
      const snapshot = await getDocs(q);
      console.log(`쿼리 결과: ${snapshot.size}개 문서 발견`);
      
      if (!snapshot.empty) {
        // 클라이언트에서 날짜 기준으로 정렬
        const sortedDocs = snapshot.docs.sort((a, b) => {
          const dateA = a.data().date.toDate();
          const dateB = b.data().date.toDate();
          return dateB.getTime() - dateA.getTime(); // 최신 날짜순 정렬
        });
        
        // 가장 최근 데이터 사용
        const latestSession = sortedDocs[0].data() as Session;
        console.log('최근 운동 기록 데이터:', JSON.stringify(latestSession, null, 2));
        
        // 메인 운동 타입이 지정된 경우, 해당 운동과 일치하는지 확인
        if (mainExerciseType && latestSession.mainExercise) {
          // 현재 선택된 운동의 레이블 가져오기
          const currentExerciseLabel = mainExerciseOptions[exercisePart].find(
            ex => ex.value === mainExerciseType
          )?.label;
          
          console.log(`현재 선택된 운동 이름: ${currentExerciseLabel}`);
          console.log(`저장된 운동 이름: ${latestSession.mainExercise.name}`);
          
          // 운동 이름이 다르면 처리 중단
          if (currentExerciseLabel && latestSession.mainExercise.name !== currentExerciseLabel) {
            console.log('선택된 운동이 최근 기록과 일치하지 않습니다. 무게를 로드하지 않습니다.');
            setLatestWorkoutInfo({
              date: null,
              weight: 0,
              allSuccess: false,
              exists: false,
              exerciseName: '',
              sets: 0,
              reps: 0
            });
            return;
          }
        }
        
        if (latestSession.mainExercise && latestSession.mainExercise.sets && latestSession.mainExercise.sets.length > 0) {
          // 모든 세트가 성공인지 확인
          const allSuccess = latestSession.mainExercise.sets.every(set => set.isSuccess === true);
          
          // 마지막 세트의 무게 가져오기 (보통 마지막 세트가 최대 무게)
          const lastWeight = latestSession.mainExercise.sets[0].weight;
          
          // 새 무게 계산: 모든 세트 성공 시 2.5kg 증량, 실패 시 동일 무게
          const newWeight = allSuccess ? lastWeight + 2.5 : lastWeight;
          
          console.log(`최근 운동 성공 여부: ${allSuccess}, 이전 무게: ${lastWeight}kg, 새 무게: ${newWeight}kg`);
          
          // 세트 수와 반복 횟수 패턴 확인
          const setsCount = latestSession.mainExercise.sets.length;
          const repsCount = latestSession.mainExercise.sets[0]?.reps || 0;
          
          // 최근 운동 이력 정보 업데이트
          setLatestWorkoutInfo({
            date: latestSession.date instanceof Date 
              ? latestSession.date 
              : (typeof latestSession.date === 'object' && latestSession.date && 'toDate' in latestSession.date 
                ? latestSession.date.toDate() 
                : new Date()),
            weight: lastWeight,
            allSuccess,
            exists: true,
            exerciseName: latestSession.mainExercise.name,
            sets: setsCount,
            reps: repsCount
          });
          
          // 메인 운동 세트 설정: 새 무게 적용 (모든 세트에 동일한 무게 적용)
          const newSets = Array(setsCount).fill(0).map((_, index) => {
            // 이전 코드: 첫 세트는 워밍업으로 약간 가벼운 무게 적용
            // const weightAdjustment = index === 0 ? -2.5 : 0;
            
            // 수정된 코드: 모든 세트에 동일한 무게 적용
            return {
              reps: latestSession.mainExercise.sets[index]?.reps || 0,
              weight: newWeight, // 모든 세트에 동일한 무게 적용
              isSuccess: null
            };
          });
          
          console.log('새로운 세트 구성:', newSets);
          
          // 메인 운동 업데이트
          setMainExercise(prev => {
            console.log('메인 운동 업데이트. 이전 상태:', prev);
            const updated = {
              ...prev,
              sets: newSets
            };
            console.log('업데이트된 상태:', updated);
            return updated;
          });
        }
      } else {
        console.log('해당 운동의 이전 기록이 없습니다.');
        setLatestWorkoutInfo({
          date: null,
          weight: 0,
          allSuccess: false,
          exists: false,
          exerciseName: '',
          sets: 0,
          reps: 0
        });
      }
    } catch (error) {
      console.error('최근 운동 기록 가져오기 실패:', error);
      setLatestWorkoutInfo({
        date: null,
        weight: 0,
        allSuccess: false,
        exists: false,
        exerciseName: '',
        sets: 0,
        reps: 0
      });
    }
  };

  // 세트 설정 변경 이벤트 감지 (WorkoutGuidePage에서 세트 설정이 변경됐을 때 즉시 반영)
  useEffect(() => {
    const handleSetConfigUpdate = (event: CustomEvent) => {
      console.log('세트 설정 변경 이벤트 감지:', event.detail);
      const { setConfiguration } = event.detail;
      
      if (setConfiguration && setConfiguration.preferredSetup) {
        console.log('이벤트로부터 세트 설정 적용:', setConfiguration);
        
        // 상태 업데이트 전에 설정을 적용하여 일관성 보장
        setSelectedSetConfiguration(setConfiguration.preferredSetup as SetConfiguration);
        setCustomSets(setConfiguration.customSets || 5);
        setCustomReps(setConfiguration.customReps || 10);
        
        // 바로 설정 적용 (setTimeout 제거)
        applySetConfiguration(setConfiguration);
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('setConfigUpdated', handleSetConfigUpdate as EventListener);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('setConfigUpdated', handleSetConfigUpdate as EventListener);
    };
  }, []);
  
  // 컴포넌트 마운트 시 로컬 스토리지에서 세트 설정 로드하는 코드는 메인 useEffect로 이동

  // 세트 구성 적용 함수 개선
  const applySetConfiguration = (config: any) => {
    console.log('세트 구성 적용:', config);
    
    // 세트 구성에 따라 초기 세트 수 설정
    const { setsCount, repsCount } = getSetConfiguration(
      config.preferredSetup as SetConfiguration, 
      config.customSets, 
      config.customReps
    );
    
    // 상태 업데이트
    setSets(setsCount);
    setReps(repsCount);
    
    console.log(`세트 구성 적용: ${config.preferredSetup} - ${setsCount} 세트 x ${repsCount} 회`);
    
    // 상태를 바로 저장하여 다른 부위로 이동해도 세트 설정이 유지되도록 함
    localStorage.setItem('lastSetConfiguration', JSON.stringify(config));
    
    // 함수형 업데이트로 변경하여 최신 상태를 보장
    setMainExercise(prevExercise => {
      console.log('현재 메인 운동 세트:', prevExercise.sets.length);
      
      // 새 세트 배열 생성
      const updatedSets = Array.from({ length: setsCount }, (_, i) => {
        // 기존 세트가 있으면 무게 유지, 반복 횟수만 업데이트
        if (i < prevExercise.sets.length) {
          return {
            weight: prevExercise.sets[i].weight || 0,
            reps: repsCount,
            isSuccess: null as boolean | null
          };
        } else {
          // 새 세트는 무게 0, 지정된 반복 횟수로 설정
          return {
            weight: 0,
            reps: repsCount,
            isSuccess: null as boolean | null
          };
        }
      });
      
      console.log(`세트 수 변경: ${prevExercise.sets.length} -> ${updatedSets.length}`);
      console.log(`세트 구성 적용 완료: ${setsCount}세트 x ${repsCount}회`, updatedSets);
      
      return {
        ...prevExercise,
        sets: updatedSets
      };
    });
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
                        ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
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
                  
                  {/* 메인 운동 선택 드롭다운 - 위치 및 스타일 수정 */}
                  <div className="w-full md:w-auto flex-shrink-0">
                    <select
                      id={`mainExerciseSelect-${part}`}
                      value={selectedMainExercise}
                      onChange={(e) => setSelectedMainExercise(e.target.value as MainExerciseType)}
                      className="w-full md:w-60 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 dark:text-white"
                      aria-label="메인 운동 선택"
                    >
                      {mainExerciseOptions[part].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 최근 운동 이력 정보 표시 */}
                {latestWorkoutInfo.exists ? (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          최근 운동 이력: {latestWorkoutInfo.date?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mt-1">
                          {latestWorkoutInfo.reps}x{latestWorkoutInfo.sets}set 메인 운동 : {latestWorkoutInfo.exerciseName} {latestWorkoutInfo.weight}kg
                        </p>
                        <p className="text-sm mt-1">
                          <span className={latestWorkoutInfo.allSuccess ? 
                            "inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium" : 
                            "inline-block px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium"}>
                            {latestWorkoutInfo.allSuccess ? '모든 세트 성공' : '일부 세트 실패'}
                          </span>
                        </p>
                      </div>
                      {latestWorkoutInfo.allSuccess && (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-medium">
                          💪 2.5kg 증량을 도전해보세요!
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      최근 운동 이력이 없습니다.
                    </p>
                  </div>
                )}

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
                             selectedSetConfiguration === '6x3' ? 6 : 10})
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
                                 selectedSetConfiguration === '6x3' ? 6 : 10}
                            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        {/* 훈련 완료 버튼 */}
                        <Button
                          type="button"
                          variant={
                            set.isSuccess === null
                              ? "default"
                              : set.isSuccess
                                ? "success"
                                : "danger"
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
                        
                        <Button
                          type="button"
                          className={
                            !activeTimers[`main_${index}`] 
                              ? "px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg" 
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
                      </div>
                    </div>
                  ))}
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
                               selectedSetConfiguration === '6x3' ? 6 : 10})
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
                                   selectedSetConfiguration === '6x3' ? 6 : 10}
                              className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          
                          {/* 훈련 완료 버튼 */}
                          <Button
                            type="button"
                            variant={
                              set.isSuccess === null
                                ? "default"
                                : set.isSuccess
                                  ? "success"
                                  : "danger"
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
                          
                          <Button
                            type="button"
                            className={
                              !activeTimers[`accessory_${index}_${setIndex}`] 
                                ? "px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg" 
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardSection>
              ))}

              <Button
                type="button"
                className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                : 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
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