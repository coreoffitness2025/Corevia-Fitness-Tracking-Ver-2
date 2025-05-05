import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Set {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

interface Workout {
  id: string;
  date: string;
  part: 'chest' | 'back' | 'shoulder' | 'leg';
  mainExercise: {
    name: string;
    sets: Set[];
  };
  accessoryExercises: Array<{
    name: string;
    sets: Set[];
  }>;
  notes: string;
  isAllSuccess: boolean;
  duration?: number; // 운동 시간 (초)
}

const WorkoutDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workout: Workout = {
    id: '1',
    date: '2024-03-20',
    part: 'chest',
    mainExercise: {
      name: '벤치프레스',
      sets: [
        { reps: 10, weight: 80, isSuccess: true },
        { reps: 10, weight: 80, isSuccess: true },
        { reps: 8, weight: 80, isSuccess: false }
      ]
    },
    accessoryExercises: [
      {
        name: '인클라인 벤치프레스',
        sets: [
          { reps: 12, weight: 60, isSuccess: true },
          { reps: 12, weight: 60, isSuccess: true }
        ]
      }
    ],
    notes: '오늘 컨디션이 좋았다.',
    isAllSuccess: false,
    duration: 3600 // 1시간
  };

  const getPartLabel = (part: string) => {
    const labels: { [key: string]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체'
    };
    return labels[part] || part;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes}분 ${secs}초`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">운동 상세</h2>
        <button
          onClick={() => navigate('/workout')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 돌아가기
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-600">{workout.date}</span>
            {workout.duration && (
              <span className="ml-4 text-gray-600">
                운동 시간: {formatTime(workout.duration)}
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded ${
            workout.isAllSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {workout.isAllSuccess ? '성공' : '실패'}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{getPartLabel(workout.part)}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">메인 운동: {workout.mainExercise.name}</h4>
              <div className="space-y-2">
                {workout.mainExercise.sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-gray-600">세트 {index + 1}</span>
                    <span>{set.weight}kg × {set.reps}회</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      set.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {set.isSuccess ? '성공' : '실패'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {workout.accessoryExercises.map((exercise, index) => (
              <div key={index}>
                <h4 className="font-medium mb-2">보조 운동: {exercise.name}</h4>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-4">
                      <span className="text-gray-600">세트 {setIndex + 1}</span>
                      <span>{set.weight}kg × {set.reps}회</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        set.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {set.isSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {workout.notes && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">메모</h4>
            <p className="text-gray-600">{workout.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetail; 