import React, { useState } from 'react';
import { 
  ExercisePart, 
  ChestMainExercise, 
  BackMainExercise, 
  ShoulderMainExercise, 
  LegMainExercise,
  BicepsMainExercise,
  TricepsMainExercise,
  MainExerciseType
} from '../../types';

interface WorkoutData {
  date: string;
  weight: number;
  isSuccess: boolean;
  sets?: Array<{ reps: number; weight: number; isSuccess: boolean }>;
}

interface ExercisePartOption {
  value: ExercisePart;
  label: string;
}

type TimeRange = '1week' | '1month' | '3months' | '6months' | '1year' | 'all';

const exercisePartOptions: ExercisePartOption[] = [
  { value: 'chest',    label: '가슴' },
  { value: 'back',     label: '등' },
  { value: 'shoulder', label: '어깨' },
  { value: 'leg',      label: '하체' },
  { value: 'biceps',   label: '이두' },
  { value: 'triceps',  label: '삼두' }
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

const WorkoutGraph: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [selectedMainExercise, setSelectedMainExercise] = useState<MainExerciseType>('benchPress');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  
  // 선택된 부위에 따른 데이터 필터링 (실제로는 API에서 데이터 가져와야 함)
  const workoutData: Record<string, WorkoutData[]> = {
    // 가슴 운동
    benchPress: [
      { 
        date: '2024-03-01', 
        weight: 80, 
        isSuccess: true,
        sets: [
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true }
        ]
      },
      { 
        date: '2024-03-08', 
        weight: 82.5, 
        isSuccess: true,
        sets: [
          { reps: 10, weight: 82.5, isSuccess: true },
          { reps: 10, weight: 82.5, isSuccess: true },
          { reps: 8, weight: 82.5, isSuccess: true }
        ]
      },
      { 
        date: '2024-03-15', 
        weight: 85, 
        isSuccess: false,
        sets: [
          { reps: 10, weight: 85, isSuccess: true },
          { reps: 8, weight: 85, isSuccess: false },
          { reps: 7, weight: 85, isSuccess: false }
        ]
      },
      { 
        date: '2024-03-22', 
        weight: 85, 
        isSuccess: true,
        sets: [
          { reps: 10, weight: 85, isSuccess: true },
          { reps: 9, weight: 85, isSuccess: true },
          { reps: 8, weight: 85, isSuccess: true }
        ]
      },
      { 
        date: '2024-03-29', 
        weight: 87.5, 
        isSuccess: true,
        sets: [
          { reps: 10, weight: 87.5, isSuccess: true },
          { reps: 10, weight: 87.5, isSuccess: true },
          { reps: 10, weight: 87.5, isSuccess: true }
        ]
      }
    ],
    inclineBenchPress: [
      { date: '2024-03-02', weight: 70, isSuccess: true },
      { date: '2024-03-09', weight: 72.5, isSuccess: true },
      { date: '2024-03-16', weight: 75, isSuccess: true },
      { date: '2024-03-23', weight: 77.5, isSuccess: false }
    ],
    // 등 운동
    deadlift: [
      { date: '2024-03-02', weight: 100, isSuccess: true },
      { date: '2024-03-09', weight: 105, isSuccess: true },
      { date: '2024-03-16', weight: 110, isSuccess: false },
      { date: '2024-03-23', weight: 110, isSuccess: true }
    ],
    pullUp: [
      { date: '2024-03-05', weight: 0, isSuccess: true },
      { date: '2024-03-12', weight: 5, isSuccess: true }, // 가중치 추가
      { date: '2024-03-19', weight: 7.5, isSuccess: true },
      { date: '2024-03-26', weight: 10, isSuccess: false }
    ],
    // 어깨 운동
    overheadPress: [
      { date: '2024-03-03', weight: 60, isSuccess: true },
      { date: '2024-03-10', weight: 62.5, isSuccess: true },
      { date: '2024-03-17', weight: 65, isSuccess: true },
      { date: '2024-03-24', weight: 67.5, isSuccess: false }
    ],
    // 하체 운동
    squat: [
      { date: '2024-03-04', weight: 120, isSuccess: true },
      { date: '2024-03-11', weight: 125, isSuccess: true },
      { date: '2024-03-18', weight: 130, isSuccess: false },
      { date: '2024-03-25', weight: 130, isSuccess: true }
    ],
    // 이두 운동
    dumbbellCurl: [
      { date: '2024-03-05', weight: 15, isSuccess: true },
      { date: '2024-03-12', weight: 17.5, isSuccess: true },
      { date: '2024-03-19', weight: 20, isSuccess: false },
      { date: '2024-03-26', weight: 20, isSuccess: true }
    ],
    // 삼두 운동
    cablePushdown: [
      { date: '2024-03-06', weight: 40, isSuccess: true },
      { date: '2024-03-13', weight: 45, isSuccess: true },
      { date: '2024-03-20', weight: 50, isSuccess: false },
      { date: '2024-03-27', weight: 50, isSuccess: true }
    ]
  };

  // 부위 변경 시 해당 부위의 첫 번째 메인 운동으로 변경
  const handlePartChange = (newPart: ExercisePart) => {
    setSelectedPart(newPart);
    setSelectedMainExercise(mainExerciseOptions[newPart][0].value as MainExerciseType);
  };

  // 필터링된 데이터를 반환하는 함수
  const getFilteredWorkouts = () => {
    const exerciseData = workoutData[selectedMainExercise] || [];
    let filteredWorkouts = [...exerciseData];
    
    // 기간별 필터링
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '1week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case '1month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return filteredWorkouts;
      }
      
      filteredWorkouts = filteredWorkouts.filter(workout => 
        new Date(workout.date) >= startDate
      );
    }
    
    return filteredWorkouts;
  };

  const currentWorkouts = getFilteredWorkouts();
  
  // 정렬된 데이터
  const sortedWorkouts = [...currentWorkouts].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // y축 범위 계산
  const maxWeight = Math.max(...currentWorkouts.map(d => d.weight), 0) + 5; // 상단 여백 추가
  const minWeight = Math.max(0, Math.min(...currentWorkouts.map(d => d.weight)) - 10);
  const range = maxWeight - minWeight > 0 ? maxWeight - minWeight : 10;
  
  // 선택된 메인 운동 이름
  const selectedExerciseLabel = mainExerciseOptions[selectedPart].find(
    option => option.value === selectedMainExercise
  )?.label || '';

  // 그래프 SVG 관련 설정
  const graphHeight = 250;  
  const graphWidth = 600;
  const paddingLeft = 50;   // y축 레이블 공간
  const paddingRight = 20;  // 오른쪽 여백
  const paddingTop = 20;    // 상단 여백
  const paddingBottom = 50; // x축 레이블 공간
  
  // 실제 그래프 영역 크기
  const chartWidth = graphWidth - paddingLeft - paddingRight;
  const chartHeight = graphHeight - paddingTop - paddingBottom;
  
  // x축, y축 데이터 포인트 계산
  const getX = (index: number) => {
    return paddingLeft + (index / (sortedWorkouts.length - 1 || 1)) * chartWidth;
  };
  
  const getY = (weight: number) => {
    return paddingTop + chartHeight - ((weight - minWeight) / range) * chartHeight;
  };
  
  // 선 그래프 경로 생성
  const createLinePath = () => {
    if (sortedWorkouts.length === 0) return '';
    
    let path = `M${getX(0)},${getY(sortedWorkouts[0].weight)}`;
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      path += ` L${getX(i)},${getY(sortedWorkouts[i].weight)}`;
    }
    
    return path;
  };

  // 데이터 포인트 클릭 핸들러
  const handlePointClick = (workout: WorkoutData) => {
    setSelectedWorkout(workout);
  };
  
  // 모달 닫기 핸들러
  const closeModal = () => {
    setSelectedWorkout(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {selectedExerciseLabel} 무게 추이
        </h2>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="flex space-x-2 items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">부위:</label>
            <div className="relative inline-block">
              <select
                value={selectedPart}
                onChange={(e) => handlePartChange(e.target.value as ExercisePart)}
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 appearance-none"
              >
                {exercisePartOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">운동:</label>
            <div className="relative inline-block">
              <select
                value={selectedMainExercise}
                onChange={(e) => setSelectedMainExercise(e.target.value as MainExerciseType)}
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 appearance-none"
              >
                {mainExerciseOptions[selectedPart].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 items-center">
            <label className="text-sm text-gray-600 dark:text-gray-400">기간:</label>
            <div className="relative inline-block">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 appearance-none"
              >
                <option value="all">전체 기간</option>
                <option value="1week">최근 1주</option>
                <option value="1month">최근 1개월</option>
                <option value="3months">최근 3개월</option>
                <option value="6months">최근 6개월</option>
                <option value="1year">최근 1년</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {currentWorkouts.length > 0 ? (
        <div className="relative overflow-x-auto">
          <svg width={graphWidth} height={graphHeight} className="mx-auto">
            {/* Y축 */}
            <line 
              x1={paddingLeft} 
              y1={paddingTop} 
              x2={paddingLeft} 
              y2={paddingTop + chartHeight} 
              stroke="#CBD5E0" 
              strokeWidth="1" 
            />
            
            {/* X축 */}
            <line 
              x1={paddingLeft} 
              y1={paddingTop + chartHeight} 
              x2={paddingLeft + chartWidth} 
              y2={paddingTop + chartHeight} 
              stroke="#CBD5E0" 
              strokeWidth="1" 
            />
            
            {/* Y축 눈금 및 레이블 */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yPos = paddingTop + chartHeight * (1 - ratio);
              const weight = minWeight + range * ratio;
              return (
                <g key={`y-${ratio}`}>
                  <line 
                    x1={paddingLeft - 5} 
                    y1={yPos} 
                    x2={paddingLeft} 
                    y2={yPos} 
                    stroke="#718096" 
                    strokeWidth="1" 
                  />
                  <text 
                    x={paddingLeft - 10} 
                    y={yPos} 
                    textAnchor="end" 
                    dominantBaseline="middle" 
                    fontSize="12" 
                    fill="#718096"
                  >
                    {Math.round(weight)}kg
                  </text>
                  <line 
                    x1={paddingLeft} 
                    y1={yPos} 
                    x2={paddingLeft + chartWidth} 
                    y2={yPos} 
                    stroke="#CBD5E0" 
                    strokeDasharray="3,3" 
                    strokeWidth="1" 
                  />
                </g>
              );
            })}
            
            {/* X축 레이블 */}
            {sortedWorkouts.map((workout, i) => (
              <text 
                key={`x-${i}`} 
                x={getX(i)} 
                y={paddingTop + chartHeight + 20} 
                textAnchor="middle" 
                fontSize="11" 
                fill="#718096"
              >
                {new Date(workout.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </text>
            ))}
            
            {/* 데이터 포인트를 연결하는 선 */}
            <path 
              d={createLinePath()} 
              fill="none" 
              stroke="#3B82F6" 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
            
            {/* 데이터 포인트 */}
            {sortedWorkouts.map((workout, i) => (
              <g key={`point-${i}`} onClick={() => handlePointClick(workout)} style={{ cursor: 'pointer' }}>
                {/* 성공/실패에 따른 데이터 포인트 색상 */}
                <circle 
                  cx={getX(i)} 
                  cy={getY(workout.weight)} 
                  r="6" 
                  fill={workout.isSuccess ? "#10B981" : "#EF4444"} 
                  stroke="white" 
                  strokeWidth="2" 
                />
                
                {/* 무게 레이블 */}
                <text 
                  x={getX(i)} 
                  y={getY(workout.weight) - 12} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fontWeight="bold" 
                  fill={workout.isSuccess ? "#10B981" : "#EF4444"}
                >
                  {workout.weight}kg
                </text>
              </g>
            ))}
          </svg>
          
          {/* 범례 */}
          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2" />
              <span className="text-sm">성공</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2" />
              <span className="text-sm">실패</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            기록된 운동 데이터가 없습니다.
          </p>
        </div>
      )}
      
      {/* 세트 정보 모달 */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedExerciseLabel} - {new Date(selectedWorkout.date).toLocaleDateString('ko-KR')}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={closeModal}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-700 dark:text-gray-300">무게: <span className="font-bold">{selectedWorkout.weight}kg</span></p>
                <span className={`px-2 py-1 text-sm rounded-full ${selectedWorkout.isSuccess 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                >
                  {selectedWorkout.isSuccess ? '성공' : '실패'}
                </span>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">세트 정보</h4>
              {selectedWorkout.sets && selectedWorkout.sets.length > 0 ? (
                <div className="space-y-2">
                  {selectedWorkout.sets.map((set, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div>
                        <span className="font-medium">세트 {index + 1}:</span> {set.weight}kg x {set.reps}회
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        set.isSuccess 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                      }`}>
                        {set.isSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  세트 정보가 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutGraph; 