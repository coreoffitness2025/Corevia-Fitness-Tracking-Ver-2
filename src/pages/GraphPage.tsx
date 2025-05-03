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
  const itemsPerPage = 10;

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    setData([]);
    setPage(1);
    setHasMore(true);
    
    console.log('그래프 페이지 데이터 로딩 시작:', part);
    
    // 먼저 로컬 스토리지에서 최신 세션 가져오기
    const latestSession = getLatestSessionFromLocalStorage(user.uid, part);
    console.log('로컬 스토리지 최신 세션:', latestSession);
    
    // Firebase에서 데이터 가져오기
    getProgressData(user.uid, part, itemsPerPage, 0, true)
      .then((rows) => {
        console.log('Firebase에서 가져온 데이터:', rows.length, '개');
        
        if (rows.length > 0) {
          // 로컬 스토리지에 최신 세션이 있고 Firebase 데이터에 없는 경우 병합
          if (latestSession && !rows.some(r => 
              r.weight === latestSession.weight && 
              r.isSuccess === latestSession.isSuccess)) {
            console.log('로컬 스토리지 데이터 병합');
            setData([latestSession, ...rows]);
          } else {
            setData(rows);
          }
          setHasMore(rows.length === itemsPerPage);
        } else if (latestSession) {
          // Firebase에 데이터가 없고 로컬 스토리지에만 있는 경우
          console.log('로컬 스토리지 데이터만 사용');
          setData([latestSession]);
          setHasMore(false);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("데이터 로딩 중 오류:", err);
        
        // 오류 발생 시 로컬 스토리지 데이터로 폴백
        if (latestSession) {
          console.log('오류 발생, 로컬 스토리지 데이터 사용');
          setData([latestSession]);
        }
        setLoading(false);
        setHasMore(false);
      });
      
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

  // 데이터 디버깅
  useEffect(() => {
    console.log('현재 그래프 데이터:', data.length, '개');
    if (data.length > 0) {
      console.log('첫 번째 데이터:', data[0]);
    }
  }, [data]);

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
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-8 h-72">
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
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  title: { display: true, text: '무게(kg)' }
                }
              }
            }}
            plugins={[labelPlugin]}
          />
        )}
      </div>
      
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
