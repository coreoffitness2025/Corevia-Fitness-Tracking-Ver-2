import { useState, useEffect, useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);
const PART_LABEL = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' };

// 로컬 스토리지에서 직접 데이터 가져오기
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

export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [data, setData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Progress | null>(null);
  const itemsPerPage = 10;

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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (!user) return;
    
    // 이전 데이터가 있으면 먼저 보여주기 (빠른 UX)
    const localKey = `session-${user.uid}-${part}`;
    const cachedData = localStorage.getItem(localKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData)) {
          setData(parsedData);
          setLoading(false); // 로딩 상태 즉시 해제
        } else if (parsedData) {
          // 단일 세션인 경우
          setData([parsedData]);
          setLoading(false);
        }
      } catch (e) {
        console.error('캐시 파싱 오류:', e);
      }
    }
    
    // 백그라운드에서 데이터 로드 (사용자는 이미 캐시된 데이터를 볼 수 있음)
    const fetchData = async () => {
      try {
        console.log('백그라운드 데이터 로드 시작');
        // 로컬 스토리지 데이터와 병합
        const latestSession = getLatestSessionFromLocalStorage(user.uid, part);
        
        // Promise.all로 병렬 처리
        const [firebaseData] = await Promise.all([
          getProgressData(user.uid, part, 10, 0, true)
        ]);
        
        // 데이터 병합 및 중복 제거
        if (firebaseData.length > 0) {
          const mergedData = mergeAndDeduplicate(
            latestSession ? [latestSession] : [], 
            firebaseData
          );
          
          setData(mergedData);
          setHasMore(firebaseData.length === 10);
        } else if (latestSession && !data.some(d => isSameSession(d, latestSession))) {
          setData(prev => [latestSession, ...prev]);
        }
      } catch (err) {
        console.error("백그라운드 데이터 로드 오류:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // 그래프 새로고침 플래그 제거
    localStorage.removeItem('shouldRefreshGraph');
  }, [user, part]);

  // 더 많은 데이터 로드
  const loadMore = () => {
    if (!user || !hasMore || loading) return;
    
    setLoading(true);
    
    getProgressData(user.uid, part, itemsPerPage, page)
      .then((rows) => {
        if (rows.length > 0) {
          setData(prev => [...prev, ...rows]);
          setPage(prev => prev + 1);
        }
        setHasMore(rows.length === itemsPerPage);
        setLoading(false);
      })
      .catch(err => {
        console.error("추가 데이터 로딩 중 오류:", err);
        setLoading(false);
      });
  };

  const chartData = useMemo(() => {
    if (data.length === 0) return { labels: [], datasets: [] };
    
    try {
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
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.3
          }
        ]
      };
    } catch (e) {
      console.error('차트 데이터 생성 오류:', e);
      return { labels: [], datasets: [] };
    }
  }, [data]);

  // 커스텀 툴팁 플러그인
  const customTooltip = {
    id: 'customTooltip',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const activeElement = chart.tooltip?.getActiveElements()[0];
      
      if (activeElement) {
        const dataIndex = activeElement.index;
        const dataPoint = data[dataIndex];
        
        if (dataPoint?.sets) {
          // 툴팁 배경
          const x = activeElement.element.x;
          const y = activeElement.element.y - 5;
          
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(x - 60, y - 80, 130, 75);
          
          // 성공/실패 세트 정보
          ctx.fillStyle = 'white';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          
          const successSets = dataPoint.sets.filter((s: any) => s.isSuccess).length;
          ctx.fillText(`세트: ${successSets}/5 성공`, x - 55, y - 65);
          
          // 각 세트 상세 정보
          dataPoint.sets.forEach((set: any, i: number) => {
            ctx.fillStyle = set.isSuccess ? '#22c55e' : '#ef4444';
            ctx.fillText(`${i+1}세트: ${set.reps}회`, x - 55, y - 45 + i * 15);
          });
          
          ctx.restore();
        }
      }
    }
  };

  // 차트 클릭 이벤트 핸들러
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>, elements: any) => {
    if (elements && elements.length) {
      const clickedIndex = elements[0].index;
      setSelectedSession(data[clickedIndex]);
    }
  };

  // 세트 상세 정보 컴포넌트
  const SetDetails = ({ session }: { session: Progress }) => {
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

  const chartOptions = {
    responsive: true,
    plugins: { 
      legend: { display: false },
      tooltip: { 
        enabled: false // 기본 툴팁 비활성화 (커스텀 툴팁 사용)
      }
    },
    scales: {
      y: {
        title: { display: true, text: '무게(kg)' }
      }
    },
    onHover: (_: any, elements: any) => {
      // 호버 시 커서 변경 - event 변수는 사용하지 않음
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.cursor = elements.length ? 'pointer' : 'default';
      }
    }
  };

  const labelPlugin = {
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      if (!chart || !chart.ctx || data.length === 0) return;
      
      try {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        
        data.forEach((p, i) => {
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
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">운동 그래프</h1>
      
      <select
        value={part}
        onChange={(e) => setPart(e.target.value as ExercisePart)}
        className="border px-3 py-2 rounded mb-6 dark:bg-gray-700 dark:text-white"
      >
        {Object.entries(PART_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 h-72">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">기록된 데이터가 없습니다</p>
            <p className="text-gray-400 text-sm">운동을 기록하면 그래프가 표시됩니다</p>
          </div>
        ) : (
          <Line
            data={chartData}
            options={chartOptions}
            plugins={[labelPlugin, customTooltip]}
            onClick={handleChartClick as any} // 타입 오류 수정
          />
        )}
      </div>
      
      {/* 선택된 세션 상세 정보 */}
      {selectedSession && <SetDetails session={selectedSession} />}
      
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
