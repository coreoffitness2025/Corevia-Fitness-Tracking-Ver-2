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
import { ExercisePart, Workout, FirestoreTimestamp } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { X } from 'lucide-react';
import Badge from '../common/Badge';
// 유틸리티 함수 import
import { getPartLabel, getPartColor, formatShortDate, parseFirestoreDate } from '../../utils/workoutUtils';

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
    { value: 'dumbbellBenchPress', label: '덤벨 벤치 프레스' },
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
    { value: 'dumbbellShoulderPress', label: '덤벨 숄더 프레스' },
    { value: 'lateralRaise', label: '레터럴 레이즈' },
    { value: 'frontRaise', label: '프론트 레이즈' },
    { value: 'facePull', label: '페이스 풀' },
    { value: 'reverseFly', label: '리버스 플라이' }
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    { value: 'romanianDeadlift', label: '루마니안 데드리프트' },
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
  '라잉 트라이셉스 익스텐션': 'rect',
  '덤벨 벤치 프레스': 'star',
  '덤벨 숄더 프레스': 'crossRot',
  '루마니안 데드리프트': 'dash'
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
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0]?.label || '';
          },
          label: (context): string | void => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            
            if (value === null || value === undefined) return;
            
            const labelMatch = label.match(/^(.+) \((.+)\)$/);
            const exerciseName = labelMatch ? labelMatch[1] : label;
            const setConfig = labelMatch ? labelMatch[2] : '';
            
            let tooltipText = `${exerciseName}: ${value} kg`;
            if (setConfig) {
              tooltipText += ` (${setConfig})`;
            }
            
            const dateLabel = context.chart.data.labels?.[context.dataIndex] as string;
            if (dateLabel && dateAllWorkoutsMap[dateLabel]) {
              const workoutsForDate = dateAllWorkoutsMap[dateLabel];
              const matchingWorkout = workoutsForDate.find(w => 
                w.mainExercise && w.mainExercise.name === exerciseName
              );
              if (matchingWorkout?.mainExercise?.sets) {
                const sets = matchingWorkout.mainExercise.sets;
                const successCount = sets.filter(set => set.isSuccess).length;
                const failCount = sets.filter(set => set.isSuccess === false).length;
                const pendingCount = sets.filter(set => set.isSuccess === null).length;
                tooltipText += `\n세트 구성: ${sets.length}세트 x ${sets[0]?.reps || '-'}회`;
                tooltipText += `\n성공: ${successCount}, 실패: ${failCount}`;
                if (pendingCount > 0) tooltipText += `, 미완료: ${pendingCount}`;
              }
            }
            return tooltipText;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        title: {
          display: true,
          text: '무게 (kg)'
        },
        ticks: {
          stepSize: 5
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
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      line: {
        segment: {
          borderColor: (ctx: any) => {
            if (!ctx.p0 || !ctx.p1 || !ctx.p0.dataset) return undefined;
            const index1 = ctx.p0.parsed?.x;
            const index2 = ctx.p1.parsed?.x;
            const dataset = ctx.chart.data.datasets[ctx.p0.datasetIndex];
            if (index1 === undefined || index2 === undefined || !dataset) return undefined;
            for (let i = index1 + 1; i < index2; i++) {
              if (dataset.data[i] === null) return 'transparent';
            }
            return (dataset as any).borderColor;
          }
        }
      }
    },
    onClick: (event, elements, chart) => {
      if (elements.length === 0 || !elements[0]) return;
      const clickedElement = elements[0];
      const dataIndex = clickedElement.index;
      const dateLabel = chart.data.labels?.[dataIndex] as string;
      if (dateLabel) {
        const workoutsForDate = dateAllWorkoutsMap[dateLabel] || [];
        if (workoutsForDate.length > 0) {
          setSelectedDate(dateLabel);
          setWorkoutsForSelectedDate(workoutsForDate);
          setSelectedWorkoutIndex(0);
          setSelectedWorkout(workoutsForDate[0]);
        }
      }
    }
  };
  
  const 안전한_날짜_문자열_변환 = (dateValue: string | Date | FirestoreTimestamp): string => {
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    const parsedDate = parseFirestoreDate(dateValue as any);
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
    }
    return String(dateValue); // 최후의 수단
  };

  // 차트 데이터 준비
  const prepareChartData = (data: Workout[]) => {
    try {
      console.log(`[WorkoutGraph] prepareChartData - 시작, 전달된 데이터 ${data.length}개`);
      if (!data || data.length === 0) {
        setChartData({ labels: [], datasets: [] }); setDateWorkoutMap({}); setDateAllWorkoutsMap({}); return;
      }
      if (selectedPart === 'shoulder') {
          const specificShoulderRecord = data.find(w => w.mainExercise?.name === '오버헤드 프레스' && w.mainExercise?.sets?.some(s => s.weight === 102.5));
          if (specificShoulderRecord) {
            console.log("[WorkoutGraph] prepareChartData - '어깨' 데이터 입력 시 102.5kg 기록:", JSON.stringify({...specificShoulderRecord, date: 안전한_날짜_문자열_변환(specificShoulderRecord.date)}, null, 2));
          } else {
            console.log("[WorkoutGraph] prepareChartData - '어깨' 데이터 입력 시 102.5kg 기록 없음");
          }
      }
      
      const newDateWorkoutMap: Record<string, Workout> = {};
      const newDateAllWorkoutsMap: Record<string, Workout[]> = {};
      const allDates: string[] = [];
      const exerciseConfigData: Record<string, Record<string, Record<string, number>>> = {};
      let minWeight = Infinity;
      let maxWeight = -Infinity;
      let hasValidData = false;

      data.forEach(workout => {
        if (!workout.mainExercise || !workout.mainExercise.sets || workout.mainExercise.sets.length === 0) return;
        const dateObj = parseFirestoreDate(workout.date as unknown as FirestoreTimestamp | Date | string);
        const dateStr = formatShortDate(dateObj);
        allDates.push(dateStr);
        const workoutKey = `${dateStr}-${workout.mainExercise.name}`;
        newDateWorkoutMap[workoutKey] = workout;
        if (!newDateAllWorkoutsMap[dateStr]) newDateAllWorkoutsMap[dateStr] = [];
        newDateAllWorkoutsMap[dateStr].push(workout);
        if (!newDateWorkoutMap[dateStr]) newDateWorkoutMap[dateStr] = workout;
        
        const exerciseName = workout.mainExercise.name;
        const sets = workout.mainExercise.sets;
        let setConfig = '';
        if (sets.length === 5 && sets.every(set => set.reps === 5)) setConfig = '5x5';
        else if (sets.length === 3 && sets.every(set => set.reps === 6)) setConfig = '6x3';
        else if (sets.length === 5 && sets.every(set => set.reps === 10)) setConfig = '10x5';
        else if (sets.length === 5 && sets.every(set => set.reps === 15)) setConfig = '15x5';
        else return;

        if (!exerciseConfigData[exerciseName]) {
          exerciseConfigData[exerciseName] = { '5x5': {}, '6x3': {}, '10x5': {}, '15x5': {} };
        }
        
        let currentMaxWorkoutWeight = 0;
        sets.forEach(set => {
          if (set.weight > currentMaxWorkoutWeight) currentMaxWorkoutWeight = set.weight;
          if (set.weight > 0) {
            minWeight = Math.min(minWeight, set.weight);
            maxWeight = Math.max(maxWeight, set.weight);
            hasValidData = true;
          }
        });

        if (workout.part === 'shoulder' && exerciseName === '오버헤드 프레스') {
             console.log(`[WorkoutGraph] prepareChartData (forEach) - 어깨 '오버헤드 프레스' 처리 중 (${dateStr}, ${setConfig}): currentMaxWorkoutWeight = ${currentMaxWorkoutWeight}`);
        }
        if (currentMaxWorkoutWeight > 0) {
          exerciseConfigData[exerciseName][setConfig][dateStr] = currentMaxWorkoutWeight;
          if (workout.part === 'shoulder' && exerciseName === '오버헤드 프레스') {
             console.log(`[WorkoutGraph] prepareChartData - exerciseConfigData 저장: ['${exerciseName}']['${setConfig}']['${dateStr}'] = ${currentMaxWorkoutWeight}`);
          }
        }
      });
      
      setDateWorkoutMap(newDateWorkoutMap);
      setDateAllWorkoutsMap(newDateAllWorkoutsMap);
      
      const uniqueDates = [...new Set(allDates)].sort((a, b) => new Date(a.split('/').map((s,i) => i === 0 ? '20'+s : s).join('/')).getTime() - new Date(b.split('/').map((s,i) => i === 0 ? '20'+s : s).join('/')).getTime());
      const datasets: any[] = [];
      const configColors = { 
        '5x5': { border: 'rgb(124, 58, 237)', background: 'rgba(124, 58, 237, 0.5)' }, 
        '6x3': { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.5)' }, 
        '10x5': { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.5)' }, 
        '15x5': { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.5)' } 
      };

      Object.entries(exerciseConfigData).forEach(([exerciseName, configData]) => {
        // exercise 객체를 찾아서 part 정보를 가져오기 (data 배열을 참조)
        const originalWorkoutEntry = data.find(w => w.mainExercise?.name === exerciseName);
        const exercisePart = originalWorkoutEntry?.part;

        const basePointStyleFromMap = exercisePointStyles[exerciseName] || 'circle'; 
        Object.entries(configData).forEach(([config, dateData]) => {
          if (Object.keys(dateData).length === 0) return;
          const configColor = configColors[config as keyof typeof configColors];
          const datasetId = `${exerciseName}-${config}`;
          
          let pointStyleValue = basePointStyleFromMap;

          if (exerciseName === '벤치 프레스' || exerciseName === '데드리프트') {
            pointStyleValue = 'triangle';
          } else if (exercisePart === 'leg') { // 하체 부위 운동은 모두 triangle로 설정
            pointStyleValue = 'triangle';
          }
          // 다른 운동 스타일에 대한 특정 조건이 있다면 여기에 추가
          
          if (exerciseName.includes('벤치 프레스') || exercisePart === 'leg') {
            console.log(`[WorkoutGraph] Dataset for: ${exerciseName} (${config}), Part: ${exercisePart}, PointStyle: ${pointStyleValue}`);
          }

          const dataForChart = uniqueDates.map(date => dateData[date] || null);
          
          datasets.push({
            data: dataForChart, 
            pointStyle: pointStyleValue, 
            label: `${exerciseName} (${config})`, 
            borderColor: configColor.border, 
            backgroundColor: configColor.background, 
            tension: 0.2, 
            pointRadius: 6, 
            pointBackgroundColor: uniqueDates.map(date => dateData[date] ? configColor.border : 'transparent'), 
            pointBorderColor: uniqueDates.map(date => dateData[date] ? configColor.border : 'transparent'), 
            pointHoverRadius: 8, 
            pointHoverBackgroundColor: configColor.background, 
            pointHitRadius: 10, 
            id: datasetId, 
            spanGaps: false 
          });
        });
      });
      
      console.log(`[WorkoutGraph] prepareChartData - 최종 계산된 minWeight: ${minWeight}, maxWeight: ${maxWeight} (어깨 부위: ${selectedPart === 'shoulder'})`);
      
      let yMin, yMax;
      if (hasValidData) {
        const padding = selectedPart === 'leg' ? 20 : 10; // 하체는 범위 여유를 더 줌
        yMin = Math.max(0, minWeight - padding); // 0 이하로 내려가지 않도록
        yMax = maxWeight + padding;
        if (yMin === yMax) { // 모든 데이터 포인트가 같을 경우
          yMin = Math.max(0, yMin - 5);
          yMax = yMax + 5;
        }
        console.log(`[WorkoutGraph] Y축 범위 동적 설정 - 부위: ${selectedPart}, 계산된 min: ${yMin}, max: ${yMax}`);
      } else {
        // 유효한 데이터가 없을 경우 기본 범위 (예: 0-100)
        yMin = 0;
        yMax = 100;
        console.log(`[WorkoutGraph] Y축 범위 기본값 사용 (유효 데이터 없음)`);
      }

      const finalChartData = { labels: uniqueDates, datasets };

      // 차트 옵션을 직접 수정하는 대신, 차트 데이터와 함께 옵션을 전달하거나
      // 차트가 업데이트될 때 옵션을 적용하는 것이 더 일반적입니다.
      // 여기서는 기존 방식을 유지하되, beginAtZero 관련 직접 조작은 제거합니다.
      const updatedOptions = JSON.parse(JSON.stringify(chartOptions)); // 옵션 객체 깊은 복사
      if (updatedOptions.scales?.y) {
        updatedOptions.scales.y.min = yMin;
        updatedOptions.scales.y.max = yMax;
      }
      // setChartData 호출 시 options를 함께 넘길 수 있다면 좋지만, react-chartjs-2에서는 props로 전달
      // 이 경우에는 chartOptions 상태를 만들고 그걸 업데이트해야 할 수 있음.
      // 일단은 기존처럼 chartOptions 객체를 직접 수정하는 방식을 임시로 유지 (하지만 권장되지 않음)
      if (chartOptions.scales?.y) {
        chartOptions.scales.y.min = yMin;
        chartOptions.scales.y.max = yMax;
      }

      setChartData(finalChartData); // options는 컴포넌트 prop으로 전달되므로, 여기서 직접 수정해도 다음 렌더링에 반영 안될 수 있음
                                  // 차트 업데이트를 위해서는 Chart.js 인스턴스의 update() 메소드를 사용하거나, 
                                  // options prop 자체를 변경해야 함. 
                                  // 가장 간단한 해결책은 y축 min/max를 상태로 관리하고, 이를 options prop에 바인딩하는 것.
                                  // 하지만 현재 구조에서는 options를 직접 수정하는 것으로 두겠음.

    } catch (error) { console.error('[WorkoutGraph] prepareChartData 오류:', error); }
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
      
      console.log('[WorkoutGraph] loadWorkoutData - selectedPeriod:', selectedPeriod);

      switch (selectedPeriod) {
        case '1month': startDate.setMonth(startDate.getMonth() - 1); break;
        case '3months': startDate.setMonth(startDate.getMonth() - 3); break;
        case '6months': startDate.setMonth(startDate.getMonth() - 6); break;
        case '1year': startDate.setFullYear(startDate.getFullYear() - 1); break;
        default: startDate.setMonth(startDate.getMonth() - 1);
      }
      console.log('[WorkoutGraph] loadWorkoutData - Firestore 쿼리 날짜 범위:', startDate.toLocaleDateString(), '~', endDate.toLocaleDateString());
      
      const sessionsCollection = collection(db, 'sessions');
      const q = query(sessionsCollection, where('userId', '==', currentUser.uid), where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: parseFirestoreDate(doc.data().date as unknown as FirestoreTimestamp | Date | string),
      })) as Workout[];
      
      console.log(
        '[WorkoutGraph] loadWorkoutData - Firestore에서 가져온 데이터 (workoutData 첫 5개):\n',
        JSON.stringify(
          data.slice(0, 5).map(d => {
            return {
              ...d,
              date: 안전한_날짜_문자열_변환(d.date)
            };
          }),
          null,
          2
        )
      );
      const shoulderDataLoaded = data.filter(w => w.part === 'shoulder');
      console.log(`[WorkoutGraph] loadWorkoutData - Firestore 데이터 중 '어깨' 기록 ${shoulderDataLoaded.length}개`);
      const specificShoulderRecordLoaded = shoulderDataLoaded.find(w => w.mainExercise?.name === '오버헤드 프레스' && w.mainExercise?.sets?.some(s => s.weight === 102.5));
      if (specificShoulderRecordLoaded) {
          console.log("[WorkoutGraph] loadWorkoutData - Firestore '어깨' 중 102.5kg 기록:", JSON.stringify({...specificShoulderRecordLoaded, date: 안전한_날짜_문자열_변환(specificShoulderRecordLoaded.date)},null,2));
      } else {
          console.log("[WorkoutGraph] loadWorkoutData - Firestore '어깨' 중 102.5kg 기록 없음");
      }

      setWorkoutData(data);
      applyFilters(data);
    } catch (error) { console.error('[WorkoutGraph] loadWorkoutData 오류:', error); setError('운동 데이터를 불러오는 중 오류가 발생했습니다.'); } finally { setLoading(false); }
  };
  
  // 필터링 기능
  const applyFilters = (dataToFilter = workoutData) => {
    try {
      let filtered = [...dataToFilter];
      console.log(`[WorkoutGraph] applyFilters - 시작, 데이터 ${filtered.length}개, 선택된 부위: ${selectedPart}, 운동: ${selectedExercise}, 세트구성: ${selectedSetConfig}`);

      filtered = filtered.filter(item => item.part === selectedPart);
      console.log(`[WorkoutGraph] applyFilters - 부위 필터링 후 (${selectedPart}): ${filtered.length}개`);
      if (selectedPart === 'shoulder') {
        const specificShoulderRecord = filtered.find(w => w.mainExercise?.name === '오버헤드 프레스' && w.mainExercise?.sets?.some(s => s.weight === 102.5));
        if (specificShoulderRecord) {
            console.log("[WorkoutGraph] applyFilters - '어깨' 부위 필터링 후 102.5kg 기록:", JSON.stringify({...specificShoulderRecord, date: 안전한_날짜_문자열_변환(specificShoulderRecord.date)},null,2));
        } else {
            console.log("[WorkoutGraph] applyFilters - '어깨' 부위 필터링 후 102.5kg 기록 없음");
        }
      }

      if (selectedExercise !== 'all') {
        filtered = filtered.filter(item => 
          item.mainExercise && item.mainExercise.name.includes(
            exerciseOptions[selectedPart]?.find(opt => opt.value === selectedExercise)?.label || ''
          )
        );
      }
      console.log(`[WorkoutGraph] applyFilters - 운동 종류 필터링 후 (${selectedExercise}): ${filtered.length}개`);
       if (selectedPart === 'shoulder') {
        const specificShoulderRecord = filtered.find(w => w.mainExercise?.name === '오버헤드 프레스' && w.mainExercise?.sets?.some(s => s.weight === 102.5));
        if (specificShoulderRecord) {
            console.log("[WorkoutGraph] applyFilters - '어깨' 운동종류 필터링 후 102.5kg 기록:", JSON.stringify({...specificShoulderRecord, date: 안전한_날짜_문자열_변환(specificShoulderRecord.date)},null,2));
        } else {
            console.log("[WorkoutGraph] applyFilters - '어깨' 운동종류 필터링 후 102.5kg 기록 없음");
        }
      }

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
      console.log(`[WorkoutGraph] applyFilters - 세트 구성 필터링 후 (${selectedSetConfig}): ${filtered.length}개`);
       if (selectedPart === 'shoulder') {
        const specificShoulderRecord = filtered.find(w => w.mainExercise?.name === '오버헤드 프레스' && w.mainExercise?.sets?.some(s => s.weight === 102.5));
        if (specificShoulderRecord) {
            console.log("[WorkoutGraph] applyFilters - '어깨' 세트구성 필터링 후 102.5kg 기록:", JSON.stringify({...specificShoulderRecord, date: 안전한_날짜_문자열_변환(specificShoulderRecord.date)},null,2));
        } else {
            console.log("[WorkoutGraph] applyFilters - '어깨' 세트구성 필터링 후 102.5kg 기록 없음");
        }
      }

      setFilteredData(filtered);
      
      if (filtered.length > 0) {
        prepareChartData(filtered);
      } else {
        setChartData({ labels: [], datasets: [] }); 
        setDateWorkoutMap({}); 
        setDateAllWorkoutsMap({});
      }
    } catch (error) { console.error('[WorkoutGraph] applyFilters 오류:', error); }
  };
  
  // 필터 변경 시 데이터 재필터링
  useEffect(() => {
    applyFilters();
  }, [selectedPart, selectedExercise, selectedSetConfig]);
  
  // 부위 변경 핸들러
  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const part = e.target.value as ExercisePart;
    setSelectedPart(part);
    // 부위 변경 시 운동 선택 초기화 (해당 부위의 첫 번째 운동 또는 'all')
    if (exerciseOptions[part] && exerciseOptions[part].length > 0) {
      setSelectedExercise(exerciseOptions[part][0].value);
    } else {
      setSelectedExercise('all');
    }
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
                {selectedWorkout.date ? parseFirestoreDate(selectedWorkout.date as unknown as FirestoreTimestamp | Date | string).toLocaleDateString() : '날짜 정보 없음'}
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