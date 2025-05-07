import React, { useState, useEffect, useRef } from 'react';
import ExerciseFaq from '../components/exercise/ExerciseFaq';
import NutritionScout from '../components/nutrition/NutritionScout';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import Layout from '../components/common/Layout';

type TabType = 'exercise' | 'nutrition' | 'handbook';
type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';
type ExercisePart = 'chest' | 'back' | 'shoulder' | 'leg' | 'biceps' | 'triceps' | 'abs' | 'cardio';

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  steps: string[];
}

interface CalorieCalculatorInputs {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityLevel: number;
  goal: Goal;
}

interface CalorieCalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 운동 부위별 운동 목록 데이터
const exercisesByPart: Record<ExercisePart, Exercise[]> = {
  chest: [
    {
      id: 'bench_press',
      name: '벤치 프레스',
      description: '가슴과 삼두근을 타겟으로 하는 대표적인 상체 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      steps: [
        '벤치에 누워 양 발을 바닥에 단단히 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 중앙까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '내릴 때는 천천히, 올릴 때는 강하게 밀어올립니다.'
      ]
    },
    {
      id: 'incline_bench_press',
      name: '인클라인 벤치 프레스',
      description: '상부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
      steps: [
        '30-45도 각도로 세팅된 벤치에 등을 기대어 앉습니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 쇄골 상단까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '일반 벤치프레스보다 중량은 약간 낮게 시작하는 것이 좋습니다.'
      ]
    },
    {
      id: 'decline_bench_press',
      name: '디클라인 벤치 프레스',
      description: '하부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
      steps: [
        '10-30도 각도로 아래로 기울어진 벤치에 누워 다리를 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 하단부까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '어깨 관절에 무리가 가지 않도록 주의합니다.'
      ]
    },
    {
      id: 'dumbbell_press',
      name: '덤벨 프레스',
      description: '덤벨을 사용해 가슴 근육을 골고루 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
      steps: [
        '벤치에 누워 양 손에 덤벨을 들고 가슴 옆에 위치시킵니다.',
        '양팔을 동시에 위로 밀어올려 덤벨이 가슴 위쪽에서 가까워지도록 합니다.',
        '천천히 시작 자세로 돌아옵니다.',
        '바벨보다 더 넓은 가동범위로 운동할 수 있습니다.'
      ]
    },
    {
      id: 'chest_fly',
      name: '체스트 플라이',
      description: '가슴 근육을 집중적으로 스트레칭하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
      steps: [
        '벤치에 누워 양 손에 덤벨을 들고 팔을 펴서 가슴 위에 위치시킵니다.',
        '팔꿈치를 약간 구부린 상태로 고정하고 팔을 양 옆으로 벌립니다.',
        '가슴이 충분히 스트레칭되는 지점까지 내린 후 시작 자세로 돌아옵니다.',
        '가슴 근육을 수축시키는 느낌에 집중합니다.'
      ]
    },
    {
      id: 'push_up',
      name: '푸시업',
      description: '체중을 이용한 기본적인 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      steps: [
        '엎드린 자세에서 손은 어깨보다 약간 넓게, 발은 모아 몸을 일직선으로 유지합니다.',
        '팔꿈치를 구부려 가슴이 바닥에 거의 닿을 때까지 몸을 내립니다.',
        '팔을 펴서 시작 자세로 돌아옵니다.',
        '운동 중 몸이 일직선을 유지하도록 주의합니다.'
      ]
    },
    {
      id: 'cable_crossover',
      name: '케이블 크로스오버',
      description: '가슴 중앙과 안쪽 부위를 집중적으로 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
      steps: [
        '케이블 머신 중앙에 서서 양쪽 케이블을 높은 위치에서 잡습니다.',
        '한 발을 앞으로 내밀고 상체를 약간 앞으로 기울입니다.',
        '팔을 앞으로 당겨 가슴 앞에서 손이 교차되게 합니다.',
        '천천히 시작 자세로 돌아옵니다.'
      ]
    }
  ],
  back: [
    {
      id: 'deadlift',
      name: '데드리프트',
      description: '등, 허리, 하체 전체를 사용하는 대표적인 복합 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      steps: [
        '바벨 앞에 발을 어깨너비로 벌리고 선 후 무릎을 굽혀 바를 잡습니다.',
        '등을 곧게 편 상태에서 바벨을 다리와 히프로 들어올립니다.',
        '허리를 곧게 유지한 채 어깨를 뒤로 젖히며 상체를 똑바로 세웁니다.',
        '역순으로 바벨을 내려놓는 동작을 반복합니다.'
      ]
    },
    {
      id: 'pull_up',
      name: '풀업',
      description: '등 넓이와 상부 등을 발달시키는 기초 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      steps: [
        '풀업 바를 어깨너비보다 약간 넓게 잡습니다.',
        '팔을 완전히 펴고 매달린 상태에서 시작합니다.',
        '턱이 바 위로 올라오도록 몸을 끌어올립니다.',
        '천천히 원래 위치로 내려옵니다.'
      ]
    }
  ],
  shoulder: [
    {
      id: 'overhead_press',
      name: '오버헤드 프레스',
      description: '어깨 전체, 특히 전면 삼각근을 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      steps: [
        '바벨을 어깨너비로 잡고 가슴 높이에서 시작합니다.',
        '팔꿈치를 바깥쪽으로 향하게 한 채로 바벨을 머리 위로 밀어올립니다.',
        '팔이 완전히 펴질 때까지 밀어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    },
    {
      id: 'lateral_raise',
      name: '래터럴 레이즈',
      description: '측면 삼각근을 타겟으로 하는 어깨 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      steps: [
        '덤벨을 양손에 들고 팔을 옆구리에 붙인 채로 서 있습니다.',
        '팔꿈치를 약간 구부린 상태로 고정합니다.',
        '덤벨을 어깨 높이까지 들어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    }
  ],
  leg: [
    {
      id: 'squat',
      name: '스쿼트',
      description: '하체 전체를 발달시키는 가장 기본적인 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=1oed-UmAxFs',
      steps: [
        '바벨을 어깨에 올리고 발을 어깨너비로 벌립니다.',
        '허리를 곧게 펴고 엉덩이를 뒤로 빼면서 무릎을 굽힙니다.',
        '대퇴부가 바닥과 평행해질 때까지 내려갑니다.',
        '발바닥으로 바닥을 강하게 밀며 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'leg_press',
      name: '레그 프레스',
      description: '하체 근육을 타겟으로 하는 기계 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
      steps: [
        '레그 프레스 기계에 앉아 발을 어깨너비로 플랫폼에 놓습니다.',
        '안전 장치를 해제하고 무릎을 가슴쪽으로 굽힙니다.',
        '발로 플랫폼을 밀어 다리를 펴지만, 무릎을 완전히 펴지는 않습니다.',
        '천천히 시작 위치로 돌아옵니다.'
      ]
    }
  ],
  biceps: [
    {
      id: 'barbell_curl',
      name: '바벨 컬',
      description: '이두근을 발달시키는 기본 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
      steps: [
        '어깨너비로 바벨을 잡습니다.',
        '상체를 곧게 유지하고 팔꿈치를 고정합니다.',
        '바벨을 들어올려 이두근을 완전히 수축시킵니다.',
        '천천히 원래 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'dumbbell_curl',
      name: '덤벨 컬',
      description: '양팔을 따로 훈련할 수 있는 이두 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I',
      steps: [
        '양손에 덤벨을 들고 팔을 자연스럽게 내립니다.',
        '팔꿈치를 고정한 채로 덤벨을 어깨쪽으로 들어올립니다.',
        '이두근이 최대로 수축된 상태에서 잠시 멈춥니다.',
        '천천히 원래 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'hammer_curl',
      name: '해머 컬',
      description: '이두근과 전완근을 함께 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk',
      steps: [
        '덤벨을 수직으로 잡고(망치 쥐는 자세) 팔을 내립니다.',
        '팔꿈치를 고정한 채로 덤벨을 어깨쪽으로 들어올립니다.',
        '이두근과 전완근이 수축된 상태에서 잠시 멈춥니다.',
        '천천히 원래 위치로 돌아옵니다.'
      ]
    }
  ],
  triceps: [
    {
      id: 'triceps_pushdown',
      name: '트라이셉스 푸시다운',
      description: '삼두근을 집중적으로 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
      steps: [
        '케이블 머신 앞에 서서 바를 어깨너비로 잡습니다.',
        '팔꿈치를 몸에 붙이고 고정합니다.',
        '팔을 완전히 펴서 케이블을 아래로 밀어냅니다.',
        '천천히 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'overhead_extension',
      name: '오버헤드 익스텐션',
      description: '삼두근의 긴 머리를 타겟으로 하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74',
      steps: [
        '덤벨을 양손으로 잡고 머리 위로 들어올립니다.',
        '팔꿈치를 구부려 덤벨을 머리 뒤로 내립니다.',
        '삼두근을 사용해 팔을 완전히 펴고 덤벨을 들어올립니다.',
        '천천히 원래 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'bench_dips',
      name: '벤치 딥스',
      description: '자신의 체중을 이용한 삼두 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=0326dy_-CzM',
      steps: [
        '두 개의 벤치 사이에 앉아 손을 뒤쪽 벤치에 놓습니다.',
        '다리를 앞으로 뻗고 엉덩이를 벤치에서 떼어 공중에 띄웁니다.',
        '팔꿈치를 구부려 몸을 내립니다.',
        '삼두근을 사용해 몸을 다시 들어올립니다.'
      ]
    }
  ],
  abs: [
    {
      id: 'crunches',
      name: '크런치',
      description: '복부 근육을 발달시키는 기본 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
      steps: [
        '바닥에 누워 무릎을 구부리고 발을 바닥에 붙입니다.',
        '손을 귀 옆에 두거나 가슴에 교차시킵니다.',
        '복부 근육을 사용해 상체를 들어올립니다.',
        '천천히 원래 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'leg_raises',
      name: '레그 레이즈',
      description: '하복부를 타겟으로 하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI',
      steps: [
        '바닥에 누워 손을 몸 옆이나 엉덩이 아래에 둡니다.',
        '다리를 모아 바닥과 평행하게 들어올립니다.',
        '복부 근육을 사용해 다리를 천천히 위로 들어올립니다.',
        '천천히 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'plank',
      name: '플랭크',
      description: '코어 전체를 강화하는 정적 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      steps: [
        '엎드린 자세에서 팔꿈치와 발끝으로 몸을 지지합니다.',
        '몸을 일직선으로 유지합니다.',
        '복부에 힘을 주고 호흡을 유지합니다.',
        '30초에서 1분간 자세를 유지합니다.'
      ]
    }
  ],
  cardio: [
    {
      id: 'treadmill',
      name: '트레드밀 (런닝머신)',
      description: '유산소 운동의 기본 형태로 심폐 지구력을 향상시킵니다.',
      videoUrl: 'https://www.youtube.com/watch?v=9L2b2khySLE',
      steps: [
        '런닝머신에 올라 안전 클립을 부착합니다.',
        '낮은 속도로 시작하여 워밍업을 합니다.',
        '원하는 속도와 경사도로 조절하여 20-30분간 운동합니다.',
        '운동 종료 전 속도를 낮추어 쿨다운합니다.'
      ]
    },
    {
      id: 'cycling',
      name: '싸이클 (실내 자전거)',
      description: '무릎에 부담이 적은 유산소 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=fCXbJ9pky_Y',
      steps: [
        '안장 높이를 조절하여 페달을 밟을 때 무릎이 약간 구부러지도록 합니다.',
        '낮은 저항으로 시작하여 워밍업을 합니다.',
        '원하는 저항과 속도로 20-30분간 운동합니다.',
        '운동 종료 전 저항을 낮추어 쿨다운합니다.'
      ]
    },
    {
      id: 'elliptical',
      name: '일립티컬 트레이너',
      description: '전신을 사용하는 저충격 유산소 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=xLd7zsHtatU',
      steps: [
        '기계에 올라 손잡이를 잡고 페달에 발을 올립니다.',
        '자연스러운 움직임으로 워밍업을 시작합니다.',
        '원하는 저항으로 20-30분간 운동합니다.',
        '운동 종료 전 저항을 낮추어 쿨다운합니다.'
      ]
    }
  ]
};

// 추가: 운동 부위별 아이콘 매핑
const partIcons: Record<ExercisePart, string> = {
  chest: '💪',
  back: '🔙',
  shoulder: '🏋️',
  leg: '🦵',
  biceps: '💪',
  triceps: '💪',
  abs: '🧘',
  cardio: '🏃'
};

const QnaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('exercise');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [handbookSearchTerm, setHandbookSearchTerm] = useState<string>('');
  const [handbookSearchResults, setHandbookSearchResults] = useState<any[]>([]);
  
  // 칼로리 계산기 상태
  const [calculatorInputs, setCalculatorInputs] = useState<CalorieCalculatorInputs>({
    gender: 'male',
    age: 25,
    weight: 70,
    height: 175,
    activityLevel: 1.55, // 보통 수준 (주 3-5회)
    goal: 'maintain'
  });
  
  const [calculatorResults, setCalculatorResults] = useState<CalorieCalculatorResults | null>(null);

  // BMR 계산 (기초 대사량)
  const calculateBMR = (inputs: CalorieCalculatorInputs): number => {
    const { gender, age, weight, height } = inputs;
    
    // 해리스-베네딕트 공식 사용
    if (gender === 'male') {
      return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
    } else {
      return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }
  };
  
  // 칼로리 계산
  const calculateCalories = () => {
    const bmr = calculateBMR(calculatorInputs);
    const tdee = bmr * calculatorInputs.activityLevel;
    
    let targetCalories = tdee;
    if (calculatorInputs.goal === 'lose') {
      targetCalories = tdee * 0.85; // 15% 감소
    } else if (calculatorInputs.goal === 'gain') {
      targetCalories = tdee * 1.15; // 15% 증가
    }
    
    // 영양소 계산
    const protein = calculatorInputs.weight * 2; // 체중 kg당 2g 단백질
    const fat = (targetCalories * 0.25) / 9; // 칼로리의 25%를 지방에서 (1g 지방 = 9 칼로리)
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4; // 나머지 칼로리 (1g 탄수화물 = 4 칼로리)
    
    setCalculatorResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    });
  };
  
  // 입력값 변경 처리
  const handleInputChange = (field: keyof CalorieCalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({ ...prev, [field]: value }));
  };
  
  // 운동 선택 처리
  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };
  
  // 운동 부위 선택 처리
  const handlePartSelect = (part: ExercisePart) => {
    setSelectedPart(part);
    setSelectedExercise(null);
  };
  
  // 운동 부위 레이블
  const getPartLabel = (part: ExercisePart) => {
    const labels: { [key in ExercisePart]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체',
      biceps: '이두',
      triceps: '삼두',
      abs: '복근',
      cardio: '유산소'
    };
    return labels[part];
  };
  
  // 검색어 변경 시 검색 결과 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // 모든 운동 데이터를 하나의 배열로 합침
    const allExercises = Object.values(exercisesByPart).flat();
    
    // 검색어와 일치하는 운동 찾기
    const results = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(term) || 
      ex.description.toLowerCase().includes(term)
    );
    
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };
  
  // 검색 결과에서 운동 선택
  const handleSearchSelect = (exercise: Exercise) => {
    // 해당 운동이 속한 부위 찾기
    for (const [part, exercises] of Object.entries(exercisesByPart)) {
      if (exercises.some(ex => ex.id === exercise.id)) {
        setSelectedPart(part as ExercisePart);
        setSelectedExercise(exercise);
        setSearchTerm(exercise.name);
        setShowDropdown(false);
        break;
      }
    }
  };
  
  // 핸드북 검색
  const handleHandbookSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setHandbookSearchTerm(term);
    
    // ExerciseFaq 컴포넌트에서 사용되는 실제 핸드북 데이터를 가져오기
    const handbookData = [
      { id: 'ex1', title: "운동 전 스트레칭은 꼭 해야 하나요?", content: "운동 전 워밍업과 스트레칭은 부상 방지와 운동 효과 증대를 위해 매우 중요합니다." },
      { id: 'ex2', title: "근육통이 생겼을 때 계속 운동해도 되나요?", content: "가벼운 근육통은 정상이지만, 심한 통증이 있다면 휴식을 취하는 것이 좋습니다." },
      { id: 'nt1', title: "단백질 섭취는 언제 하는 것이 가장 효과적인가요?", content: "운동 후 30분 이내에 섭취하는 것이 근육 회복과 성장에 가장 효과적입니다." },
      { id: 'wt1', title: "체중 감량을 위한 최적의 운동 방법은?", content: "유산소 운동과 근력 운동을 병행하는 것이 가장 효과적입니다. 식이 조절도 중요합니다." },
      { id: 'ex3', title: "하루에 몇 시간 운동하는 것이 적당한가요?", content: "개인의 체력과 목표에 따라 다르지만, 일반적으로 30분~1시간 정도가 적당합니다." },
      { id: 'wt2', title: "어떤 운동이 복부 지방 감소에 가장 효과적인가요?", content: "복부 지방을 집중적으로 감소시키는 운동은 없으며, 전체적인 체지방 감소가 필요합니다." },
      { id: 'ex4', title: "헬스장 없이 집에서 할 수 있는 효과적인 운동은?", content: "체중 운동, 서킷 트레이닝, 요가 등 다양한 홈 트레이닝이 가능합니다." },
      { id: 'sp1', title: "운동 후 단백질 셰이크는 꼭 필요한가요?", content: "필수는 아니지만, 빠른 근육 회복과 성장에 도움이 됩니다." },
      { id: 'ex5', title: "근력 운동과 유산소 운동의 순서는 어떻게 해야 하나요?", content: "목표에 따라 다르며, 근력 향상이 목표라면 근력 운동을 먼저 하는 것이 좋습니다." },
      { id: 'nt2', title: "운동 전후에 탄수화물 섭취가 필요한가요?", content: "운동 전에는 지속적인 에너지 공급을, 운동 후에는 글리코겐 재합성을 위해 필요합니다." }
    ];
    
    if (term.length < 1) {
      setHandbookSearchResults([]);
      return;
    }
    
    const results = handbookData.filter(item => 
      item.title.toLowerCase().includes(term) || 
      item.content.toLowerCase().includes(term)
    );
    
    setHandbookSearchResults(results);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            운동 & 영양 가이드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            올바른 운동 정보 및 영양 가이드
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6">
          {(['exercise', 'nutrition', 'handbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tab === 'exercise' && '운동 정보'}
              {tab === 'nutrition' && '영양 정보'}
              {tab === 'handbook' && '핸드북'}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'exercise' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽: 운동 유형 선택 */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-t-4 border-[#4285F4]">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">운동 정보 검색</h2>
                
                {/* 검색 기능 추가 */}
                <div className="mb-4 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="운동 이름 검색..."
                    onChange={handleSearchChange}
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: '10px center',
                      backgroundSize: '20px',
                    }}
                  />
                  
                  {/* 자동완성 드롭다운 */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                      {searchResults.map(exercise => (
                        <div
                          key={exercise.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleSearchSelect(exercise)}
                        >
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {exercise.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 검색 결과가 없을 때만 운동 부위 선택 버튼 표시 */}
                {!searchTerm && (
                  <>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {(['chest', 'back', 'shoulder', 'leg', 'biceps', 'triceps', 'abs', 'cardio'] as const).map((part) => (
                        <button
                          key={part}
                          onClick={() => handlePartSelect(part)}
                          className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                            selectedPart === part
                              ? 'bg-[#4285F4] text-white shadow-md transform scale-105'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="mr-2">{partIcons[part]}</span>
                          {getPartLabel(part)}
                        </button>
                      ))}
                    </div>
                    
                    {/* 선택된 부위의 운동 목록 */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {partIcons[selectedPart]} {getPartLabel(selectedPart)} 운동 목록
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {exercisesByPart[selectedPart].map((exercise) => (
                          <div 
                            key={exercise.id}
                            className="border rounded-lg transition-all duration-300 overflow-hidden"
                          >
                            {/* 운동 헤더 부분 */}
                            <div 
                              onClick={() => handleExerciseSelect(exercise)}
                              className={`p-4 cursor-pointer ${
                                selectedExercise?.id === exercise.id
                                  ? 'border-[#4285F4] bg-blue-50 dark:bg-blue-900/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {exercise.name}
                                </h4>
                                <span className={`transform transition-transform duration-300 ${
                                  selectedExercise?.id === exercise.id ? 'rotate-180' : ''
                                }`}>
                                  ▼
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {exercise.description}
                              </p>
                            </div>
                            
                            {/* 접히는 상세 내용 부분 */}
                            {selectedExercise?.id === exercise.id && (
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-t border-blue-200 dark:border-blue-800 animate-slideDown">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-blue-200 dark:border-blue-700 pb-2">
                                  수행 방법
                                </h3>
                                <ol className="list-decimal list-inside space-y-3 mb-6 pl-2">
                                  {exercise.steps.map((step, index) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                                {exercise.videoUrl && (
                                  <a 
                                    href={exercise.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-[#4285F4] hover:bg-[#3b78db] text-white rounded-lg shadow transition-colors duration-300"
                                  >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    영상으로 보기
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {/* 검색 결과가 있을 때 표시 */}
                {searchTerm && selectedExercise && (
                  <div className="mt-4 animate-fadeIn">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full text-sm mr-2">
                              {getPartLabel(selectedPart)}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedExercise.name}</h3>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedExercise.description}</p>
                        
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg mb-6">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            수행 방법
                          </h4>
                          <ol className="list-decimal list-inside space-y-3 pl-2">
                            {selectedExercise.steps.map((step, index) => (
                              <li key={index} className="text-gray-700 dark:text-gray-300">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        {selectedExercise.videoUrl && (
                          <div className="text-center">
                            <a 
                              href={selectedExercise.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-6 py-3 bg-[#4285F4] hover:bg-[#3b78db] text-white rounded-lg shadow transition-colors duration-300"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              영상으로 보기
                            </a>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedExercise(null);
                          }}
                          className="mt-6 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          목록으로 돌아가기
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 오른쪽: 1RM 계산기 */}
            <div className="space-y-6">
              <OneRepMaxCalculator />
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽에 목표 칼로리 계산기 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">목표 칼로리 계산기</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">성별</label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="male" 
                          name="gender" 
                          checked={calculatorInputs.gender === 'male'}
                          onChange={() => handleInputChange('gender', 'male')}
                          className="mr-2" 
                        />
                        <label htmlFor="male" className="text-gray-700 dark:text-gray-300">남성</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="female" 
                          name="gender" 
                          checked={calculatorInputs.gender === 'female'}
                          onChange={() => handleInputChange('gender', 'female')}
                          className="mr-2" 
                        />
                        <label htmlFor="female" className="text-gray-700 dark:text-gray-300">여성</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">나이</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">체중 (kg)</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">신장 (cm)</label>
                      <input 
                        type="number" 
                        value={calculatorInputs.height || ''}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">활동 수준</label>
                      <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={calculatorInputs.activityLevel}
                        onChange={(e) => handleInputChange('activityLevel', parseFloat(e.target.value))}
                      >
                        <option value="1.2">거의 운동 안함</option>
                        <option value="1.375">가벼운 운동 (주 1-3회)</option>
                        <option value="1.55">보통 수준 (주 3-5회)</option>
                        <option value="1.725">활발한 운동 (주 6-7회)</option>
                        <option value="1.9">매우 활발함 (하루 2회)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">목표</label>
                    <select 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={calculatorInputs.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value as Goal)}
                    >
                      <option value="lose">체중 감량</option>
                      <option value="maintain">체중 유지</option>
                      <option value="gain">체중 증가</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={calculateCalories}
                    className="w-full bg-[#4285F4] text-white py-2 px-4 rounded-md hover:bg-[#3b78db] mt-4"
                  >
                    계산하기
                  </button>
                  
                  {calculatorResults && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">계산 결과</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">기초 대사량 (BMR)</p>
                          <p className="font-medium">{calculatorResults.bmr.toLocaleString()} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">활동 대사량 (TDEE)</p>
                          <p className="font-medium">{calculatorResults.tdee.toLocaleString()} kcal</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">하루 권장 칼로리</p>
                          <p className="font-medium text-[#4285F4] dark:text-blue-400 text-lg">
                            {calculatorResults.targetCalories.toLocaleString()} kcal
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">단백질</p>
                          <p className="font-medium">{calculatorResults.protein}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.protein / 3)}g/끼니)</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">탄수화물</p>
                          <p className="font-medium">{calculatorResults.carbs}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.carbs / 3)}g/끼니)</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                          <p className="text-xs text-gray-500">지방</p>
                          <p className="font-medium">{calculatorResults.fat}g</p>
                          <p className="text-xs text-gray-400">({Math.round(calculatorResults.fat / 3)}g/끼니)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 오른쪽에 음식 영양성분 확인하기 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">음식 영양성분 확인하기</h2>
              <NutritionScout />
            </div>
          </div>
        )}

        {activeTab === 'handbook' && (
          <div>
            <div className="mb-4 relative">
              <input
                type="text"
                value={handbookSearchTerm}
                className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="핸드북 검색..."
                onChange={handleHandbookSearch}
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'%3E%3C/path%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '10px center',
                  backgroundSize: '20px',
                }}
              />
              
              {/* 핸드북 자동완성 드롭다운 */}
              {handbookSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  {handbookSearchResults.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setHandbookSearchTerm(item.title);
                        // 검색 이벤트 발생 - FAQ 항목 자동 확장을 위해
                        document.dispatchEvent(new CustomEvent('handbookSearch', {
                          detail: { searchTerm: item.title }
                        }));
                        setHandbookSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ExerciseFaq searchTerm={handbookSearchTerm} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
