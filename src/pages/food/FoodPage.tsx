import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/common/Layout';
import FoodForm from '../../components/food/FoodForm';
import FoodLog from '../../components/food/FoodLog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';

type FoodTab = 'input' | 'records';

const FoodPage: React.FC = () => {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const initialTab = location.state?.activeTab || 'input';
  const [activeTab, setActiveTab] = useState<FoodTab>(initialTab);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // 인증되지 않았으면 로그인 필요 메시지 표시
  if (!isAuthenticated || !userProfile) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">로그인이 필요합니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            안녕하세요, {userProfile?.displayName || '회원님'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{today}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className={`px-6 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                activeTab === 'input'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              식단 입력
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-6 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                activeTab === 'records'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              식단 기록
            </button>
          </div>
        </div>
        
        {activeTab === 'input' ? <FoodForm onSuccess={() => setActiveTab('records')} /> : <FoodLog />}
      </div>
    </Layout>
  );
};

export default FoodPage; 