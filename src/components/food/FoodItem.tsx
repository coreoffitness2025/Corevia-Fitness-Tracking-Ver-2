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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* 이미지 섹션 - 더 크게 표시 */}
      <div className="relative">
        {imageSource ? (
          <img
            src={imageSource}
            alt={food.name}
            className="w-full h-48 sm:h-64 object-cover"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">사진 없음</p>
          </div>
        )}
        
        {/* 날짜 오버레이 */}
        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-sm px-2 py-1 m-2 rounded">
          {food.date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
      
      {/* 정보 섹션 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            {food.name || '식사 기록'}
          </h3>
        </div>
        
        {/* 영양소 정보는 있을 때만 표시 */}
        {(food.calories > 0 || food.protein > 0 || food.carbs > 0 || food.fat > 0) && (
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
            <div>칼로리: {food.calories}kcal</div>
            <div>단백질: {food.protein}g</div>
            <div>탄수화물: {food.carbs}g</div>
            <div>지방: {food.fat}g</div>
          </div>
        )}
        
        {/* 메모가 있을 때만 표시 */}
        {food.notes && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">
            "{food.notes}"
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodItem; 