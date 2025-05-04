import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const FoodRecordPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        식단 기록
      </h1>
      {/* 식단 기록 관련 컴포넌트들을 여기에 추가 */}
    </div>
  );
};

export default FoodRecordPage; 