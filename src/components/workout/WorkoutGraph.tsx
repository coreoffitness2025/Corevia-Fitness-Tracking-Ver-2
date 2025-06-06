import React, { useState, useEffect, useRef } from 'react';
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

// 운동 종류 옵션 (부위별로 그룹화) - 메인 운동만
const exerciseOptions: Record<string, { value: string; label: string }[]> = {
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    { value: 'dumbbellBenchPress', label: '덤벨 벤치 프레스' },
    { value: 'chestPress', label: '체스트 프레스 머신' }
  ],
  back: [
    { value: 'deadlift', label: '데드리프트' },
    { value: 'barbellRow', label: '바벨로우' },
    { value: 'tBarRow', label: '티바로우' },
    { value: 'pullUp', label: '턱걸이 (풀업)' }
  ],
  shoulder: [
    { value: 'overheadPress', label: '오버헤드 프레스' },
    { value: 'dumbbellShoulderPress', label: '덤벨 숄더 프레스' }
  ],
  leg: [
    { value: 'squat', label: '스쿼트' },
    { value: 'legPress', label: '레그 프레스' },
    { value: 'romanianDeadlift', label: '루마니안 데드리프트' }
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
  '덤벨 벤치 프레스': 'star',
  '체스트 프레스 머신': 'circle',
  '인클라인 벤치 프레스': 'circle',
  '디클라인 벤치 프레스': 'rect',
  
  // 등 운동
  '데드리프트': 'triangle',
  '바벨로우': 'circle',
  '티바로우': 'rect',
  '턱걸이 (풀업)': 'rectRounded',
  
  // 어깨 운동
  '오버헤드 프레스': 'triangle',
  '덤벨 숄더 프레스': 'crossRot',
  '레터럴 레이즈': 'circle',
  
  // 하체 운동
  '스쿼트': 'triangle', 
  '레그 프레스': 'circle',
  '루마니안 데드리프트': 'dash',
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
  const chartRef = useRef<any>(null); // Chart.js 인스턴스 참조 추가
  
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
  const initialChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, // 높이 조정 가능하도록
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          boxWidth: 20,
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, index: number) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 2,
              pointStyle: dataset.pointStyle,
              datasetIndex: index,
              hidden: !chart.isDatasetVisible(index) // 현재 데이터셋 표시 상태 반영
            }));
          }
        },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          
          if (index !== undefined) {
            // 데이터셋 표시/숨김 토글
            const meta = chart.getDatasetMeta(index);
            meta.hidden = meta.hidden === null ? !chart.isDatasetVisible(index) : null;
            chart.update();
          }
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
        beginAtZero: false, // 0부터 시작하지 않도록 기본 설정
        title: {
          display: true,
          text: '무게 (kg)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          stepSize: 2.5,
          callback: function(value: any) {
            return `${value}kg`;
          },
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: '날짜',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
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
        borderWidth: 2,
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
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2
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
  
  const [dynamicChartOptions, setDynamicChartOptions] = useState<ChartOptions<'line'>>(initialChartOptions);

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

        const exerciseName = workout.mainExercise.name;
        const dateStr = parseFirestoreDate(workout.date as unknown as FirestoreTimestamp | Date | string).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' }).replace(/\./g, '/').replace(/\s/g, '').replace(/\/$/, '');
        
        // 80kg 데이터 특별 추적 (prepareChartData 진입점)
        const hasEightyKg = workout.mainExercise.sets.some(set => set.weight === 80);
        if (hasEightyKg && workout.part === 'leg') {
          console.log(`[WorkoutGraph] 🔍 80kg 데이터 prepareChartData 진입: ${exerciseName} (${dateStr}), 세트정보: ${JSON.stringify(workout.mainExercise.sets.map(s => ({weight: s.weight, reps: s.reps})))}`);
        }
        
        // 디버깅: 운동 이름과 날짜 확인
        console.log(`[WorkoutGraph] 운동 데이터 처리: ${exerciseName} (${dateStr})`);
        
        // 운동 이름이 exerciseOptions에 있는지 확인
        let found = false;
        Object.values(exerciseOptions).forEach(partExercises => {
          if (partExercises.some(ex => ex.label === exerciseName)) {
            found = true;
          }
        });
        
        if (!found) {
          console.warn(`[WorkoutGraph] 운동 "${exerciseName}"이 exerciseOptions에서 찾을 수 없습니다.`);
        }

        allDates.push(dateStr);
        newDateWorkoutMap[dateStr] = workout;
        
        if (!newDateAllWorkoutsMap[dateStr]) {
          newDateAllWorkoutsMap[dateStr] = [];
        }
        newDateAllWorkoutsMap[dateStr].push(workout);
        
        const sets = workout.mainExercise.sets;
        
        // 80kg 데이터 세트 구성 확인
        if (hasEightyKg && workout.part === 'leg') {
          console.log(`[WorkoutGraph] 🔍 80kg 데이터 세트 구성 검사 시작: 세트수=${sets.length}, 반복횟수=[${sets.map(s => s.reps).join(', ')}]`);
        }

        let setConfig = '';
        // 원래 코드로 복원 - 표준 세트 구성만 분류
        if (sets.length === 5 && sets.every(set => set.reps === 5)) setConfig = '5x5';
        else if (sets.length === 3 && sets.every(set => set.reps === 6)) setConfig = '6x3';
        else if (sets.length === 5 && sets.every(set => set.reps === 10)) setConfig = '10x5';
        else if (sets.length === 5 && sets.every(set => set.reps === 15)) setConfig = '15x5';
        else {
          // 표준 세트 구성이 아니면 제외 (디버깅 로그 추가)
          if (hasEightyKg && workout.part === 'leg') {
            console.log(`[WorkoutGraph] ❌ 80kg 데이터 제외됨 (비표준 세트): ${exerciseName}, 세트구성: ${sets.length}세트 x [${sets.map(s => s.reps).join(', ')}]회, 무게: [${sets.map(s => s.weight).join(', ')}]kg`);
          }
          if (workout.part === 'leg' && exerciseName?.includes('스쿼트')) {
            console.log(`[WorkoutGraph] ❌ 스쿼트 데이터 제외됨 (비표준 세트): ${exerciseName}, 세트구성: ${sets.length}세트 x [${sets.map(s => s.reps).join(', ')}]회, 무게: [${sets.map(s => s.weight).join(', ')}]kg`);
          }
          return;
        }

        if (!exerciseConfigData[exerciseName]) {
          exerciseConfigData[exerciseName] = { '5x5': {}, '6x3': {}, '10x5': {}, '15x5': {} };
        }
        
        let currentMaxWorkoutWeight = 0;
        const allWeightsInWorkout: number[] = [];
        
        sets.forEach(set => {
          if (set.weight > 0) {
            allWeightsInWorkout.push(set.weight);
            if (set.weight > currentMaxWorkoutWeight) currentMaxWorkoutWeight = set.weight;
            minWeight = Math.min(minWeight, set.weight);
            maxWeight = Math.max(maxWeight, set.weight);
            hasValidData = true;
          }
        });

        // 하체/스쿼트 데이터 특별 디버깅
        if (workout.part === 'leg' && exerciseName?.includes('스쿼트')) {
             console.log(`[WorkoutGraph] ✅ 스쿼트 데이터 포함됨: ${exerciseName} (${dateStr}, ${setConfig}): 모든무게=[${allWeightsInWorkout.join(', ')}]kg, 최대=${currentMaxWorkoutWeight}kg`);
             
             // 80kg 특별 추적
             if (allWeightsInWorkout.includes(80)) {
               console.log(`[WorkoutGraph] 🎯 80kg 스쿼트 발견! 세트구성: ${setConfig}, 세트정보: ${JSON.stringify(sets.map(s => ({weight: s.weight, reps: s.reps})))}`);
             }
        }
        
        if (currentMaxWorkoutWeight > 0) {
          exerciseConfigData[exerciseName][setConfig][dateStr] = currentMaxWorkoutWeight;
          
          // 80kg 데이터 특별 추적
          if (allWeightsInWorkout.includes(80)) {
            console.log(`[WorkoutGraph] 🎯 80kg 데이터 발견! 운동: ${exerciseName}, 날짜: ${dateStr}, 세트구성: ${setConfig}, 저장된값: ${currentMaxWorkoutWeight}kg`);
          }
          
          if (currentMaxWorkoutWeight === 80) {
            console.log(`[WorkoutGraph] 🔥 80kg이 최대무게로 차트에 표시됨! 운동: ${exerciseName}, 날짜: ${dateStr}`);
          }
        }
      });
      
      setDateWorkoutMap(newDateWorkoutMap);
      setDateAllWorkoutsMap(newDateAllWorkoutsMap);
      
      const uniqueDates = [...new Set(allDates)].sort((a, b) => new Date(a.split('/').map((s,i) => i === 0 ? '20'+s : s).join('/')).getTime() - new Date(b.split('/').map((s,i) => i === 0 ? '20'+s : s).join('/')).getTime());
      const datasets: any[] = [];
      const configColors = { 
        '5x5': { border: '#0000FF', background: 'rgba(0, 0, 255, 0.5)' },    // 파란색 (Blue)
        '6x3': { border: '#800080', background: 'rgba(128, 0, 128, 0.5)' },  // 보라색 (Purple)
        '10x5': { border: '#FF0000', background: 'rgba(255, 0, 0, 0.5)' },   // 빨간색 (Red)
        '15x5': { border: '#008000', background: 'rgba(0, 128, 0, 0.5)' }  // 초록색 (Green)
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
          
          // 세트 구성별로 다른 pointStyle 할당
          const configPointStyles = {
            '5x5': 'triangle',
            '6x3': 'circle', 
            '10x5': 'rect',
            '15x5': 'rectRounded'
          };
          
          let pointStyleValue = configPointStyles[config as keyof typeof configPointStyles] || basePointStyleFromMap;

          // 하체 운동 디버깅 강화
          if (exercisePart === 'leg') {
            console.log(`[WorkoutGraph] 🦵 하체 Dataset 생성: ${exerciseName} (${config}), 색상: ${configColor.border}, 포인트: ${pointStyleValue}`);
            console.log(`[WorkoutGraph] 🦵 데이터 포인트 수:`, Object.keys(dateData).length);
            console.log(`[WorkoutGraph] 🦵 실제 데이터:`, dateData);
          }

          const dataForChart = uniqueDates.map(date => dateData[date] || null);
          
          console.log(`[WorkoutGraph] Adding dataset: Label='${exerciseName} (${config})', pointStyle='${pointStyleValue}', 데이터수=${dataForChart.filter(v => v !== null).length}`);

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
            spanGaps: true // 빈 데이터 구간에서도 선 연결
          });
        });
      });
      
      console.log(`[WorkoutGraph] prepareChartData - 최종 계산된 minWeight: ${minWeight}, maxWeight: ${maxWeight} (어깨 부위: ${selectedPart === 'shoulder'})`);
      
      let yMin, yMax;
      if (hasValidData) {
        // 패딩을 더 크게 하여 데이터가 잘 보이도록 함
        const range = maxWeight - minWeight;
        const padding = Math.max(10, range * 0.1); // 최소 10kg 또는 데이터 범위의 10%
        
        yMin = Math.max(0, minWeight - padding); // 0 이하로 내려가지 않도록
        yMax = maxWeight + padding;
        
        // 모든 데이터 포인트가 같을 경우 더 넓은 범위 설정
        if (yMin === yMax || Math.abs(yMax - yMin) < 20) {
          const center = (yMin + yMax) / 2;
          yMin = Math.max(0, center - 15);
          yMax = center + 15;
        }
        
        // 최소 범위 보장 (최소 20kg 범위)
        if (yMax - yMin < 20) {
          const center = (yMin + yMax) / 2;
          yMin = Math.max(0, center - 10);
          yMax = center + 10;
        }
        
        console.log(`[WorkoutGraph] Y축 범위 동적 설정 - 부위: ${selectedPart}, 계산된 min: ${yMin}, max: ${yMax}, 데이터 범위: ${minWeight}-${maxWeight}kg`);
      } else {
        // 유효한 데이터가 없을 경우 기본 범위
        yMin = 0;
        yMax = 100;
        console.log(`[WorkoutGraph] Y축 범위 기본값 사용 (유효 데이터 없음)`);
      }

      const finalChartData = { labels: uniqueDates, datasets };

      // 차트 옵션 업데이트 - 더 안전한 방식으로 처리
      const updatedOptions = JSON.parse(JSON.stringify(initialChartOptions));
      if (updatedOptions.scales?.y) {
        updatedOptions.scales.y.min = yMin;
        updatedOptions.scales.y.max = yMax;
        updatedOptions.scales.y.beginAtZero = false; // 0부터 시작하지 않도록 설정
        
        // tick 설정 개선
        updatedOptions.scales.y.ticks = {
          ...updatedOptions.scales.y.ticks,
          stepSize: Math.max(2.5, Math.round((yMax - yMin) / 8)), // 적절한 간격 설정
          callback: function(value: any) {
            return `${value}kg`;
          }
        };
        
        console.log(`[WorkoutGraph] 차트 옵션 업데이트 - Y축 min: ${yMin}, max: ${yMax}, stepSize: ${updatedOptions.scales.y.ticks.stepSize}`);
      }
      setDynamicChartOptions(updatedOptions);

      // 디버깅: 최종 datasets 배열 확인
      console.log('[WorkoutGraph] 최종 생성된 datasets:', datasets.map(d => ({ label: d.label, pointStyle: d.pointStyle, dataCount: d.data.filter((v: any) => v !== null).length })));

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
      console.log(`[WorkoutGraph] applyFilters - 시작, 데이터 ${filtered.length}개, 선택된 부위: ${selectedPart}, 운동: ${selectedExercise}, 세트구성: ${selectedSetConfig}, 기간: ${selectedPeriod}`);

      // 기간별 필터링 추가
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
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
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(item => {
        const itemDate = parseFirestoreDate(item.date as unknown as FirestoreTimestamp | Date | string);
        return itemDate >= startDate && itemDate <= now;
      });
      console.log(`[WorkoutGraph] applyFilters - 기간 필터링 후 (${selectedPeriod}): ${filtered.length}개`);

      // 부위별 필터링
      filtered = filtered.filter(item => item.part === selectedPart);
      console.log(`[WorkoutGraph] applyFilters - 부위 필터링 후 (${selectedPart}): ${filtered.length}개`);
      
      // 스쿼트/하체 데이터 특별 디버깅
      if (selectedPart === 'leg') {
        const legExercises = filtered.map(w => ({
          exercise: w.mainExercise?.name,
          date: w.date,
          maxWeight: Math.max(...(w.mainExercise?.sets?.map(s => s.weight) || [0]))
        }));
        console.log('[WorkoutGraph] 하체 운동 데이터 목록:', legExercises);
        
        const squatData = filtered.filter(w => w.mainExercise?.name?.includes('스쿼트'));
        console.log(`[WorkoutGraph] 스쿼트 데이터 ${squatData.length}개:`, squatData.map(w => ({
          name: w.mainExercise?.name,
          sets: w.mainExercise?.sets?.map(s => `${s.weight}kg x ${s.reps}회`)
        })));
      }

      // 운동별 필터링 (선택된 운동이 'all'이 아닌 경우)
      if (selectedExercise !== 'all') {
        const selectedExerciseLabel = exerciseOptions[selectedPart]?.find(opt => opt.value === selectedExercise)?.label;
        console.log(`[WorkoutGraph] 선택된 운동 라벨: ${selectedExerciseLabel}`);
        
        if (selectedExerciseLabel) {
          const beforeCount = filtered.length;
          filtered = filtered.filter(item => 
            item.mainExercise && item.mainExercise.name === selectedExerciseLabel
          );
          console.log(`[WorkoutGraph] 운동 필터링: "${selectedExerciseLabel}" - ${beforeCount}개 → ${filtered.length}개`);
        } else {
          console.warn(`[WorkoutGraph] 선택된 운동 라벨을 찾을 수 없음: ${selectedExercise}`);
          filtered = [];
        }
      }
      console.log(`[WorkoutGraph] applyFilters - 운동 종류 필터링 후 (${selectedExercise}): ${filtered.length}개`);

      // 세트 구성별 필터링 (선택된 구성이 'all'이 아닌 경우)
      if (selectedSetConfig !== 'all') {
        const beforeCount = filtered.length;
        filtered = filtered.filter(item => {
          if (!item.mainExercise || !item.mainExercise.sets || item.mainExercise.sets.length === 0) {
            return false;
          }
          
          const sets = item.mainExercise.sets;
          
          // 세트 구성 매칭 로직 개선
          switch (selectedSetConfig) {
            case '5x5':
              return sets.length === 5 && sets.every(set => set.reps === 5);
            case '10x5':
              return sets.length === 5 && sets.every(set => set.reps === 10);
            case '15x5':
              return sets.length === 5 && sets.every(set => set.reps === 15);
            case '6x3':
              return sets.length === 3 && sets.every(set => set.reps === 6);
            default:
              return false;
          }
        });
        console.log(`[WorkoutGraph] 세트 구성 필터링: "${selectedSetConfig}" - ${beforeCount}개 → ${filtered.length}개`);
      }
      console.log(`[WorkoutGraph] applyFilters - 세트 구성 필터링 후 (${selectedSetConfig}): ${filtered.length}개`);

      // 최종 필터링 결과 디버깅
      if (filtered.length > 0) {
        const exerciseNames = [...new Set(filtered.map(w => w.mainExercise?.name))];
        const weightRanges = filtered.map(w => {
          const weights = w.mainExercise?.sets?.map(s => s.weight) || [0];
          return { min: Math.min(...weights), max: Math.max(...weights) };
        });
        const overallMin = Math.min(...weightRanges.map(r => r.min));
        const overallMax = Math.max(...weightRanges.map(r => r.max));
        
        console.log(`[WorkoutGraph] 최종 필터링 결과 - 운동종류: [${exerciseNames.join(', ')}], 무게범위: ${overallMin}-${overallMax}kg`);
      }

      setFilteredData(filtered);
      
      if (filtered.length > 0) {
        prepareChartData(filtered);
      } else {
        console.log('[WorkoutGraph] 필터링된 데이터가 없어 빈 차트 설정');
        setChartData({ labels: [], datasets: [] }); 
        setDateWorkoutMap({}); 
        setDateAllWorkoutsMap({});
        
        // 빈 데이터일 때도 기본 y축 범위 설정
        const emptyOptions = JSON.parse(JSON.stringify(initialChartOptions));
        if (emptyOptions.scales?.y) {
          emptyOptions.scales.y.min = 0;
          emptyOptions.scales.y.max = 100;
        }
        setDynamicChartOptions(emptyOptions);
      }
    } catch (error) { 
      console.error('[WorkoutGraph] applyFilters 오류:', error); 
    }
  };
  
  // 필터 변경 시 데이터 재필터링
  useEffect(() => {
    applyFilters();
  }, [selectedPart, selectedExercise, selectedSetConfig, selectedPeriod]);
  
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

  // 커스텀 범례 클릭 핸들러 함수 추가
  const toggleDatasetVisibility = (datasetIndex: number) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const meta = chart.getDatasetMeta(datasetIndex);
    meta.hidden = meta.hidden === null ? !chart.isDatasetVisible(datasetIndex) : null;
    chart.update();
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
        
        {/* 운동 선택 필터 추가 */}
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">운동 선택:</span>
          </div>
          <div className="flex items-center flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* 전체 보기 버튼 */}
            <button
              type="button"
              onClick={() => setSelectedExercise('all')}
              className={`
                py-2 px-3 rounded-lg flex items-center transition-all duration-300 text-xs font-medium
                ${selectedExercise === 'all' 
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              전체
            </button>
            {/* 선택된 부위의 운동들 */}
            {exerciseOptions[selectedPart]?.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedExercise(option.value)}
                className={`
                  py-2 px-3 rounded-lg flex items-center transition-all duration-300 text-xs font-medium
                  ${selectedExercise === option.value 
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 기간 선택 필터 추가 */}
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기간 선택:</span>
          </div>
          <div className="flex items-center flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {periodOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPeriod(option.value)}
                className={`
                  py-2 px-3 rounded-lg flex items-center transition-all duration-300 text-xs font-medium
                  ${selectedPeriod === option.value 
                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
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
              {/* 커스텀 범례 */}
              {chartData.datasets && chartData.datasets.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-4 justify-center">
                  {chartData.datasets.map((dataset: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                      onClick={() => toggleDatasetVisibility(index)}
                    >
                      <div 
                        className="w-3 h-3"
                        style={{
                          backgroundColor: dataset.borderColor,
                          clipPath: dataset.pointStyle === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                   dataset.pointStyle === 'rect' ? 'none' :
                                   dataset.pointStyle === 'circle' ? 'circle(50%)' :
                                   dataset.pointStyle === 'rectRounded' ? 'none' : 'none',
                          borderRadius: dataset.pointStyle === 'circle' ? '50%' : 
                                      dataset.pointStyle === 'rectRounded' ? '2px' : '0'
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {dataset.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative" style={{ height: '480px' }}>
                <Line 
                  options={dynamicChartOptions} 
                  data={chartData}
                  ref={chartRef} // Chart.js 인스턴스에 대한 참조 추가
                />
              </div>
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