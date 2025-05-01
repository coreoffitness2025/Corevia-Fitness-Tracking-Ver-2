import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ExercisePart, Progress } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { getProgressData } from '../services/firebaseService';
import Layout from '../components/common/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const partNames = { chest: '가슴', back: '등', shoulder: '어깨', leg: '하체' };

const GraphPage = () => {
  const { user } = useAuthStore();
  const { progressCache, cacheProgress } = useSessionStore();

  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [loading, setLoading] = useState(true);

  const progressData: Progress[] | undefined = progressCache[selectedPart];

  useEffect(() => {
    if (!user) return;
    if (progressData !== undefined) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getProgressData(user.uid, selectedPart, 10)          // 최근 10회만
      .then((data) => {
        cacheProgress(selectedPart, data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        cacheProgress(selectedPart, []);
        setLoading(false);
      });
  }, [user, selectedPart, progressData, cacheProgress]);

  const chartData = useMemo(() => {
    if (!progressData?.length) return null;

    const labels = [...progressData]
      .reverse()
      .map((d) => new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));

    const weights = progressData.map((d) => d.weight).reverse();
    const success = progressData.map((d) => d.successSets).reverse();

    return {
      labels,
      datasets: [
        {
          label: '무게 (kg)',
          data: weights,
          borderColor: 'rgb(53,162,235)',
          backgroundColor: 'rgba(53,162,235,0.5)',
          yAxisID: 'y'
        },
        {
          label: '성공 세트 수',
          data: success,
          borderColor: 'rgb(255,99,132)',
          backgroundColor: 'rgba(255,99,132,0.5)',
          yAxisID: 'y1'
        }
      ]
    };
  }, [progressData]);

  const options = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: { display: true, text: '무게 (kg)' }
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: { display: true, text: '성공 세트 수' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 5
      }
    }
  } as const;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">진행 상황</h1>
        <p className="text-gray-600 dark:text-gray-400">나의 운동 성과를 확인하세요</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">부위 선택</label>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(partNames).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 h-64 md:h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">📊 로딩 중...</div>
        ) : chartData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            데이터가 없습니다. 운동을 기록해주세요.
          </div>
        )}
      </div>

      {/* 해석 블록은 필요 시 그대로 유지 */}
    </Layout>
  );
};

export default GraphPage;
