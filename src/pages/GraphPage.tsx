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
  Tooltip,
  Legend
} from 'chart.js';
import { ExercisePart, Progress } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';       // ⬅️ 캐시 재활용
import { getProgressData } from '../services/firebaseService';
import Layout from '../components/common/Layout';

/* Chart.js 등록 */
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

/* ───────── 컴포넌트 ───────────────────────────────────── */
const GraphPage = () => {
  const { user } = useAuthStore();
  const {
    /* 기존 세션 캐시와 별도 영역으로 진행 데이터 캐싱 */
    progressCache,
    cacheProgress
  } = useSessionStore();

  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [loading, setLoading] = useState(true);

  /* ① 캐시 우선 사용 */
  const progressData: Progress[] | undefined = progressCache[selectedPart];

  /* ② 캐시에 없으면 백그라운드 fetch (limit 10) */
  useEffect(() => {
    if (!user) return;

    /* 캐시 hit → 바로 렌더 */
    if (progressData !== undefined) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getProgressData(user.uid, selectedPart, 10)         // 🔥 limit 10회
      .then((data) => {
        cacheProgress(selectedPart, data);              // 메모리 캐싱
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        cacheProgress(selectedPart, []);                // 실패해도 캐싱
        setLoading(false);
      });
  }, [user, selectedPart, progressData, cacheProgress]);

  /* ③ 그래프 데이터 가공: useMemo → 재연산 최소화 */
  const chartData = useMemo(() => {
    if (!progressData || progressData.length === 0) return null;

    const labels = [...progressData]
      .reverse()                                        // 최근 날짜가 오른쪽
      .map((d) => new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));

    const weights = progressData.map((d) => d.weight).reverse();
    const successSets = progressData.map((d) => d.successSets).reverse();

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
          data: successSets,
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
      y: { type: 'linear' as const, position: 'left', title: { display: true, text: '무게 (kg)' } },
      y1: {
        type: 'linear' as const,
        position: 'right',
        title: { display: true, text: '성공 세트 수' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 5
      }
    }
  };

  return (
    <Layout>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">진행 상황</h1>
        <p className="text-gray-600 dark:text-gray-400">나의 운동 성과를 확인하세요</p>
      </div>

      {/* 부위 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          부위 선택
        </label>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(partNames).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* 그래프 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 h-64 md:h-80">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            📊 로딩 중...
          </div>
        ) : chartData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
            데이터가 없습니다. 운동을 기록해주세요.
          </div>
        )}
      </div>

      {/* 해석 블록 (기존 그대로) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {/* …생략: 해석 텍스트… */}
      </div>
    </Layout>
  );
};

export default GraphPage;
