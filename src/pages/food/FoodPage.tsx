import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/common/Layout';
import FoodForm from '../../components/food/FoodForm';
import WaterForm from '../../components/food/WaterForm';
import SupplementForm from '../../components/food/SupplementForm';
import IntakeLog from '../../components/food/IntakeLog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import { Utensils, Droplets, Pill, History } from 'lucide-react';

type FoodTab = 'food' | 'water' | 'supplement' | 'records';

const FoodPage: React.FC = () => {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const initialTab = location.state?.activeTab === 'records' ? 'records' : 'food';
  const selectedDateFromState = location.state?.selectedDate;
  const [activeTab, setActiveTab] = useState<FoodTab>(initialTab);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 탭 설정
  const tabs = [
    { 
      id: 'food', 
      label: '음식', 
      icon: <Utensils size={20} />,
      color: 'text-orange-500'
    },
    { 
      id: 'water', 
      label: '물', 
      icon: <Droplets size={20} />,
      color: 'text-blue-500'
    },
    { 
      id: 'supplement', 
      label: '영양제', 
      icon: <Pill size={20} />,
      color: 'text-green-500'
    },
    { 
      id: 'records', 
      label: '기록', 
      icon: <History size={20} />,
      color: 'text-gray-500'
    }
  ];

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
      case 'food':
        return <FoodForm onSuccess={() => setActiveTab('records')} />;
      case 'water':
        return <WaterForm onSuccess={() => setActiveTab('records')} />;
      case 'supplement':
        return <SupplementForm onSuccess={() => setActiveTab('records')} />;
      case 'records':
        return <IntakeLog selectedDate={selectedDateFromState} />;
      default:
        return <FoodForm onSuccess={() => setActiveTab('records')} />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            안녕하세요, {userProfile?.displayName || '회원님'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{today}</p>
        </div>

        {/* 개선된 4개 탭 네비게이션 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1" role="group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FoodTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className={activeTab === tab.id ? tab.color : 'text-gray-400'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 현재 선택된 탭의 설명 */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'food' && '음식 섭취를 기록하고 영양 정보를 관리하세요.'}
            {activeTab === 'water' && '하루 수분 섭취량을 추적하고 목표를 달성하세요.'}
            {activeTab === 'supplement' && '영양제와 보충제 복용을 체계적으로 관리하세요.'}
            {activeTab === 'records' && '모든 식단, 수분, 영양제 기록을 한눈에 확인하세요.'}
          </p>
        </div>
        
        {/* 탭 컨텐츠 */}
        {renderTabContent()}
      </div>
    </Layout>
  );
};

export default FoodPage; 