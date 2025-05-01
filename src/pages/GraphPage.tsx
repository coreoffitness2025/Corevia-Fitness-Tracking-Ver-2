import { useState, useEffect } from 'react';
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
import { ExercisePart } from '../types';
import { useAuthStore } from '../stores/authStore';
import { getProgressData } from '../services/firebaseService';
import Layout from '../components/common/Layout';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const partNames = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체'
};

const GraphPage = () => {
  const { user } = useAuthStore();
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const progressData = await getProgressData(user.uid, selectedPart);
      
      if (progressData.length > 0) {
        const labels = progressData.map(item => 
          new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
        );
        
        const weights = progressData.map(item => item.weight);
        const successSets = progressData.map(item => item.successSets);
        
        setChartData({
          labels,
          datasets: [
            {
              label: '무게 (kg)',
              data: weights,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              yAxisID: 'y'
            },
            {
              label: '성공 세트 수',
              data: successSets,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'y1'
            }
          ]
        });
      } else {
        setChartData(null);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [user, selectedPart]);
  
  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '무게 (kg)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '성공 세트 수'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 5
      },
    },
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          진행 상황
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          나의 운동 성과를 확인하세요
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            부위 선택
          </label>
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {Object.entries(partNames).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="h-64 md:h-80">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="spinner"></div>
            </div>
          ) : chartData ? (
            <Line options={options} data={chartData} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                데이터가 없습니다. 운동을 기록해주세요.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          데이터 해석
        </h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <strong>파란색 선</strong>: 사용한 무게(kg)를 나타냅니다.
          </p>
          
          <p>
            <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
            <strong>분홍색 선</strong>: 각 세션에서 성공한 세트 수를 나타냅니다.
          </p>
          
          <p className="mt-4">
            <strong>💡 팁:</strong> 모든 세트를 성공적으로 완료한 후에 무게를 증가시키는 것이 이상적입니다.
            그래프에서 분홍색 선이 5에 도달한 후 파란색 선이 상승하는 패턴이 보이면 
            올바른 진행 방향입니다.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default GraphPage;
