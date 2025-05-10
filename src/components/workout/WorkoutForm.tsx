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
const mainExerciseOptions = {
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    { value: 'inclineBenchPress', label: '인클라인 벤치 프레스' },
    { value: 'declineBenchPress', label: '디클라인 벤치 프레스' }
  ],
  back: [
    { value: 'deadlift', label: '데드리프트' },
    { value: 'pullUp', label: '턱걸이' },
    { value: 'bentOverRow', label: '벤트오버 로우' }
  ],
  shoulder: [
    { value: 'overheadPress', label: '오버헤드 프레스' },
    { value: 'lateralRaise', label: '레터럴 레이즈' },
    { value: 'facePull', label: '페이스 풀' }
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    { value: 'lungue', label: '런지' }
  ],
  biceps: [
    { value: 'dumbbellCurl', label: '덤벨 컬' },
    { value: 'barbelCurl', label: '바벨 컬' },
    { value: 'hammerCurl', label: '해머 컬' }
  ],
  triceps: [
    { value: 'cablePushdown', label: '케이블 푸시다운' },
    { value: 'overheadExtension', label: '오버헤드 익스텐션' },
    { value: 'lyingExtension', label: '라잉 익스텐션' }
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
  const [selectedMainExercise, setSelectedMainExercise] = useState<MainExerciseType>('benchPress');
  const [mainExercise, setMainExercise] = useState({
    name: exercisePartOptions[0].mainExerciseName,
    sets: [{ reps: 0, weight: 0, isSuccess: false }]
  });
  const [accessoryExercises, setAccessoryExercises] = useState<Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean }>;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
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
      }
    }
  }, [userProfile]);

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
    // 메인 운동에 최소 한 개의 세트가 있고, 각 세트에 무게와 반복 수가 입력되어 있는지 확인
    const isMainExerciseValid = mainExercise.sets.length > 0 && 
      mainExercise.sets.every(set => set.weight > 0 && set.reps > 0);

    // 보조 운동이 있는 경우, 각 운동에 이름이 있고 최소 한 개의 세트가 있는지 확인
    const areAccessoryExercisesValid = accessoryExercises.length === 0 || 
      accessoryExercises.every(exercise => 
        exercise.name.trim() !== '' && 
        exercise.sets.length > 0 && 
        exercise.sets.every(set => set.weight > 0 && set.reps > 0)
      );

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
        sets: [...prev.sets, { reps: 0, weight: 0, isSuccess: false }]
      }));
    } else {
      setAccessoryExercises(prev => {
        const newExercises = [...prev];
        newExercises[exerciseIndex].sets = [
          ...newExercises[exerciseIndex].sets,
          { reps: 0, weight: 0, isSuccess: false }
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
        sets: [{ reps: 0, weight: 0, isSuccess: false }] 
      }
    ]);
  };

  const removeAccessoryExercise = (index: number) => {
    setAccessoryExercises(prev => prev.filter((_, i) => i !== index));
  };

  // 횟수 자동 성공 처리
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      newSets[setIndex].reps = newReps;
      // 10회 이상이면 자동으로 성공 처리
      newSets[setIndex].isSuccess = newReps >= 10;
      setMainExercise(prev => ({ ...prev, sets: newSets }));
    } else if (accessoryIndex !== undefined) {
      const newExercises = [...accessoryExercises];
      newExercises[accessoryIndex].sets[setIndex].reps = newReps;
      // 10회 이상이면 자동으로 성공 처리
      newExercises[accessoryIndex].sets[setIndex].isSuccess = newReps >= 10;
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
    let setsCount = 5; // 기본값
    let repsCount = 5; // 기본값
    
    // 설정된 세트 구성에 따라 세트 수와 반복 수 결정
    if (config.preferredSetup === '5x5') {
      setsCount = 5;
      repsCount = 5;
    } else if (config.preferredSetup === '10x5') {
      setsCount = 10;
      repsCount = 5;
    } else if (config.preferredSetup === '6x5') {
      setsCount = 6;
      repsCount = 5;
    } else if (config.preferredSetup === '15x5') {
      setsCount = 15;
      repsCount = 5;
    } else if (config.preferredSetup === '3x10') {
      setsCount = 3;
      repsCount = 10;
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!isFormValid) {
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      // 일주일 전 날짜 계산
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // 메인 운동 데이터 정리: 무게와 반복 수가 0인 세트 제외
      const cleanMainExercise = {
        part,
        name: mainExercise.name, // 이름 필드 추가
        weight: mainExercise.sets && mainExercise.sets.length > 0 ? mainExercise.sets[0].weight : 0,
        sets: mainExercise.sets.map(set => ({
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess || false
        }))
      };

      const cleanAccessoryExercises = accessoryExercises.map(exercise => ({
        name: exercise.name || '',
        weight: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].weight : 0,
        reps: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].reps : 0,
        sets: (exercise.sets || []).map(set => ({
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess || false
        }))
      }));

      const sessionData: Session = {
        userId: userProfile.uid,
        date: new Date(),
        part,
        mainExercise: cleanMainExercise,
        accessoryExercises: cleanAccessoryExercises,
        notes: notes || '',
        isAllSuccess: mainExercise.sets.every(set => set.isSuccess),
        successSets: mainExercise.sets.filter(set => set.isSuccess).length,
        accessoryNames: cleanAccessoryExercises.map(ex => ex.name)
      };

      console.log('저장할 세션 데이터:', sessionData);

      // 기존 기록 확인
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', userProfile.uid),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.size >= 7) {
        toast.error('최근 7일 동안의 기록만 저장할 수 있습니다.');
        return;
      }

      await addDoc(collection(db, 'sessions'), sessionData);
      
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
      
      // 5회 이상 10세트 성공 시 증량 추천 메시지
      const successSets = mainExercise.sets.filter(set => set.isSuccess).length;
      if (successSets >= 5 && mainExercise.sets.length >= 10) {
        toast.success('훈련에 성공했습니다. 2.5kg 증량을 추천드립니다!', {
          duration: 5000,
          icon: '🏋️',
          style: {
            background: '#3B82F6',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
      }
      
      // 폼 초기화
      setPart('chest');
      setMainExercise({
        name: exercisePartOptions[0].mainExerciseName,
        sets: [{ reps: 0, weight: 0, isSuccess: false }]
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
      console.error('Error saving session:', error);
      toast.error('운동 기록 저장에 실패했습니다.');
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
                  variant="ghost" 
                  size="sm"
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
              </div>
            </Card>
          )}

          {/* 세트 구성 선택 섹션 추가 */}
          <Card className="animate-slideUp">
            <CardTitle>세트 구성 설정</CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              <Button
                type="button"
                variant={selectedSetConfiguration === '5x5' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('5x5')}
              >
                5세트 x 5회
              </Button>
              <Button
                type="button"
                variant={selectedSetConfiguration === '10x5' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('10x5')}
              >
                10세트 x 5회
              </Button>
              <Button
                type="button"
                variant={selectedSetConfiguration === '6x5' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('6x5')}
              >
                6세트 x 5회
              </Button>
              <Button
                type="button"
                variant={selectedSetConfiguration === '15x5' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('15x5' as SetConfiguration)}
              >
                15세트 x 5회
              </Button>
              <Button
                type="button"
                variant={selectedSetConfiguration === '3x10' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('3x10')}
              >
                3세트 x 10회
              </Button>
              <Button
                type="button"
                variant={selectedSetConfiguration === 'custom' ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSetConfigChange('custom')}
              >
                커스텀
              </Button>
            </div>
            
            {selectedSetConfiguration === 'custom' && (
              <div className="flex gap-4 mb-4 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">세트 수</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customSets}
                    onChange={(e) => setCustomSets(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">반복 횟수</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customReps}
                    onChange={(e) => setCustomReps(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={applyCustomConfiguration}
                >
                  적용
                </Button>
              </div>
            )}
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              현재 구성: <span className="font-medium">{sets}세트</span> x <span className="font-medium">{reps}회</span> 
              <span className="text-xs ml-2 text-gray-500">(세트 수 x 반복 횟수)</span>
            </div>
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
                      py-2 px-4 rounded-lg flex items-center transition-all duration-300
                      ${part === option.value 
                        ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                        : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                          <label className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                          <input
                            type="number"
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
                          <label className="text-xs text-gray-500 mb-1">횟수</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleRepsChange(Number(e.target.value), index, true)}
                            placeholder="횟수"
                            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant={set.isSuccess ? "success" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newSets = [...mainExercise.sets];
                            newSets[index].isSuccess = !newSets[index].isSuccess;
                            setMainExercise(prev => ({ ...prev, sets: newSets }));
                          }}
                          icon={set.isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        >
                          {set.isSuccess ? '성공' : '실패'}
                        </Button>
                        <span className="text-xs text-gray-500 italic ml-2">(* 10회 이상 성공시 성공으로 계산)</span>
                        
                        <Button
                          type="button"
                          variant={
                            !activeTimers[`main_${index}`] 
                              ? "secondary" 
                              : activeTimers[`main_${index}`].isPaused 
                                ? "warning" 
                                : "danger"
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

                        {mainExercise.sets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(-1, index)}
                            icon={<X size={16} className="text-danger-500" />}
                            className="ml-auto"
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
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccessoryExercise(index)}
                      icon={<X size={16} className="text-danger-500" />}
                    >
                      삭제
                    </Button>
                  </div>
                  <input
                    type="text"
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
                            <label className="text-xs text-gray-500 mb-1">무게 (kg)</label>
                            <input
                              type="number"
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
                            <label className="text-xs text-gray-500 mb-1">횟수</label>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleRepsChange(Number(e.target.value), setIndex, false, index)}
                              placeholder="횟수"
                              className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <Button
                            type="button"
                            variant={set.isSuccess ? "success" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newExercises = [...accessoryExercises];
                              newExercises[index].sets[setIndex].isSuccess = !newExercises[index].sets[setIndex].isSuccess;
                              setAccessoryExercises(newExercises);
                            }}
                            icon={set.isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          >
                            {set.isSuccess ? '성공' : '실패'}
                          </Button>
                          <span className="text-xs text-gray-500 italic ml-2">(* 10회 이상 성공시 성공으로 계산)</span>
                          
                          <Button
                            type="button"
                            variant={
                              !activeTimers[`accessory_${index}_${setIndex}`] 
                                ? "secondary" 
                                : activeTimers[`accessory_${index}_${setIndex}`].isPaused 
                                  ? "warning" 
                                  : "danger"
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

                          {exercise.sets.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSet(index, setIndex)}
                              icon={<X size={16} className="text-danger-500" />}
                              className="ml-auto"
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
                variant="primary"
                onClick={addAccessoryExercise}
                fullWidth
                icon={<Plus size={16} />}
                className="mt-4"
              >
                보조 운동 추가
              </Button>
            </div>
          </Card>

          <Card className="animate-slideUp">
            <CardTitle>메모</CardTitle>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="오늘의 운동에 대한 메모를 남겨보세요"
              className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </Card>

          <Button
            type="submit"
            variant="success"
            fullWidth
            size="lg"
            disabled={!isFormValid}
            icon={<Save size={20} />}
            className="transition-all duration-500"
          >
            저장하기
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default WorkoutForm;