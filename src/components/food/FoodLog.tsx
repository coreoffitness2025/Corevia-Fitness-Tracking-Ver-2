import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { calculateTotalNutrition, formatDate } from '../../utils/nutritionUtils';
import { fetchFoodsByDate } from '../../services/foodService';
import FoodItem from './FoodItem';
import NutritionSummary from './NutritionSummary';
import Card from '../common/Card';
import { Info, Calendar, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NutritionSourcesGuide from './NutritionSourcesGuide';
import LoadingSpinner from '../common/LoadingSpinner';

// 활동 수준에 따른 칼로리 계수
const activityMultipliers = {
  low: 1.2,      // 거의 운동하지 않음
  moderate: 1.5, // 주 3-5회 운동
  high: 1.8      // 거의 매일 운동
};

// 목표에 따른 칼로리 조정
const goalMultipliers = {
  loss: 0.8,     // 체중 감량
  maintain: 1.0, // 체중 유지
  gain: 1.2      // 체중 증가
};

// 성별에 따른 기초 대사량 계산 (Harris-Benedict 방정식)
function calculateBMR(gender: 'male' | 'female', weight: number, height: number, age: number) {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

type ViewMode = 'day' | 'week' | 'month';

const FoodLog: React.FC = () => {
  const { user } = useAuthStore();
  const { userProfile } = useAuth();
  const { foods, setFoods } = useFoodStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [proteinTarget, setProteinTarget] = useState<number>(0);
  const [carbsTarget, setCarbsTarget] = useState<number>(0);
  const [fatTarget, setFatTarget] = useState<number>(0);
  const [showNutritionSources, setShowNutritionSources] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadFoodData();
    }
  }, [user, selectedDate, viewMode]);

  // 사용자 프로필에서 목표 칼로리 가져오기
  useEffect(() => {
    if (userProfile) {
      updateNutritionTargets(userProfile);
    }
  }, [userProfile]);

  const updateNutritionTargets = (profile: any) => {
    if (!profile) return;

    // 이미 계산된 목표 칼로리가 있으면 사용
    if (profile.targetCalories && !isNaN(profile.targetCalories)) {
      setTargetCalories(profile.targetCalories);
    } else {
      // 계산된 목표 칼로리가 없으면 직접 계산
      if (profile.height && profile.weight && profile.age && profile.gender && profile.activityLevel && profile.fitnessGoal) {
        const bmr = calculateBMR(
          profile.gender,
          Number(profile.weight),
          Number(profile.height),
          Number(profile.age)
        );

        // 기본값 사용 및 타입 안전성 확보
        const activityLevel = profile.activityLevel === 'moderate' ? 'moderate' : (profile.activityLevel || 'moderate');
        const fitnessGoal = profile.fitnessGoal === 'maintain' ? 'maintain' : (profile.fitnessGoal || 'maintain');

        // 총 일일 에너지 소비량(TDEE) 계산
        const tdee = bmr * (activityMultipliers[activityLevel] || 1.5);

        // 목표에 따른 칼로리 조정
        const calculatedCalories = Math.round(tdee * (goalMultipliers[fitnessGoal] || 1.0));

        setTargetCalories(calculatedCalories);
      } else {
        // 기본 목표 칼로리 설정
        setTargetCalories(2000);
      }
    }

    // 단백질, 탄수화물, 지방 목표량 계산
    calculateMacroNutrientTargets(Number(profile.weight) || 70);
  };

  const calculateMacroNutrientTargets = (weight: number) => {
    // 체중 1kg당 단백질 1.6g, 탄수화물과 지방은 남은 칼로리에서 분배
    const proteinGrams = Math.round(weight * 1.6);
    const proteinCalories = proteinGrams * 4; // 단백질 1g = 4 칼로리

    const localTargetCalories = targetCalories > 0 ? targetCalories : 2000;
    const remainingCalories = Math.max(0, localTargetCalories - proteinCalories);

    // 탄수화물 45-65%, 지방 20-35% (여기서는 중간값 사용)
    const carbsCalories = Math.max(0, remainingCalories * 0.55);
    const fatCalories = Math.max(0, remainingCalories * 0.3);

    setProteinTarget(proteinGrams);
    setCarbsTarget(Math.round(carbsCalories / 4)); // 탄수화물 1g = 4 칼로리
    setFatTarget(Math.round(fatCalories / 9));     // 지방 1g = 9 칼로리
  };

  const loadFoodData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let foodData: Food[] = [];
      
      if (viewMode === 'day') {
        // 하루 데이터만 로드
        foodData = await fetchFoodsByDate(user.uid, new Date(selectedDate));
      } else if (viewMode === 'week') {
        // 1주일 데이터 로드
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // 주의 시작일 (일요일)
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // 주의 마지막일 (토요일)
        
        // 실제 앱에서는 범위 쿼리를 사용하여 범위 내 모든 데이터를 가져옴
        // 여기서는 임시로 단일 날짜 데이터만 사용
        foodData = await fetchFoodsByDate(user.uid, new Date(selectedDate));
      } else if (viewMode === 'month') {
        // 1개월 데이터 로드
        const date = new Date(selectedDate);
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // 실제 앱에서는 범위 쿼리를 사용
        // 여기서는 임시로 단일 날짜 데이터만 사용
        foodData = await fetchFoodsByDate(user.uid, new Date(selectedDate));
      }
      
      setFoods(foodData);
    } catch (error) {
      console.error('Error loading food records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysOfWeek = () => {
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // 주의 시작일 (일요일)
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDaysOfMonth = () => {
    const date = new Date(selectedDate);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const days = [];
    for (let i = 0; i < lastDayOfMonth.getDate(); i++) {
      const day = new Date(firstDayOfMonth);
      day.setDate(firstDayOfMonth.getDate() + i);
      days.push(day);
    }
    return days;
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

  // 이전/다음 이동 함수
  const navigatePrevious = () => {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() - 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const navigateNext = () => {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + 7);
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() + 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // 영양정보 페이지로 이동하는 함수
  const navigateToNutritionInfo = () => {
    navigate('/qna', { state: { activeTab: 'nutrition' } });
  };

  // 날짜별 식단을 표시하는 함수
  const renderFoodsByDate = (dateStr: string, foodsForDate: Food[]) => {
    const date = new Date(dateStr);
    const hasPhotos = foodsForDate.some(food => food.imageUrl);
    
    return (
      <div key={dateStr} className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric', 
              weekday: 'long'
            })}
          </h3>
        </div>
        
        {/* 영양 요약 정보 */}
        <div className="mb-4">
          <NutritionSummary 
            totalNutrition={calculateTotalNutrition(foodsForDate)} 
            targetProtein={proteinTarget}
            targetCarbs={carbsTarget}
            targetFat={fatTarget}
          />
        </div>
        
        {/* 사진이 있는 경우 그리드로 표시 */}
        {hasPhotos && (
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">식사 사진</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {foodsForDate
                .filter(food => food.imageUrl)
                .map(food => (
                  <FoodItem key={food.id} food={food} isGridItem={true} />
                ))}
            </div>
          </div>
        )}
        
        {/* 식사 목록 */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">식사 목록</h4>
          <div className="space-y-3">
            {foodsForDate.map(food => (
              <div key={food.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {food.date.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <h5 className="font-medium">{food.name || '식사 기록'}</h5>
                  </div>
                  
                  {(food.calories > 0 || food.protein > 0 || food.carbs > 0 || food.fat > 0) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="bg-blue-50 dark:bg-blue-900/20 py-1 px-2 rounded-full">
                        {food.calories > 0 ? `${food.calories}kcal` : '영양정보 있음'}
                      </span>
                    </div>
                  )}
                </div>
                
                {food.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    "{food.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 영양소 목표 및 버튼 */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold mb-2">1끼당 권장 섭취량(3끼 기준)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">단백질</span>
                <span className="block text-lg font-bold text-green-600 dark:text-green-400">{Math.round(proteinTarget/3)}g</span>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">탄수화물</span>
                <span className="block text-lg font-bold text-yellow-600 dark:text-yellow-400">{Math.round(carbsTarget/3)}g</span>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">지방</span>
                <span className="block text-lg font-bold text-red-600 dark:text-red-400">{Math.round(fatTarget/3)}g</span>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                💡 하루 총 목표: 단백질 <strong>{proteinTarget}g</strong>, 탄수화물 <strong>{carbsTarget}g</strong>, 지방 <strong>{fatTarget}g</strong>
              </p>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={navigateToNutritionInfo}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                음식별 칼로리 확인하기
              </button>
              
              <button
                type="button"
                onClick={() => setShowNutritionSources(!showNutritionSources)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                주요 탄/단/지 급원 확인하기
              </button>
            </div>
            
            {/* 영양소 급원 표시 영역 */}
            {showNutritionSources && <NutritionSourcesGuide />}
          </div>
        </div>
      </Card>

      {/* 뷰 컨트롤 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex items-center">
          <button 
            onClick={navigatePrevious}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            &lt;
          </button>
          
          <span className="mx-4 font-medium">
            {viewMode === 'day' && new Date(selectedDate).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
            {viewMode === 'week' && (
              <>
                {getDaysOfWeek()[0].toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - {getDaysOfWeek()[6].toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
              </>
            )}
            {viewMode === 'month' && new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </span>
          
          <button 
            onClick={navigateNext}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            &gt;
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center px-3 py-1 rounded ${
              viewMode === 'day' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar size={16} className="mr-1" /> 일별
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center px-3 py-1 rounded ${
              viewMode === 'week' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar size={16} className="mr-1" /> 주별
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center px-3 py-1 rounded ${
              viewMode === 'month' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <CalendarDays size={16} className="mr-1" /> 월별
          </button>
        </div>
      </div>
      
      {/* 식단 기록 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" showText={true} text="식단 기록을 불러오는 중입니다..." />
        </div>
      ) : (
        <div>
          {foods.length > 0 ? (
            <div>
              {/* 날짜별로 식단 그룹화하여 표시 */}
              {Object.entries(groupFoodsByDate(foods))
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // 최신순 정렬
                .map(([dateStr, foodsForDate]) => renderFoodsByDate(dateStr, foodsForDate))
              }
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">선택한 기간에 식단 기록이 없습니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 <strong>참고:</strong> 식단 사진은 기기 내부 저장소에 저장됩니다. 기기에서 해당 파일이 삭제되거나 브라우저 데이터가 초기화되면 사진을 볼 수 없게 됩니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodLog;