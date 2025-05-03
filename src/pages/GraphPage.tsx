import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
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

// 로컬 스토리지 관련 유틸리티 함수들
const CACHE_VERSION = 'v1'; // 캐시 버전 관리
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

// 데이터 다운샘플링: 대량의 데이터를 화면에 표시할 때 점수를 줄임
const downsampleData = (data: Progress[], targetPoints = 50): Progress[] => {
  // 데이터가 targetPoints보다 적으면 그대로 반환
  if (data.length <= targetPoints) return data;
  
  // 다운샘플링 비율 계산
  const samplingRate = Math.ceil(data.length / targetPoints);
  
  // 간략화된 데이터셋 생성
  return data.filter((_, index) => index % samplingRate === 0);
};

// 데이터 병합 및 중복 제거 함수
const mergeAndDeduplicate = (localData: Progress[], remoteData: Progress[]): Progress[] => {
  const allData = [...localData, ...remoteData];
  // 무게, 성공여부, 날짜를 기준으로 중복 제거
  const uniqueMap = new Map();
  
  allData.forEach(item => {
    const key = `${item.weight}-${item.isSuccess}-${new Date(item.date).toDateString()}`;
    if (!uniqueMap.has(key) || new Date(item.date) > new Date(uniqueMap.get(key).date)) {
      uniqueMap.set(key, item);
    }
  });
  
  return Array.from(uniqueMap.values());
};

// 세션 비교 함수
const isSameSession = (a: Progress, b: Progress): boolean => {
  return a.weight === b.weight && 
         a.isSuccess === b.isSuccess && 
         new Date(a.date).toDateString() === new Date(b.date).toDateString();
};

// 로딩 상태 컴포넌트
const LoadingState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
    <p className="text-gray-500">데이터를 불러오는 중...</p>
  </div>
);

// 빈 데이터 컴포넌트
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-gray-500 text-lg font-medium">기록된 데이터가 없습니다</p>
    <p className="text-gray-400 text-sm">운동을 기록하면 그래프가 표시됩니다</p>
  </div>
);

// 요약 통계 컴포넌트
const DataSummary = ({ data }: { data: Progress[] }) => {
  // 데이터 요약 계산
  const summary = useMemo(() => {
    if (data.length === 0) return null;
    
    // 최근 기간만 사용 (가장 최근 10개 데이터)
    const recentData = data.slice(0, Math.min(10, data.length));
    
    // 최대/최소/평균 무게
    const weights = recentData.map(d => d.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
    // 성공률
    const successCount = recentData.filter(d => d.isSuccess).length;
    const successRate = (successCount / recentData.length) * 100;
    
    return {
      maxWeight,
      minWeight,
      avgWeight: Math.round(avgWeight * 10) / 10,
      successRate: Math.round(successRate)
    };
  }, [data]);
  
  if (!summary) return null;
  
  return (
    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow">
        <div className="text-xs text-gray-500">최대 무게</div>
        <div className="font-bold text-lg">{summary.maxWeight}kg</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow">
        <div className="text-xs text-gray-500">최소 무게</div>
        <div className="font-bold text-lg">{summary.minWeight}kg</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow">
        <div className="text-xs text-gray-500">평균 무게</div>
        <div className="font-bold text-lg">{summary.avgWeight}kg</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow">
        <div className="text-xs text-gray-500">성공률</div>
        <div className="font-bold text-lg">{summary.successRate}%</div>
      </div>
    </div>
  );
};

// 세트 상세 정보 컴포넌트
const SetDetails = ({ session }: { session: Progress | null }) => {
  if (!session) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">세트 상세 정보</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(session.date).toLocaleDateString('ko-KR', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </span>
        <span className="font-bold text-lg">{session.weight}kg</span>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mt-3">
        {session.sets.map((set: any, i: number) => (
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
    </div>
  );
};

// 지연 로딩 차트 컴포넌트
const LazyLoadChart = ({ 
  data, 
  chartData, 
  chartOptions, 
  plugins, 
  onClick 
}: { 
  data: Progress[],
  chartData: any, 
  chartOptions: any, 
  plugins: any[], 
  onClick: any 
}) => {
  const [isChartVisible, setIsChartVisible] = useState(false);
  
  useEffect(() => {
    // 컴포넌트 마운트 후 약간의 지연을 두고 차트 표시 (애니메이션 방지)
    const timer = setTimeout(() => {
      setIsChartVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isChartVisible) {
    return <div className="animate-pulse h-full w-full bg-gray-200 dark:bg-gray-700 rounded"></div>;
  }
  
  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <Line
      data={chartData}
      options={chartOptions}
      plugins={plugins}
      onClick={onClick}
    />
  );
};

// 최적화된 그래프 페이지 컴포넌트
export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [data, setData] = useState<Progress[]>([]);
  const [displayData, setDisplayData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Progress | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'recent'>('recent');
  const itemsPerPage = 10;
  
  // 차트 데이터 준비
  const prepareDisplayData = useCallback(() => {
    if (data.length === 0) {
      setDisplayData([]);
      return;
    }
    
    // 표시 모드에 따라 다운샘플링 적용
    if (viewMode === 'all' && data.length > 50) {
      // 전체 데이터 모드일 때 대용량 데이터는 다운샘플링
      setDisplayData(downsampleData(data, 50));
    } else if (viewMode === 'recent') {
      // 최근 데이터 모드일 때는 최근 15개만 표시
      setDisplayData(data.slice(0, Math.min(15, data.length)));
    } else {
      setDisplayData(data);
    }
  }, [data, viewMode]);
  
  // 데이터 변경 시 디스플레이 데이터 업데이트
  useEffect(() => {
    prepareDisplayData();
  }, [data, viewMode, prepareDisplayData]);

  // 커스텀 라벨 플러그인 - 메모이제이션
  const labelPlugin = useMemo(() => ({
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      if (!chart || !chart.ctx || displayData.length === 0) return;
      
      try {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        
        // 성능 최적화: 보이는 포인트만 렌더링
        const visiblePoints = displayData.filter((_, i) => 
          meta.data[i] && meta.data[i].active);
        
        visiblePoints.forEach((p, i) => {
          if (!meta.data[i]) return;
          
          const { x, y } = meta.data[i].tooltipPosition();
          ctx.save();
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = p.isSuccess ? '#22c55e' : '#ef4444';
          ctx.fillText(p.isSuccess ? '성공' : '실패', x, y - 10);
          ctx.restore();
        });
      } catch (e) {
        console.error('라벨 플러그인 오류:', e);
      }
    }
  }), [displayData]);

  // 커스텀 툴팁 플러그인 - 메모이제이션
  const customTooltip = useMemo(() => ({
    id: 'customTooltip',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const activeElement = chart.tooltip?.getActiveElements()[0];
      
      if (activeElement) {
        const dataIndex = activeElement.index;
        const dataPoint = displayData[dataIndex];
        
        if (dataPoint?.sets) {
          // 툴팁 렌더링 최적화
          const x = activeElement.element.x;
          const y = activeElement.element.y - 5;
          
          // 렌더링 성능 최적화: requestAnimationFrame 사용
          requestAnimationFrame(() => {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x - 60, y - 80, 130, 75);
            
            ctx.fillStyle = 'white';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            
            const successSets = dataPoint.sets.filter((s: any) => s.isSuccess).length;
            ctx.fillText(`세트: ${successSets}/5 성공`, x - 55, y - 65);
            
            // 모든 세트를 한 번에 렌더링
            let yOffset = -45;
            for (let i = 0; i < Math.min(dataPoint.sets.length, 5); i++) {
              const set = dataPoint.sets[i];
              ctx.fillStyle = set.isSuccess ? '#22c55e' : '#ef4444';
              ctx.fillText(`${i+1}세트: ${set.reps}회`, x - 55, y + yOffset);
              yOffset += 15;
            }
            
            ctx.restore();
          });
        }
      }
    }
  }), [displayData]);

  // 차트 옵션 메모이제이션
  const chartOptions = useMemo(() => {
    // Chart.js 애니메이션 타입에 맞게 수정
    const animationConfig = isInitialLoad 
      ? { duration: 0 } 
      : { duration: 400 };
    
    return {
      responsive: true,
      animation: animationConfig,
      plugins: { 
        legend: { display: false },
        tooltip: { enabled: false } // 기본 툴팁 비활성화
      },
      elements: {
        line: {
          tension: 0.2, // 선 부드러움 감소
          borderWidth: displayData.length > 20 ? 1.5 : 2, // 데이터 많을 때 더 얇은 선
        },
        point: {
          radius: displayData.length > 30 ? 2 : displayData.length > 15 ? 3 : 4, // 데이터량에 따라 점 크기 조정
          hoverRadius: displayData.length > 30 ? 3 : displayData.length > 15 ? 4 : 6,
        }
      },
      scales: {
        y: {
          title: { display: true, text: '무게(kg)' },
          beginAtZero: false,
          ticks: {
            maxTicksLimit: 6, // Y축 눈금 제한
          }
        },
        x: {
          ticks: {
            maxTicksLimit: displayData.length > 30 ? 10 : 20, // X축 눈금 제한
            autoSkip: true, // 자동 건너뛰기
          }
        }
      },
      maintainAspectRatio: false,
      devicePixelRatio: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 2 : 1, // 해상도 최적화 (SSR 대비)
      onHover: (_: any, elements: any) => {
        // 마우스 오버 핸들러 최적화 - RAF 사용
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              canvas.style.cursor = elements.length ? 'pointer' : 'default';
            }
          });
        }
      }
    };
  }, [isInitialLoad, displayData.length]);

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!user) return;
    
    const shouldRefresh = localStorage.getItem('shouldRefreshGraph') === 'true';
    
    try {
      // 1. 캐시된 데이터 먼저 확인
      const cachedData = !shouldRefresh ? getCachedProgressData(user.uid, part) : null;
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 즉시 표시
        const cached = cachedData; // 지역 변수로 선언
        const cachedItems = cached.data;
        setData(cachedItems);
        setLoading(false);
        setIsInitialLoad(false);
        
        // 캐시된 데이터가 충분하면 추가 로딩 방지
        if (cachedItems.length >= itemsPerPage) {
          setHasMore(true);
          
          // 백그라운드에서 새로운 데이터 체크 (사용자 방해 없이)
          setTimeout(() => {
            getProgressData(user.uid, part, 5, 0, true)
              .then(freshData => {
                if (freshData.length > 0 && 
                    freshData[0].date !== cachedItems[0].date) {
                  // 새 데이터가 있으면 업데이트
                  const combinedData = mergeAndDeduplicate(cachedItems, freshData);
                  setData(combinedData);
                  setCachedProgressData(user.uid, part, combinedData);
                }
              })
              .catch(err => console.error("백그라운드 데이터 체크 오류:", err));
          }, 3000); // 3초 지연으로 메인 렌더링에 영향 없게
          
          return;
        }
      }
      
      // 2. 로컬 스토리지 세션 데이터 확인 (빠른 UX)
      const latestSession = getLatestSessionFromLocalStorage(user.uid, part);
      if (latestSession && !cachedData) {
        setData([latestSession]);
        setLoading(false);
      }
      
      // 3. Firebase에서 데이터 로드
      setLoading(cachedData || latestSession ? false : true);
      
      const firebaseData = await getProgressData(user.uid, part, itemsPerPage, 0, true);
      
      if (firebaseData.length > 0) {
        // 데이터 병합 및 중복 제거
        const mergedData = mergeAndDeduplicate(
          latestSession && !cachedData ? [latestSession] : [], 
          firebaseData
        );
        
        // 전체 데이터는 저장
        setData(mergedData);
        
        // 캐시 업데이트
        setCachedProgressData(user.uid, part, mergedData);
        
        setHasMore(firebaseData.length === itemsPerPage);
      } else if (!cachedData && !latestSession) {
        // 데이터가 없는 경우
        setData([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      
      // 캐시된 데이터와 로컬 세션이 모두 없고 오류가 발생한 경우에만 빈 배열로 설정
      if (!cachedData && !getLatestSessionFromLocalStorage(user.uid, part)) {
        setData([]);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      localStorage.removeItem('shouldRefreshGraph');
    }
  }, [user, part, itemsPerPage]);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
    
    // 클린업 함수
    return () => {
      // 불필요한 작업 취소 등의 코드가 필요하면 여기에 추가
    };
  }, [loadData]);

  // 더 많은 데이터 로드 - 메모이제이션
  const loadMore = useCallback(() => {
    if (!user || !hasMore || loading) return;
    
    setLoading(true);
    
    getProgressData(user.uid, part, itemsPerPage, page)
      .then((rows) => {
        if (rows.length > 0) {
          // 이전 데이터와 합치기
          const newData = [...data, ...rows];
          setData(newData);
          setPage(prev => prev + 1);
          
          // 캐시 업데이트
          setCachedProgressData(user.uid, part, newData);
        }
        setHasMore(rows.length === itemsPerPage);
      })
      .catch(err => {
        console.error("추가 데이터 로딩 중 오류:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, part, hasMore, loading, page, data, itemsPerPage]);

  // 차트 데이터 메모이제이션
  const chartData = useMemo(() => {
    if (displayData.length === 0) return { labels: [], datasets: [] };
    
    try {
      // 날짜 포맷 안전하게 처리
      const labels = displayData.map(p => {
        try {
          const date = p.date instanceof Date ? p.date : new Date(p.date);
          return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        } catch (e) {
          return '날짜 오류';
        }
      });
      
      return {
        labels,
        datasets: [
          {
            label: '무게(kg)',
            data: displayData.map(p => p.weight),
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F6',
            tension: 0.3,
            spanGaps: true, // 누락된 데이터 처리
          }
        ]
      };
    } catch (e) {
      console.error('차트 데이터 생성 오류:', e);
      return { labels: [], datasets: [] };
    }
  }, [displayData]);

  // 차트 클릭 핸들러 - 메모이제이션
  const handleChartClick = useCallback(
    (_event: React.MouseEvent<HTMLCanvasElement>, elements: any) => {
      if (elements && elements.length) {
        const clickedIndex = elements[0].index;
        const selectedPoint = displayData[clickedIndex];
        
        // 전체 데이터에서 원본 항목 찾기
        const originalItem = data.find(item => 
          isSameSession(item, selectedPoint)
        );
        
        setSelectedSession(originalItem || selectedPoint);
      }
    },
    [displayData, data]
  );

  // 부품 변경 핸들러 - 메모이제이션
  const handlePartChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPart = e.target.value as ExercisePart;
    setPart(newPart);
    setPage(1);
    setHasMore(true);
    setSelectedSession(null);
    setIsInitialLoad(true);
    setLoading(true);
    setDisplayData([]);
  }, []);
  
  // 뷰 모드 변경 핸들러
  const handleViewModeChange = useCallback((mode: 'all' | 'recent') => {
    setViewMode(mode);
    setSelectedSession(null);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">운동 그래프</h1>
      
      {/* 데이터 요약 통계 */}
      {data.length > 0 && <DataSummary data={data} />}
      
      <div className="flex justify-between items-center mb-4">
        <select
          value={part}
          onChange={handlePartChange}
          className="border px-3 py-2 rounded dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(PART_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewModeChange('recent')}
            className={`px-3 py-2 rounded ${
              viewMode === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            최근 기록
          </button>
          <button
            onClick={() => handleViewModeChange('all')}
            className={`px-3 py-2 rounded ${
              viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            전체 기록
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 h-72">
        {loading && data.length === 0 ? (
          <LoadingState />
        ) : (
          <LazyLoadChart 
            data={displayData}
            chartData={chartData}
            chartOptions={chartOptions}
            plugins={[labelPlugin, customTooltip]}
            onClick={handleChartClick as any}
          />
        )}
      </div>
      
      {/* 선택된 세션 상세 정보 */}
      <SetDetails session={selectedSession} />
      
      {hasMore && viewMode === 'all' && (
        <button 
          onClick={loadMore} 
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full"
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더 많은 데이터 보기'}
        </button>
      )}
    </Layout>
  );
}
