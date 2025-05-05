import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Layout from '../../components/common/Layout';
import FoodForm from '../../components/food/FoodForm';
import FoodLog from '../../components/food/FoodLog';

type FoodTab = 'input' | 'records';

const FoodPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FoodTab>('input');

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">로그인 정보를 불러오는 중...</div>
      </Layout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'input':
        return <FoodForm onSuccess={() => setActiveTab('records')} />;
      case 'records':
        return <FoodLog />;
      default:
        return <FoodForm onSuccess={() => setActiveTab('records')} />;
    }
  };

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          안녕하세요, {user.displayName || '회원'}님!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{today}</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeTab === 'input'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            식단 입력
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'records'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            식단 기록
          </button>
        </div>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </Layout>
  );
};

export default FoodPage; 