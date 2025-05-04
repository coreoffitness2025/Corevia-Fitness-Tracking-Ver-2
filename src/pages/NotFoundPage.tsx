import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">운동 일지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">벤치 프레스</h3>
            <p className="text-gray-600 dark:text-gray-300">3세트 x 10회</p>
            <p className="text-gray-600 dark:text-gray-300">60kg</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">랫 풀다운</h3>
            <p className="text-gray-600 dark:text-gray-300">3세트 x 12회</p>
            <p className="text-gray-600 dark:text-gray-300">45kg</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">오늘의 식단</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">아침</h3>
            <p className="text-gray-600 dark:text-gray-300">계란 2개, 통밀빵 2장, 우유 1컵</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">점심</h3>
            <p className="text-gray-600 dark:text-gray-300">닭가슴살 샐러드, 현미밥</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">운동 통계</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">이번 주 운동 횟수</p>
            <p className="text-2xl font-bold">3회</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">총 운동 시간</p>
            <p className="text-2xl font-bold">4시간 30분</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 