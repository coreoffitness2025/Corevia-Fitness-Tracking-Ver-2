import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Workout {
  id: string;
  date: string;
  part: 'chest' | 'back' | 'shoulder' | 'leg';
  mainExercise: {
    name: string;
    weight: number;
    sets: Array<{
      reps: number;
      weight: number;
      isSuccess: boolean;
    }>;
  };
  isAllSuccess: boolean;
}

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workouts: Workout[] = [
    {
      id: '1',
      date: '2024-03-20',
      part: 'chest',
      mainExercise: {
        name: '벤치프레스',
        weight: 80,
        sets: [
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 8, weight: 80, isSuccess: false }
        ]
      },
      isAllSuccess: false
    }
  ];

  const getPartLabel = (part: string) => {
    const labels: { [key: string]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체'
    };
    return labels[part] || part;
  };

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          onClick={() => navigate(`/workout/${workout.id}`)}
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{workout.date}</span>
            <span className={`px-2 py-1 rounded ${
              workout.isAllSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {workout.isAllSuccess ? '성공' : '실패'}
            </span>
          </div>
          <h3 className="font-semibold">{getPartLabel(workout.part)}</h3>
          <p className="text-gray-600">
            {workout.mainExercise.name} - {workout.mainExercise.weight}kg
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {workout.mainExercise.sets.length}세트
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutList; 