import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { calculateTotalNutrition, formatDate } from '../../utils/nutritionUtils';
import { fetchFoodsByDate } from '../../services/foodService';
import FoodItem from './FoodItem';
import NutritionSummary from './NutritionSummary';

const FoodLog: React.FC = () => {
  const { user } = useAuthStore();
  const { foods, setFoods } = useFoodStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (!user) return;

    const loadFoods = async () => {
      try {
        const foodData = await fetchFoodsByDate(user.uid, selectedDate);
        setFoods(foodData);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    loadFoods();
  }, [user, selectedDate, setFoods]);

  const totalNutrition = calculateTotalNutrition(foods);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          식단 기록
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded ${
              view === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            일간
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded ${
              view === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`px-4 py-2 rounded ${
              view === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {formatDate(selectedDate)}
          </h2>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <NutritionSummary 
          calories={totalNutrition.calories} 
          protein={totalNutrition.protein}
          carbs={totalNutrition.carbs}
          fat={totalNutrition.fat}
        />

        <div className="space-y-4">
          {foods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodLog; 