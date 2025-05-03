// 최적화된 GraphPage 컴포넌트
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

// 최적화된 그래프 페이지 컴포넌트
export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [data, setData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Progress | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const itemsPerPage = 10;

  // 메모이제이션된 차트 옵션
  const chartOptions = useMemo(() => ({
    responsive: true,
    animation: isInitialLoad ? false : true, // 초기 로딩 시 애니메이션 비활성화
    plugins: { 
      legend: { display: false },
      tooltip: { enabled: false } // 기본 툴팁 비활성화
    },
    scales: {
      y: {
        title: { display: true, text: '무게(kg)' },
        beginAtZero: false // y축 최소값 자동 조정
      }
    },
    maintainAspectRatio: false,
    onHover: (_: any, elements: any) => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.cursor = elements.length ? 'pointer' : 'default';
      }
    }
  }), [isInitialLoad]);

  // 라벨 플러그인 - 메모이제이션
  const labelPlugin = useMemo(() => ({
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      if (!chart || !chart.ctx || data.length === 0) return;
      
      try {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        
        // 성능 최적화: 보이는 포인트만 렌더링
        data.forEach((p, i) => {
          if (!meta.data[i] || !meta.data[i].active) return;
          
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
  }), [data]);

  // 커스텀 툴팁 플러그인 - 메모이제이션
  const customTooltip = useMemo(() => ({
    id: 'customTooltip',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const activeElement = chart.tooltip?.getActiveElements()[0];
      
      if (activeElement) {
        const dataIndex = activeElement.index;
        const dataPoint = data[dataIndex];
        
        if (dataPoint?.sets) {
          // 툴팁 렌더링 최적화
          const x = activeElement.element.x;
          const y = activeElement.element.y - 5;
          
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
          for (let i = 0; i < dataPoint.sets.length; i++) {
            const set = dataPoint.sets[i];
            ctx.fillStyle = set.isSuccess ? '#22c55e' : '#ef4444';
            ctx.fillText(`${i+1}세트: ${set.reps}회`, x - 55, y + yOffset);
            yOffset += 15;
          }
          
          ctx.restore();
        }
      }
    }
  }), [data]);

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!user) return;
    
    const shouldRefresh = localStorage.getItem('shouldRefreshGraph') === 'true';
    
    try {
      // 1. 캐시된 데이터 먼저 확인
      const cachedData = !shouldRefresh ? getCachedProgressData(user.uid, part) : null;
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 즉시 표시
        const cachedItems = cachedData.data;
        setData(cachedItems);
        setLoading(false);
        
        // 캐시된 데이터가 충분하면 추가 로딩 방지
        if (cachedItems.length >= itemsPerPage) {
          setHasMore(true);
          return;
        }
      }
      
      // 2. Firebase에서 데이터 로드
      setLoading(true);
      
      const firebaseData = await getProgressData(user.uid, part, itemsPerPage, 0, true);
      
      if (firebaseData.length > 0) {
        // 데이터 설정 및 캐시
        setData(firebaseData);
        setCachedProgressData(user.uid, part, firebaseData);
        setHasMore(firebaseData.length === itemsPerPage);
      } else if (!cachedData) {
        // 데이터가 없는 경우
        setData([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      
      // 캐시된 데이터가 없고 오류가 발생한 경우에만 빈 배열로 설정
      if (!cachedData) {
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
          setData(prev => [...prev, ...rows]);
          setPage(prev => prev + 1);
          
          // 캐시 업데이트 (현재 데이터와 새 데이터 모두 저장)
          const updatedData = [...data, ...rows];
          setCachedProgressData(user.uid, part, updatedData);
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
    if (data.length === 0) return { labels: [], datasets: [] };
    
    try {
      // 데이터 크기에 따라 포인트 스타일 최적화
      const pointRadius = data.length > 20 ? 4 : 6;
      const pointHoverRadius = data.length > 20 ? 6 : 8;
      
      // 날짜 포맷 안전하게 처리
      const labels = data.map(p => {
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
            data: data.map(p => p.weight),
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F6',
            pointRadius,
            pointHoverRadius,
            tension: 0.3,
            spanGaps: true, // 누락된 데이터 처리
          }
        ]
      };
    } catch (e) {
      console.error('차트 데이터 생성 오류:', e);
      return { labels: [], datasets: [] };
    }
  }, [data]);

  // 차트 클릭 핸들러 - 메모이제이션
  const handleChartClick = useCallback(
    (_event: React.MouseEvent<HTMLCanvasElement>, elements: any) => {
      if (elements && elements.length) {
        const clickedIndex = elements[0].index;
        setSelectedSession(data[clickedIndex]);
      }
    },
    [data]
  );

  // 부품 변경 핸들러 - 메모이제이션
  const handlePartChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPart(e.target.value as ExercisePart);
    setPage(1);
    setHasMore(true);
    setSelectedSession(null);
    setIsInitialLoad(true);
  }, []);

  // 세트 상세 정보 컴포넌트 - 메모이제이션
  const SetDetails = useMemo(() => {
    if (!selectedSession) return null;
    
    const session = selectedSession;
    
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
  }, [selectedSession]);

  // 로딩 및 빈 상태 표시 컴포넌트 - 메모이제이션
  const LoadingOrEmptyState = useMemo(() => {
    if (loading && data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      );
    } else if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">기록된 데이터가 없습니다</p>
          <p className="text-gray-400 text-sm">운동을 기록하면 그래프가 표시됩니다</p>
        </div>
      );
    }
    
    return null;
  }, [loading, data]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">운동 그래프</h1>
      
      <select
        value={part}
        onChange={handlePartChange}
        className="border px-3 py-2 rounded mb-6 dark:bg-gray-700 dark:text-white"
      >
        {Object.entries(PART_LABEL).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 h-72">
        {LoadingOrEmptyState || (
          <Line
            data={chartData}
            options={chartOptions}
            plugins={[labelPlugin, customTooltip]}
            onClick={handleChartClick as any}
          />
        )}
      </div>
      
      {/* 선택된 세션 상세 정보 */}
      {SetDetails}
      
      {hasMore && data.length > 0 && (
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
