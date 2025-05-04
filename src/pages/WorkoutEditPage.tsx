import React from 'react';
import { useParams } from 'react-router-dom';

const WorkoutEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">운동 수정</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p>운동 ID: {id}</p>
      </div>
    </div>
  );
};

export default WorkoutEditPage; 