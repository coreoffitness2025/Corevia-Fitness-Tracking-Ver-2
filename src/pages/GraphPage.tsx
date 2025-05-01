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
    getProgressData(user.uid, part, 10).then((data) => {
      setRows(data.reverse());
      setLoading(false);
      setSelected(null);
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
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3
        }
      ]
    };
  }, [rows]);

  const handlePointClick = (_: unknown, el: any[]) => {
    if (!el.length) return;
    setSelected(rows[el[0].index]);
  };

  const labelPlugin = {
    id: 'labelPlugin',
    afterDatasetDraw(chart: any) {
      const ctx = chart.ctx;
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* 그래프 */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 h-72">
          {loading ? (
            <p className="text-center text-gray-400 mt-24">로딩 중...</p>
          ) : chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                onClick: handlePointClick,
                plugins: { legend: { display: false } },
                scales: { y: { title: { display: true, text: '무게(kg)' } } }
              }}
              plugins={[labelPlugin]}
            />
          ) : (
            <p className="text-center text-gray-400 mt-24">데이터가 없습니다.</p>
          )}
        </div>

        {/* 상세 패널 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded shadow p-4 min-h-72">
          {!selected ? (
            <p className="text-gray-600 dark:text-gray-400">
              그래프의 점을 클릭하면<br />해당 날짜의 세트 현황이 표시됩니다.
            </p>
          ) : (
            <>
              <h2 className="text-sm font-semibold mb-2">
                {new Date(selected.date).toLocaleDateString('ko-KR')} 상세
              </h2>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {selected.sets.map((s, i) => (
                  <li key={i}>
                    {i + 1}세트 – {s.reps} reps ({s.isSuccess ? '성공' : '실패'})
                  </li>
                ))}
              </ul>

              {/* 보조 운동 목록 */}
              {selected.accessoryNames.length > 0 && (
                <>
                  <h3 className="mt-4 font-semibold text-sm">보조 운동</h3>
                  <ul className="list-disc list-inside text-sm">
                    {selected.accessoryNames.map((n: string) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
