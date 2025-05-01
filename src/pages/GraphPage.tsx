import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
} from 'chart.js';
import { ExercisePart, Progress } from '../types';
import { useAuthStore } from '../stores/authStore';
import { getProgressData } from '../services/firebaseService';
import Layout from '../components/common/Layout';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

const partNames = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' };

export default function GraphPage() {
  const { user } = useAuthStore();
  const [part, setPart] = useState<ExercisePart>('chest');
  const [data, setData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Progress | null>(null); // 팝업용

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getProgressData(user.uid, part, 20).then((d) => {
      setData(d.reverse()); // 오래된 → 최근
      setLoading(false);
    });
  }, [user, part]);

  /* 차트 데이터 */
  const chartData = useMemo(() => {
    if (!data.length) return null;
    return {
      labels: data.map((d) =>
        d.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: '무게(kg)',
          data: data.map((d) => d.weight),
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6'
        }
      ]
    };
  }, [data]);

  /* 클릭 이벤트: pointIndex → detail 세트 열기 */
  const onClick = (_: unknown, elements: any[]) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    setDetail(data[idx]);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">진행 상황</h1>

      {/* 부위 선택 */}
      <select
        className="border p-2 rounded mb-6 dark:bg-gray-700 dark:text-white"
        value={part}
        onChange={(e) => setPart(e.target.value as ExercisePart)}
      >
        {Object.entries(partNames).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      {/* 그래프 */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-8 h-72">
        {loading ? (
          <p className="text-center text-gray-400 mt-24">로딩 중...</p>
        ) : chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              onClick,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: false, title: { display: true, text: '무게(kg)' } }
              }
            }}
          />
        ) : (
          <p className="text-center text-gray-400 mt-24">데이터가 없습니다.</p>
        )}
      </div>

      {/* 상세 팝업 */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-xs w-full">
            <h2 className="font-semibold mb-4">
              {detail.date.toLocaleDateString('ko-KR')} 세트 상세
            </h2>
            <ul className="space-y-1 mb-4">
              {detail.sets.map((s, i) => (
                <li key={i}>
                  {i + 1}세트 – {s.reps} reps (
                  {s.isSuccess ? '성공' : '실패'})
                </li>
              ))}
            </ul>
            <button
              onClick={() => setDetail(null)}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
