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

// 세션 비교 함수
const isSameSession = (a: Progress, b: Progress): boolean => {
  return (
    a.weight === b.weight && 
    a.isSuccess === b.isSuccess && 
    new Date(a.date).toDateString() === new Date(b.date).toDateString()
  );
};

// 최근 데이터 카드 컴포넌트
const RecentSessionCard = ({ data }: { data: Progress | null }) => {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 flex items-center justify-center h-40">
        <p className="text-gray-500">최근 운동 기록이 없습니다</p>
      </div>
    );
  }
  
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const successSets = data.sets.filter(set => set.isSuccess).length;
  const totalSets = data.sets.length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
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
      
      <div className="mb-2">
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
      
      <div className="grid grid-cols-5 gap-2 mt-4">
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

// 로딩 상태 컴포넌트
const LoadingState = () => (
  <div className="flex items-center justify-center h-72">
    <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
    <p className="text-gray-500">데이터를 불러오는 중...</p>
  </div>
);

// 빈 데이터 컴포넌트
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-72">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-gray-500 text-lg font-medium">기록된 데이터가 없습니다</p>
    <p className="text-gray-400 text-sm">운동을 기록하면 그래프가 표시됩니다</p>
  </div>
);

export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [allData, setAllData] = useState<Progress[]>([]);
  const [displayData, setDisplayData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Progress | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
  const [dateRange, setDateRange] = useState<'all' | '3months' | '6months'>('3months');
  const itemsPerPage = 20; // 한 번에 더 많은 데이터 로드
  
  // 데이터 날짜 필터링
  const filterDataByDateRange = useCallback((data: Progress[], range: 'all' | '3months' | '6months') => {
    if (range === 'all') return data;
    
    const cutoffDate = getDateRangeFilter(range);
    return data.filter(item => new Date(item.date) >= cutoffDate);
  }, []);
  
  // 날짜 범위에 따른 데이터 업데이트
  useEffect(() => {
    if (allData.length === 0) return;
    
    const filtered = filterDataByDateRange(allData, dateRange);
    setDisplayData(filtered);
  }, [dateRange, allData, filterDataByDateRange]);

  // 커스텀 라벨 플러그인 - 메모이제이션
  const labelPlugin = useMemo(() => ({
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      if (!chart || !chart.ctx || displayData.length === 0) return;
      
      try {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        
        displayData.forEach((p, i) => {
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
          // 툴팁 렌더링
          const x = activeElement.element.x;
          const y = activeElement.element.y - 5;
          
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(x - 60, y - 80, 130, 75);
          
          ctx.fillStyle = 'white';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          
          const successSets = dataPoint.sets.filter((s: any) => s.isSuccess).length;
          ctx.fillText(`세트: ${successSets}/${dataPoint.sets.length} 성공`, x - 55, y - 65);
          
          // 각 세트 상세 정보
          let yOffset = -45;
          for (let i = 0; i < Math.min(dataPoint.sets.length, 5); i++) {
            const set = dataPoint.sets[i];
            ctx.fillStyle = set.isSuccess ? '#22c55e' : '#ef4444';
            ctx.fillText(`${i+1}세트: ${set.reps}회`, x - 55, y + yOffset);
            yOffset += 15;
          }
          
          ctx.restore();
        }
      }
    }
  }), [displayData]);

  // 차트 옵션 메모이제이션
  const chartOptions = useMemo(() => {
    const animationConfig = { duration: 400 };
    
    return {
      responsive: true,
      animation: animationConfig,
      plugins: { 
        legend: { display: false },
        tooltip: { enabled: false } // 기본 툴팁 비활성화
      },
      elements: {
        line: {
          tension: 0.2,
          borderWidth: 2,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
        }
      },
      scales: {
        y: {
          title: { display: true, text: '무게(kg)' },
          beginAtZero: false,
          ticks: {
            maxTicksLimit: 6, 
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 12,
            autoSkip: true, 
          }
        }
      },
      maintainAspectRatio: false,
      devicePixelRatio: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 2 : 1,
      onClick: (_: any, elements: any) => {
        if (elements && elements.length) {
          const clickedIndex = elements[0].index;
          handlePointClick(clickedIndex);
        }
      }
    };
  }, []);

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!user) return;
    
    const shouldRefresh = localStorage.getItem('shouldRefreshGraph') === 'true';
    
    try {
      // 1. 캐시된 데이터 먼저 확인
      const cachedData = !shouldRefresh ? getCachedProgressData(user.uid, part) : null;
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 즉시 표시
        const cached = cachedData;
        const cachedItems = cached.data;
        setAllData(cachedItems);
        setLoading(false);
        
        // 캐시된 데이터가 충분하면 추가 로딩 방지
        if (cachedItems.length >= itemsPerPage) {
          setHasMore(true);
          
          // 백그라운드에서 새로운 데이터 체크
          setTimeout(() => {
            getProgressData(user.uid, part, 5, 0, true)
              .then(freshData => {
                if (freshData.length > 0 && 
                    (cachedItems.length === 0 || freshData[0].date !== cachedItems[0].date)) {
                  // 새 데이터가 있으면 업데이트
                  const combinedData = mergeAndDeduplicate(cachedItems, freshData);
                  setAllData(combinedData);
                  setCachedProgressData(user.uid, part, combinedData);
                }
              })
              .catch(err => console.error("백그라운드 데이터 체크 오류:", err));
          }, 2000);
          
          return;
        }
      }
      
      // 2. 로컬 스토리지 세션 데이터 확인 (빠른 UX)
      const latestSession = getLatestSessionFromLocalStorage(user.uid, part);
      if (latestSession && !cachedData) {
        setAllData([latestSession]);
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
        setAllData(mergedData);
        
        // 캐시 업데이트
        setCachedProgressData(user.uid, part, mergedData);
        
        setHasMore(firebaseData.length === itemsPerPage);
      } else if (!cachedData && !latestSession) {
        // 데이터가 없는 경우
        setAllData([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      
      // 캐시된 데이터와 로컬 세션이 모두 없고 오류가 발생한 경우에만 빈 배열로 설정
      const hasCache = getCachedProgressData(user.uid, part) !== null;
      if (!hasCache && !getLatestSessionFromLocalStorage(user.uid, part)) {
        setAllData([]);
      }
    } finally {
      setLoading(false);
      localStorage.removeItem('shouldRefreshGraph');
    }
  }, [user, part, itemsPerPage]);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 더 많은 데이터 로드
  const loadMore = useCallback(() => {
    if (!user || !hasMore || loading) return;
    
    setLoading(true);
    
    getProgressData(user.uid, part, itemsPerPage, page)
      .then((rows) => {
        if (rows.length > 0) {
          // 이전 데이터와 합치기
          const newData = mergeAndDeduplicate(allData, rows);
          setAllData(newData);
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
  }, [user, part, hasMore, loading, page, allData, itemsPerPage]);

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
            spanGaps: true,
          }
        ]
      };
    } catch (e) {
      console.error('차트 데이터 생성 오류:', e);
      return { labels: [], datasets: [] };
    }
  }, [displayData]);

  // 포인트 클릭 핸들러
  const handlePointClick = useCallback((index: number) => {
    const clickedData = displayData[index];
    if (clickedData) {
      setSelectedSession(clickedData);
    }
  }, [displayData]);

  // 부품 변경 핸들러
  const handlePartChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPart = e.target.value as ExercisePart;
    setPart(newPart);
    setPage(1);
    setHasMore(true);
    setSelectedSession(null);
    setLoading(true);
    setAllData([]);
    setDisplayData([]);
  }, []);
  
  // 뷰 모드 변경 핸들러
  const handleViewModeChange = useCallback((mode: 'recent' | 'all') => {
    setViewMode(mode);
    setSelectedSession(null);
  }, []);
  
  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((range: '3months' | '6months' | 'all') => {
    setDateRange(range);
    setSelectedSession(null);
  }, []);
  
  // 최근 데이터(1개) 메모이제이션
  const latestSession = useMemo(() => {
    if (allData.length === 0) return null;
    return allData[0]; // 이미 날짜순으로 정렬되어 있음
  }, [allData]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">운동 그래프</h1>
      
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
      
      {loading && allData.length === 0 ? (
        <LoadingState />
      ) : viewMode === 'recent' ? (
        // 최근 기록 모드 - 카드 형태로 표시
        <RecentSessionCard data={latestSession} />
      ) : (
        // 전체 기록 모드 - 그래프로 표시
        <>
          <div className="flex justify-end mb-2 space-x-2">
            <button
              onClick={() => handleDateRangeChange('3months')}
              className={`px-3 py-1 text-sm rounded ${
                dateRange === '3months' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              최근 3개월
            </button>
            <button
              onClick={() => handleDateRangeChange('6months')}
              className={`px-3 py-1 text-sm rounded ${
                dateRange === '6months' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              최근 6개월
            </button>
            <button
              onClick={() => handleDateRangeChange('all')}
              className={`px-3 py-1 text-sm rounded ${
                dateRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              전체 기간
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 h-72">
            {displayData.length === 0 ? (
              <EmptyState />
            ) : (
              <Line
                data={chartData}
                options={chartOptions}
                plugins={[labelPlugin, customTooltip]}
              />
            )}
          </div>
          
          {/* 선택된 세션 상세 정보 */}
          {selectedSession && <SetDetails session={selectedSession} />}
          
          {hasMore && viewMode === 'all' && (
            <button 
              onClick={loadMore} 
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full"
              disabled={loading}
            >
              {loading ? '로딩 중...' : '더 많은 데이터 보기'}
            </button>
          )}
        </>
      )}
    </Layout>
  );
}
