import React from 'react';
import { ExercisePart } from '../../types';

interface WorkoutLogProps {
  part: ExercisePart;
  weight: number;
  sets: Array<{
    reps: number;
    weight: number;
    isSuccess: boolean;
  }>;
}

const WorkoutLog: React.FC<WorkoutLogProps> = ({ part, weight, sets }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">운동 기록</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">운동 부위</h3>
          <p className="text-gray-600 dark:text-gray-300">{part}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">무게</h3>
          <p className="text-gray-600 dark:text-gray-300">{weight} kg</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">세트</h3>
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-300">
                  세트 {index + 1}: {set.reps}회 x {set.weight}kg
                </span>
                <span className={`px-2 py-1 rounded ${
                  set.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {set.isSuccess ? '성공' : '실패'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLog; 