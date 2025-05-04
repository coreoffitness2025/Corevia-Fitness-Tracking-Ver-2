import React from 'react';
import { Link } from 'react-router-dom';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import WorkoutPage from './WorkoutPage';
import FoodLogPage from './FoodLogPage';
import QnaPage from './QnaPage';
import SettingsPage from './SettingsPage';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">홈 페이지</h2>
          <HomePage />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">프로필 페이지</h2>
          <ProfilePage />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">운동 페이지</h2>
          <WorkoutPage />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">식단 페이지</h2>
          <FoodLogPage />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Q&A 페이지</h2>
          <QnaPage />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">설정 페이지</h2>
          <SettingsPage />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 