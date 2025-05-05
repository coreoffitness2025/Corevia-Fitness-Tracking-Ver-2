import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { calculateTotalNutrition, formatDate } from '../../utils/nutritionUtils';
import { fetchFoodsByDate } from '../../services/foodService';
import FoodItem from './FoodItem';
import NutritionSummary from './NutritionSummary';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const FoodLog: React.FC = () => {
  const { user } = useAuthStore();
  const { foods, setFoods } = useFoodStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (user) {
      loadFoodData();
    }
  }, [user, selectedDate]);

  const loadFoodData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const foodData = await fetchFoodsByDate(user.uid, new Date(selectedDate));
      setFoods(foodData);
    } catch (error) {
      console.error('Error loading food records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜별로 식단 그룹화
  const groupFoodsByDate = (foods: Food[]) => {
    const groups: Record<string, Food[]> = {};
    
    foods.forEach(food => {
      const dateKey = food.date instanceof Date 
        ? food.date.toISOString().split('T')[0]
        : new Date(food.date).toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(food);
    });
    
    return groups;
  };

  const foodGroups = groupFoodsByDate(foods);
  const dates = Object.keys(foodGroups).sort((a, b) => b.localeCompare(a));

  const totalNutrition = calculateTotalNutrition(foods);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          날짜 선택
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : dates.length > 0 ? (
        dates.map(dateStr => (
          <div key={dateStr} className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              {formatDate(new Date(dateStr))}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodGroups[dateStr].map(food => (
                <div key={food.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{food.name}</h4>
                      {food.type && (
                        <span className="text-sm text-blue-500 dark:text-blue-400">{food.type}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(food.date).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {food.imageUrl && (
                    <div className="mt-2 mb-3">
                      <img 
                        src={food.imageUrl} 
                        alt={food.name} 
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 이미지 표시
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=이미지+없음';
                        }}
                      />
                    </div>
                  )}
                  
                  {food.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {food.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            이 날짜에 기록된 식단이 없습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            식단 입력 탭에서 식사를 기록해보세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodLog; 