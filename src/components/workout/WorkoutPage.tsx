import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkoutGraph from './WorkoutGraph';

interface Workout {
  id: string;
  date: string;
  part: string;
  mainExercise: string;
  isSuccess: boolean;
}

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState<string>('all');

  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workouts: Workout[] = [
    {
      id: '1',
      date: '2024-03-20',
      part: 'chest',
      mainExercise: '벤치프레스',
      isSuccess: true
    },
    {
      id: '2',
      date: '2024-03-18',
      part: 'back',
      mainExercise: '데드리프트',
      isSuccess: false
    }
  ];

  const getPartLabel = (part: string) => {
    const labels: { [key: string]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체',
      all: '전체'
    };
    return labels[part] || part;
  };

  const filteredWorkouts = selectedPart === 'all'
    ? workouts
    : workouts.filter(workout => workout.part === selectedPart);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">운동 기록</h2>
        <button
          onClick={() => navigate('/workout/new')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          새 운동 시작
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {['all', 'chest', 'back', 'shoulder', 'leg'].map(part => (
          <button
            key={part}
            onClick={() => setSelectedPart(part)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedPart === part
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getPartLabel(part)}
          </button>
        ))}
      </div>

      <WorkoutGraph />

      <div className="space-y-4">
        {filteredWorkouts.map(workout => (
          <div
            key={workout.id}
            onClick={() => navigate(`/workout/${workout.id}`)}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{workout.mainExercise}</h3>
                <p className="text-sm text-gray-600">{getPartLabel(workout.part)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{workout.date}</span>
                <span className={`px-3 py-1 rounded ${
                  workout.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {workout.isSuccess ? '성공' : '실패'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPage; 