import { useState, useEffect, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from 'chart.js';
import { useAuthStore } from '../stores/authStore';
import { getProgressData } from '../services/firebaseService';
import { ExercisePart, Progress } from '../types';
import Layout from '../components/common/Layout';

// 차트 등록은 컴포넌트 외부에서 한 번만 실행
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);
const PART_LABEL = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' };

// 날짜 범위 계산 함수
const getDateRangeFilter = (range: 'all' | '3months' | '6months'): Date => {
  const today = new Date();
  
  switch (range) {
    case '3months':
      return new Date(today.setMonth(today.getMonth() - 3));
    case '6months':
      return new Date(today.setMonth(today.getMonth() - 6));
    case 'all':
    default:
      return new Date(0); // 모든 데이터
  }
};

// 로컬 스토리지 관련 유틸리티 함수들
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간 캐시 유효 기간

const getLocalStorageKey = (userId: string, part: ExercisePart) => 
  `progress-${userId}-${part}-${CACHE_VERSION}`;

// 최근 세션 가져오기
const getLatestSessionFromLocalStorage = (userId: string, part: ExercisePart): Progress | null => {
  try {
    const key = `session-${userId}-${part}`;
    const sessionData = localStorage.getItem(key);
    if (!sessionData) return null;
    
    return JSON.parse(sessionData) as Progress;
  } catch (e) {
    console.error('로컬 스토리지 데이터 로드 실패:', e);
    return null;
  }
};

// 캐시된 데이터 가져오기
const getCachedProgressData = (userId: string, part: ExercisePart): {
  data: Progress[];
  timestamp: number;
} | null => {
  try {
    const key = getLocalStorageKey(userId, part);
    const cachedData = localStorage.getItem(key);
    
    if (!cachedData) return null;
    
    const parsed = JSON.parse(cachedData);
    // 캐시가 만료되었는지 확인
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed;
  } catch (e) {
    console.error('캐시 로드 실패:', e);
    return null;
  }
};

// 캐시 저장
const setCachedProgressData = (userId: string, part: ExercisePart, data: Progress[]) => {
  try {
    const key = getLocalStorageKey(userId, part);
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (e) {
    console.error('캐시 저장 실패:', e);
  }
};

// 데이터 병합 및 중복 제거 함수
const mergeAndDeduplicate = (localData: Progress[], remoteData: Progress[]): Progress[] => {
  const allData = [...localData, ...remoteData];
  // 무게, 성공여부, 날짜를 기준으로 중복 제거
  const uniqueMap = new Map();
  
  allData.forEach(item => {
    // 날짜+무게+성공여부 조합으로 고유 키 생성
    const key = `${item.weight}-${item.isSuccess}-${new Date(item.date).toDateString()}`;
    if (!uniqueMap.has(key) || new Date(item.date) > new Date(uniqueMap.get(key).date)) {
      uniqueMap.set(key, item);
    }
  });
  
  // 날짜 기준 정렬 (최신순)
  return Array.from(uniqueMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 최근 데이터 카드 컴포넌트
const RecentSessionCard = ({ data, part }: { data: Progress | null, part: ExercisePart }) => {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 flex items-center justify-center h-40">
        <p className="text-gray-500">최근 운동 기록이 없습니다</p>
      </div>
    );
  }
  
  // 운동 부위별 주요 운동 종목 매핑
  const exerciseNameByPart: Record<ExercisePart, string> = {
    chest: '벤치 프레스',
    back: '데드리프트',
    shoulder: '오버헤드 프레스',
    leg: '스쿼트'
  };
  
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const successSets = data.sets.filter(set => set.isSuccess).length;
  const totalSets = data.sets.length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-medium">가장 최근 운동 기록</h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{data.weight}kg</div>
          <div className={`text-sm ${data.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {data.isSuccess ? '성공' : '실패'}
          </div>
        </div>
      </div>
      
      {/* 운동 종목 표시 */}
      <div className="mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded-md">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="font-medium">{exerciseNameByPart[part]}</span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>세트 성공률</span>
          <span>{successSets}/{totalSets} 세트</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full" 
            style={{ width: `${(successSets / totalSets) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {data.sets.map((set, i) => (
          <div key={i} className={`border p-2 rounded text-center ${
            set.isSuccess ? 'bg-green-100 dark:bg-green-900 border-green-400' : 
                          'bg-red-100 dark:bg-red-900 border-red-400'
          }`}>
            <div className="text-xs text-gray-600 dark:text-gray-400">{i+1}세트</div>
            <div className="font-bold">{set.reps}회</div>
            <div className="text-xs">
              {set.isSuccess ? '성공' : '실패'}
            </div>
          </div>
        ))}
      </div>
      
      {/* 보조 운동 섹션 */}
      {data.accessoryExercises && data.accessoryExercises.length > 0 && (
        <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">보조 운동</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.accessoryExercises.map((exercise, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{exercise.name}</div>
                {exercise.sets && exercise.sets.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exercise.sets.map((set, j) => (
                      <div key={j} className="text-xs bg-gray-200 dark:bg-gray-800 px-2.5 py-1.5 rounded-md text-gray-800 dark:text-gray-200">
                        {set.weight}kg × {set.reps}회
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">세트 정보 없음</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 메모 섹션 */}
      {data.notes && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">메모</h4>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm border border-yellow-200 dark:border-yellow-800/50">
            <p className="whitespace-pre-wrap">{data.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 세트 상세 정보 컴포넌트
const SetDetails = ({ session }: { session: Progress | null }) => {
  if (!session) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">세트 상세 정보</h3>
      
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-700 dark:text-gray-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          무게
        </span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{session.weight}kg</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {session.sets.map((set, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            set.isSuccess ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">{index + 1}세트</span>
              <span className={`text-sm font-medium ${
                set.isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {set.isSuccess ? '성공' : '실패'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {set.reps}회
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 로딩 상태 컴포넌트
const LoadingState = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState = () => (
  <div className="text-center py-12">
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      아직 운동 기록이 없습니다
    </p>
  </div>
);

export default function WorkoutRecordPage() {
  const { user } = useAuthStore();
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [dateRange, setDateRange] = useState<'all' | '3months' | '6months'>('3months');
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 가져오기
  const fetchProgressData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 캐시된 데이터 확인
      const cachedData = getCachedProgressData(user.uid, selectedPart);
      
      if (cachedData) {
        setProgressData(cachedData.data);
        setLoading(false);
        return;
      }
      
      // 서버에서 데이터 가져오기
      const remoteData = await getProgressData(user.uid, selectedPart);
      
      // 로컬 데이터와 병합
      const localData = getLatestSessionFromLocalStorage(user.uid, selectedPart) || [];
      const mergedData = mergeAndDeduplicate(
        Array.isArray(localData) ? localData : [localData],
        remoteData
      );
      
      // 캐시에 저장
      setCachedProgressData(user.uid, selectedPart, mergedData);
      
      setProgressData(mergedData);
    } catch (err) {
      console.error('데이터 가져오기 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedPart]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    const filteredData = progressData.filter(item => 
      new Date(item.date) >= getDateRangeFilter(dateRange)
    );

    return {
      labels: filteredData.map(item => 
        new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: '무게 (kg)',
          data: filteredData.map(item => item.weight),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.1
        }
      ]
    };
  }, [progressData, dateRange]);

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const data = progressData[context.dataIndex];
            return [
              `무게: ${data.weight}kg`,
              `성공: ${data.isSuccess ? '예' : '아니오'}`,
              `세트: ${data.sets.length}개`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (progressData.length === 0) return <EmptyState />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">운동 기록</h1>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'all' | '3months' | '6months')}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
          >
            <option value="3months">최근 3개월</option>
            <option value="6months">최근 6개월</option>
            <option value="all">전체</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex space-x-4 mb-4">
                {Object.entries(PART_LABEL).map(([part, label]) => (
                  <button
                    key={part}
                    onClick={() => setSelectedPart(part as ExercisePart)}
                    className={`px-4 py-2 rounded ${
                      selectedPart === part
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div>
            <RecentSessionCard 
              data={progressData[0] || null} 
              part={selectedPart} 
            />
            <SetDetails session={progressData[0] || null} />
          </div>
        </div>
      </div>
    </Layout>
  );
} 