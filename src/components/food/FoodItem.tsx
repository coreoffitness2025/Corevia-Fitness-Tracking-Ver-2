import React from 'react';
import { Food } from '../../types';

interface FoodItemProps {
  food: Food;
}

const FoodItem: React.FC<FoodItemProps> = ({ food }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          {food.name}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {food.date.toLocaleTimeString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
        <div>칼로리: {food.calories}kcal</div>
        <div>단백질: {food.protein}g</div>
        <div>탄수화물: {food.carbs}g</div>
        <div>지방: {food.fat}g</div>
      </div>
      {food.notes && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {food.notes}
        </p>
      )}
      {food.imageUrl && (
        <img
          src={food.imageUrl}
          alt={food.name}
          className="mt-2 rounded-lg max-h-48 object-cover"
        />
      )}
    </div>
  );
};

export default FoodItem; 