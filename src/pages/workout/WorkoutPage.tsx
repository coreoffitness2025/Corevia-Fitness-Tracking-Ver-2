import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/common/Layout';
import WorkoutForm from '../../components/workout/WorkoutForm';
import WorkoutList from '../../components/workout/WorkoutList';
import WorkoutGraph from '../../components/workout/WorkoutGraph';
import { LoadingScreen } from '../../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';

type WorkoutTab = 'input' | 'records' | 'graph';

const WorkoutPage: React.FC = () => {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const locationState = location.state as { activeTab?: WorkoutTab } | null;
  const [activeTab, setActiveTab] = useState<WorkoutTab>(locationState?.activeTab || 'input');

  // location.state의 activeTab이 변경되면 상태 업데이트
  useEffect(() => {
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
  }, [locationState?.activeTab]);

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
        <LoadingScreen message="운동 정보를 불러오고 있습니다..." />
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            운동 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">오늘도 건강한 운동을 시작하세요</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className={`px-6 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                activeTab === 'input'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              운동 입력
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'records'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              운동 기록
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('graph')}
              className={`px-6 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                activeTab === 'graph'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              그래프
            </button>
          </div>
        </div>

        {renderTabContent()}
      </div>
    </Layout>
  );
};

export default WorkoutPage; 