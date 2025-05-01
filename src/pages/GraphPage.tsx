/* src/pages/GraphPage.tsx */

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
  const [rows, setRows] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Progress | null>(null);

  /* 1. 데이터 fetch (최근 20회) */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getProgressData(user.uid, part, 20).then((d) => {
      setRows(d.reverse());          // 오래된 → 최신
      setLoading(false);
    });
  }, [user, part]);

  /* 2. 차트 데이터 */
  const chartData = useMemo(() => {
    if (!rows.length) return null;

    return {
      labels: rows.map((p) =>
        new Date(p.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: '무게(kg)',
          data: rows.map((p) => p.weight),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.3
        }
      ]
    };
  }, [rows]);

  /* 3. 포인트 클릭 => 실패일 경우 팝업 */
  const onPointClick = (_: any, el: any[]) => {
    if (!el.length) return;
    const idx = el[0].index;
    if (!rows[idx].isSuccess) setDetail(rows[idx]);
  };

  /* 4. 커스텀 플러그인: 점 위에 “성공 / 실패” 텍스트 */
  const labelPlugin = {
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      rows.forEach((p, i) => {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">진행 상황</h1>
        <p className="text-gray-600 dark:text-gray-400">날짜별 운동 진행을 확인하세요</p>
      </div>

      {/* 부위 선택 */}
      <select
        value={part}
        onChange={(e) => setPart(e.target.value as ExercisePart)}
        className="border px-3 py-2 rounded mb-6 dark:bg-gray-700 dark:text-white"
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
              onClick: onPointClick,
              plugins: { legend: { display: false } },
              scales: {
                y: { title: { display: true, text: '무게(kg)' } }
              }
            }}
            plugins={[labelPlugin]}
          />
        ) : (
          <p className="text-center text-gray-400 mt-24">데이터가 없습니다.</p>
        )}
      </div>

      {/* 실패일 상세 팝업 */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-xs w-full">
            <h2 className="font-semibold mb-4">
              {new Date(detail.date).toLocaleDateString('ko-KR')} 세트 상세
            </h2>
            <ul className="space-y-1 text-sm mb-4">
              {detail.sets.map((s, i) => (
                <li key={i}>
                  {i + 1}세트 – {s.reps} reps ({s.isSuccess ? '성공' : '실패'})
                </li>
              ))}
            </ul>
            <button
              onClick={() => setDetail(null)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
