import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkoutSettings } from '../../hooks/useWorkoutSettings';
import { 
  ExercisePart, 
  Session, 
  // ChestMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  // BackMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  // ShoulderMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  // LegMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  // BicepsMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  // TricepsMainExercise, // ?ъ슜?섏? ?딆쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ??젣 媛??  MainExerciseType,
  SetConfiguration
} from '../../types';
import { addDoc, collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Layout from '../common/Layout';
import Card, { CardTitle, CardSection } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Plus, X, Clock, CheckCircle, XCircle, Save, Info, AlertTriangle, ChevronUp, ChevronDown, RotateCcw, Trash, Square, Play, Pause, Heart, ArrowBigUpDash, MoveHorizontal, Footprints, Grip, ArrowUp, User, Zap, Camera, Upload, Timer, History, Settings2, ChevronsUpDown } from 'lucide-react'; // Edit, TrendingUp ?쒓굅
import { getSetConfiguration } from '../../utils/workoutUtils';
import AccessoryExerciseComponent from './AccessoryExerciseComponent';
// ?꾩슂??import 異붽?
import ComplexWorkoutForm, { MainExerciseItem, AccessoryExerciseItem } from './ComplexWorkoutForm';
import type { ReactNode } from 'react'; // ReactNode ???import
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import WorkoutSetConfig from '../settings/WorkoutSetConfig';
import ExerciseDatabase from '../exercise/ExerciseDatabase';
import { scheduleNotification, triggerHapticFeedback } from '../../utils/capacitorUtils';

interface WorkoutFormProps {
  onSuccess?: () => void; // ????깃났 ???몄텧??肄쒕갚
}

const exercisePartOptions = [
  { value: 'chest',    label: '媛??,   mainExerciseName: '踰ㅼ튂 ?꾨젅?? },
  { value: 'back',     label: '??,     mainExerciseName: '?곕뱶由ы봽?? },
  { value: 'shoulder', label: '?닿묠',   mainExerciseName: '?ㅻ쾭?ㅻ뱶 ?꾨젅?? },
  { value: 'leg',      label: '?섏껜',   mainExerciseName: '?ㅼ옘?? },
  { value: 'biceps',   label: '?대몢',   mainExerciseName: '?ㅻ꺼 而? },
  { value: 'triceps',  label: '?쇰몢',   mainExerciseName: '耳?대툝 ?몄떆?ㅼ슫' }
];

// 媛?遺?꾨퀎 硫붿씤 ?대룞 ?듭뀡
const mainExerciseOptions: Record<ExercisePart, {value: MainExerciseType, label: string}[]> = {
  chest: [
    { value: 'benchPress', label: '踰ㅼ튂 ?꾨젅?? },
    { value: 'dumbbellBenchPress', label: '?ㅻ꺼 踰ㅼ튂 ?꾨젅?? },
    { value: 'chestPress', label: '泥댁뒪???꾨젅??癒몄떊' }
  ],
  back: [
    { value: 'barbellRow', label: '諛붾꺼濡쒖슦' }, 
    { value: 'deadlift', label: '?곕뱶由ы봽?? },
    { value: 'tBarRow', label: '?곕컮濡쒖슦' },
    { value: 'pullUp', label: '?깃구??(???' } // ?깃구??異붽? (?대쫫? ??낆쑝濡??듭씪)
  ],
  shoulder: [
    { value: 'overheadPress', label: '?ㅻ쾭?ㅻ뱶 ?꾨젅?? },
    { value: 'dumbbellShoulderPress', label: '?ㅻ꺼 ?꾨뜑 ?꾨젅?? }, 
  ],
  leg: [
    { value: 'squat', label: '?ㅼ옘?? },
    { value: 'legPress', label: '?덇렇 ?꾨젅?? },
    { value: 'romanianDeadlift', label: '猷⑤쭏?덉븞 ?곕뱶由ы봽?? }, 
  ],
  biceps: [
    { value: 'dumbbellCurl', label: '?ㅻ꺼 而? },
    { value: 'barbellCurl', label: '諛붾꺼 而? },
    { value: 'hammerCurl', label: '?대㉧ 而? }
  ],
  triceps: [
    { value: 'cablePushdown', label: '耳?대툝 ?몄떆?ㅼ슫' },
    { value: 'overheadExtension', label: '?ㅻ쾭?ㅻ뱶 ?듭뒪?먯뀡' },
    { value: 'lyingTricepsExtension', label: '?쇱엵 ?몃씪?댁뀎???듭뒪?먯뀡' }
  ],
  complex: [ 
    { value: 'customComplex', label: '蹂듯빀 ?대룞 遺덈윭?ㅺ린' }
  ],
  abs: [], 
  cardio: [] 
};

// ?쒖뾽 ?명듃 異붿쿇 ?대룞
const warmupExercises = {
  chest: ['媛踰쇱슫 ?몄떆??10-15??, '?쇱씠??踰ㅼ튂?꾨젅??15??, '諛대뱶 ? ?꾪뙆??15-20??],
  back: ['寃쎈웾 ?곕뱶由ы봽??10-15??, '諛대뱶 ??ㅼ슫 15-20??, '?덊띁留????3?명듃 x 10珥?],
  shoulder: ['???щ씪?대뱶 10-15??, '?섏씠??? 15-20??, '諛대뱶 ?몄쟾 ?대룞 15-20??],
  leg: ['留⑤じ ?ㅼ옘??15-20??, '移댄봽 ?덉씠利?20??, '??궧 ?곗? 10???묒そ)'],
  biceps: ['媛踰쇱슫 ?ㅻ꺼 而?15-20??, '諛대뱶 而?15-20??, '?먮ぉ ?좎뿰???대룞 10??],
  triceps: ['媛踰쇱슫 ?몄떆??10-15??, '媛踰쇱슫 ?ㅻ꺼 ?λ갚 15-20??, '諛대뱶 ?몄떆?ㅼ슫 15-20??]
};

// ?좏샇?섎뒗 ?명듃 援ъ꽦??'15x5' 異붽?
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
  
  // ?쒖뾽 諛??ㅽ듃?덉묶 ?꾨즺 ?곹깭 愿由?  const [stretchingCompleted, setStretchingCompleted] = useState<boolean>(false);
  const [warmupCompleted, setWarmupCompleted] = useState<boolean>(false);
  const [stretchingNotes, setStretchingNotes] = useState<string>('');
  
  // ?섎㈃ ?쒓컙 諛?而⑤뵒???곹깭 異붽?
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [condition, setCondition] = useState<'bad' | 'normal' | 'good' | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [lastMealTime, setLastMealTime] = useState<string>("");

  // ?듯빀 ??대㉧ ?곹깭
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

  // 異붽? ?곹깭 蹂???뺤쓽
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ExercisePart>('chest');
  const [preferredExercises, setPreferredExercises] = useState<Record<string, string>>({});
  const [selectedSetConfiguration, setSelectedSetConfiguration] = useState<SetConfiguration>('10x5');
  const [sets, setSets] = useState<number>(5);
  const [reps, setReps] = useState<number>(10);
  const [customSets, setCustomSets] = useState<number>(5);
  const [customReps, setCustomReps] = useState<number>(10);
  
  // 理쒓렐 ?대룞 ?대젰 ?뺣낫 ????곹깭 異붽?
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

  // ?댁쟾 蹂댁“ ?대룞 ?덉뒪?좊━ (硫붿씤 ?대룞蹂꾨줈 ???
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

  // 泥댁쨷 愿???곹깭 異붽?
  // const [currentWeight, setCurrentWeight] = useState<number>(0);
  // const [showWeightChart, setShowWeightChart] = useState(false);
  // const [showWeightChangeModal, setShowWeightChangeModal] = useState(false);
  // const [newWeight, setNewWeight] = useState<number>(0);
  // const [weightHistory, setWeightHistory] = useState<Array<{
  //   date: Date;
  //   weight: number;
  // }>>([]);

  // userProfile??濡쒕뱶????泥댁쨷 珥덇린媛??ㅼ젙 ?쒓굅
  // useEffect(() => {
  //   if (userProfile?.weight) {
  //     setCurrentWeight(userProfile.weight);
  //     setNewWeight(userProfile.weight);
  //   }
  // }, [userProfile?.weight]);

  // 而댄룷?뚰듃 留덉슫????珥덇린??濡쒖쭅 ?섏젙
  useEffect(() => {
    console.log('[WorkoutForm] 而댄룷?뚰듃 留덉슫?? userProfile:', userProfile?.uid);
    
    // ?뚮엺 ?ъ슫???붿냼 ?앹꽦
    try {
      alarmRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3');
      alarmRef.current.preload = 'auto'; // 誘몃━ 濡쒕뱶
    } catch (error) {
      console.error('?뚮엺 ?ъ슫??濡쒕뱶 ?ㅽ뙣:', error);
    }
    
    // 釉뚮씪?곗? ?뚮┝ 沅뚰븳 ?붿껌
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('?뚮┝ 沅뚰븳:', permission);
      });
    }
    
    if (userProfile) {
      console.log('[WorkoutForm] ?ъ슜???꾨줈??濡쒕뱶?? ?대룞 ?ㅼ젙 ?곸슜:', userProfile);
      
      // 1. 遺?꾨퀎 ?좏샇 ?대룞 ?ㅼ젙 ?곸슜
      if (userProfile.preferredExercises) {
        console.log('[WorkoutForm] ?좏샇 ?대룞 ?ㅼ젙 ?곸슜:', userProfile.preferredExercises);
        
        // 珥덇린 遺?꾨뒗 媛?댁쑝濡??ㅼ젙?섍퀬 ?대떦 遺?꾩쓽 ?좏샇 ?대룞 ?곸슜
        const prefExercises = userProfile.preferredExercises;
        
        // 遺?꾨퀎 ?좏샇 ?대룞 ?ㅼ젙
        if (prefExercises.chest) {
          setSelectedMainExercise(prefExercises.chest as MainExerciseType);
        }
        
        // 遺??蹂寃????대떦 遺?꾩쓽 ?좏샇 ?대룞 ?곸슜???꾪빐 ???        setPreferredExercises(prefExercises);
      }
      
      // 3. ?꾩옱 ?좏깮??遺?꾩뿉 ???理쒓렐 ?대룞 湲곕줉 議고쉶
      fetchLatestWorkout(part);
    }
  }, [userProfile?.uid]); // ?섏〈??諛곗뿴??userProfile.uid留??ы븿?섏뿬 濡쒓렇???쒖뿉留??ㅽ뻾
  
  // ?명듃 ?ㅼ젙??蹂寃쎈맆 ?뚮쭏???곸슜 - 濡쒖쭅 ?⑥닚??  useEffect(() => {
    if (settings) {
      console.log('[WorkoutForm] ?명듃 ?ㅼ젙 媛먯???', settings);
      
      // ?명듃 ?ㅼ젙 吏곸젒 ?곸슜 (?곹깭瑜?癒쇱? ?낅뜲?댄듃?섍퀬 ?섏쨷???명듃 援ъ꽦 ?곸슜)
      setSelectedSetConfiguration(settings.preferredSetup);
      setCustomSets(settings.customSets || 5);
      setCustomReps(settings.customReps || 10);
      
      // ?명듃 援ъ꽦???곕씪 ?명듃 ?섏? 諛섎났 ?잛닔 媛?몄삤湲?      const { setsCount, repsCount } = getSetConfiguration(
        settings.preferredSetup,
        settings.customSets, 
        settings.customReps
      );
      
      console.log(`[WorkoutForm] ?명듃 援ъ꽦 ?곸슜: ${settings.preferredSetup} - ${setsCount}?명듃 x ${repsCount}??);
      
      // ?명듃 ?곹깭 ?낅뜲?댄듃
      setSets(setsCount);
      setReps(repsCount);
      
      // 紐낆떆?곸쑝濡?硫붿씤 ?대룞 ?명듃 諛곗뿴 ?낅뜲?댄듃
      const newSets = Array.from({ length: setsCount }, (_, i) => {
        // 湲곗〈 ?명듃媛 ?덉쑝硫?臾닿쾶 ?좎?, ?놁쑝硫?0?쇰줈 ?ㅼ젙
        const weight = (i < mainExercise.sets.length) ? mainExercise.sets[i].weight : 0;
        
        return {
          weight: weight,
          reps: repsCount,
          isSuccess: null as boolean | null
        };
      });
      
      // ?명듃 諛곗뿴 ?낅뜲?댄듃
      setMainExercise((prev: typeof mainExercise) => ({ // prev ???紐낆떆
        ...prev,
        sets: newSets
      }));
      
      console.log('[WorkoutForm] ?명듃 援ъ꽦 ?곸슜 ?꾨즺:', newSets);
    }
  }, [settings]); // ?섏〈??諛곗뿴??settings留??ы븿 (?ㅻⅨ ?곹깭???쒓굅)

  // 遺??part) 蹂寃????대룞 ?대쫫留??낅뜲?댄듃?섍퀬, ?명듃 ?ㅼ젙? 洹몃?濡??좎?
  useEffect(() => {
    console.log(`遺??蹂寃? ${part}, ?명듃 ?ㅼ젙 ?좎?`);
    const newSelectedPart = part as ExercisePart; // ????⑥뼵
    if (mainExerciseOptions[newSelectedPart] && mainExerciseOptions[newSelectedPart].length > 0) {
      const firstExerciseForPart = mainExerciseOptions[newSelectedPart][0];
      setSelectedMainExercise(firstExerciseForPart.value);
      
      // ?대룞 ?대쫫留?蹂寃쏀븯怨??명듃 ?좎?
      setMainExercise((prev: typeof mainExercise) => ({ // prev ???紐낆떆
        ...prev,
        name: firstExerciseForPart.label
      }));
    } else {
      // ?대떦 遺?꾩뿉 ?대룞???녿뒗 寃쎌슦 (?? ?섎せ??'part' 媛?, 湲곕낯媛??먮뒗 ?ㅻ쪟 泥섎━
      setSelectedMainExercise(mainExerciseOptions.chest[0].value);
      setMainExercise((prev: typeof mainExercise) => ({ // prev ???紐낆떆
        ...prev,
        name: mainExerciseOptions.chest[0].label
      }));
    }

    // 遺??蹂寃???理쒓렐 ?대룞 湲곕줉 媛?몄삤湲?    // 以묒슂: 遺??蹂寃??쒖뿉???명듃 ?ㅼ젙? ?좎??섎룄濡??섏젙
    // 理쒓렐 ?대룞 湲곕줉??媛?몄삤?? ?명듃 ?ㅼ젙????뼱?곗? ?딅룄濡????뚮옒洹??ъ슜
    fetchLatestWorkout(newSelectedPart, undefined, true);
  }, [part]);

  // ?좏깮??硫붿씤 ?대룞(selectedMainExercise) 蹂寃???mainExercise.name ?낅뜲?댄듃
  useEffect(() => {
    const currentPartExercises = mainExerciseOptions[part as ExercisePart];
    const foundExercise = currentPartExercises.find(ex => ex.value === selectedMainExercise);
    if (foundExercise) {
      console.log(`[WorkoutForm] 硫붿씤 ?대룞 蹂寃? ${selectedMainExercise} -> ${foundExercise.label}`);
      setMainExercise((prev: typeof mainExercise) => ({ // prev ???紐낆떆
        ...prev,
        name: foundExercise.label
      }));

      // 硫붿씤 ?대룞 蹂寃????대떦 ?대룞??理쒓렐 湲곕줉 媛?몄삤湲?      // ?대룞 蹂寃??쒖뿉???명듃 ?ㅼ젙? ?좎?
      fetchLatestWorkout(part, selectedMainExercise, true);
    } else {
      console.warn(`[WorkoutForm] 硫붿씤 ?대룞??李얠쓣 ???놁뒿?덈떎: part=${part}, selectedMainExercise=${selectedMainExercise}`);
    }
  }, [selectedMainExercise, part]);

  // ???좏슚??寃??  useEffect(() => {
    // 硫붿씤 ?대룞??理쒖냼 ??媛쒖쓽 ?명듃媛 ?덇퀬, 媛??명듃??臾닿쾶? 諛섎났 ?섍? 0蹂대떎 ?곗? ?뺤씤
    const isMainExerciseValid = mainExercise.sets.length > 0 && 
      mainExercise.sets.every((set: { weight: number; reps: number; }) => set.weight > 0 && set.reps > 0); // set ???紐낆떆

    // 蹂댁“ ?대룞???덈뒗 寃쎌슦, 媛??대룞???대쫫???덇퀬 理쒖냼 ??媛쒖쓽 ?명듃媛 ?덉쑝硫? 媛??명듃??臾닿쾶? 諛섎났 ?섍? 0蹂대떎 ?곗? ?뺤씤
    const areAccessoryExercisesValid = accessoryExercises.length === 0 || 
      accessoryExercises.every((exercise: { name: string; sets: Array<{ weight: number; reps: number; }> }) =>  // exercise ???紐낆떆
        exercise.name.trim() !== '' && 
        exercise.sets.length > 0 && 
        exercise.sets.every((set: { weight: number; reps: number; }) => set.weight > 0 && set.reps > 0) // set ???紐낆떆
      );
    
    console.log('Form Validity Check:', { isMainExerciseValid, areAccessoryExercisesValid });
    setIsFormValid(isMainExerciseValid && areAccessoryExercisesValid);
  }, [mainExercise, accessoryExercises]);

  const formatTimeGlobal = (seconds: number) => { // formatTime ?⑥닔瑜?WorkoutForm ?ㅼ퐫?꾨줈 ?대룞?섍퀬 ?대쫫 蹂寃?    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ?덈젴 ?꾨즺 諛???대㉧ ?쒖옉/?쇱떆?뺤?/?ш컻 ?듯빀 ?⑥닔
  const handleSetCompletionAndTimer = (setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      const currentSet = newSets[setIndex];

      // 1. ?명듃 ?곹깭 ?좉? (誘몄셿猷?-> ?깃났 -> 誘몄셿猷?
      if (currentSet.isSuccess === null) { // 誘몄셿猷?-> ?깃났
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
            // 紐⑺몴 誘몃떖 ???깃났?쇰줈 泥섎━?섏? ?딆쓬 (?ъ슜?먭? 吏곸젒 ?ㅽ뙣濡?蹂寃쏀븯嫄곕굹, ?꾩옱???깃났 ?곹깭濡??좎?)
            // currentSet.isSuccess = false; // ?꾩슂?섎떎硫?二쇱꽍 ?댁젣
        }

      } else { // ?깃났(true) ?먮뒗 ?ㅽ뙣(false, ?꾩옱 濡쒖쭅?먯꽌??false ?곹깭媛 ?놁쓬) -> 誘몄셿猷?null)
        currentSet.isSuccess = null;
      }
      setMainExercise(prev => ({ ...prev, sets: newSets }));

    } else if (accessoryIndex !== undefined) {
      // 蹂댁“ ?대룞 濡쒖쭅? AccessoryExerciseComponent?먯꽌 泥섎━ (??대㉧ ?곕룞 ?놁쓬)
      const newExercises = [...accessoryExercises];
      // 蹂댁“ ?대룞 ?명듃 ?꾨즺 泥섎━ (AccessoryExerciseComponent ?대? ?먮뒗 ?ш린??吏곸젒)
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

  // ?듯빀 ??대㉧ 濡쒖쭅 ?⑥닔??  const startGlobalTimer = (sectionId: string) => {
    if (globalTimerRef.current) {
      clearInterval(globalTimerRef.current);
    }
    setGlobalTimer(prev => ({
      ...prev,
      sectionId,
      timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, // timerMinutes? timerSeconds濡?timeLeft ?ㅼ젙
      isPaused: false,
      isRunning: true,
    }));

    const sectionName = sectionId === 'main' ? '硫붿씤 ?대룞' : 
      sectionId.startsWith('accessory_') ? 
      `${accessoryExercises[parseInt(sectionId.split('_')[1])]?.name || '蹂댁“ ?대룞'} ${parseInt(sectionId.split('_')[1])+1}` 
      : '?대룞'; // 湲곕낯媛믪쓣 '?대룞'?쇰줈 蹂寃?
    toast.success(`${sectionName} ?댁떇 ??대㉧ ?쒖옉`, {
      icon: '?깍툘',
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
          
          // ?뵦 媛뺥솕???뚮┝ ?쒖뒪??          const sectionName = sectionId === 'main' ? '硫붿씤 ?대룞' : 
            sectionId.startsWith('accessory_') ? 
            `${accessoryExercises[parseInt(sectionId.split('_')[1])]?.name || '蹂댁“ ?대룞'} ${parseInt(sectionId.split('_')[1])+1}` 
            : '?대룞';
          
          // 1. ?좎뒪???뚮┝ (媛뺥솕???ㅽ???
          toast.success(`?룍截뤴띯셽截?${sectionName} ?댁떇 ?꾨즺!`, {
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
          
          // 2. Capacitor ?ㅼ씠?곕툕 ?뚮┝ (?깆뿉????媛뺣젰???뚮┝)
          scheduleNotification(
            '?룍截뤴띯셽截?肄붿뼱鍮꾩븘 ?쇳듃?덉뒪',
            `${sectionName} ?댁떇 ?쒓컙???앸궗?듬땲?? ?ㅼ쓬 ?명듃瑜??쒖옉?섏꽭?? ?뮞`
          ).catch(err => {
            console.warn('?ㅼ씠?곕툕 ?뚮┝ ?꾩넚 ?ㅽ뙣:', err);
          });
          
          // 3. 釉뚮씪?곗? ?뚮┝ (?뱀뿉??諛깃렇?쇱슫?쒖뿉?쒕룄 蹂댁엫)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('?룍截뤴띯셽截?肄붿뼱鍮꾩븘 ?쇳듃?덉뒪', {
              body: `${sectionName} ?댁떇 ?쒓컙???앸궗?듬땲??\n?ㅼ쓬 ?명듃瑜??쒖옉?섏꽭?? ?뮞`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'workout-timer',
              requireInteraction: true // ?ъ슜?먭? 吏곸젒 ?レ쓣 ?뚭퉴吏 ?쒖떆
            });
          }
          
          // 4. ?뚮엺 ?ъ슫???ъ깮 (3踰?諛섎났)
          if (alarmRef.current) {
            let playCount = 0;
            const playAlarm = () => {
              if (playCount < 3) {
                alarmRef.current?.play().catch(err => {
                  console.error('?뚮엺 ?ъ깮 ?ㅽ뙣:', err);
                });
                playCount++;
                setTimeout(playAlarm, 800); // 0.8珥?媛꾧꺽?쇰줈 諛섎났
              }
            };
            playAlarm();
          }
          
          // 5. 媛뺥솕???낇떛 ?쇰뱶諛?(Capacitor 吏??
          triggerHapticFeedback('heavy').catch(err => {
            console.warn('?낇떛 ?쇰뱶諛??ㅽ뙣:', err);
          });
          
          // 6. 異붽? ?낇떛 ?⑦꽩 (3珥???
          setTimeout(() => {
            triggerHapticFeedback('medium').catch(err => {
              console.warn('異붽? ?낇떛 ?쇰뱶諛??ㅽ뙣:', err);
            });
          }, 3000);
          
          // 7. ?붾㈃ 源쒕묀???④낵 (?섏씠吏 ??댄? 蹂寃?
          let flashCount = 0;
          const originalTitle = document.title;
          const flashTitle = () => {
            if (flashCount < 10) {
              document.title = flashCount % 2 === 0 ? '?뵦 ?댁떇 ?꾨즺! ?뵦' : '?뮞 ?ㅼ쓬 ?명듃! ?뮞';
              flashCount++;
              setTimeout(flashTitle, 500);
            } else {
              document.title = originalTitle;
            }
          };
          flashTitle();
          
          // ??대㉧ 醫낅즺 ??timeLeft瑜??ㅼ떆 timerMinutes, timerSeconds 湲곗??쇰줈 ?ㅼ젙
          return { ...prev, sectionId: null, timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, isPaused: true, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const togglePauseGlobalTimer = () => {
    setGlobalTimer(prev => {
      if (!prev.isRunning && prev.sectionId) { // 硫덉텣 ??대㉧ ?ъ떆??(?꾩옱 ?뱀뀡 ?좎?)
        startGlobalTimer(prev.sectionId);
        return prev; // startGlobalTimer媛 ?곹깭瑜??낅뜲?댄듃?섎?濡??ш린?쒕뒗 ?댁쟾 ?곹깭 諛섑솚
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
      timeLeft: prev.timerMinutes * 60 + prev.timerSeconds, // timerMinutes? timerSeconds濡?timeLeft ?ㅼ젙
      isPaused: true,
      isRunning: false,
    }));
  };

  const handleTimerInputChange = (type: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return; // ?좏슚?섏? ?딆? ?낅젰 諛⑹?

    setGlobalTimer(prev => {
      let newMinutes = prev.timerMinutes;
      let newSeconds = prev.timerSeconds;

      if (type === 'minutes') {
        newMinutes = Math.min(99, numValue); // 理쒕? 99遺?      } else {
        newSeconds = Math.min(59, numValue); // 理쒕? 59珥?      }
      
      // ??대㉧媛 ?ㅽ뻾 以묒씠 ?꾨땺 ?뚮쭔 timeLeft???④퍡 ?낅뜲?댄듃
      const newTimeLeft = !prev.isRunning ? newMinutes * 60 + newSeconds : prev.timeLeft;

      return {
        ...prev,
        timerMinutes: newMinutes,
        timerSeconds: newSeconds,
        timeLeft: newTimeLeft,
      };
    });
  };

  // 蹂댁“ ?대룞 異붽?
  const addAccessoryExercise = () => {
    // 湲곕낯 ?명듃 援ъ꽦???꾩옱 ?좏깮???명듃 援ъ꽦怨??쇱튂?쒗궡
    const { setsCount, repsCount } = getSetConfiguration(
      selectedSetConfiguration,
      customSets,
      customReps
    );
    
    // ??蹂댁“ ?대룞 ?앹꽦
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
    
    setAccessoryExercises((prev: typeof accessoryExercises) => [...prev, newExercise]); // prev ???紐낆떆
  };

  // 蹂댁“ ?대룞 ?쒓굅
  const removeAccessoryExercise = (index: number) => {
    setAccessoryExercises((prev: typeof accessoryExercises) => prev.filter((_: any, i: number) => i !== index)); // prev, _, i ???紐낆떆
  };

  // 蹂댁“ ?대룞 蹂寃?  const handleAccessoryExerciseChange = (index: number, updatedExercise: any) => {
    setAccessoryExercises((prev: typeof accessoryExercises) => { // prev ???紐낆떆
      const newExercises = [...prev];
      newExercises[index] = updatedExercise;
      return newExercises;
    });
  };

  // 硫붿씤 ?대룞 蹂寃????댁쟾 蹂댁“ ?대룞 ?먮룞 濡쒕뱶
  useEffect(() => {
    // 硫붿씤 ?대룞??蹂寃쎈맆 ?뚮쭔 ?ㅽ뻾?섎룄濡?    // 留덉슫???щ?瑜?泥댄겕?섎뒗 ?뚮옒洹?異붽?
    const isMounted = { current: true };
    
    // 硫붿씤 ?대룞??蹂寃쎈맆 ???대떦 ?대룞??????댁쟾 蹂댁“ ?대룞 紐⑸줉 議고쉶
    const fetchPreviousAccessoryExercises = async () => {
      if (!userProfile || !mainExercise.name || !isMounted.current) return;
      
      try {
        console.log(`[蹂댁“?대룞 濡쒕뱶] ?쒖옉: ${mainExercise.name} ?대룞??????댁쟾 蹂댁“ ?대룞 寃??);
        
        const sessionsCollection = collection(db, 'sessions');
        
        // 蹂듯빀 ?몃뜳???ㅻ쪟 ?닿껐: orderBy ?쒓굅?섍퀬 湲곕낯 荑쇰━留??ъ슜
        const q = query(
          sessionsCollection,
          where('userId', '==', userProfile.uid),
          where('mainExercise.name', '==', mainExercise.name)
          // orderBy('date', 'desc')? limit(1) ?쒓굅
        );
        
        console.log('[蹂댁“?대룞 濡쒕뱶] Firestore 荑쇰━ ?ㅽ뻾');
        const querySnapshot = await getDocs(q);
        if (!isMounted.current) return; // 鍮꾨룞湲??묒뾽 ?꾨즺 ???몃쭏?댄듃 ?뺤씤
        
        console.log(`[蹂댁“?대룞 濡쒕뱶] 荑쇰━ 寃곌낵: ${querySnapshot.size}媛??몄뀡 諛쒓껄`);
        
        // 蹂댁“ ?대룞 紐⑸줉 珥덇린??(?댁쟾 蹂댁“ ?대룞 湲곕줉 ?쒓굅)
        if (accessoryExercises.length === 0) {
          if (!querySnapshot.empty) {
            // ?대씪?댁뼵?몄뿉???좎쭨 湲곗??쇰줈 ?뺣젹
            const sortedDocs = querySnapshot.docs.sort((a: any, b: any) => { // a, b ???紐낆떆
              const dateA = a.data().date.toDate();
              const dateB = b.data().date.toDate();
              return dateB.getTime() - dateA.getTime(); // 理쒖떊 ?좎쭨???뺣젹
            });
            
            // 媛??理쒓렐 ?몄뀡 ?ъ슜
            const latestSession = sortedDocs[0].data();
            const latestSessionDate = latestSession.date?.toDate?.();
            const dateStr = latestSessionDate ? latestSessionDate.toLocaleDateString() : '?좎쭨 ?놁쓬';
            
            console.log(`[蹂댁“?대룞 濡쒕뱶] 理쒓렐 ?몄뀡 ID: ${sortedDocs[0].id}, ?좎쭨: ${dateStr}`);
            
            if (latestSession.accessoryExercises && Array.isArray(latestSession.accessoryExercises) && latestSession.accessoryExercises.length > 0) {
              console.log(`[蹂댁“?대룞 濡쒕뱶] 理쒓렐 ?몄뀡??蹂댁“ ?대룞 媛쒖닔: ${latestSession.accessoryExercises.length}媛?);
              
              // 理쒓렐 ?몄뀡??蹂댁“ ?대룞留??ъ슜
              const latestExercises = latestSession.accessoryExercises;
              
              latestExercises.forEach((exercise: any) => {
                if (exercise && exercise.name) {
                  console.log(`[蹂댁“?대룞 濡쒕뱶] 蹂댁“ ?대룞 諛쒓껄: ${exercise.name}, ?명듃 ?? ${exercise.sets?.length || 0}`);
                }
              });
              
              // 硫붿씤 ?대룞 ?대쫫?쇰줈 ?댁쟾 蹂댁“ ?대룞 留??낅뜲?댄듃
              setPreviousAccessoryExercises((prev: typeof previousAccessoryExercises) => { // prev ???紐낆떆
                const updated = {
                  ...prev,
                  [mainExercise.name]: latestExercises
                };
                console.log(`[蹂댁“?대룞 濡쒕뱶] ?댁쟾 蹂댁“ ?대룞 留??낅뜲?댄듃: ${Object.keys(updated).length}媛?硫붿씤 ?대룞?????留ㅽ븨 蹂댁쑀`);
                return updated;
              });
              
              // ?먮룞?쇰줈 吏곸쟾 蹂댁“ ?대룞 異붽?
              console.log(`[蹂댁“?대룞 濡쒕뱶] 理쒓렐 蹂댁“ ?대룞 ?먮룞 ?ㅼ젙 (${latestExercises.length}媛?`);
              setAccessoryExercises(latestExercises);
            } else {
              console.log(`[蹂댁“?대룞 濡쒕뱶] 理쒓렐 ?몄뀡??蹂댁“ ?대룞 ?놁쓬`);
            }
          } else {
            console.log(`[蹂댁“?대룞 濡쒕뱶] 荑쇰━ 寃곌낵 ?놁쓬 (${mainExercise.name} ?대룞 湲곕줉 ?놁쓬)`);
          }
        } else {
          console.log(`[蹂댁“?대룞 濡쒕뱶] ?대? 蹂댁“ ?대룞??${accessoryExercises.length}媛??ㅼ젙?섏뼱 ?덉뼱 ?먮룞 濡쒕뱶 ?앸왂`);
        }
      } catch (error) {
        console.error(`[蹂댁“?대룞 濡쒕뱶] ?ㅻ쪟:`, error);
      }
    };
    
    // ?덈줈??硫붿씤 ?대룞?쇰줈 蹂寃쎈맆 ??湲곗〈 蹂댁“ ?대룞 珥덇린??    setAccessoryExercises([]);
    
    fetchPreviousAccessoryExercises();
    
    // ?대┛???⑥닔
    return () => {
      isMounted.current = false;
    };
  }, [userProfile, mainExercise.name]);

  // ?덈젴 ?꾨즺 泥섎━ ?⑥닔 ?섏젙
  const handleTrainingComplete = (setIndex: number, isMainExercise: boolean, accessoryIndex?: number) => {
    if (isMainExercise) {
      const newSets = [...mainExercise.sets];
      
      // ?대? ?곹깭媛 ?덉쑝硫?珥덇린 ?곹깭濡??섎룎由ш린 (?좉? 湲곕뒫)
      if (newSets[setIndex].isSuccess !== null) {
        newSets[setIndex].isSuccess = null;
      } else {
        // 紐⑺몴 ?잛닔 ?ъ꽦 ???깃났, 洹몃젃吏 ?딆쑝硫??ㅽ뙣
        const { repsCount: targetReps } = getSetConfiguration(
          selectedSetConfiguration, 
          customSets, 
          customReps
        );
        
        // ?꾩옱 ?낅젰???잛닔媛 紐⑺몴 ?잛닔 ?댁긽?대㈃ ?깃났, 洹몃젃吏 ?딆쑝硫??ㅽ뙣
        const currentReps = newSets[setIndex].reps;
        const isSuccess = currentReps >= targetReps;
        newSets[setIndex].isSuccess = isSuccess;
        
        console.log(`?명듃 ${setIndex+1} ?꾨즺: ${currentReps}/${targetReps}?? 寃곌낵: ${isSuccess ? '?깃났' : '?ㅽ뙣'}`);
        
        // ?깃났???명듃??寃쎌슦 1RM ?덉긽 怨꾩궛 諛??꾨줈???낅뜲?댄듃
        if (isSuccess) {
          const weight = newSets[setIndex].weight;
          const reps = newSets[setIndex].reps;
          
          // 釉뚮젅李뚰궎 怨듭떇?쇰줈 1RM 怨꾩궛
          if (weight > 0 && reps > 0 && reps < 37) {
            const estimatedOneRM = Math.round(weight * (36 / (37 - reps)));
            console.log(`?명듃 ?깃났: ${weight}kg x ${reps}?? ?덉긽 1RM: ${estimatedOneRM}kg`);
            
            // 硫붿씤 ?대룞 醫낅쪟???곕씪 1RM ?낅뜲?댄듃
            updateOneRMIfHigher(selectedMainExercise, estimatedOneRM);
          }
        }
      }
      
      setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets })); // prev ???紐낆떆
    } else if (accessoryIndex !== undefined) {
      // 蹂댁“ ?대룞?????泥섎━
      console.log(`蹂댁“ ?대룞 ?덈젴 ?꾨즺 泥섎━: ?명듃 ${setIndex}, 蹂댁“?대룞 ?몃뜳??${accessoryIndex}`);
      
      // 蹂댁“ ?대룞 諛곗뿴??踰붿쐞 ?뺤씤
      if (accessoryIndex >= 0 && accessoryIndex < accessoryExercises.length) {
        const newExercises = [...accessoryExercises];
        
        // ?대? ?곹깭媛 ?덉쑝硫?珥덇린 ?곹깭濡??섎룎由ш린 (?좉? 湲곕뒫)
        if (newExercises[accessoryIndex].sets[setIndex].isSuccess !== null) {
          newExercises[accessoryIndex].sets[setIndex].isSuccess = null;
        } else {
          // 紐⑺몴 ?잛닔 ?ъ꽦 ???깃났, 洹몃젃吏 ?딆쑝硫??ㅽ뙣
          const { repsCount: targetReps } = getSetConfiguration(
            selectedSetConfiguration, 
            customSets, 
            customReps
          );
          
          // ?꾩옱 ?낅젰???잛닔媛 紐⑺몴 ?잛닔 ?댁긽?대㈃ ?깃났, 洹몃젃吏 ?딆쑝硫??ㅽ뙣
          const currentReps = newExercises[accessoryIndex].sets[setIndex].reps;
          const isSuccess = currentReps >= targetReps;
          newExercises[accessoryIndex].sets[setIndex].isSuccess = isSuccess;
          
          console.log(`蹂댁“?대룞 ${accessoryIndex+1}, ?명듃 ${setIndex+1} ?꾨즺: ${currentReps}/${targetReps}?? 寃곌낵: ${isSuccess ? '?깃났' : '?ㅽ뙣'}`);
        }
        
        setAccessoryExercises(newExercises);
      } else {
        console.error(`蹂댁“ ?대룞 ?몃뜳??踰붿쐞 ?ㅻ쪟: ${accessoryIndex}, ?꾩껜 媛쒖닔: ${accessoryExercises.length}`);
      }
    }
  };
  
  // ?덈줈??1RM??湲곗〈蹂대떎 ?믪? 寃쎌슦 ?꾨줈???낅뜲?댄듃
  const updateOneRMIfHigher = async (exerciseType: MainExerciseType, newOneRM: number) => {
    if (!userProfile) return;
    
    // ?꾩옱 ?꾨줈?꾩쓽 1RM ?뺣낫
    const currentOneRM = userProfile.oneRepMax || {
      bench: 0,
      squat: 0,
      deadlift: 0,
      overheadPress: 0
    };
    let shouldUpdate = false;
    let exerciseKey = '';
    
    // ?대룞 醫낅쪟???곕씪 ?대떦?섎뒗 1RM ??寃곗젙
    // 踰ㅼ튂?꾨젅??怨꾩뿴
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
    // ?ㅼ옘??怨꾩뿴
    else if (exerciseType === 'squat') {
      exerciseKey = 'squat';
      if (!currentOneRM.squat || newOneRM > currentOneRM.squat) {
        shouldUpdate = true;
      }
    }
    // ?곕뱶由ы봽??怨꾩뿴
    else if (exerciseType === 'deadlift') {
      exerciseKey = 'deadlift';
      if (!currentOneRM.deadlift || newOneRM > currentOneRM.deadlift) {
        shouldUpdate = true;
      }
    }
    // ?ㅻ쾭?ㅻ뱶?꾨젅??怨꾩뿴
    else if (exerciseType === 'overheadPress') {
      exerciseKey = 'overheadPress';
      if (!currentOneRM.overheadPress || newOneRM > currentOneRM.overheadPress) {
        shouldUpdate = true;
      }
    }
    
    // ?낅뜲?댄듃媛 ?꾩슂??寃쎌슦
    if (shouldUpdate && exerciseKey) {
      try {
        const updatedOneRM = { ...currentOneRM, [exerciseKey]: newOneRM };
        
        // AuthContext??updateProfile ?⑥닔瑜??ъ슜?섏뿬 ?꾨줈???낅뜲?댄듃
        await updateProfile({ 
          oneRepMax: updatedOneRM as {
            bench: number;
            squat: number;
            deadlift: number;
            overheadPress: number;
          }
        });
        
        // ?깃났 ?좎뒪??硫붿떆吏 - ?쒓굅
        // toast.success(
        //   `?덈줈??${exerciseKey === 'bench' ? '踰ㅼ튂?꾨젅?? : 
        //     exerciseKey === 'squat' ? '?ㅼ옘?? : 
        //     exerciseKey === 'deadlift' ? '?곕뱶由ы봽?? : '?ㅻ쾭?ㅻ뱶?꾨젅??
        //   } 1RM: ${newOneRM}kg!`, 
        //   { duration: 3000 }
        // );
        
        console.log(`1RM ?낅뜲?댄듃 ?깃났: ${exerciseKey} = ${newOneRM}kg`);
      } catch (error) {
        console.error('1RM ?낅뜲?댄듃 ?ㅽ뙣:', error);
      }
    }
  };

  // 硫붿씤 ?대룞 ??낆뿉 ?곕Ⅸ ?대룞 ?대쫫 諛섑솚 ?⑥닔
  const getMainExerciseName = (exerciseType: MainExerciseType): string => {
    const exercise = mainExerciseOptions[part].find(ex => ex.value === exerciseType);
    return exercise?.label || '';
  };

  // 理쒓렐 ?대룞 湲곕줉 媛?몄삤湲?  const fetchLatestWorkout = async (
    exercisePart: ExercisePart, 
    mainExerciseType?: MainExerciseType,
    useCurrentSettings: boolean = false
  ) => {
    if (!userProfile?.uid) return;
    console.log(`[WorkoutForm] ${exercisePart} 遺?꾩쓽 理쒓렐 ?대룞 湲곕줉 議고쉶 ?쒖옉...`);
    
    try {
      // 媛숈? 遺?꾩쓽 媛??理쒓렐 ?대룞 湲곕줉 荑쇰━
      const workoutsCollection = collection(db, 'sessions');
      const q = query(
        workoutsCollection,
        where('userId', '==', userProfile.uid),
        where('part', '==', exercisePart),
        orderBy('date', 'desc')
        // limit(1) ?쒓굅 - 紐⑤뱺 湲곕줉??媛?몄삤?꾨줉 ?섏젙
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // 紐⑤뱺 湲곕줉??諛곗뿴濡?蹂??        const workouts = snapshot.docs.map(doc => doc.data());
        // 媛??理쒓렐 湲곕줉 (?뺣젹?섏뼱 ?덉쑝誘濡?泥?踰덉㎏ ??ぉ)
        const latestWorkout = workouts[0];
        console.log(`[WorkoutForm] 理쒓렐 ?대룞 湲곕줉 ${workouts.length}媛?李얠쓬. 泥?踰덉㎏ 湲곕줉:`, latestWorkout);
        
        // ?숈씪???대룞?????紐⑤뱺 湲곕줉??濡쒓렇濡?異쒕젰
        if (workouts.length > 1) {
          console.log(`[WorkoutForm] 珥?${workouts.length}媛쒖쓽 湲곕줉???덉뒿?덈떎:`);
          workouts.forEach((workout, index) => {
            console.log(`[WorkoutForm] 湲곕줉 #${index + 1}:`, 
              workout.date instanceof Date 
                ? workout.date.toLocaleString() 
                : new Date((workout.date as any).seconds * 1000).toLocaleString(),
              workout.mainExercise?.name,
              '臾닿쾶:', workout.mainExercise?.sets[0]?.weight,
              '寃곌낵:', workout.isAllSuccess ? '?깃났' : '?ㅽ뙣'
            );
          });
        }
        
        // ?ㅽ듃?덉묶/?쒖뾽 愿??硫붾え 濡쒕뱶
        if (latestWorkout.stretchingNotes) {
          setStretchingNotes(latestWorkout.stretchingNotes);
        }
        
        // 硫붿씤 ?대룞 ?대쫫???쇱튂?섎뒗 寃쎌슦 異붽? ?뺣낫 ?쒓났
        if (!mainExerciseType || (latestWorkout.mainExercise && latestWorkout.mainExercise.name === getMainExerciseName(mainExerciseType))) {
          // ?꾩옱 ?좏깮???대룞???덉씠釉?媛?몄삤湲?          const currentExerciseLabel = mainExerciseOptions[exercisePart].find(
            ex => ex.value === mainExerciseType
          )?.label;
          
          console.log(`?꾩옱 ?좏깮???대룞 ?대쫫: ${currentExerciseLabel}`);
          console.log(`??λ맂 ?대룞 ?대쫫: ${latestWorkout.mainExercise.name}`);
          
          // ?대룞 ?대쫫???ㅻⅤ硫?泥섎━ 以묐떒
          if (currentExerciseLabel && latestWorkout.mainExercise.name !== currentExerciseLabel) {
            console.log('?좏깮???대룞??理쒓렐 湲곕줉怨??쇱튂?섏? ?딆뒿?덈떎. 臾닿쾶瑜?濡쒕뱶?섏? ?딆뒿?덈떎.');
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
          // 紐⑤뱺 ?명듃媛 ?깃났?몄? ?뺤씤
          const allSuccess = latestWorkout.mainExercise.sets.every(set => set.isSuccess === true);
          
          // 留덉?留??명듃??臾닿쾶 媛?몄삤湲?(蹂댄넻 留덉?留??명듃媛 理쒕? 臾닿쾶)
          const lastWeight = latestWorkout.mainExercise.sets[0].weight;
          
          // ??臾닿쾶 怨꾩궛: 紐⑤뱺 ?명듃 ?깃났 ??2.5kg 利앸웾, ?ㅽ뙣 ???숈씪 臾닿쾶
          const newWeight = allSuccess ? lastWeight + 2.5 : lastWeight;
          
          console.log(`理쒓렐 ?대룞 ?깃났 ?щ?: ${allSuccess}, ?댁쟾 臾닿쾶: ${lastWeight}kg, ??臾닿쾶: ${newWeight}kg`);
          
          // 理쒓렐 ?대룞 ?대젰 ?뺣낫留??낅뜲?댄듃 - ?명듃 援ъ꽦? 蹂寃쏀븯吏 ?딆쓬
          setLatestWorkoutInfo({
            date: latestWorkout.date instanceof Date 
              ? latestWorkout.date 
              : (typeof latestWorkout.date === 'object' && latestWorkout.date && 'seconds' in latestWorkout.date
                ? new Date((latestWorkout.date as { seconds: number }).seconds * 1000) // ????⑥뼵 諛?seconds ?묎렐
                : new Date()),
            weight: lastWeight,
            allSuccess,
            exists: true,
            exerciseName: latestWorkout.mainExercise.name,
            sets: latestWorkout.mainExercise.sets.length,
            reps: latestWorkout.mainExercise.sets[0]?.reps || 0
          });
          
          // 以묒슂: ?꾩옱 ?좏깮???명듃 ?ㅼ젙 ?ъ슜 (理쒓렐 湲곕줉???꾨땶 ?꾩옱 ?ㅼ젙 ?곗꽑)
          if (useCurrentSettings && settings) {
            // ?꾩옱 ?ㅼ젙???명듃 援ъ꽦 ?뺣낫 媛?몄삤湲?            const { setsCount, repsCount } = getSetConfiguration(
              settings.preferredSetup,
              settings.customSets, 
              settings.customReps
            );
            
            console.log(`[fetchLatestWorkout] ?좏깮???명듃 援ъ꽦???곗꽑 ?곸슜: ${settings.preferredSetup} - ${setsCount}?명듃 x ${repsCount}??);
            
            // 硫붿씤 ?대룞 ?명듃 ?ㅼ젙: ?꾩옱 ?ㅼ젙???명듃 ?섏? 諛섎났 ?잛닔 ?곸슜, 臾닿쾶留?理쒓렐 湲곕줉?먯꽌 媛?몄샂
            const newSets = Array.from({ length: setsCount }, () => ({
              reps: repsCount,
              weight: newWeight,
              isSuccess: null
            }));
            
            console.log('???명듃 援ъ꽦 (理쒓렐 臾닿쾶 + ?꾩옱 ?명듃 ?ㅼ젙):', newSets);
            
            // 硫붿씤 ?대룞 ?낅뜲?댄듃
            setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
          } else {
            // settings媛 ?꾩쭅 濡쒕뱶?섏? ?딆? 寃쎌슦, 理쒓렐 ?대룞 湲곕줉 湲곕컲?쇰줈留??ㅼ젙
            console.log('[fetchLatestWorkout] settings ?놁쓬, 理쒓렐 ?대룞 湲곕줉留??ъ슜');
            
            const setsCount = latestWorkout.mainExercise.sets.length;
            
            // 硫붿씤 ?대룞 ?명듃 ?ㅼ젙: ??臾닿쾶 ?곸슜 (紐⑤뱺 ?명듃???숈씪??臾닿쾶 ?곸슜)
            const newSets = Array(setsCount).fill(0).map((_, index) => {
              return {
                reps: latestWorkout.mainExercise.sets[index]?.reps || 0, 
                weight: newWeight,
                isSuccess: null
              };
            });
            
            console.log('?덈줈???명듃 援ъ꽦 (理쒓렐 ?대룞 湲곕줉 湲곕컲):', newSets);
            
            // 硫붿씤 ?대룞 ?낅뜲?댄듃
            setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
          }
        }
      } else {
        console.log('?대떦 ?대룞???댁쟾 湲곕줉???놁뒿?덈떎.');
        setLatestWorkoutInfo({
          date: null,
          weight: 0,
          allSuccess: false,
          exists: false,
          exerciseName: '',
          sets: 0,
          reps: 0
        });
        
        // 理쒓렐 湲곕줉???놁쓣 ???꾩옱 ?명듃 ?ㅼ젙 ?곸슜
        if (useCurrentSettings && settings) {
          const { setsCount, repsCount } = getSetConfiguration(
            settings.preferredSetup,
            settings.customSets, 
            settings.customReps
          );
          
          console.log(`[fetchLatestWorkout] 湲곕줉 ?놁쓬, ?좏깮???명듃 援ъ꽦 ?곸슜: ${settings.preferredSetup} - ${setsCount}?명듃 x ${repsCount}??);
          
          // 湲곕낯 ?명듃 援ъ꽦 ?곸슜
          const newSets = Array.from({ length: setsCount }, () => ({
            reps: repsCount,
            weight: 0,
            isSuccess: null
          }));
          
          setMainExercise((prev: typeof mainExercise) => ({ ...prev, sets: newSets }));
        }
      }
    } catch (error) {
      console.error('理쒓렐 ?대룞 湲곕줉 媛?몄삤湲??ㅽ뙣:', error);
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

  // handleRepsChange ?⑥닔 ?섏젙
  const handleRepsChange = (newReps: number, setIndex: number, isMainExercise: boolean = true) => {
    // ?명듃 援ъ꽦???곕Ⅸ 諛섎났 ?잛닔 ?쒗븳
    let maxReps = newReps;
    
    // ?쒖? ?명듃 援ъ꽦??寃쎌슦 理쒕? 諛섎났 ?잛닔 ?쒗븳
    if (selectedSetConfiguration === '5x5') {
      maxReps = Math.min(newReps, 5);
    } else if (selectedSetConfiguration === '6x3') {
      maxReps = Math.min(newReps, 6);
    } else if (selectedSetConfiguration === '10x5') {
      maxReps = Math.min(newReps, 10);
    } else if (selectedSetConfiguration === '15x5') {
      maxReps = Math.min(newReps, 15);
    }
    
    // 理쒖냼媛?泥댄겕 (0 ?댄븯 諛⑹?)
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
      toast.error('濡쒓렇?몄씠 ?꾩슂?⑸땲??');
      console.log('WorkoutForm: User not logged in');
      return;
    }
    console.log('WorkoutForm: User profile available:', userProfile);

    console.log('WorkoutForm: Final isFormValid state before submitting:', isFormValid);
    if (!isFormValid) {
      toast.error('?꾩닔 ?꾨뱶瑜?紐⑤몢 ?낅젰?댁＜?몄슂. (媛??명듃??臾닿쾶? ?잛닔??0蹂대떎 而ㅼ빞 ?⑸땲??');
      console.log('WorkoutForm: Form is not valid. Main exercise:', mainExercise, 'Accessory:', accessoryExercises);
      return;
    }

    try {
      console.log('WorkoutForm: Preparing session data...');
      // ?쇱＜?????좎쭨 怨꾩궛
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // ?????硫붿씤 ?대룞 ?곹깭 ?붾쾭源?      console.log('[WorkoutForm] ?????硫붿씤 ?대룞 ?곹깭:', {
        selectedMainExercise,
        mainExerciseName: mainExercise.name,
        mainExerciseSets: mainExercise.sets,
        mainExerciseSetsLength: mainExercise.sets.length,
        part,
        isFormValid
      });
      
      // 硫붿씤 ?대룞 ?곗씠???뺣━: 臾닿쾶? 諛섎났 ?섍? 0???명듃 ?쒖쇅 (isFormValid?먯꽌 ?대? 泥댄겕?섏?留? ?덉쟾?μ튂)
      const cleanMainExercise = {
        part,
        name: mainExercise.name, 
        // weight: mainExercise.sets && mainExercise.sets.length > 0 ? mainExercise.sets[0].weight : 0, // ?명듃蹂?臾닿쾶瑜??ъ슜?섎?濡????꾨뱶??遺덊븘?뷀븷 ???덉쓬
        sets: mainExercise.sets.map((set: { reps: number; weight: number; isSuccess: boolean | null }) => ({ // set ???紐낆떆
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess === null ? false : set.isSuccess // null?대㈃ false濡?泥섎━
        }))
      };
      console.log('[WorkoutForm] cleanMainExercise ?앹꽦 ?꾨즺:', cleanMainExercise);

      const cleanAccessoryExercises = accessoryExercises.map((exercise: { name: string; sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }> }) => ({ // exercise ???紐낆떆
        name: exercise.name || '',
        // weight: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].weight : 0, // ?명듃蹂?臾닿쾶
        // reps: exercise.sets && exercise.sets.length > 0 ? exercise.sets[0].reps : 0, // ?명듃蹂??잛닔
        sets: (exercise.sets || []).map((set: { reps: number; weight: number; isSuccess: boolean | null }) => ({ // set ???紐낆떆
          reps: set.reps || 0,
          weight: set.weight || 0,
          isSuccess: set.isSuccess === null ? false : set.isSuccess // null?대㈃ false濡?泥섎━
        }))
      }));
      console.log('Cleaned accessory exercises:', cleanAccessoryExercises);

      const sessionData: Session = {
        userId: userProfile.uid,
        date: new Date(), // Timestamp濡?蹂?섏? Firestore媛 ?먮룞?쇰줈 泥섎━?섍굅?? Timestamp.fromDate(new Date()) ?ъ슜
        part,
        mainExercise: cleanMainExercise,
        accessoryExercises: cleanAccessoryExercises,
        notes: notes || '',
        isAllSuccess: mainExercise.sets.every((set: { isSuccess: boolean | null }) => set.isSuccess === true), // isSuccess媛 true??寃쎌슦留??꾩껜 ?깃났 // set ???紐낆떆
        successSets: mainExercise.sets.filter((set: { isSuccess: boolean | null }) => set.isSuccess === true).length, // isSuccess媛 true???명듃 ??// set ???紐낆떆
        accessoryNames: cleanAccessoryExercises.map((ex: { name: string }) => ex.name), // ex ???紐낆떆
        sleepHours: sleepHours === undefined ? null : sleepHours, // undefined??寃쎌슦 null濡??ㅼ젙
        condition: condition || 'normal', // condition??undefined??寃쎌슦 'normal'濡??ㅼ젙
        startTime,
        lastMealTime: lastMealTime || null, // undefined??寃쎌슦 null濡??ㅼ젙
        stretchingCompleted,
        warmupCompleted,
        stretchingNotes: stretchingNotes || null // undefined??寃쎌슦 null濡??ㅼ젙
      };

      console.log('WorkoutForm: Attempting to save session data to Firestore. Data:', JSON.stringify(sessionData, null, 2));

      // 湲곗〈 湲곕줉 ?뺤씤
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', userProfile.uid),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const querySnapshot = await getDocs(q);
      console.log('WorkoutForm: Existing sessions in last 7 days:', querySnapshot.size);
      
      // 二쇱꽍 泥섎━: ?꾩옱??7???쒗븳 ?놁씠 ????뚯뒪??      // if (querySnapshot.size >= 7) {
      //   toast.error('理쒓렐 7???숈븞??湲곕줉留???ν븷 ???덉뒿?덈떎.');
      //   console.log('WorkoutForm: Save limit reached (7 days).');
      //   return;
      // }

      await addDoc(collection(db, 'sessions'), sessionData);
      console.log('WorkoutForm: Session data saved successfully to Firestore.');
      
      // ????꾨즺 ?좎뒪??硫붿떆吏
      toast.success('????꾨즺!', {
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
        icon: '??
      });
      
      // ??珥덇린??      setPart('chest');
      setMainExercise({
        name: mainExerciseOptions.chest[0].label,
        sets: [{ reps: 0, weight: 0, isSuccess: null }]
      });
      setAccessoryExercises([]);
      setNotes('');
      
      // ?깃났 肄쒕갚 ?몄텧 - ?대룞 湲곕줉 ?섏씠吏濡??대룞
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('WorkoutForm: Error saving session:', error); // ?꾩껜 ?먮윭 媛앹껜 濡쒓퉭
      toast.error('?대룞 湲곕줉 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.'); // 肄섏넄 ?뺤씤 ?덈궡 ?쒓굅
    }
  };

  // 蹂듯빀 ?대룞 ???湲곕뒫
  const saveComplexWorkout = async () => {
    if (!userProfile || !complexWorkoutName.trim()) {
      toast.error('蹂듯빀 ?대룞 ?대쫫???낅젰?댁＜?몄슂.');
      return;
    }

    try {
      setIsSavingComplexWorkout(true);
      
      // 硫붿씤 ?대룞 ?곗씠?곗? 蹂댁“ ?대룞 ?곗씠??以鍮?      const complexWorkoutData = {
        userId: userProfile.uid,
        name: complexWorkoutName,
        date: new Date(),
        mainExercises: part === 'complex' ? 
          [...mainExercises, mainExercise].filter(ex => ex.name !== '蹂듯빀 ?대룞 遺덈윭?ㅺ린') : 
          [mainExercise],
        accessoryExercises: accessoryExercises
      };

      // Firestore?????      await addDoc(collection(db, 'complexWorkouts'), complexWorkoutData);
      
      toast.success('蹂듯빀 ?대룞????λ릺?덉뒿?덈떎.');
      fetchComplexWorkouts(); // 紐⑸줉 ?덈줈怨좎묠
      setComplexWorkoutName(''); // ?낅젰 ?꾨뱶 珥덇린??      
    } catch (error) {
      console.error('蹂듯빀 ?대룞 ???以??ㅻ쪟 諛쒖깮:', error);
      toast.error('蹂듯빀 ?대룞 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.');
    } finally {
      setIsSavingComplexWorkout(false);
    }
  };

  // 蹂듯빀 ?대룞 紐⑸줉 媛?몄삤湲?  const fetchComplexWorkouts = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoadingComplexWorkouts(true);
      const complexWorkoutsCollection = collection(db, 'complexWorkouts');
      const q = query(complexWorkoutsCollection, where('userId', '==', userProfile.uid));
      const snapshot = await getDocs(q);
      
      const workouts = snapshot.docs.map((doc: any) => ({ // doc ???紐낆떆
        id: doc.id,
        ...doc.data() as any
      }));
      
      setSavedComplexWorkouts(workouts);
    } catch (error) {
      console.error('蹂듯빀 ?대룞 紐⑸줉 媛?몄삤湲??ㅽ뙣:', error);
      toast.error('蹂듯빀 ?대룞 紐⑸줉??遺덈윭?ㅻ뒗???ㅽ뙣?덉뒿?덈떎.');
    } finally {
      setIsLoadingComplexWorkouts(false);
    }
  };

  // 蹂듯빀 ?대룞 遺덈윭?ㅺ린
  const loadComplexWorkout = (workoutId: string) => {
    const workout = savedComplexWorkouts.find((w: { id: string }) => w.id === workoutId); // w ???紐낆떆
    if (!workout) return;
    
    // 蹂듯빀 ?대룞 紐⑤뱶濡??꾪솚
    setPart('complex');
    
    // 泥?踰덉㎏ 硫붿씤 ?대룞?쇰줈 ?ㅼ젙?섍퀬 ?섎㉧吏??mainExercises??異붽?
    if (workout.mainExercises && workout.mainExercises.length > 0) {
      const [firstMain, ...restMains] = workout.mainExercises;
      setMainExercise(firstMain);
      setMainExercises(restMains || []);
    }
    
    // 蹂댁“ ?대룞 ?ㅼ젙
    if (workout.accessoryExercises && workout.accessoryExercises.length > 0) {
      setAccessoryExercises(workout.accessoryExercises);
    }
    
    setShowComplexWorkoutModal(false);
    toast.success(`"${workout.name}" 蹂듯빀 ?대룞??遺덈윭?붿뒿?덈떎.`);
  };

  // 硫붿씤 ?대룞 異붽? (蹂듯빀 ?대룞?먯꽌留??ъ슜)
  const addMainExercise = () => {
    // 湲곕낯 ?명듃 援ъ꽦???꾩옱 ?좏깮???명듃 援ъ꽦怨??쇱튂?쒗궡
    const { setsCount, repsCount } = getSetConfiguration(
      selectedSetConfiguration,
      customSets,
      customReps
    );
    
    // ??硫붿씤 ?대룞 ?앹꽦
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

  // 硫붿씤 ?대룞 ?쒓굅
  const removeMainExercise = (index: number) => {
    setMainExercises((prev: typeof mainExercises) => prev.filter((_: any, i: number) => i !== index)); // prev, _, i ???紐낆떆
  };

  // 硫붿씤 ?대룞 蹂寃?  const handleMainExerciseChange = (index: number, updatedExercise: any) => {
    setMainExercises((prev: typeof mainExercises) => { // prev ???紐낆떆
      const newExercises = [...prev];
      newExercises[index] = updatedExercise;
      return newExercises;
    });
  };

  // 遺?꾧? 蹂寃쎈맆 ??蹂듯빀 ?대룞 愿???곹깭 珥덇린??  useEffect(() => {
    if (part === 'complex') {
      fetchComplexWorkouts();
    } else {
      // 蹂듯빀 ?대룞???꾨땶 寃쎌슦 硫붿씤 ?대룞 諛곗뿴 珥덇린??      setMainExercises([]);
    }
  }, [part]);

  return (
    <div className="space-y-6">
      {/* ?ㅻ뒛??而⑤뵒??泥댄겕 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">?ㅻ뒛??而⑤뵒??/h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">?섎㈃ ?쒓컙</label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">?쒓컙</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">而⑤뵒??/label>
            <div className="flex space-x-2">
              {['?섏겏', '蹂댄넻', '醫뗭쓬'].map((c) => (
                <Button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c === '?섏겏' ? 'bad' : c === '蹂댄넻' ? 'normal' : 'good')}
                  variant={condition === (c === '?섏겏' ? 'bad' : c === '蹂댄넻' ? 'normal' : 'good') ? 'primary' : 'outline'}
                  size="sm"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">?대룞 ?쒖옉 ?쒓컙</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* ?대룞 遺??諛?硫붿씤 ?대룞 ?좏깮 */}
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div>
          <label className="text-lg font-semibold text-gray-800 dark:text-white mb-2 block">?대룞 遺??/label>
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
        {mainExerciseOptions[part] && mainExerciseOptions[part].length > 0 && (
          <div>
            <label className="text-lg font-semibold text-gray-800 dark:text-white mb-2 block">硫붿씤 ?대룞</label>
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

      {/* 理쒓렐 ?대룞 ?뺣낫 諛?硫붿씤 ?대룞 ?낅젰 */}
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {latestWorkoutInfo.exists && (
          <div className="bg-blue-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm">
            <p>
              <strong>理쒓렐 湲곕줉:</strong> {latestWorkoutInfo.exerciseName} - {latestWorkoutInfo.weight}kg &times; {latestWorkoutInfo.reps}??({latestWorkoutInfo.sets}?명듃)
              <span className={latestWorkoutInfo.allSuccess ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                ({latestWorkoutInfo.allSuccess ? '?깃났' : '?ㅽ뙣'})
              </span>
            </p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            硫붿씤 ?대룞: <span className="text-blue-600 dark:text-blue-400">{mainExercise.name}</span>
          </h2>
          {/* ?댁떇 ??대㉧ */}
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
                placeholder="臾닿쾶"
              />
              <span className="text-gray-400">kg</span>
              <input
                type="number"
                value={set.reps}
                onChange={(e) => handleRepsChange(Number(e.target.value), index, true)}
                className="w-full p-2 text-center border border-gray-300 rounded-md dark:bg-gray-700"
                placeholder="?잛닔"
              />
              <span className="text-gray-400">??/span>
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
      
      {/* 蹂댁“ ?대룞 */}
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">蹂댁“ ?대룞</h2>
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
        <Button onClick={addAccessoryExercise} variant="outline" className="w-full" icon={<Plus size={16} />}>
          蹂댁“ ?대룞 異붽?
        </Button>
      </div>

      {/* 硫붾え */}
      <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <label htmlFor="notes" className="text-lg font-semibold text-gray-800 dark:text-white">硫붾え</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700" />
      </div>

      {/* ???踰꾪듉 */}
      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={!isFormValid} size="lg" className="w-full">
          <Save size={20} className="mr-2" />
          ?대룞 湲곕줉 ???        </Button>
      </div>
    </div>
  );
};

export default WorkoutForm;
