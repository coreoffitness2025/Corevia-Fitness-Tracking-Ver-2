// src/pages/GraphPage.tsx
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

export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [data, setData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;

  // 데이터 초기 로드
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    setData([]);
    setPage(1);
    setHasMore(true);
    
    getProgressData(user.uid, part, itemsPerPage).then((rows) => {
      setData(rows.reverse());
      setLoading(false);
      setHasMore(rows.length === itemsPerPage);
    }).catch(err => {
      console.error("데이터 로딩 중 오류:", err);
      setLoading(false);
    });
  }, [user, part]);

  // 더 많은 데이터 로드
  const loadMore = () => {
    if (!user || !hasMore || loading) return;
    
    setLoading(true);
    
    getProgressData(user.uid, part, itemsPerPage, page).then((rows) => {
      if (rows.length > 0) {
        setData(prev => [...prev, ...rows.reverse()]);
        setPage(prev => prev + 1);
      }
      setHasMore(rows.length === itemsPerPage);
      setLoading(false);
    }).catch(err => {
      console.error("추가 데이터 로딩 중 오류:", err);
      setLoading(false);
    });
  };

  const chartData = useMemo(() => {
    return {
      labels: data.map((p) =>
        new Date(p.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: '무게(kg)',
          data: data.map((p) => p.weight),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.3
        }
      ]
    };
  }, [data]);

  const labelPlugin = {
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      data.forEach((p, i) => {
        const { x, y } = meta.data[i].tooltipPosition();
        ctx.save();
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = p.isSuccess ? '#22c55e' : '#ef4444';
        ctx.fillText(p.isSuccess ? '성공' : '실패', x, y - 10);
        ctx.restore();
      });
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
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-8 h-72">
        {loading && data.length === 0 ? (
          <p className="text-center text-gray-400 mt-24">로딩 중...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 mt-24">기록된 데이터가 없습니다.</p>
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
      
      {hasMore && (
        <button 
          onClick={loadMore} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md w-full"
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더 많은 데이터 보기'}
        </button>
      )}
    </Layout>
  );
}
