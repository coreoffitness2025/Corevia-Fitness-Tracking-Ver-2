import React, { useState } from 'react';
import { Camera, Plus, Clock, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';

interface FoodItem {
  name: string;
  calories: number;
  amount: string;
}

interface MealRecord {
  id: number;
  type: '아침' | '점심' | '저녁' | '간식';
  time: string;
  items: FoodItem[];
  totalCalories: number;
}

const FoodRecordPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([
    {
      id: 1,
      type: '아침',
      time: '08:00',
      items: [
        { name: '현미밥', calories: 150, amount: '1공기' },
        { name: '된장국', calories: 100, amount: '1그릇' },
        { name: '계란찜', calories: 100, amount: '1개' }
      ],
      totalCalories: 350
    },
    {
      id: 2,
      type: '점심',
      time: '12:30',
      items: [
        { name: '닭가슴살', calories: 300, amount: '200g' },
        { name: '샐러드', calories: 100, amount: '1접시' },
        { name: '그릭요거트', calories: 50, amount: '1통' }
      ],
      totalCalories: 450
    }
  ]);

  const getTotalCalories = () => {
    return mealRecords.reduce((total, meal) => total + meal.totalCalories, 0);
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600 dark:text-gray-400">로그인이 필요합니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            식단 기록
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            오늘의 식사를 기록하고 칼로리를 관리하세요
          </p>
        </div>

        {/* 오늘의 칼로리 현황 */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
            오늘의 총 섭취 칼로리
          </h2>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {getTotalCalories()} kcal
          </p>
        </div>

        {/* 식단 기록 추가 버튼 */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
            <Camera size={20} />
            사진으로 기록
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Plus size={20} />
            직접 입력
          </button>
        </div>

        {/* 식사 기록 목록 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">오늘의 식사</h2>
          {mealRecords.map((meal) => (
            <div key={meal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    meal.type === '아침' ? 'bg-yellow-100 text-yellow-800' :
                    meal.type === '점심' ? 'bg-green-100 text-green-800' :
                    meal.type === '저녁' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {meal.type}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    {meal.time}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {meal.totalCalories} kcal
                </span>
              </div>
              <div className="space-y-1">
                {meal.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name} ({item.amount})
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 기록 내역 보기 */}
        <Link 
          to="/food" 
          className="mt-6 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <History size={20} />
          전체 기록 내역 보기
        </Link>
      </div>
    </Layout>
  );
};

export default FoodRecordPage;
