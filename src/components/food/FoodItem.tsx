import React, { useState, useEffect } from 'react';
import { Food } from '../../types';

interface FoodItemProps {
  food: Food;
  isGridItem?: boolean;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, isGridItem = false }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // 이미지 로딩 처리 개선
  useEffect(() => {
    if (food.imageUrl) {
      // 이미지 URL이 base64 문자열인 경우 직접 사용
      if (food.imageUrl.startsWith('data:image')) {
        setImageSource(food.imageUrl);
        setImageError(false);
      }
      // 로컬 저장소에서 이미지 가져오기
      else if (food.imageUrl.startsWith('local_')) {
        const storedImage = localStorage.getItem(`food_image_${food.imageUrl}`);
        if (storedImage) {
          setImageSource(storedImage);
          setImageError(false);
        } else {
          console.error('이미지 참조 저장됨:', food.imageUrl, '->', '로컬 스토리지에서 찾을 수 없음');
          setImageError(true);
        }
      } 
      // 파이어베이스 스토리지 URL인 경우 캐싱 방지를 위한 쿼리 파라미터 추가
      else {
        const timestamp = new Date().getTime();
        setImageSource(`${food.imageUrl}?t=${timestamp}`);
        setImageError(false);
      }
    } else {
      setImageSource(null);
    }
  }, [food.imageUrl]);

  // 이미지 로드 에러 처리
  const handleImageError = () => {
    console.error('이미지 로드 실패:', food.imageUrl);
    setImageError(true);
  };

  // 그리드 아이템 모드일 때는 썸네일 형태로 표시
  if (isGridItem) {
    return (
      <div className="rounded-lg overflow-hidden relative group">
        {imageSource && !imageError ? (
          <div 
            className="aspect-square w-full cursor-pointer bg-gray-100 dark:bg-gray-800 relative"
            onClick={() => setShowFullImage(true)}
          >
            <img 
              src={imageSource} 
              alt={food.name} 
              className="object-cover w-full h-full absolute inset-0"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">이미지 없음</span>
          </div>
        )}
        
        <div className="p-2 bg-white dark:bg-gray-800">
          <h4 className="font-medium text-sm truncate">{food.name}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {food.calories ? `${food.calories} kcal` : '칼로리 정보 없음'}
          </p>
        </div>
      </div>
    );
  }

  // 상세 뷰 모드 (그리드 아이템이 아닐 때)
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-3">
      <div className="flex">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{food.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {food.calories ? `${food.calories} kcal` : '칼로리 정보 없음'}
          </p>
          {food.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{food.description}</p>
          )}
        </div>
        
        {imageSource && !imageError && (
          <div className="ml-4">
            <div 
              className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-800 relative"
              onClick={() => setShowFullImage(true)}
            >
              <img 
                src={imageSource} 
                alt={food.name} 
                className="object-cover w-full h-full absolute inset-0"
                onError={handleImageError}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 영양소 정보 표시 (5/17 날짜 확인은 Food 리스트를 보여주는 FoodLog에서 처리) */}
      {food.nutrients && (
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-xs text-blue-700 dark:text-blue-300">
              단백질: {food.nutrients.protein}g
            </span>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              탄수화물: {food.nutrients.carbs}g
            </span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
            <span className="text-xs text-red-700 dark:text-red-300">
              지방: {food.nutrients.fat}g
            </span>
          </div>
        </div>
      )}
      
      {/* 이미지 전체 화면 표시 */}
      {showFullImage && imageSource && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="max-w-3xl max-h-screen w-full relative">
            <img 
              src={imageSource} 
              alt={food.name} 
              className="max-h-[90vh] max-w-full object-contain rounded-lg mx-auto"
              onError={handleImageError}
            />
            <button 
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-900"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullImage(false);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem; 