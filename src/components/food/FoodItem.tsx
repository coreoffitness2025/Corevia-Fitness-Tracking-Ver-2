import React, { useState, useEffect } from 'react';
import { Food } from '../../types';
import { getLocalImage } from '../../services/foodService';

interface FoodItemProps {
  food: Food;
  isGridItem?: boolean; // 그리드 아이템인지 여부
}

const FoodItem: React.FC<FoodItemProps> = ({ food, isGridItem = false }) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState<boolean>(false);
  
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
  
  // 그리드 아이템 모드일 때는 썸네일 형태로 표시
  if (isGridItem) {
    return (
      <div className="relative group">
        {/* 썸네일 이미지 */}
        <div 
          className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => setShowFullImage(true)}
        >
          {imageSource ? (
            <img
              src={imageSource}
              alt={food.name || '식사 사진'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">사진 없음</p>
            </div>
          )}
        </div>
        
        {/* 간단한 오버레이 정보 - 마우스 오버 시 표시 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {food.date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {/* 전체 이미지 모달 */}
        {showFullImage && imageSource && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-lg bg-white dark:bg-gray-800">
              <img
                src={imageSource}
                alt={food.name || '식사 사진'}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                onClick={() => setShowFullImage(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* 정보 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3">
                <p className="text-sm font-medium">{food.name || '식사 기록'}</p>
                <p className="text-xs">{food.date.toLocaleString('ko-KR')}</p>
                {food.notes && <p className="text-xs mt-1 italic">"{food.notes}"</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 일반 목록 아이템 모드 (기존 표시 방식)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* 이미지 섹션 */}
      <div className="relative">
        {imageSource ? (
          <img
            src={imageSource}
            alt={food.name}
            className="w-full h-48 sm:h-64 object-cover cursor-pointer"
            onClick={() => setShowFullImage(true)}
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
      
      {/* 전체 이미지 모달 */}
      {showFullImage && imageSource && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-lg">
            <img
              src={imageSource}
              alt={food.name || '식사 사진'}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              onClick={() => setShowFullImage(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem; 