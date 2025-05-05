import React from 'react';

interface WorkoutData {
  date: string;
  weight: number;
  isSuccess: boolean;
}

const WorkoutGraph: React.FC = () => {
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workoutData: WorkoutData[] = [
    { date: '2024-03-01', weight: 80, isSuccess: true },
    { date: '2024-03-08', weight: 82.5, isSuccess: true },
    { date: '2024-03-15', weight: 85, isSuccess: false },
    { date: '2024-03-22', weight: 85, isSuccess: true }
  ];

  const maxWeight = Math.max(...workoutData.map(d => d.weight));
  const minWeight = Math.min(...workoutData.map(d => d.weight));
  const range = maxWeight - minWeight;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">운동 기록 그래프</h2>
      
      <div className="h-64 flex items-end gap-4">
        {workoutData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t ${
                data.isSuccess ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                height: `${((data.weight - minWeight) / range) * 100}%`
              }}
            />
            <div className="mt-2 text-sm text-gray-600">
              {data.weight}kg
            </div>
            <div className="text-xs text-gray-500">
              {new Date(data.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2" />
          <span className="text-sm">성공</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2" />
          <span className="text-sm">실패</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGraph; 