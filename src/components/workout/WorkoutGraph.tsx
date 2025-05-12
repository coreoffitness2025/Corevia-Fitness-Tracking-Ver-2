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
import { ExercisePart } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

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
  { value: 'all', label: '전체' },
  { value: 'chest', label: '가슴' },
  { value: 'back', label: '등' },
  { value: 'shoulder', label: '어깨' },
  { value: 'leg', label: '하체' }
];

// 운동 종류 옵션 (부위별로 그룹화)
const exerciseOptions: Record<string, { value: string; label: string }[]> = {
  all: [{ value: 'all', label: '전체' }],
  chest: [
    { value: 'benchPress', label: '벤치 프레스' },
    { value: 'inclineBenchPress', label: '인클라인 벤치 프레스' },
    { value: 'declineBenchPress', label: '디클라인 벤치 프레스' },
    { value: 'cableFly', label: '케이블 플라이' },
    { value: 'dumbbellFly', label: '덤벨 플라이' }
  ],
  back: [
    { value: 'deadlift', label: '데드리프트' },
    { value: 'bentOverRow', label: '벤트오버 로우' },
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
  { value: '10x5', label: '10회 x 5세트' },
  { value: '15x5', label: '15회 x 5세트' },
  { value: '6x3', label: '6회 x 3세트' },
  { value: 'custom', label: '커스텀' }
];

// 운동 기록 표시 컴포넌트
interface WorkoutRecordProps {
  workout: any;
  onClose: () => void;
}

const WorkoutRecord: React.FC<WorkoutRecordProps> = ({ workout, onClose }) => {
  if (!workout) return null;
  
  const date = new Date(workout.date);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // 부위에 따른 색상 지정
  const getPartColor = (part: ExercisePart) => {
    const colors = {
      chest: 'bg-blue-100 text-blue-800',
      back: 'bg-green-100 text-green-800',
      shoulder: 'bg-purple-100 text-purple-800',
      leg: 'bg-orange-100 text-orange-800',
      biceps: 'bg-pink-100 text-pink-800',
      triceps: 'bg-indigo-100 text-indigo-800'
    };
    return colors[part] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{formattedDate} 운동 기록</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${getPartColor(workout.part)}`}>
              {workout.part === 'chest' ? '가슴' : 
               workout.part === 'back' ? '등' : 
               workout.part === 'shoulder' ? '어깨' : 
               workout.part === 'leg' ? '하체' :
               workout.part === 'biceps' ? '이두' :
               workout.part === 'triceps' ? '삼두' : workout.part}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${workout.isAllSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {workout.isAllSuccess ? '성공' : '실패'} ({workout.successSets || 0}/{workout.mainExercise?.sets?.length || 0} 세트)
            </span>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">메인 운동</h4>
            <p className="mb-2">{workout.mainExercise?.name}</p>
            <div className="flex flex-wrap gap-2">
              {workout.mainExercise?.sets?.map((set: any, index: number) => (
                <div key={index} className={`px-3 py-1 rounded text-sm ${set.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {set.weight}kg x {set.reps}회
                </div>
              ))}
            </div>
          </div>
          
          {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">보조 운동</h4>
              <div className="space-y-2">
                {workout.accessoryExercises.map((exercise: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium">{exercise.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(exercise.sets) && exercise.sets.map((set: any, setIndex: number) => (
                        <span key={setIndex} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                          {set.weight}kg x {set.reps}회
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {workout.notes && (
            <div>
              <h4 className="font-medium mb-2">메모</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{workout.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkoutGraph: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPart, setSelectedPart] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1month');
  const [selectedSetConfig, setSelectedSetConfig] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 실제 데이터를 저장할 상태
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // 클릭한 운동 데이터 관리 상태
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [dateWorkoutMap, setDateWorkoutMap] = useState<Record<string, any>>({});
  
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
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
        }));
        
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
      if (selectedPart !== 'all') {
        filtered = filtered.filter(item => item.part === selectedPart);
      }
      
      // 운동 종류 필터링
      if (selectedExercise !== 'all') {
        filtered = filtered.filter(item => 
          item.mainExercise && item.mainExercise.name.includes(selectedExercise)
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
          
          if (selectedSetConfig === '10x5') {
            return sets.length === 5 && sets.every(set => set.reps === 10);
          } else if (selectedSetConfig === '15x5') {
            return sets.length === 5 && sets.every(set => set.reps === 15);
          } else if (selectedSetConfig === '6x3') {
            return sets.length === 3 && sets.every(set => set.reps === 6);
          } else if (selectedSetConfig === 'custom') {
            // 10x5, 15x5, 6x3 패턴이 아닌 경우 커스텀으로 간주
            return !(
              (sets.length === 5 && sets.every(set => set.reps === 10)) ||
              (sets.length === 5 && sets.every(set => set.reps === 15)) ||
              (sets.length === 3 && sets.every(set => set.reps === 6))
            );
          }
          
          return true;
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
  
  // 차트 데이터 준비
  const prepareChartData = (data: any[]) => {
    try {
      if (!data || data.length === 0) {
        setChartData({
          labels: [],
          datasets: []
        });
        setDateWorkoutMap({});
        return;
      }
      
      // 날짜 형식 변환 함수
      const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      };
      
      // 날짜별 성공한 세트 중 최대 무게 추출
      const successWeightsByDate: Record<string, number> = {};
      const allDates: string[] = [];
      const newDateWorkoutMap: Record<string, any> = {};
      
      data.forEach(workout => {
        if (!workout.mainExercise || !workout.mainExercise.sets) return;
        
        const dateStr = formatDate(new Date(workout.date));
        allDates.push(dateStr);
        
        // 날짜별 운동 기록 저장 (클릭 이벤트용)
        if (!newDateWorkoutMap[dateStr] || new Date(workout.date) > new Date(newDateWorkoutMap[dateStr].date)) {
          newDateWorkoutMap[dateStr] = workout;
        }
        
        // 성공한 세트 중 최대 무게 찾기
        let maxWeight = 0;
        workout.mainExercise.sets.forEach((set: any) => {
          if (set.isSuccess && set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
        
        // 기존 값과 비교하여 더 큰 값 저장
        if (maxWeight > 0) {
          if (!successWeightsByDate[dateStr] || maxWeight > successWeightsByDate[dateStr]) {
            successWeightsByDate[dateStr] = maxWeight;
          }
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
      
      // 차트 데이터셋 구성
      const weights = uniqueDates.map(date => successWeightsByDate[date] || null);
      
      setChartData({
        labels: uniqueDates,
        datasets: [
          {
            label: '성공 세트 최대 무게 (kg)',
            data: weights,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.2,
            pointRadius: 5,
            pointBackgroundColor: weights.map(w => w ? 'rgba(0, 200, 0, 0.8)' : 'rgba(200, 0, 0, 0.8)'),
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(53, 162, 235, 0.9)',
            pointHitRadius: 10,
          }
        ]
      });
    } catch (error) {
      console.error('차트 데이터 변환 오류:', error);
    }
  };
  
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
      <Card className="animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="w-full md:w-auto">
            <label htmlFor="part-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              부위
            </label>
            <select
              id="part-select"
              value={selectedPart}
              onChange={handlePartChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {partOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              운동
            </label>
            <select
              id="exercise-select"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {exerciseOptions[selectedPart === 'all' ? 'all' : selectedPart].map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="set-config-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              세트 구성
            </label>
            <select
              id="set-config-select"
              value={selectedSetConfig}
              onChange={(e) => setSelectedSetConfig(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {setConfigOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              기간
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-2 text-sm text-gray-500 dark:text-gray-400">
          <p>데이터 포인트를 클릭하면 해당 일자의 운동 기록을 확인할 수 있습니다</p>
        </div>
        
        {filteredData.length > 0 ? (
          <div className="h-80">
            <Line options={chartOptions} data={chartData} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              기록된 운동 데이터가 없습니다.
            </p>
          </div>
        )}
      </Card>
      
      {/* 데이터 요약 표시 */}
      {filteredData.length > 0 && (
        <Card className="animate-slideUp">
          <h3 className="text-lg font-semibold mb-4">운동 데이터 요약</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">총 운동 횟수</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-300">{filteredData.length}회</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">최대 무게</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-300">
                {Math.max(...filteredData.flatMap(w => 
                  w.mainExercise?.sets?.map((s: any) => s.isSuccess ? s.weight : 0) || [0]
                ))}kg
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">평균 성공률</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-300">
                {Math.round(filteredData.reduce((acc, curr) => 
                  acc + (curr.successSets / (curr.mainExercise?.sets?.length || 1)) * 100, 0
                ) / filteredData.length)}%
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">마지막 운동일</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-300">
                {new Date(Math.max(...filteredData.map(d => new Date(d.date).getTime())))
                  .toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* 선택한 운동 기록 모달 */}
      {selectedWorkout && (
        <WorkoutRecord 
          workout={selectedWorkout} 
          onClose={() => setSelectedWorkout(null)} 
        />
      )}
    </div>
  );
};

export default WorkoutGraph; 