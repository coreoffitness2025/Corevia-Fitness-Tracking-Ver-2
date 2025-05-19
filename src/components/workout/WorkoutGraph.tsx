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

// 운동 종류별 포인트 모양 정의
const exercisePointStyles: Record<string, string> = {
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
  
  // 하체 운동
  '스쿼트': 'triangle', 
  '레그 프레스': 'circle',
  '런지': 'rect',
  '레그 익스텐션': 'rectRounded',
  '레그 컬': 'rectRot',
  
  // 이두 운동
  '덤벨 컬': 'triangle',
  '바벨 컬': 'circle',
  '해머 컬': 'rect',
  
  // 삼두 운동
  '케이블 푸시다운': 'triangle',
  '오버헤드 익스텐션': 'circle',
  '라잉 트라이셉스 익스텐션': 'rect'
};

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
  const [dateAllWorkoutsMap, setDateAllWorkoutsMap] = useState<Record<string, Workout[]>>({});
  
  // 새로 추가: 선택된 날짜와 해당 날짜의 워크아웃 목록 관리
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutsForSelectedDate, setWorkoutsForSelectedDate] = useState<Workout[]>([]);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number>(0);
  
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
            
            // 해당 날짜의 데이터가 있을 경우 추가 정보 표시 (보조 운동 정보 제외)
            const dateLabel = context.chart.data.labels?.[context.dataIndex] as string;
            if (dateLabel && dateAllWorkoutsMap[dateLabel]) {
              // 해당 날짜의 모든 운동 시도
              const workoutsForDate = dateAllWorkoutsMap[dateLabel];
              
              // 표시 중인 운동 이름과 일치하는 운동 찾기
              const matchingWorkout = workoutsForDate.find(w => 
                w.mainExercise && w.mainExercise.name === exerciseName
              );
              
              if (matchingWorkout) {
                const workout = matchingWorkout;
                
                // 메인 운동 정보 표시
                if (workout.mainExercise) {
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
        },
        ticks: {
          stepSize: 5 // 5kg 단위로 눈금 표시
        },
        // 최소 무게에서 10kg 정도 밑에서 시작하도록 설정
        min: (context) => {
          const minValue = context.chart.data.datasets.reduce((min, dataset) => {
            const dataValues = dataset.data.filter((val): val is number => typeof val === 'number' && val !== null);
            return dataValues.length > 0 ? Math.min(min, Math.min(...dataValues)) : min;
          }, Infinity);
          
          return minValue !== Infinity ? Math.max(0, minValue - 10) : 0;
        },
        // 최대 무게에서 10kg 정도 위에서 끝나도록 설정
        max: (context) => {
          const maxValue = context.chart.data.datasets.reduce((max, dataset) => {
            const dataValues = dataset.data.filter((val): val is number => typeof val === 'number' && val !== null);
            return dataValues.length > 0 ? Math.max(max, Math.max(...dataValues)) : max;
          }, -Infinity);
          
          return maxValue !== -Infinity ? maxValue + 10 : 100;
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
      const dateLabel = chart.data.labels?.[dataIndex] as string;
      
      if (dateLabel) {
        // 클릭한 날짜의 모든 운동 목록
        const workoutsForDate = dateAllWorkoutsMap[dateLabel] || [];
        
        if (workoutsForDate.length > 0) {
          // 선택된 날짜 및 해당 날짜의 운동 목록 설정
          setSelectedDate(dateLabel);
          setWorkoutsForSelectedDate(workoutsForDate);
          setSelectedWorkoutIndex(0); // 첫 번째 운동으로 초기화
          setSelectedWorkout(workoutsForDate[0]); // 첫 번째 운동 선택
        }
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
      
      // 날짜별 모든 운동 기록을 저장하는 맵
      const dateAllWorkoutsMap: Record<string, Workout[]> = {};
      
      // 중복 제거 및 정렬된 날짜 배열 준비
      const allDates: string[] = [];
      
      // 운동 종류별, 세트 구성별로 데이터 구성
      // 구조: { 운동이름: { 세트구성: { 날짜: 무게 } } }
      const exerciseConfigData: Record<string, Record<string, Record<string, number>>> = {};
      
      // 무게의 최소/최대값을 추적하기 위한 변수
      let minWeight = Infinity;
      let maxWeight = -Infinity;
      
      data.forEach(workout => {
        if (!workout.mainExercise || !workout.mainExercise.sets || workout.mainExercise.sets.length === 0) return;
        
        const dateStr = formatShortDate(new Date(workout.date));
        allDates.push(dateStr);
        
        // 날짜별 운동 기록 저장 (클릭 이벤트용)
        // 각 고유한 운동 기록을 날짜+운동이름의 조합으로 저장
        const workoutKey = `${dateStr}-${workout.mainExercise.name}`;
        newDateWorkoutMap[workoutKey] = workout;
        
        // 날짜별 모든 운동 기록 저장
        if (!dateAllWorkoutsMap[dateStr]) {
          dateAllWorkoutsMap[dateStr] = [];
        }
        dateAllWorkoutsMap[dateStr].push(workout);
        
        // 기본 날짜별 맵에도 추가 (호환성 유지)
        if (!newDateWorkoutMap[dateStr]) {
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
        let maxWorkoutWeight = 0;
        sets.forEach(set => {
          // 모든 세트의 무게 데이터 (성공, 실패 모두 포함)
          if (set.weight > maxWorkoutWeight) {
            maxWorkoutWeight = set.weight;
          }
          
          // 전체 최소/최대 무게 업데이트
          if (set.weight > 0) {
            minWeight = Math.min(minWeight, set.weight);
            maxWeight = Math.max(maxWeight, set.weight);
          }
        });
        
        // 세트 구성별 데이터에 저장
        if (maxWorkoutWeight > 0) {
          exerciseConfigData[exerciseName][setConfig][dateStr] = maxWorkoutWeight;
        }
      });
      
      // 날짜별 운동 데이터 맵 업데이트
      setDateWorkoutMap(newDateWorkoutMap);
      
      // 날짜별 모든 운동 기록 맵 업데이트
      setDateAllWorkoutsMap(dateAllWorkoutsMap);
      
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
          
          // 운동별 구분된 ID 생성
          const datasetId = `${exerciseName}-${config}`;
          
          // 포인트 스타일 결정 - 벤치 프레스(6x3)은 항상 삼각형으로 표시
          let pointStyleValue = pointStyle;
          
          // 특정 운동 및 세트 구성 조합에 특별한 포인트 스타일 적용
          if (exerciseName === '벤치 프레스' && config === '6x3') {
            pointStyleValue = 'triangle';
            console.log(`벤치 프레스(6x3) 포인트 스타일 설정됨: triangle`);
          } else if (exerciseName === '데드리프트') {
            pointStyleValue = 'triangle';
          }
          
          console.log(`데이터셋 생성: ${exerciseName} (${config}) - 포인트 스타일: ${pointStyleValue}, 데이터 수: ${Object.keys(dateData).length}`);
          
          datasets.push({
            label: `${exerciseName} (${config})`,
            data: uniqueDates.map(date => dateData[date] || null),
            borderColor: configColor.border,
            backgroundColor: configColor.background,
            tension: 0.2,
            pointRadius: 6,
            pointStyle: pointStyleValue,
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
      
      // 차트 데이터 설정
      const chartData = {
        labels: uniqueDates,
        datasets: datasets
      };
      
      // 최소/최대 무게에 따라 Y축 범위 계산
      if (minWeight !== Infinity && maxWeight !== -Infinity) {
        // 부위별로 다른 Y축 범위 설정
        let yMin = 0;
        let yMax = 0;
        
        // 부위별 적절한 Y축 범위 설정
        switch (selectedPart) {
          case 'shoulder':
            // 어깨 운동도 다른 운동과 동일한 범위 설정
            yMin = Math.max(0, minWeight - 10);
            yMax = maxWeight + 10;
            break;
          case 'leg':
            // 하체 운동은 무게가 높으므로 더 넓은 범위 설정
            yMin = Math.max(0, minWeight - 20);
            yMax = maxWeight + 20;
            break;
          default:
            // 기본 범위 설정
            yMin = Math.max(0, minWeight - 10);
            yMax = maxWeight + 10;
        }
        
        console.log(`부위: ${selectedPart}, 무게 범위: ${minWeight}kg ~ ${maxWeight}kg, Y축 설정: ${yMin}kg ~ ${yMax}kg`);
        
        // 차트 옵션 업데이트
        chartOptions.scales = {
          ...chartOptions.scales,
          y: {
            ...chartOptions.scales?.y,
            min: yMin,
            max: yMax,
            ticks: {
              stepSize: 5  // 5kg 단위로 눈금 표시
            }
          }
        };
      }
      
      setChartData(chartData);
    } catch (error) {
      console.error('차트 데이터 변환 오류:', error);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWorkoutData();
  }, [currentUser, selectedPeriod]);

  // 부위 변경 시 해당 부위의 운동 데이터만 필터링
  useEffect(() => {
    if (workoutData.length > 0) {
      console.log(`부위 변경: ${selectedPart}`);
      
      const filtered = workoutData.filter(workout => {
        return workout.part === selectedPart;
      });
      
      setFilteredData(filtered);
      
      // 선택된 운동 상세 정보 초기화
      setSelectedWorkout(null);
      setSelectedDate(null);
      setWorkoutsForSelectedDate([]);
    }
  }, [selectedPart, workoutData]);
  
  // Firestore에서 데이터 가져오기
  const loadWorkoutData = async () => {
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
  
  // 필터링 기능
  const applyFilters = (data = workoutData) => {
    try {
      let filtered = [...data];
      
      // 부위 필터링 - 선택된 부위만 정확히 포함하도록 수정
      filtered = filtered.filter(item => item.part === selectedPart);
      
      // 운동 종류 필터링
      if (selectedExercise !== 'all') {
        filtered = filtered.filter(item => 
          item.mainExercise && item.mainExercise.name.includes(
            exerciseOptions[selectedPart].find(opt => opt.value === selectedExercise)?.label || ''
          )
        );
      }
      
      // 이 부분을 추가하여 데이터 검증 (디버깅용)
      console.log(`필터링 결과 (${selectedPart}): `, filtered.length, '개의 데이터');
      console.log(`필터링 전 전체 데이터:`, data.length, '개');
      console.log(`필터링된 운동 이름들:`, filtered.map(w => w.mainExercise?.name).join(', '));
      
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
      
      // 같은 날짜에 여러 운동이 있을 경우 모두 유지
      const uniqueWorkouts: Workout[] = [];
      const workoutKeys = new Set<string>();
      
      filtered.forEach(workout => {
        const key = `${workout.date}-${workout.mainExercise?.name || ''}`;
        if (!workoutKeys.has(key)) {
          workoutKeys.add(key);
          uniqueWorkouts.push(workout);
        }
      });
      
      setFilteredData(uniqueWorkouts);
      
      // 차트 데이터 변환 - 부위별 데이터만 사용하도록 수정
      if (filtered.length > 0) {
        prepareChartData(filtered);
      } else {
        // 데이터가 없을 경우 빈 차트 데이터 설정
        setChartData({
          labels: [],
          datasets: []
        });
      }
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
  
  // 이전/다음 운동으로 이동하는 함수
  const navigateWorkout = (direction: 'prev' | 'next') => {
    if (!workoutsForSelectedDate.length) return;
    
    let newIndex = selectedWorkoutIndex;
    if (direction === 'prev') {
      newIndex = (selectedWorkoutIndex - 1 + workoutsForSelectedDate.length) % workoutsForSelectedDate.length;
    } else {
      newIndex = (selectedWorkoutIndex + 1) % workoutsForSelectedDate.length;
    }
    
    setSelectedWorkoutIndex(newIndex);
    setSelectedWorkout(workoutsForSelectedDate[newIndex]);
  };

  // 특정 인덱스의 운동으로 이동하는 함수
  const selectWorkoutByIndex = (index: number) => {
    if (index >= 0 && index < workoutsForSelectedDate.length) {
      setSelectedWorkoutIndex(index);
      setSelectedWorkout(workoutsForSelectedDate[index]);
    }
  };

  // 어깨 운동 그래프 문제 해결 - 어깨 운동 옵션 확인
  useEffect(() => {
    // 어깨 부위 선택 시 데이터 확인
    if (selectedPart === 'shoulder') {
      console.log('어깨 운동 데이터 확인:', filteredData);
      
      // 어깨 운동 데이터에 문제가 있는지 확인
      const shoulderExercises = workoutData.filter(w => w.part === 'shoulder');
      console.log('전체 어깨 운동 데이터:', shoulderExercises);
      
      // 필터링 결과 확인
      console.log('필터링된 어깨 운동 데이터:', filteredData);
    }
  }, [selectedPart, filteredData]);

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 그래프와 필터 */}
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
        
        {/* 그래프 */}
        <div>
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
      </Card>

      {/* 선택된 운동 상세 정보 - 그래프 아래에 배치 */}
      {selectedWorkout && (
        <Card className="animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">선택된 운동 상세 정보</h4>
            <div className="flex items-center gap-2">
              {/* 운동 페이지네이션 컨트롤 */}
              {workoutsForSelectedDate.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateWorkout('prev')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedWorkoutIndex + 1} / {workoutsForSelectedDate.length}
                  </span>
                  
                  <button
                    onClick={() => navigateWorkout('next')}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
              
              <Button 
                size="sm" 
                className="bg-transparent text-gray-500 hover:text-gray-700 p-1"
                onClick={() => setSelectedWorkout(null)}
                icon={<X size={18} />}
              />
            </div>
          </div>
          
          {/* 운동 선택 인터페이스 (같은 날짜의 여러 운동이 있는 경우) */}
          {workoutsForSelectedDate.length > 1 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">운동 선택:</div>
              <div className="flex flex-wrap gap-2">
                {workoutsForSelectedDate.map((workout, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectWorkoutByIndex(idx)}
                    className={`
                      px-3 py-1 text-xs rounded-full 
                      ${selectedWorkoutIndex === idx 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {idx + 1}: {workout.mainExercise?.name || '운동'}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
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
            
            {/* 보조 운동 정보 표시 (선택된 상세 정보에서만 표시) */}
            {selectedWorkout.accessoryExercises && selectedWorkout.accessoryExercises.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mt-3">보조 운동</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {selectedWorkout.accessoryExercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{exercise.name}</p>
                        <Badge variant="secondary" size="sm">
                          {exercise.sets?.length || 0}세트
                        </Badge>
                      </div>
                      
                      {exercise.sets && exercise.sets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div 
                              key={setIndex} 
                              className={`p-1.5 rounded ${
                                set.isSuccess === true 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500' 
                                  : set.isSuccess === false
                                    ? 'bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500'
                                    : 'bg-gray-100 dark:bg-gray-700 border-l-2 border-gray-400'
                              }`}
                            >
                              <div className="flex justify-between text-xs">
                                <span>세트 {setIndex + 1}</span>
                                <span>{set.weight}kg × {set.reps}회</span>
                              </div>
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
        </Card>
      )}
    </div>
  );
};

export default WorkoutGraph; 