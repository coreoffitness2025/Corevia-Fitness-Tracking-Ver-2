import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/common/Layout';
import WorkoutForm from '../../components/workout/WorkoutForm';
import WorkoutList from '../../components/workout/WorkoutList';
import WorkoutGraph from '../../components/workout/WorkoutGraph';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type WorkoutTab = 'input' | 'records' | 'graph';

const WorkoutPage: React.FC = () => {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkoutTab>('input');

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'input':
        return <WorkoutForm onSuccess={() => setActiveTab('records')} />;
      case 'records':
        return <WorkoutList />;
      case 'graph':
        return <WorkoutGraph />;
      default:
        return <WorkoutForm onSuccess={() => setActiveTab('records')} />;
    }
  };

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          안녕하세요, {userProfile.displayName || '회원님'}!
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
            운동 입력
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'records'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            운동 기록
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'graph'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            운동 그래프
          </button>
        </div>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </Layout>
  );
};

export default WorkoutPage; 