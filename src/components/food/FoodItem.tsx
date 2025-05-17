import React, { useState, useEffect } from 'react';
import { Food } from '../../types';
import { getLocalImage } from '../../services/foodService';

interface FoodItemProps {
  food: Food;
}

const FoodItem: React.FC<FoodItemProps> = ({ food }) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  
  // 이미지 소스 설정
  useEffect(() => {
    // 로컬 이미지인 경우
    if (food.imageUrl && food.imageUrl.startsWith('local_')) {
      // 로컬 스토리지에서 이미지 데이터 가져오기
      const localImageData = getLocalImage(food.imageUrl);
      if (localImageData) {
        setImageSource(localImageData);
      } else {
        console.warn(`로컬 이미지를 찾을 수 없음: ${food.imageUrl}`);
        setImageSource(null);
      }
    } else if (food.imageUrl) {
      // 일반 URL인 경우 그대로 사용
      setImageSource(food.imageUrl);
    } else {
      setImageSource(null);
    }
  }, [food.imageUrl]);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          {food.name}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {food.date.toLocaleDateString()}
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
      {imageSource && (
        <img
          src={imageSource}
          alt={food.name}
          className="mt-2 rounded-lg max-h-48 object-cover"
        />
      )}
    </div>
  );
};

export default FoodItem; 