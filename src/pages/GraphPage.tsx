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
  const [selected, setSelected] = useState<Progress | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getProgressData(user.uid, part, 20).then((d) => {
      setRows(d.reverse());
      setLoading(false);
    });
  }, [user, part]);

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

  const onPointClick = (_: any, el: any[]) => {
    if (!el.length) return;
    const idx = el[0].index;
    setSelected(rows[idx]);
  };

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

      <select
        value={part}
        onChange={(e) => setPart(e.target.value as ExercisePart)}
        className="border px-3 py-2 rounded mb-6 dark:bg-gray-700 dark:text-white"
      >
        {Object.entries(partNames).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      {/* 그래프 + 상세 레이아웃 분리 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 h-72">
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

        <div className="bg-gray-50 dark:bg-gray-800 rounded shadow p-4 min-h-72">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            {selected
              ? `${new Date(selected.date).toLocaleDateString('ko-KR')} 진행 결과`
              : '세트를 확인하려면 그래프 점을 선택하세요'}
          </h2>

          {selected && !selected.isSuccess ? (
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {selected.sets.map((s, i) => (
                <li key={i}>
                  {i + 1}세트 – {s.reps} reps ({s.isSuccess ? '성공' : '실패'})
                </li>
              ))}
            </ul>
          ) : selected && selected.isSuccess ? (
            <p className="text-green-600 dark:text-green-400 text-sm">모든 세트를 성공했습니다!</p>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
