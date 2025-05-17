import React, { useState, useEffect } from 'react';
import { Food } from '../../types';

interface FoodItemProps {
  food: Food;
  isGridItem?: boolean; // 그리드 아이템인지 여부
}

const FoodItem: React.FC<FoodItemProps> = ({ food, isGridItem = false }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  
  // 이미지 로딩 처리
  useEffect(() => {
    if (food.imageUrl) {
      // 이미지 URL이 base64 문자열인 경우 직접 사용
      if (food.imageUrl.startsWith('data:image')) {
        setImageSource(food.imageUrl);
      } 
      // 파이어베이스 스토리지 URL인 경우
      else {
        setImageSource(food.imageUrl);
      }
    } else {
      // 기본 이미지 설정
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
              onError={(e) => {
                // 이미지 로드 실패 시 폴백 처리
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=이미지+없음';
              }}
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
        {showFullImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 cursor-pointer"
               onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
                onClick={() => setShowFullImage(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div className="relative">
                  <img
                    src={imageSource || 'https://via.placeholder.com/800x600?text=이미지+없음'}
                    alt={food.name || '식사 사진'}
                    className="w-full max-h-[80vh] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=이미지+로드+실패';
                    }}
                  />
                </div>
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
            alt={food.name || '식사 사진'}
            className="w-full h-48 sm:h-64 object-cover cursor-pointer"
            onClick={() => setShowFullImage(true)}
            onError={(e) => {
              // 이미지 로드 실패 시 폴백 처리
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=이미지+없음';
            }}
          />
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
               onClick={() => setShowFullImage(true)}>
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
      {showFullImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 cursor-pointer"
             onClick={() => setShowFullImage(false)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
              onClick={() => setShowFullImage(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <div className="relative">
                <img
                  src={imageSource || 'https://via.placeholder.com/800x600?text=이미지+없음'}
                  alt={food.name || '식사 사진'}
                  className="w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=이미지+로드+실패';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem; 