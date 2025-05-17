import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import { ExercisePart, Workout } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { X } from 'lucide-react';
import Badge from '../common/Badge';
// 유틸리티 함수 import
import { getPartLabel, getPartColor, formatShortDate } from '../../utils/workoutUtils';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 운동 부위 옵션
const partOptions = [
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'shoulder', label: '어깨' },
  { value: 'leg', label: '하체' },
  { value: 'biceps', label: '이두' },
  { value: 'triceps', label: '삼두' }
];

// 운동 종류 옵션 (부위별로 그룹화)
const exerciseOptions: Record<string, { value: string; label: string }[]> = {
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    { value: 'inclineBenchPress', label: '인클라인 벤치 프레스' },
    { value: 'declineBenchPress', label: '디클라인 벤치 프레스' },
    { value: 'cableFly', label: '케이블 플라이' },
    { value: 'dumbbellFly', label: '덤벨 플라이' }
  ],
  back: [
    { value: 'deadlift', label: '데드리프트' },
    { value: 'barbellRow', label: '바벨로우' },
    { value: 'tBarRow', label: '티바로우' },
    { value: 'latPulldown', label: '랫 풀다운' },
    { value: 'seatedRow', label: '시티드 로우' },
    { value: 'pullUp', label: '풀업' }
  ],
  shoulder: [
    { value: 'overheadPress', label: '오버헤드 프레스' },
    { value: 'lateralRaise', label: '레터럴 레이즈' },
    { value: 'frontRaise', label: '프론트 레이즈' },
    { value: 'facePull', label: '페이스 풀' },
    { value: 'reverseFly', label: '리버스 플라이' }
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    { value: 'lunges', label: '런지' },
    { value: 'legExtension', label: '레그 익스텐션' },
    { value: 'legCurl', label: '레그 컬' }
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
  ]
};

// 기간 옵션
const periodOptions = [
  { value: '1month', label: '1개월' },
  { value: '3months', label: '3개월' },
  { value: '6months', label: '6개월' },
  { value: '1year', label: '1년' }
];

// 세트 구성 옵션
const setConfigOptions = [
  { value: 'all', label: '전체' },
  { value: '5x5', label: '5회 x 5세트' },
  { value: '10x5', label: '10회 x 5세트' },
  { value: '15x5', label: '15회 x 5세트' },
  { value: '6x3', label: '6회 x 3세트' }
];

const WorkoutGraph: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPart, setSelectedPart] = useState<string>('chest');
  const [selectedExercise, setSelectedExercise] = useState<string>('benchPress');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1month');
  const [selectedSetConfig, setSelectedSetConfig] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 실제 데이터를 저장할 상태
  const [workoutData, setWorkoutData] = useState<Workout[]>([]);
  const [filteredData, setFilteredData] = useState<Workout[]>([]);
  
  // 클릭한 운동 데이터 관리 상태
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [dateWorkoutMap, setDateWorkoutMap] = useState<Record<string, Workout>>({});
  
  // 차트 데이터
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  
  // 차트 옵션
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label || '';
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            
            if (value === null) return null;
            
            // 라벨에서 운동 이름과 세트 구성 추출
            const labelMatch = label.match(/^(.+) \((.+)\)$/);
            const exerciseName = labelMatch ? labelMatch[1] : label;
            const setConfig = labelMatch ? labelMatch[2] : '';
            
            let tooltipText = `${exerciseName}: ${value} kg`;
            if (setConfig) {
              tooltipText += ` (${setConfig})`;
            }
            
            // 해당 날짜의 데이터가 있을 경우 추가 정보 표시
            const dateLabel = context.chart.data.labels?.[context.dataIndex] as string;
            if (dateLabel && dateWorkoutMap[dateLabel]) {
              const workout = dateWorkoutMap[dateLabel];
              
              // 같은 운동 이름을 찾아 세트 정보 추출
              if (workout.mainExercise && workout.mainExercise.name === exerciseName) {
                const sets = workout.mainExercise.sets;
                if (sets && sets.length > 0) {
                  // 세트별 성공/실패 정보 추가
                  const successCount = sets.filter(set => set.isSuccess).length;
                  const failCount = sets.filter(set => set.isSuccess === false).length;
                  const pendingCount = sets.filter(set => set.isSuccess === null).length;
                  
                  tooltipText += `\n세트 구성: ${sets.length}세트 x ${sets[0].reps}회`;
                  tooltipText += `\n성공: ${successCount}, 실패: ${failCount}`;
                  
                  if (pendingCount > 0) {
                    tooltipText += `, 미완료: ${pendingCount}`;
                  }
                }
              }
              
              // 보조 운동 정보 추가 (메인 운동과 동일한 경우만)
              if (workout.mainExercise && workout.mainExercise.name === exerciseName) {
                if (workout.accessoryExercises && workout.accessoryExercises.length > 0) {
                  tooltipText += '\n보조 운동:';
                  workout.accessoryExercises.forEach(exercise => {
                    tooltipText += `\n- ${exercise.name}`;
                  });
                }
              }
            }
            
            return tooltipText;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '무게 (kg)'
        }
      },
      x: {
        title: {
          display: true,
          text: '날짜'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        segment: {
          borderColor: (ctx) => {
            const index1 = ctx.p0.parsed.x;
            const index2 = ctx.p1.parsed.x;
            const dataset = ctx.p0.dataset;
            
            for (let i = index1 + 1; i < index2; i++) {
              if (dataset.data[i] === null) {
                return 'transparent';
              }
            }
            
            return dataset.borderColor;
          }
        }
      }
    },
    onClick: (event, elements, chart) => {
      if (elements.length === 0) return;
      
      const clickedElement = elements[0];
      const dataIndex = clickedElement.index;
      const label = chart.data.labels?.[dataIndex] as string;
      
      if (label && dateWorkoutMap[label]) {
        setSelectedWorkout(dateWorkoutMap[label]);
      }
    }
  };
  
  // 차트 데이터 준비
  const prepareChartData = (data: Workout[]) => {
    try {
      if (!data || data.length === 0) {
        setChartData({
          labels: [],
          datasets: []
        });
        setDateWorkoutMap({});
        return;
      }
      
      // 날짜별 운동 데이터 맵 생성
      const newDateWorkoutMap: Record<string, Workout> = {};
      
      // 중복 제거 및 정렬된 날짜 배열 준비
      const allDates: string[] = [];
      
      // 운동 종류별, 세트 구성별로 데이터 구성
      // 구조: { 운동이름: { 세트구성: { 날짜: 무게 } } }
      const exerciseConfigData: Record<string, Record<string, Record<string, number>>> = {};
      
      data.forEach(workout => {
        if (!workout.mainExercise || !workout.mainExercise.sets || workout.mainExercise.sets.length === 0) return;
        
        const dateStr = formatShortDate(new Date(workout.date));
        allDates.push(dateStr);
        
        // 날짜별 운동 기록 저장 (클릭 이벤트용)
        if (!newDateWorkoutMap[dateStr] || new Date(workout.date) > new Date(newDateWorkoutMap[dateStr].date)) {
          newDateWorkoutMap[dateStr] = workout;
        }
        
        // 운동 이름 가져오기
        const exerciseName = workout.mainExercise.name;
        
        // 세트 구성 확인
        const sets = workout.mainExercise.sets;
        let setConfig = '';
        
        if (sets.length === 5 && sets.every(set => set.reps === 5)) {
          setConfig = '5x5';
        } else if (sets.length === 3 && sets.every(set => set.reps === 6)) {
          setConfig = '6x3';
        } else if (sets.length === 5 && sets.every(set => set.reps === 10)) {
          setConfig = '10x5';
        } else if (sets.length === 5 && sets.every(set => set.reps === 15)) {
          setConfig = '15x5';
        } else {
          // 표준 세트 구성이 아닌 경우 건너뛰기
          return;
        }
        
        // 운동 별 데이터 초기화 (존재하지 않을 경우)
        if (!exerciseConfigData[exerciseName]) {
          exerciseConfigData[exerciseName] = {
            '5x5': {},
            '6x3': {},
            '10x5': {},
            '15x5': {}
          };
        }
        
        // 세트 중 최대 무게 찾기 (성공/실패 관계 없이)
        let maxWeight = 0;
        sets.forEach(set => {
          // 모든 세트의 무게 데이터 (성공, 실패 모두 포함)
          if (set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
        
        // 세트 구성별 데이터에 저장
        if (maxWeight > 0) {
          exerciseConfigData[exerciseName][setConfig][dateStr] = maxWeight;
        }
      });
      
      // 날짜별 운동 데이터 맵 업데이트
      setDateWorkoutMap(newDateWorkoutMap);
      
      // 중복 제거 및 정렬된 날짜 배열
      const uniqueDates = [...new Set(allDates)].sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
      
      // 세트 구성별 색상 정의
      const configColors = {
        '5x5': { border: 'rgb(124, 58, 237)', background: 'rgba(124, 58, 237, 0.5)' }, // 보라색
        '6x3': { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.5)' }, // 파란색
        '10x5': { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.5)' }, // 빨간색
        '15x5': { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.5)' } // 초록색
      };
      
      // 운동 종류별 포인트 모양 정의
      const exercisePointStyles: Record<string, string> = {
        // 하체 운동
        '스쿼트': 'triangle', // 삼각형
        '레그 프레스': 'circle', // 원형
        '런지': 'rect', // 사각형
        '레그 익스텐션': 'rectRounded', // 둥근 사각형
        '레그 컬': 'rectRot', // 회전된 사각형
        
        // 가슴 운동
        '벤치 프레스': 'triangle',
        '인클라인 벤치 프레스': 'circle',
        '디클라인 벤치 프레스': 'rect',
        
        // 등 운동
        '데드리프트': 'triangle',
        '바벨로우': 'circle',
        '티바로우': 'rect',
        
        // 어깨 운동
        '오버헤드 프레스': 'triangle',
        '레터럴 레이즈': 'circle',
        
        // 이두 운동
        '덤벨 컬': 'triangle',
        '바벨 컬': 'circle',
        '해머 컬': 'rect',
        
        // 삼두 운동
        '케이블 푸시다운': 'triangle',
        '오버헤드 익스텐션': 'circle',
        '라잉 트라이셉스 익스텐션': 'rect'
      };
      
      // 데이터셋 생성
      const datasets: any[] = [];
      
      // 각 운동과 세트 구성에 대한 데이터셋 생성
      Object.entries(exerciseConfigData).forEach(([exerciseName, configData]) => {
        // 운동별 포인트 스타일 결정
        const pointStyle = exercisePointStyles[exerciseName] || 'circle'; // 기본값은 원형
        
        // 각 세트 구성별 데이터셋 생성
        Object.entries(configData).forEach(([config, dateData]) => {
          // 데이터가 없으면 건너뛰기
          if (Object.keys(dateData).length === 0) return;
          
          const configColor = configColors[config as keyof typeof configColors];
          
          // 동일한 운동+세트 구성에 한하여 선으로 연결하도록 처리
          // 이를 위해 운동별 구분된 ID 생성
          const datasetId = `${exerciseName}-${config}`;
          
          datasets.push({
            label: `${exerciseName} (${config})`,
            data: uniqueDates.map(date => dateData[date] || null),
            borderColor: configColor.border,
            backgroundColor: configColor.background,
            tension: 0.2,
            pointRadius: 6,
            pointStyle: pointStyle, // 운동 종류별 다른 포인트 모양
            pointBackgroundColor: uniqueDates.map(date => 
              dateData[date] ? configColor.border : 'transparent'
            ),
            pointBorderColor: uniqueDates.map(date => 
              dateData[date] ? configColor.border : 'transparent'
            ),
            pointHoverRadius: 8,
            pointHoverBackgroundColor: configColor.background,
            pointHitRadius: 10,
            id: datasetId, // 데이터셋 고유 ID
            spanGaps: false // 데이터 없는 부분은 선으로 연결하지 않음
          });
        });
      });
      
      setChartData({
        labels: uniqueDates,
        datasets: datasets
      });
    } catch (error) {
      console.error('차트 데이터 변환 오류:', error);
    }
  };
  
  // Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!currentUser) {
        setError('로그인이 필요합니다');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 기간에 따른 날짜 범위 계산
        const endDate = new Date();
        let startDate = new Date();
        
        switch (selectedPeriod) {
          case '1month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case '6months':
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 1);
        }
        
        // Firestore 쿼리 구성
        const sessionsCollection = collection(db, 'sessions');
        const q = query(
          sessionsCollection,
          where('userId', '==', currentUser.uid),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // 쿼리 결과 파싱
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date.toDate()),
        })) as Workout[];
        
        setWorkoutData(data);
        // 초기 필터 적용
        applyFilters(data);
        
      } catch (error) {
        console.error('운동 데이터 로드 오류:', error);
        setError('운동 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutData();
  }, [currentUser, selectedPeriod]);
  
  // 필터링 기능
  const applyFilters = (data = workoutData) => {
    try {
      let filtered = [...data];
      
      // 부위 필터링
      filtered = filtered.filter(item => item.part === selectedPart);
      
      // 운동 종류 필터링
      if (selectedExercise !== 'all') {
        filtered = filtered.filter(item => 
          item.mainExercise && item.mainExercise.name.includes(
            exerciseOptions[selectedPart].find(opt => opt.value === selectedExercise)?.label || ''
          )
        );
      }
      
      // 세트 구성 필터링 (실제 세트 구성에 따라 필터링)
      if (selectedSetConfig !== 'all') {
        filtered = filtered.filter(item => {
          if (!item.mainExercise || !item.mainExercise.sets || item.mainExercise.sets.length === 0) {
            return false;
          }
          
          // 세트 개수와 반복 횟수로 필터링
          const sets = item.mainExercise.sets;
          
          if (selectedSetConfig === '5x5') {
            return sets.length === 5 && sets.every(set => set.reps === 5);
          } else if (selectedSetConfig === '10x5') {
            return sets.length === 5 && sets.every(set => set.reps === 10);
          } else if (selectedSetConfig === '15x5') {
            return sets.length === 5 && sets.every(set => set.reps === 15);
          } else if (selectedSetConfig === '6x3') {
            return sets.length === 3 && sets.every(set => set.reps === 6);
          }
          
          return false;
        });
      }
      
      setFilteredData(filtered);
      
      // 차트 데이터 변환
      prepareChartData(filtered);
    } catch (error) {
      console.error('필터 적용 오류:', error);
    }
  };
  
  // 필터 변경 시 데이터 재필터링
  useEffect(() => {
    applyFilters();
  }, [selectedPart, selectedExercise, selectedSetConfig]);
  
  // 부위 변경 핸들러
  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const part = e.target.value;
    setSelectedPart(part);
    // 부위 변경 시 운동 선택 초기화
    setSelectedExercise('all');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 그래프와 운동 기록을 함께 표시하는 섹션 */}
      <Card className="animate-slideUp">
        <h3 className="text-lg font-semibold mb-4">운동 성과 그래프</h3>
        
        {/* 부위 선택 필터 추가 */}
        <div className="mb-6">
          <div className="flex items-center flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {partOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPart(option.value)}
                className={`
                  py-2 px-4 rounded-lg flex items-center transition-all duration-300 text-sm font-medium
                  ${selectedPart === option.value 
                    ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 왼쪽: 그래프 */}
          <div className="flex-1">
            {filteredData.length > 0 ? (
              <div className="h-120">
                <Line options={chartOptions} data={chartData} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {`${partOptions.find(p => p.value === selectedPart)?.label || ''} 부위의 운동 데이터가 없습니다.`}
                </p>
              </div>
            )}
          </div>
          
          {/* 오른쪽: 선택된 운동 상세 정보 */}
          <div className="lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-4">
            {selectedWorkout ? (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">선택된 운동 상세 정보</h4>
                  <Button 
                    size="sm" 
                    className="bg-transparent text-gray-500 hover:text-gray-700 p-1"
                    onClick={() => setSelectedWorkout(null)}
                    icon={<X size={18} />}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">
                      {typeof selectedWorkout.date === 'string' 
                        ? new Date(selectedWorkout.date).toLocaleDateString() 
                        : selectedWorkout.date.toLocaleDateString()}
                    </Badge>
                    <Badge variant="secondary">{getPartLabel(selectedWorkout.part)}</Badge>
                    <Badge variant={selectedWorkout.isAllSuccess ? 'success' : 'danger'}>
                      {selectedWorkout.isAllSuccess ? '성공' : '일부 실패'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedWorkout.mainExercise?.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {selectedWorkout.mainExercise?.sets?.map((set, index) => (
                        <div 
                          key={index}
                          className={`p-2 rounded-lg text-sm ${
                            set.isSuccess 
                              ? 'bg-green-50 dark:bg-green-900/30 border-l-2 border-green-500' 
                              : 'bg-red-50 dark:bg-red-900/30 border-l-2 border-red-500'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">세트 {index + 1}</span>
                            <Badge 
                              variant={set.isSuccess ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {set.isSuccess ? '성공' : '실패'}
                            </Badge>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">무게</span>
                              <p className="font-bold">{set.weight} kg</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">횟수</span>
                              <p className="font-bold">{set.reps} 회</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 보조 운동 정보 표시 */}
                  {selectedWorkout.accessoryExercises && selectedWorkout.accessoryExercises.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mt-3">보조 운동</h4>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {selectedWorkout.accessoryExercises.map((exercise, index) => (
                          <div 
                            key={index}
                            className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                          >
                            <p className="font-medium">{exercise.name}</p>
                            {exercise.sets && exercise.sets.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {exercise.sets.map((set, setIndex) => (
                                  <div key={setIndex} className="text-xs flex justify-between">
                                    <span>세트 {setIndex + 1}:</span>
                                    <span>{set.weight}kg × {set.reps}회</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs flex justify-between">
                                {exercise.weight && <span>무게: {exercise.weight}kg</span>}
                                {exercise.reps && <span>반복: {exercise.reps}회</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedWorkout.notes && (
                    <div>
                      <h4 className="font-medium text-sm">메모</h4>
                      <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mt-1 text-sm">{selectedWorkout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="mb-2">그래프의 데이터 포인트를 클릭하면</p>
                  <p>해당 일자의 운동 상세 기록이 여기에 표시됩니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkoutGraph; 