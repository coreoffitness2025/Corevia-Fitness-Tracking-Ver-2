import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkoutSettings } from '../../hooks/useWorkoutSettings';
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
import { Plus, X, Clock, CheckCircle, XCircle, Save, Info, AlertTriangle, ChevronUp, ChevronDown, RotateCcw, Trash, Square, Play, Pause, Heart, ArrowBigUpDash, MoveHorizontal, Footprints, Grip, ArrowUp, User, Zap, Camera, Upload, Timer, History, Settings2, ChevronsUpDown } from 'lucide-react'; // Edit, TrendingUp 제거
import { getSetConfiguration } from '../../utils/workoutUtils';
import AccessoryExerciseComponent from './AccessoryExerciseComponent';
// 필요한 import 추가
import ComplexWorkoutForm, { MainExerciseItem, AccessoryExerciseItem } from './ComplexWorkoutForm';
import type { ReactNode } from 'react'; // ReactNode 타입 import
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import WorkoutSetConfig from '../settings/WorkoutSetConfig';
import ExerciseDatabase from '../exercise/ExerciseDatabase';
import { scheduleNotification, triggerHapticFeedback } from '../../utils/capacitorUtils';

interface WorkoutFormProps {
  onSuccess?: () => void; // 저장 성공 시 호출될 콜백
}

const exercisePartOptions = [
  { value: 'chest',    label: '가슴',   mainExerciseName: '벤치 프레스' },
  { value: 'back',     label: '등',     mainExerciseName: '데드리프트' },
  { value: 'shoulder', label: '어깨',   mainExerciseName: '오버헤드 프레스' },
  { value: 'leg',      label: '하체',   mainExerciseName: '스쿼트' },
  { value: 'biceps',   label: '이두',   mainExerciseName: '덤벨 컬' },
  { value: 'triceps',  label: '삼두',   mainExerciseName: '케이블 푸시다운' }
];

// 각 부위별 메인 운동 옵션
const mainExerciseOptions: Record<ExercisePart, {value: MainExerciseType, label: string}[]> = {
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    { value: 'dumbbellBenchPress', label: '덤벨 벤치 프레스' },
    { value: 'chestPress', label: '체스트 프레스 머신' }
  ],
  back: [
    { value: 'barbellRow', label: '바벨로우' }, 
    { value: 'deadlift', label: '데드리프트' },
    { value: 'tBarRow', label: '티바로우' },
    { value: 'pullUp', label: '턱걸이 (풀업)' } // 턱걸이 추가 (이름은 풀업으로 통일)
  ],
  shoulder: [
    { value: 'overheadPress', label: '오버헤드 프레스' },
    { value: 'dumbbellShoulderPress', label: '덤벨 숄더 프레스' }, 
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    { value: 'romanianDeadlift', label: '루마니안 데드리프트' }, 
  ],
  biceps: [
    { value: 'dumbbellCurl', label: '덤벨 컬' },
    { value: 'barbellCurl', label: '바벨 컬' },
    { value: 'hammerCurl', label: '해머 컬' }
  ],
  triceps: [
    { value: 'cablePushdown', label: '케이블 푸시다운' },
    { value: 'overheadExtension', label: '오버헤드 익스텐션' },
    { value: 'lyingTricepsExtension', label: '라잉 트라이셉스 익스텐션' }
  ],
  complex: [ 
    { value: 'customComplex', label: '복합 운동 불러오기' }
  ],
  abs: [], 
  cardio: [] 
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
  const navigate = useNavigate();
  const { userProfile, updateProfile } = useAuth();
  const { settings, isLoading: isLoadingSettings } = useWorkoutSettings();
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
  const [stretchingCompleted, setStretchingCompleted] = useState<boolean>(false);
  const [warmupCompleted, setWarmupCompleted] = useState<boolean>(false);
  const [stretchingNotes, setStretchingNotes] = useState<string>('');
  
  // 수면 시간 및 컨디션 상태 추가
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [condition, setCondition] = useState<'bad' | 'normal' | 'good' | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [lastMealTime, setLastMealTime] = useState<string>("");

  // 통합 타이머 상태
  const [globalTimer, setGlobalTimer] = useState<{
    sectionId: string | null; 
    timeLeft: number;         
    timerMinutes: number;     
    timerSeconds: number;     
    isPaused: boolean;
    isRunning: boolean;       
  }>({
    sectionId: null,
    timeLeft: 120, 
    timerMinutes: 2,
    timerSeconds: 0,
    isPaused: true,
    isRunning: false,
  });
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // 추가 상태 변수 정의
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ExercisePart>('chest');
  const [preferredExercises, setPreferredExercises] = useState<Record<string, string>>({});
  const [selectedSetConfiguration, setSelectedSetConfiguration] = useState<SetConfiguration>('10x5');
  const [sets, setSets] = useState<number>(5);
  const [reps, setReps] = useState<number>(10);
  const [customSets, setCustomSets] = useState<number>(5);
  const [customReps, setCustomReps] = useState<number>(10);
  
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

  // 이전 보조 운동 히스토리 (메인 운동별로 저장)
  const [previousAccessoryExercises, setPreviousAccessoryExercises] = useState<Record<string, Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>>>({});

  const [savedComplexWorkouts, setSavedComplexWorkouts] = useState<Array<{
    id: string;
    name: string;
    mainExercises: Array<{
      name: string;
      sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
    }>;
    accessoryExercises: Array<{
      name: string;
      weight: number;
      reps: number;
      sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
    }>;
  }>>([]);
  
  const [showComplexWorkoutModal, setShowComplexWorkoutModal] = useState(false);
  const [selectedComplexWorkout, setSelectedComplexWorkout] = useState<string | null>(null);
  const [complexWorkoutName, setComplexWorkoutName] = useState<string>('');
  const [mainExercises, setMainExercises] = useState<Array<{
    name: string;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>>([]);
  const [isLoadingComplexWorkouts, setIsLoadingComplexWorkouts] = useState(false);
  const [isSavingComplexWorkout, setIsSavingComplexWorkout] = useState(false);

  // 체중 관련 상태 추가
  // const [currentWeight, setCurrentWeight] = useState<number>(0);
  // const [showWeightChart, setShowWeightChart] = useState(false);
  // const [showWeightChangeModal, setShowWeightChangeModal] = useState(false);
  // const [newWeight, setNewWeight] = useState<number>(0);
  // const [weightHistory, setWeightHistory] = useState<Array<{
  //   date: Date;
  //   weight: number;
  // }>>([]);

  // userProfile이 로드된 후 체중 초기값 설정 제거
  // useEffect(() => {
  //   if (userProfile?.weight) {
  //     setCurrentWeight(userProfile.weight);
  //     setNewWeight(userProfile.weight);
  //   }
  // }, [userProfile?.weight]);

  // 컴포넌트 마운트 시 초기화 로직 수정
  useEffect(() => {
    console.log('[WorkoutForm] 컴포넌트 마운트, userProfile:', userProfile?.uid);
    
    // 알람 사운드 요소 생성
    try {
      alarmRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3');
      alarmRef.current.preload = 'auto'; // 미리 로드
    } catch (error) {
      console.error('알람 사운드 로드 실패:', error);
    }
    
    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('알림 권한:', permission);
      });
    }
    
    if (userProfile) {
      console.log('[WorkoutForm] 사용자 프로필 로드됨, 운동 설정 적용:', userProfile);
      
      // 1. 부위별 선호 운동 설정 적용
      if (userProfile.preferredExercises) {
        console.log('[WorkoutForm] 선호 운동 설정 적용:', userProfile.preferredExercises);
        
        // 초기 부위는 가슴으로 설정하고 해당 부위의 선호 운동 적용
        const prefExercises = userProfile.preferredExercises;
        
        // 부위별 선호 운동 설정
        if (prefExercises.chest) {
          setSelectedMainExercise(prefExercises.chest as MainExerciseType);
        }
        
        // 부위 변경 시 해당 부위의 선호 운동 적용을 위해 저장
        setPreferredExercises(prefExercises);
      }
      
      // 3. 현재 선택된 부위에 대한 최근 운동 기록 조회
      fetchLatestWorkout(part);
    }
  }, [userProfile?.uid]); // 의존성 배열에 userProfile.uid만 포함하여 로그인 시에만 실행
  
  // 세트 설정이 변경될 때마다 적용 - 로직 단순화
  useEffect(() => {
    if (settings) {
      console.log('[WorkoutForm] 세트 설정 감지됨:', settings);
      
      // 세트 설정 직접 적용 (상태를 먼저 업데이트하고 나중에 세트 구성 적용)
      setSelectedSetConfiguration(settings.preferredSetup);
      setCustomSets(settings.customSets || 5);
      setCustomReps(settings.customReps || 10);
      
      // 세트 구성에 따라 세트 수와 반복 횟수 가져오기
      const { setsCount, repsCount } = getSetConfiguration(
        settings.preferredSetup,
        settings.customSets, 
        settings.customReps
      );
      
      console.log(`[WorkoutForm] 세트 구성 적용: ${settings.preferredSetup} - ${setsCount}세트 x ${repsCount}회`);
      
      // 세트 상태 업데이트
      setSets(setsCount);
      setReps(repsCount);
      
      // 명시적으로 메인 운동 세트 배열 업데이트
      const newSets = Array.from({ length: setsCount }, (_, i) => {
        // 기존 세트가 있으면 무게 유지, 없으면 0으로 설정
        const weight = (i < mainExercise.sets.length) ? mainExercise.sets[i].weight : 0;
        
        return {
          weight: weight,
          reps: repsCount,
          isSuccess: null as boolean | null
        };
      });
      
      // 세트 배열 업데이트
      setMainExercise((prev: typeof mainExercise) => ({ // prev 타입 명시
        ...prev,
        sets: newSets
      }));
      
      console.log('[WorkoutForm] 세트 구성 적용 완료:', newSets);
    }
  }, [settings]); // 의존성 배열에 settings만 포함 (다른 상태는 제거)

  // 부위(part) 변경 시 운동 이름만 업데이트하고, 세트 설정은 그대로 유지
  useEffect(() => {
    console.log(`부위 변경: ${part}, 세트 설정 유지`);
    const newSelectedPart = part as ExercisePart; // 타입 단언
    if (mainExerciseOptions[newSelectedPart] && mainExerciseOptions[newSelectedPart].length > 0) {
      const firstExerciseForPart = mainExerciseOptions[newSelectedPart][0];
      setSelectedMainExercise(firstExerciseForPart.value);
      
      // 운동 이름만 변경하고 세트 유지
      setMainExercise((prev: typeof mainExercise) => ({ // prev 타입 명시
        ...prev,
        name: firstExerciseForPart.label
      }));
    } else {
      // 해당 부위에 운동이 없는 경우 (예: 잘못된 'part' 값), 기본값 또는 오류 처리
      setSelectedMainExercise(mainExerciseOptions.chest[0].value);
      setMainExercise((prev: typeof mainExercise) => ({ // prev 타입 명시
        ...prev,
        name: mainExerciseOptions.chest[0].label
      }));
    }

    // 부위 변경 시 최근 운동 기록 가져오기
    // 중요: 부위 변경 시에도 세트 설정은 유지하도록 수정
    // 최근 운동 기록을 가져오되, 세트 설정을 덮어쓰지 않도록 새 플래그 사용
    fetchLatestWorkout(newSelectedPart, undefined, true);
  }, [part]);

  // 선택된 메인 운동(selectedMainExercise) 변경 시 mainExercise.name 업데이트
  useEffect(() => {
    const currentPartExercises = mainExerciseOptions[part as ExercisePart];
    const foundExercise = currentPartExercises.find(ex => ex.value === selectedMainExercise);
    if (foundExercise) {
      console.log(`[WorkoutForm] 메인 운동 변경: ${selectedMainExercise} -> ${foundExercise.label}`);
      setMainExercise((prev: typeof mainExercise) => ({ // prev 타입 명시
        ...prev,
        name: foundExercise.label
      }));

      // 메인 운동 변경 시 해당 운동의 최근 기록 가져오기
      // 운동 변경 시에도 세트 설정은 유지
      fetchLatestWorkout(part, selectedMainExercise, true);
    } else {
      console.warn(`[WorkoutForm] 메인 운동을 찾을 수 없습니다: part=${part}, selectedMainExercise=${selectedMainExercise}`);
    }
  }, [selectedMainExercise, part]);

  // 폼 유효성 검사
  useEffect(() => {
    // 메인 운동에 최소 한 개의 세트가 있고, 각 세트에 무게와 반복 수가 0보다 큰지 확인
    const isMainExerciseValid = mainExercise.sets.length > 0 && 
      mainExercise.sets.every((set: { weight: number; reps: number; }) => set.weight > 0 && set.reps > 0); // set 타입 명시

    // 보조 운동이 있는 경우, 각 운동에 이름이 있고 최소 한 개의 세트가 있으며, 각 세트에 무게와 반복 수가 0보다 큰지 확인
    const areAccessoryExercisesValid = accessoryExercises.length === 0 || 
      accessoryExercises.every((exercise: { name: string; sets: Array<{ weight: number; reps: number; }> }) =>  // exercise 타입 명시
        exercise.name.trim() !== '' && 
        exercise.sets.length > 0 && 
        exercise.sets.every((set: { weight: number; reps: number; }) => set.weight > 0 && set.reps > 0) // set 타입 명시
      );
    
    console.log('Form Validity Check:', { isMainExerciseValid, areAccessoryExercisesValid });
    setIsFormValid(isMainExerciseValid && areAccessoryExercisesValid);
  }, [mainExercise, accessoryExercises]);

  const formatTimeGlobal = (seconds: number) => { // formatTime 함수를 WorkoutForm 스코프로 이동하고 이름 변경
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 훈련 완료 및 타이머 시작/일시정지/재개 통합 함수
  const handleSetCompletionAndTimer = (setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      const currentSet = newSets[setIndex];

      // 1. 세트 상태 토글 (미완료 -> 성공 -> 미완료)
      if (currentSet.isSuccess === null) { // 미완료 -> 성공
        currentSet.isSuccess = true;
        
        const { repsCount: targetReps } = getSetConfiguration(selectedSetConfiguration, customSets, customReps);
        const currentReps = currentSet.reps;
        if (currentReps >= targetReps) { 
            const weight = currentSet.weight;
            const reps = currentSet.reps;
            if (weight > 0 && reps > 0 && reps < 37) {
                const estimatedOneRM = Math.round(weight * (36 / (37 - reps)));
                updateOneRMIfHigher(selectedMainExercise, estimatedOneRM);
            }
        } else {
            // 목표 미달 시 성공으로 처리하지 않음 (사용자가 직접 실패로 변경하거나, 현재는 성공 상태로 유지)
            // currentSet.isSuccess = false; // 필요하다면 주석 해제
        }

      } else { // 성공(true) 또는 실패(false, 현재 로직에서는 false 상태가 없음) -> 미완료(null)
        currentSet.isSuccess = null;
      }
      setMainExercise(prev => ({ ...prev, sets: newSets }));

    } else if (accessoryIndex !== undefined) {
      // 보조 운동 로직은 AccessoryExerciseComponent에서 처리 (타이머 연동 없음)
      const newExercises = [...accessoryExercises];
      // 보조 운동 세트 완료 처리 (AccessoryExerciseComponent 내부 또는 여기서 직접)
      if (newExercises[accessoryIndex] && newExercises[accessoryIndex].sets[setIndex]) {
        const currentAccessorySet = newExercises[accessoryIndex].sets[setIndex];
        if (currentAccessorySet.isSuccess === null) {
          currentAccessorySet.isSuccess = true;
        } else {
          currentAccessorySet.isSuccess = null;
        }
        setAccessoryExercises(newExercises);
      }
    }
  };

  // 통합 타이머 로직 함수들
  const startGlobalTimer = (sectionId: string) => {
    if (globalTimerRef.current) {
      clearInterval(globalTimerRef.current);
    }
    setGlobalTimer(prev => ({
      ...prev,
      sectionId,
      timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, // timerMinutes와 timerSeconds로 timeLeft 설정
      isPaused: false,
      isRunning: true,
    }));

    const sectionName = sectionId === 'main' ? '메인 운동' : 
      sectionId.startsWith('accessory_') ? 
      `${accessoryExercises[parseInt(sectionId.split('_')[1])]?.name || '보조 운동'} ${parseInt(sectionId.split('_')[1])+1}` 
      : '운동'; // 기본값을 '운동'으로 변경

    toast.success(`${sectionName} 휴식 타이머 시작`, {
      icon: '⏱️',
      duration: 2000,
      position: 'top-center',
    });

    globalTimerRef.current = setInterval(() => {
      setGlobalTimer(prev => {
        if (prev.isPaused || !prev.isRunning) {
          if (globalTimerRef.current) clearInterval(globalTimerRef.current);
          return { ...prev, isRunning: false };
        }
        if (prev.timeLeft <= 1) {
          if (globalTimerRef.current) clearInterval(globalTimerRef.current);
          
          // 🔥 강화된 알림 시스템
          const sectionName = sectionId === 'main' ? '메인 운동' : 
            sectionId.startsWith('accessory_') ? 
            `${accessoryExercises[parseInt(sectionId.split('_')[1])]?.name || '보조 운동'} ${parseInt(sectionId.split('_')[1])+1}` 
            : '운동';
          
          // 1. 토스트 알림 (강화된 스타일)
          toast.success(`🏋️‍♂️ ${sectionName} 휴식 완료!`, {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            }
          });
          
          // 2. Capacitor 네이티브 알림 (앱에서 더 강력한 알림)
          scheduleNotification(
            '🏋️‍♂️ 코어비아 피트니스',
            `${sectionName} 휴식 시간이 끝났습니다! 다음 세트를 시작하세요! 💪`
          ).catch(err => {
            console.warn('네이티브 알림 전송 실패:', err);
          });
          
          // 3. 브라우저 알림 (웹에서 백그라운드에서도 보임)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🏋️‍♂️ 코어비아 피트니스', {
              body: `${sectionName} 휴식 시간이 끝났습니다!\n다음 세트를 시작하세요! 💪`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'workout-timer',
              requireInteraction: true // 사용자가 직접 닫을 때까지 표시
            });
          }
          
          // 4. 알람 사운드 재생 (3번 반복)
          if (alarmRef.current) {
            let playCount = 0;
            const playAlarm = () => {
              if (playCount < 3) {
                alarmRef.current?.play().catch(err => {
                  console.error('알람 재생 실패:', err);
                });
                playCount++;
                setTimeout(playAlarm, 800); // 0.8초 간격으로 반복
              }
            };
            playAlarm();
          }
          
          // 5. 강화된 햅틱 피드백 (Capacitor 지원)
          triggerHapticFeedback('heavy').catch(err => {
            console.warn('햅틱 피드백 실패:', err);
          });
          
          // 6. 추가 햅틱 패턴 (3초 후)
          setTimeout(() => {
            triggerHapticFeedback('medium').catch(err => {
              console.warn('추가 햅틱 피드백 실패:', err);
            });
          }, 3000);
          
          // 7. 화면 깜빡임 효과 (페이지 타이틀 변경)
          let flashCount = 0;
          const originalTitle = document.title;
          const flashTitle = () => {
            if (flashCount < 10) {
              document.title = flashCount % 2 === 0 ? '🔥 휴식 완료! 🔥' : '💪 다음 세트! 💪';
              flashCount++;
              setTimeout(flashTitle, 500);
            } else {
              document.title = originalTitle;
            }
          };
          flashTitle();
          
          // 타이머 종료 시 timeLeft를 다시 timerMinutes, timerSeconds 기준으로 설정
          return { ...prev, sectionId: null, timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, isPaused: true, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const togglePauseGlobalTimer = () => {
    setGlobalTimer(prev => {
      if (!prev.isRunning && prev.sectionId) { // 멈춘 타이머 재시작 (현재 섹션 유지)
        startGlobalTimer(prev.sectionId);
        return prev; // startGlobalTimer가 상태를 업데이트하므로 여기서는 이전 상태 반환
      }
      return { ...prev, isPaused: !prev.isPaused };
    });
  };

  const resetGlobalTimer = () => {
    if (globalTimerRef.current) {
      clearInterval(globalTimerRef.current);
    }
    setGlobalTimer(prev => ({
      ...prev,
      sectionId: null, 
      timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, // timerMinutes와 timerSeconds로 timeLeft 설정
      isPaused: true,
      isRunning: false,
    }));
  };

  const handleTimerInputChange = (type: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return; // 유효하지 않은 입력 방지

    setGlobalTimer(prev => {
      let newMinutes = prev.timerMinutes;
      let newSeconds = prev.timerSeconds;

      if (type === 'minutes') {
        newMinutes = Math.min(99, numValue); // 최대 99분
      } else {
        newSeconds = Math.min(59, numValue); // 최대 59초
      }
      
      // 타이머가 실행 중이 아닐 때만 timeLeft도 함께 업데이트
      const newTimeLeft = !prev.isRunning ? newMinutes * 60 + newSeconds : prev.timeLeft;

      return {
        ...prev,
        timerMinutes: newMinutes,
        timerSeconds: newSeconds,
        timeLeft: newTimeLeft,
      };
    });
  };

  // 보조 운동 추가
  const addAccessoryExercise = () => {
    // 기본 세트 구성을 현재 선택된 세트 구성과 일치시킴
    const { setsCount, repsCount } = getSetConfiguration(
      selectedSetConfiguration,
      customSets,
      customReps
    );
    
    // 새 보조 운동 생성
    const newExercise = {
      name: '',
      weight: 0,
      reps: repsCount,
      sets: Array.from({ length: setsCount }, () => ({
        reps: repsCount,
        weight: 0,
        isSuccess: null
      }))
    };
    
    setAccessoryExercises((prev: typeof accessoryExercises) => [...prev, newExercise]); // prev 타입 명시
  };

  // 보조 운동 제거
  const removeAccessoryExercise = (index: number) => {
    setAccessoryExercises((prev: typeof accessoryExercises) => prev.filter((_: any, i: number) => i !== index)); // prev, _, i 타입 명시
  };

  // 보조 운동 변경
  const handleAccessoryExerciseChange = (index: number, updatedExercise: any) => {
    setAccessoryExercises((prev: typeof accessoryExercises) => { // prev 타입 명시
      const newExercises = [...prev];
      newExercises[index] = updatedExercise;
      return newExercises;
    });
  };

  // 메인 운동 변경 시 이전 보조 운동 자동 로드
  useEffect(() => {
    // 메인 운동이 변경될 때만 실행되도록
    // 마운트 여부를 체크하는 플래그 추가
    const isMounted = { current: true };
    
    // 메인 운동이 변경될 때 해당 운동에 대한 이전 보조 운동 목록 조회
    const fetchPreviousAccessoryExercises = async () => {
      if (!userProfile || !mainExercise.name || !isMounted.current) return;
      
      try {
        console.log(`[보조운동 로드] 시작: ${mainExercise.name} 운동에 대한 이전 보조 운동 검색`);
        
        const sessionsCollection = collection(db, 'sessions');
        
        // 복합 인덱스 오류 해결: orderBy 제거하고 기본 쿼리만 사용
        const q = query(
          sessionsCollection,
          where('userId', '==', userProfile.uid),
          where('mainExercise.name', '==', mainExercise.name)
          // orderBy('date', 'desc')와 limit(1) 제거
        );
        
        console.log('[보조운동 로드] Firestore 쿼리 실행');
        const querySnapshot = await getDocs(q);
        if (!isMounted.current) return; // 비동기 작업 완료 후 언마운트 확인
        
        console.log(`[보조운동 로드] 쿼리 결과: ${querySnapshot.size}개 세션 발견`);
        
        // 보조 운동 목록 초기화 (이전 보조 운동 기록 제거)
        if (accessoryExercises.length === 0) {
          if (!querySnapshot.empty) {
            // 클라이언트에서 날짜 기준으로 정렬
            const sortedDocs = querySnapshot.docs.sort((a: any, b: any) => { // a, b 타입 명시
              const dateA = a.data().date.toDate();
              const dateB = b.data().date.toDate();
              return dateB.getTime() - dateA.getTime(); // 최신 날짜순 정렬
            });
            
            // 가장 최근 세션 사용
            const latestSession = sortedDocs[0].data();
            const latestSessionDate = latestSession.date?.toDate?.();
            const dateStr = latestSessionDate ? latestSessionDate.toLocaleDateString() : '날짜 없음';
            
            console.log(`[보조운동 로드] 최근 세션 ID: ${sortedDocs[0].id}, 날짜: ${dateStr}`);
            
            if (latestSession.accessoryExercises && Array.isArray(latestSession.accessoryExercises) && latestSession.accessoryExercises.length > 0) {
              console.log(`[보조운동 로드] 최근 세션의 보조 운동 개수: ${latestSession.accessoryExercises.length}개`);
              
              // 최근 세션의 보조 운동만 사용
              const latestExercises = latestSession.accessoryExercises;
              
              latestExercises.forEach((exercise: any) => {
                if (exercise && exercise.name) {
                  console.log(`[보조운동 로드] 보조 운동 발견: ${exercise.name}, 세트 수: ${exercise.sets?.length || 0}`);
                }
              });
              
              // 메인 운동 이름으로 이전 보조 운동 맵 업데이트
              setPreviousAccessoryExercises((prev: typeof previousAccessoryExercises) => { // prev 타입 명시
                const updated = {
                  ...prev,
                  [mainExercise.name]: latestExercises
                };
                console.log(`[보조운동 로드] 이전 보조 운동 맵 업데이트: ${Object.keys(updated).length}개 메인 운동에 대한 매핑 보유`);
                return updated;
              });
              
              // 자동으로 직전 보조 운동 추가
              console.log(`[보조운동 로드] 최근 보조 운동 자동 설정 (${latestExercises.length}개)`);
              setAccessoryExercises(latestExercises);
            } else {
              console.log(`[보조운동 로드] 최근 세션에 보조 운동 없음`);
            }
          } else {
            console.log(`[보조운동 로드] 쿼리 결과 없음 (${mainExercise.name} 운동 기록 없음)`);
          }
        } else {
          console.log(`[보조운동 로드] 이미 보조 운동이 ${accessoryExercises.length}개 설정되어 있어 자동 로드 생략`);
        }
      } catch (error) {
        console.error(`[보조운동 로드] 오류:`, error);
      }
    };
    
    // 새로운 메인 운동으로 변경될 때 기존 보조 운동 초기화
    setAccessoryExercises([]);
    
    fetchPreviousAccessoryExercises();
    
    // 클린업 함수
    return () => {
      isMounted.current = false;
    };
  }, [userProfile, mainExercise.name]);

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
      
      setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets })); // prev 타입 명시
    } else if (accessoryIndex !== undefined) {
      // 보조 운동에 대한 처리
      console.log(`보조 운동 훈련 완료 처리: 세트 ${setIndex}, 보조운동 인덱스 ${accessoryIndex}`);
      
      // 보조 운동 배열의 범위 확인
      if (accessoryIndex >= 0 && accessoryIndex < accessoryExercises.length) {
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
      } else {
        console.error(`보조 운동 인덱스 범위 오류: ${accessoryIndex}, 전체 개수: ${accessoryExercises.length}`);
      }
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
        
        // 성공 토스트 메시지 - 제거
        // toast.success(
        //   `새로운 ${exerciseKey === 'bench' ? '벤치프레스' : 
        //     exerciseKey === 'squat' ? '스쿼트' : 
        //     exerciseKey === 'deadlift' ? '데드리프트' : '오버헤드프레스'
        //   } 1RM: ${newOneRM}kg!`, 
        //   { duration: 3000 }
        // );
        
        console.log(`1RM 업데이트 성공: ${exerciseKey} = ${newOneRM}kg`);
      } catch (error) {
        console.error('1RM 업데이트 실패:', error);
      }
    }
  };

  // 메인 운동 타입에 따른 운동 이름 반환 함수
  const getMainExerciseName = (exerciseType: MainExerciseType): string => {
    const exercise = mainExerciseOptions[part].find(ex => ex.value === exerciseType);
    return exercise?.label || '';
  };

  // 최근 운동 기록 가져오기
  const fetchLatestWorkout = async (
    exercisePart: ExercisePart, 
    mainExerciseType?: MainExerciseType,
    useCurrentSettings: boolean = false
  ) => {
    if (!userProfile?.uid) return;
    console.log(`[WorkoutForm] ${exercisePart} 부위의 최근 운동 기록 조회 시작...`);
    
    try {
      // 같은 부위의 가장 최근 운동 기록 쿼리
      const workoutsCollection = collection(db, 'sessions');
      const q = query(
        workoutsCollection,
        where('userId', '==', userProfile.uid),
        where('part', '==', exercisePart),
        orderBy('date', 'desc')
        // limit(1) 제거 - 모든 기록을 가져오도록 수정
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // 모든 기록을 배열로 변환
        const workouts = snapshot.docs.map(doc => doc.data());
        // 가장 최근 기록 (정렬되어 있으므로 첫 번째 항목)
        const latestWorkout = workouts[0];
        console.log(`[WorkoutForm] 최근 운동 기록 ${workouts.length}개 찾음. 첫 번째 기록:`, latestWorkout);
        
        // 동일한 운동에 대한 모든 기록을 로그로 출력
        if (workouts.length > 1) {
          console.log(`[WorkoutForm] 총 ${workouts.length}개의 기록이 있습니다:`);
          workouts.forEach((workout, index) => {
            console.log(`[WorkoutForm] 기록 #${index + 1}:`, 
              workout.date instanceof Date 
                ? workout.date.toLocaleString() 
                : new Date((workout.date as any).seconds * 1000).toLocaleString(),
              workout.mainExercise?.name,
              '무게:', workout.mainExercise?.sets[0]?.weight,
              '결과:', workout.isAllSuccess ? '성공' : '실패'
            );
          });
        }
        
        // 스트레칭/웜업 관련 메모 로드
        if (latestWorkout.stretchingNotes) {
          setStretchingNotes(latestWorkout.stretchingNotes);
        }
        
        // 메인 운동 이름이 일치하는 경우 추가 정보 제공
        if (!mainExerciseType || (latestWorkout.mainExercise && latestWorkout.mainExercise.name === getMainExerciseName(mainExerciseType))) {
          // 현재 선택된 운동의 레이블 가져오기
          const currentExerciseLabel = mainExerciseOptions[exercisePart].find(
            ex => ex.value === mainExerciseType
          )?.label;
          
          console.log(`현재 선택된 운동 이름: ${currentExerciseLabel}`);
          console.log(`저장된 운동 이름: ${latestWorkout.mainExercise.name}`);
          
          // 운동 이름이 다르면 처리 중단
          if (currentExerciseLabel && latestWorkout.mainExercise.name !== currentExerciseLabel) {
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
        
        if (latestWorkout.mainExercise && latestWorkout.mainExercise.sets && latestWorkout.mainExercise.sets.length > 0) {
          // 모든 세트가 성공인지 확인
          const allSuccess = latestWorkout.mainExercise.sets.every(set => set.isSuccess === true);
          
          // 마지막 세트의 무게 가져오기 (보통 마지막 세트가 최대 무게)
          const lastWeight = latestWorkout.mainExercise.sets[0].weight;
          
          // 새 무게 계산: 모든 세트 성공 시 2.5kg 증량, 실패 시 동일 무게
          const newWeight = allSuccess ? lastWeight + 2.5 : lastWeight;
          
          console.log(`최근 운동 성공 여부: ${allSuccess}, 이전 무게: ${lastWeight}kg, 새 무게: ${newWeight}kg`);
          
          // 최근 운동 이력 정보만 업데이트 - 세트 구성은 변경하지 않음
          setLatestWorkoutInfo({
            date: latestWorkout.date instanceof Date 
              ? latestWorkout.date 
              : (typeof latestWorkout.date === 'object' && latestWorkout.date && 'seconds' in latestWorkout.date
                ? new Date((latestWorkout.date as { seconds: number }).seconds * 1000) // 타입 단언 및 seconds 접근
                : new Date()),
            weight: lastWeight,
            allSuccess,
            exists: true,
            exerciseName: latestWorkout.mainExercise.name,
            sets: latestWorkout.mainExercise.sets.length,
            reps: latestWorkout.mainExercise.sets[0]?.reps || 0
          });
          
          // 중요: 현재 선택된 세트 설정 사용 (최근 기록이 아닌 현재 설정 우선)
          if (useCurrentSettings && settings) {
            // 현재 설정된 세트 구성 정보 가져오기
            const { setsCount, repsCount } = getSetConfiguration(
              settings.preferredSetup,
              settings.customSets, 
              settings.customReps
            );
            
            console.log(`[fetchLatestWorkout] 선택된 세트 구성을 우선 적용: ${settings.preferredSetup} - ${setsCount}세트 x ${repsCount}회`);
            
            // 메인 운동 세트 설정: 현재 설정된 세트 수와 반복 횟수 적용, 무게만 최근 기록에서 가져옴
            const newSets = Array.from({ length: setsCount }, () => ({
              reps: repsCount,
              weight: newWeight,
              isSuccess: null
            }));
            
            console.log('새 세트 구성 (최근 무게 + 현재 세트 설정):', newSets);
            
            // 메인 운동 업데이트
            setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
          } else {
            // settings가 아직 로드되지 않은 경우, 최근 운동 기록 기반으로만 설정
            console.log('[fetchLatestWorkout] settings 없음, 최근 운동 기록만 사용');
            
            const setsCount = latestWorkout.mainExercise.sets.length;
            
            // 메인 운동 세트 설정: 새 무게 적용 (모든 세트에 동일한 무게 적용)
            const newSets = Array(setsCount).fill(0).map((_, index) => {
              return {
                reps: latestWorkout.mainExercise.sets[index]?.reps || 0, 
                weight: newWeight,
                isSuccess: null
              };
            });
            
            console.log('새로운 세트 구성 (최근 운동 기록 기반):', newSets);
            
            // 메인 운동 업데이트
            setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
          }
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
        
        // 최근 기록이 없을 때 현재 세트 설정 적용
        if (useCurrentSettings && settings) {
          const { setsCount, repsCount } = getSetConfiguration(
            settings.preferredSetup,
            settings.customSets, 
            settings.customReps
          );
          
          console.log(`[fetchLatestWorkout] 기록 없음, 선택된 세트 구성 적용: ${settings.preferredSetup} - ${setsCount}세트 x ${repsCount}회`);
          
          // 기본 세트 구성 적용
          const newSets = Array.from({ length: setsCount }, () => ({
            reps: repsCount,
            weight: 0,
            isSuccess: null
          }));
          
          setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
        }
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

  // handleRepsChange 함수 수정
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean = true) => {
    // 세트 구성에 따른 반복 횟수 제한
    let maxReps = newReps;
    
    // 표준 세트 구성의 경우 최대 반복 횟수 제한
    if (selectedSetConfiguration === '5x5') {
      maxReps = Math.min(newReps, 5);
    } else if (selectedSetConfiguration === '6x3') {
      maxReps = Math.min(newReps, 6);
    } else if (selectedSetConfiguration === '10x5') {
      maxReps = Math.min(newReps, 10);
    } else if (selectedSetConfiguration === '15x5') {
      maxReps = Math.min(newReps, 15);
    }
    
    // 최소값 체크 (0 이하 방지)
    maxReps = Math.max(1, maxReps);

    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      newSets[setIndex].reps = maxReps;
      setMainExercise({ ...mainExercise, sets: newSets });
    }
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
      
      // 저장 전 메인 운동 상태 디버깅
      console.log('[WorkoutForm] 저장 전 메인 운동 상태:', {
        selectedMainExercise,
        mainExerciseName: mainExercise.name,
        mainExerciseSets: mainExercise.sets,
        mainExerciseSetsLength: mainExercise.sets.length,
        part,
        isFormValid
      });
      
      // 메인 운동 데이터 정리: 무게와 반복 수가 0인 세트 제외 (isFormValid에서 이미 체크하지만, 안전장치)
      const cleanMainExercise = {
        part,
        name: mainExercise.name, 
        // weight: mainExercise.sets && mainExercise.sets.length > 0 ? mainExercise.sets[0].weight : 0, // 세트별 무게를 사용하므로 이 필드는 불필요할 수 있음
        sets: mainExercise.sets.map((set: { reps: number; weight: number; isSuccess: boolean | null }) => ({ // set 타입 명시
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess === null ? false : set.isSuccess // null이면 false로 처리
        }))
      };
      console.log('[WorkoutForm] cleanMainExercise 생성 완료:', cleanMainExercise);

      const cleanAccessoryExercises = accessoryExercises.map((exercise: { name: string; sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }> }) => ({ // exercise 타입 명시
        name: exercise.name || '',
        // weight: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].weight : 0, // 세트별 무게
        // reps: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].reps : 0, // 세트별 횟수
        sets: (exercise.sets || []).map((set: { reps: number; weight: number; isSuccess: boolean | null }) => ({ // set 타입 명시
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
        isAllSuccess: mainExercise.sets.every((set: { isSuccess: boolean | null }) => set.isSuccess === true), // isSuccess가 true인 경우만 전체 성공 // set 타입 명시
        successSets: mainExercise.sets.filter((set: { isSuccess: boolean | null }) => set.isSuccess === true).length, // isSuccess가 true인 세트 수 // set 타입 명시
        accessoryNames: cleanAccessoryExercises.map((ex: { name: string }) => ex.name), // ex 타입 명시
        sleepHours: sleepHours === undefined ? null : sleepHours, // undefined인 경우 null로 설정
        condition: condition || 'normal', // condition이 undefined인 경우 'normal'로 설정
        startTime,
        lastMealTime: lastMealTime || null, // undefined인 경우 null로 설정
        stretchingCompleted,
        warmupCompleted,
        stretchingNotes: stretchingNotes || null // undefined인 경우 null로 설정
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
      toast.error('운동 기록 저장에 실패했습니다.'); // 콘솔 확인 안내 제거
    }
  };

  // 복합 운동 저장 기능
  const saveComplexWorkout = async () => {
    if (!userProfile || !complexWorkoutName.trim()) {
      toast.error('복합 운동 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSavingComplexWorkout(true);
      
      // 메인 운동 데이터와 보조 운동 데이터 준비
      const complexWorkoutData = {
        userId: userProfile.uid,
        name: complexWorkoutName,
        date: new Date(),
        mainExercises: part === 'complex' ? 
          [...mainExercises, mainExercise].filter(ex => ex.name !== '복합 운동 불러오기') : 
          [mainExercise],
        accessoryExercises: accessoryExercises
      };

      // Firestore에 저장
      await addDoc(collection(db, 'complexWorkouts'), complexWorkoutData);
      
      toast.success('복합 운동이 저장되었습니다.');
      fetchComplexWorkouts(); // 목록 새로고침
      setComplexWorkoutName(''); // 입력 필드 초기화
      
    } catch (error) {
      console.error('복합 운동 저장 중 오류 발생:', error);
      toast.error('복합 운동 저장에 실패했습니다.');
    } finally {
      setIsSavingComplexWorkout(false);
    }
  };

  // 복합 운동 목록 가져오기
  const fetchComplexWorkouts = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoadingComplexWorkouts(true);
      const complexWorkoutsCollection = collection(db, 'complexWorkouts');
      const q = query(complexWorkoutsCollection, where('userId', '==', userProfile.uid));
      const snapshot = await getDocs(q);
      
      const workouts = snapshot.docs.map((doc: any) => ({ // doc 타입 명시
        id: doc.id,
        ...doc.data() as any
      }));
      
      setSavedComplexWorkouts(workouts);
    } catch (error) {
      console.error('복합 운동 목록 가져오기 실패:', error);
      toast.error('복합 운동 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingComplexWorkouts(false);
    }
  };

  // 복합 운동 불러오기
  const loadComplexWorkout = (workoutId: string) => {
    const workout = savedComplexWorkouts.find((w: { id: string }) => w.id === workoutId); // w 타입 명시
    if (!workout) return;
    
    // 복합 운동 모드로 전환
    setPart('complex');
    
    // 첫 번째 메인 운동으로 설정하고 나머지는 mainExercises에 추가
    if (workout.mainExercises && workout.mainExercises.length > 0) {
      const [firstMain, ...restMains] = workout.mainExercises;
      setMainExercise(firstMain);
      setMainExercises(restMains || []);
    }
    
    // 보조 운동 설정
    if (workout.accessoryExercises && workout.accessoryExercises.length > 0) {
      setAccessoryExercises(workout.accessoryExercises);
    }
    
    setShowComplexWorkoutModal(false);
    toast.success(`"${workout.name}" 복합 운동을 불러왔습니다.`);
  };

  // 메인 운동 추가 (복합 운동에서만 사용)
  const addMainExercise = () => {
    // 기본 세트 구성을 현재 선택된 세트 구성과 일치시킴
    const { setsCount, repsCount } = getSetConfiguration(
      selectedSetConfiguration,
      customSets,
      customReps
    );
    
    // 새 메인 운동 생성
    const newExercise = {
      name: '',
      sets: Array.from({ length: setsCount }, () => ({
        reps: repsCount,
        weight: 0,
        isSuccess: null
      }))
    };
    
    setMainExercises([...mainExercises, newExercise]);
  };

  // 메인 운동 제거
  const removeMainExercise = (index: number) => {
    setMainExercises((prev: typeof mainExercises) => prev.filter((_: any, i: number) => i !== index)); // prev, _, i 타입 명시
  };

  // 메인 운동 변경
  const handleMainExerciseChange = (index: number, updatedExercise: any) => {
    setMainExercises((prev: typeof mainExercises) => { // prev 타입 명시
      const newExercises = [...prev];
      newExercises[index] = updatedExercise;
      return newExercises;
    });
  };

  // 부위가 변경될 때 복합 운동 관련 상태 초기화
  useEffect(() => {
    if (part === 'complex') {
      fetchComplexWorkouts();
    } else {
      // 복합 운동이 아닌 경우 메인 운동 배열 초기화
      setMainExercises([]);
    }
  }, [part]);

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">운동 기록</h1>
        
        {/* 수면 시간 및 컨디션 체크 섹션 */}
        <div className="space-y-6">
          {/* 오늘의 컨디션 체크 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">오늘의 컨디션</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">수면 시간</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={sleepHours === undefined ? '' : sleepHours}
                    onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="8"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">시간</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">컨디션</label>
                <div className="flex space-x-2">
                  {['나쁨', '보통', '좋음'].map((c) => (
                    <Button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c === '나쁨' ? 'bad' : c === '보통' ? 'normal' : 'good')}
                      variant={condition === (c === '나쁨' ? 'bad' : c === '보통' ? 'normal' : 'good') ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">운동 시작 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* 운동 부위 선택 */}
          <div className="space-y-4">
            <div>
              <label className="text-lg font-semibold text-gray-800 dark:text-white mb-2 block">운동 부위</label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {exercisePartOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPart(option.value as ExercisePart)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                      part === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 메인 운동 선택 */}
            {mainExerciseOptions[part] && mainExerciseOptions[part].length > 0 && (
              <div>
                <label className="text-lg font-semibold text-gray-800 dark:text-white mb-2 block">메인 운동</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                  {(mainExerciseOptions[part] || []).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMainExercise(option.value)}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                        selectedMainExercise === option.value
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 최근 운동 정보 */}
          {latestWorkoutInfo.exists && (
            <div className="bg-blue-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm">
              <p>
                <strong>최근 기록:</strong> {latestWorkoutInfo.exerciseName} - {latestWorkoutInfo.weight}kg &times; {latestWorkoutInfo.reps}회 ({latestWorkoutInfo.sets}세트)
                <span className={latestWorkoutInfo.allSuccess ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                  ({latestWorkoutInfo.allSuccess ? '성공' : '실패'})
                </span>
              </p>
            </div>
          )}

          {/* 메인 운동 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                메인 운동: <span className="text-blue-600 dark:text-blue-400">{mainExercise.name}</span>
              </h2>
              {/* 휴식 타이머 */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Clock size={18} className="text-gray-500" />
                <div className="flex items-center">
                  <input
                    type="number"
                    value={globalTimer.timerMinutes}
                    onChange={(e) => handleTimerInputChange('minutes', e.target.value)}
                    className="w-12 p-1 text-center text-lg font-bold bg-transparent focus:outline-none"
                  />
                  <span className="font-bold text-lg">:</span>
                  <input
                    type="number"
                    value={globalTimer.timerSeconds}
                    onChange={(e) => handleTimerInputChange('seconds', e.target.value)}
                    className="w-12 p-1 text-center text-lg font-bold bg-transparent focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={togglePauseGlobalTimer} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    {globalTimer.isRunning && !globalTimer.isPaused ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={resetGlobalTimer} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {mainExercise.sets.map((set, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <span className="w-6 text-center font-semibold text-gray-500">{index + 1}</span>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => {
                      const newSets = [...mainExercise.sets];
                      newSets[index].weight = Number(e.target.value);
                      setMainExercise({ ...mainExercise, sets: newSets });
                    }}
                    className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-700"
                    placeholder="무게"
                  />
                  <span className="text-gray-400">kg</span>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleRepsChange(Number(e.target.value), index, true)}
                    className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-700"
                    placeholder="횟수"
                  />
                  <span className="text-gray-400">회</span>
                  <button
                    onClick={() => handleSetCompletionAndTimer(index, true)}
                    className={`p-2 rounded-full ${set.isSuccess ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* 보조 운동 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">보조 운동</h2>
            <div className="space-y-4">
              {accessoryExercises.map((exercise, index) => (
                <AccessoryExerciseComponent
                  key={index}
                  index={index}
                  exercise={exercise}
                  onChange={handleAccessoryExerciseChange}
                  onRemove={removeAccessoryExercise}
                  currentExercisePart={part}
                  globalTimer={globalTimer}
                  startGlobalTimer={startGlobalTimer}
                  resetGlobalTimer={resetGlobalTimer}
                  formatTime={formatTimeGlobal}
                />
              ))}
            </div>
            <Button
              onClick={addAccessoryExercise}
              variant="outline"
              className="w-full"
              icon={<Plus size={16} />}
            >
              보조 운동 추가
            </Button>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-lg font-semibold text-gray-800 dark:text-white">메모</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700"
              placeholder="운동 후 느낌, 컨디션, 통증 등 자유롭게 기록하세요."
            />
          </div>

          {/* 저장 버튼 */}
          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              size="lg"
              className="w-full"
            >
              <Save size={20} className="mr-2" />
              운동 기록 저장
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutForm;