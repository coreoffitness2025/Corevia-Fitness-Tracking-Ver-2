import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

interface Nutrient {
  protein: number;
  carbs: number;
  fat: number;
}

interface MealCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  calories?: number;
  nutrients?: Nutrient;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onImageClick?: () => void;
}

/**
 * 재사용 가능한 식사 카드 컴포넌트
 * 식단 기록 및 식사 정보를 일관된 형태로 표시합니다.
 */
const MealCard: React.FC<MealCardProps> = ({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt = '식사 이미지',
  calories,
  nutrients,
  mealType,
  onImageClick
}) => {
  // 식사 유형에 따른 한글 텍스트 및 색상
  const mealTypeInfo = {
    breakfast: { label: '아침', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    lunch: { label: '점심', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    dinner: { label: '저녁', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    snack: { label: '간식', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
  };

  const mealTypeLabel = mealType ? mealTypeInfo[mealType].label : '';
  const mealTypeColor = mealType ? mealTypeInfo[mealType].color : '';

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          {/* 이미지 영역 */}
          {imageSrc && (
            <div className="mr-4 flex-shrink-0">
              <div 
                className="w-20 h-20 rounded-md overflow-hidden cursor-pointer relative bg-gray-100 dark:bg-gray-800"
                onClick={onImageClick}
              >
                <img 
                  src={imageSrc} 
                  alt={imageAlt} 
                  className="object-cover w-full h-full absolute inset-0"
                />
              </div>
            </div>
          )}

          {/* 텍스트 정보 영역 */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-medium">{title}</h3>
              
              {mealType && (
                <span className={`text-xs px-2 py-1 rounded-full ${mealTypeColor}`}>
                  {mealTypeLabel}
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
            
            {calories !== undefined && (
              <p className="text-sm font-medium mt-1">
                {calories} kcal
              </p>
            )}
            
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* 영양소 정보 */}
        {nutrients && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="primary" className="bg-blue-50 dark:bg-blue-900/20">
              <span className="text-xs text-blue-700 dark:text-blue-300">
                단백질: {nutrients.protein}g
              </span>
            </Badge>
            
            <Badge variant="primary" className="bg-yellow-50 dark:bg-yellow-900/20">
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                탄수화물: {nutrients.carbs}g
              </span>
            </Badge>
            
            <Badge variant="primary" className="bg-red-50 dark:bg-red-900/20">
              <span className="text-xs text-red-700 dark:text-red-300">
                지방: {nutrients.fat}g
              </span>
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MealCard; 