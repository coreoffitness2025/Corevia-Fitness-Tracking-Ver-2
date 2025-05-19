import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { calculateTotalNutrition } from '../../utils/nutritionUtils';
import { formatDate, formatDateWithWeekday, isToday } from '../../utils/dateUtils';
import { fetchFoodsByDate } from '../../services/foodService';
import FoodItem from './FoodItem';
import NutritionSummary from './NutritionSummary';
import Card from '../common/Card';
import { Info, Calendar, CalendarDays, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NutritionSourcesGuide from './NutritionSourcesGuide';
import LoadingSpinner from '../common/LoadingSpinner';
import { getFoodRecordsByDate, getFoodImage, FoodRecord } from '../../utils/indexedDB';

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
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [recordsByDate, setRecordsByDate] = useState<Record<string, FoodRecord[]>>({});

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

  useEffect(() => {
    if (userProfile?.uid) {
      loadFoodData();
    }
  }, [userProfile?.uid, selectedDate, viewMode]);

  // 월별 보기일 때 달력 날짜 계산
  useEffect(() => {
    if (viewMode === 'month') {
      const dates = getDatesForCalendar();
      setCalendarDates(dates);
    }
  }, [viewMode, selectedDate]);

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
    if (!userProfile?.uid) return;
    
    setIsLoading(true);
    try {
      let records: FoodRecord[] = [];
      
      if (viewMode === 'day') {
        // 하루 데이터만 로드
        records = await getFoodRecordsByDate(userProfile.uid, new Date(selectedDate));
      } else if (viewMode === 'week') {
        // 1주일 데이터 로드
        const weekDates = getDaysOfWeek();
        for (const date of weekDates) {
          const dateRecords = await getFoodRecordsByDate(userProfile.uid, date);
          records = [...records, ...dateRecords];
        }
      } else if (viewMode === 'month') {
        // 1개월 데이터 로드
        const monthDates = getDatesForCalendar();
        let allRecords: FoodRecord[] = [];
        const recordMap: Record<string, FoodRecord[]> = {};
        
        for (const date of monthDates) {
          const dateStr = date.toISOString().split('T')[0];
          const dateRecords = await getFoodRecordsByDate(userProfile.uid, date);
          
          if (dateRecords.length > 0) {
            recordMap[dateStr] = dateRecords;
            allRecords = [...allRecords, ...dateRecords];
          }
        }
        
        setRecordsByDate(recordMap);
        records = allRecords;
      }
      
      setFoodRecords(records);
      
      // 이미지 로드
      await loadImages(records);
    } catch (error) {
      console.error('식단 기록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 로드 함수
  const loadImages = async (records: FoodRecord[]) => {
    const newImageCache: Record<string, string> = { ...imageCache };
    
    for (const record of records) {
      if (record.imageId && !newImageCache[record.imageId]) {
        try {
          const imageBlob = await getFoodImage(record.imageId);
          if (imageBlob) {
            const imageUrl = URL.createObjectURL(imageBlob);
            newImageCache[record.imageId] = imageUrl;
          }
        } catch (error) {
          console.error(`이미지 로드 오류 (ID: ${record.imageId}):`, error);
        }
      }
    }
    
    setImageCache(newImageCache);
  };

  // 현재 선택된 날짜를 기준으로 한 주의 날짜들을 반환하는 함수
  const getDaysOfWeek = () => {
    const startDate = new Date(selectedDate);
    // 현재 날짜의 요일(0: 일요일, 1: 월요일, ...)을 구함
    const dayOfWeek = startDate.getDay();
    // 주의 시작일(일요일)로 설정
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // 달력 표시를 위한 날짜 배열 생성 함수
  const getDatesForCalendar = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 달력 첫 번째 칸의 날짜 (이전 달의 일부 포함)
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstCalendarDay.getDate() - firstCalendarDay.getDay());
    
    // 달력 마지막 칸의 날짜 (다음 달의 일부 포함)
    const lastCalendarDay = new Date(lastDay);
    const remainingDays = 6 - lastCalendarDay.getDay();
    lastCalendarDay.setDate(lastCalendarDay.getDate() + remainingDays);
    
    // 달력에 표시할 모든 날짜 생성
    const dates = [];
    let currentDate = new Date(firstCalendarDay);
    
    while (currentDate <= lastCalendarDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // 날짜별로 식단 그룹화
  const groupFoodsByDate = (records: FoodRecord[]) => {
    const groups: Record<string, FoodRecord[]> = {};
    
    records.forEach(record => {
      const dateKey = record.date instanceof Date 
        ? record.date.toISOString().split('T')[0]
        : new Date(record.date).toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(record);
    });
    
    return groups;
  };

  const foodGroups = groupFoodsByDate(foodRecords);
  const dates = Object.keys(foodGroups).sort((a, b) => b.localeCompare(a));

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

  // 날짜별 식단을 표시하는 함수 (일별 보기)
  const renderFoodsByDate = (dateStr: string, recordsForDate: FoodRecord[]) => {
    const date = new Date(dateStr);
    const hasPhotos = recordsForDate.some(record => record.imageId);
    
    return (
      <div key={dateStr} className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {formatDate(date)}
        </h3>
        
        {/* 사진 영역 - 같은 날짜의 사진들을 행에 나란히 표시 */}
        {hasPhotos && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recordsForDate.filter(record => record.imageId && imageCache[record.imageId]).map((record) => (
                <div key={record.id} className="overflow-hidden rounded-lg">
                  <img 
                    src={imageCache[record.imageId!]} 
                    alt={record.name || '식사 이미지'} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-gray-100 dark:bg-gray-800">
                    <p className="font-medium text-sm text-center">{record.name || '식사 기록'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      식사 {recordsForDate.indexOf(record) + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 식단 정보 테이블 - 간단한 메모만 표시 */}
        <div className="space-y-4">
          {recordsForDate.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  {/* 식사 정보 영역 */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {record.name || '식사 기록'}
                        <span className="ml-2 text-sm text-gray-500">
                          (식사 {recordsForDate.indexOf(record) + 1})
                        </span>
                      </h3>
                    </div>
                    
                    {record.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {record.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 주별 보기에서 간략한 식단 표시 함수
  const renderWeeklyView = () => {
    const weekDays = getDaysOfWeek();
    
    return (
      <div className="space-y-4">
        {weekDays.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const records = foodGroups[dateStr] || [];
          const hasPhotos = records.some(record => record.imageId);
          
          return (
            <Card key={dateStr} className="overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {day.toLocaleDateString('ko-KR', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                {records.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    식단 기록이 없습니다.
                  </p>
                ) : (
                  <div>
                    {/* 사진만 표시 - 간략하게 */}
                    {hasPhotos && (
                      <div className="flex overflow-x-auto space-x-3 pb-2 mb-2">
                        {records.filter(record => record.imageId && imageCache[record.imageId]).map((record) => (
                          <div key={record.id} className="flex-shrink-0 w-24">
                            <img 
                              src={imageCache[record.imageId!]} 
                              alt={record.name || '식사 이미지'} 
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <p className="text-xs text-center mt-1 truncate">
                              식사 {records.indexOf(record) + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 식사 요약 정보 */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                      {records.map(record => (
                        <span key={record.id} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          식사 {records.indexOf(record) + 1}
                          {record.name && `: ${record.name}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // 월별 보기에서 달력 형태로 표시하는 함수
  const renderMonthlyView = () => {
    const today = new Date();
    const currentDate = new Date(selectedDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="py-2 border-b border-gray-200 dark:border-gray-700 font-medium">
              {day}
            </div>
          ))}
          
          {calendarDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const records = recordsByDate[dateStr] || [];
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === today.toDateString();
            const hasRecords = records.length > 0;
            const hasPhotos = records.some(record => record.imageId && imageCache[record.imageId]);
            
            return (
              <div 
                key={index} 
                className={`
                  p-1 min-h-24 border border-gray-100 dark:border-gray-700 
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800' : ''} 
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="h-full flex flex-col">
                  <div className="text-right p-1">
                    <span className={`text-sm rounded-full w-6 h-6 flex items-center justify-center
                      ${isToday ? 'bg-blue-500 text-white' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {hasRecords && (
                    <div className="flex-1 flex flex-col">
                      {hasPhotos && (
                        <div className="flex overflow-x-auto space-x-1 py-1">
                          {records
                            .filter(record => record.imageId && imageCache[record.imageId])
                            .slice(0, 2) // 최대 2개만 표시
                            .map((record) => (
                              <div key={record.id} className="flex-shrink-0 w-8 h-8">
                                <img 
                                  src={imageCache[record.imageId!]} 
                                  alt={record.name || '식사 이미지'} 
                                  className="w-8 h-8 object-cover rounded-sm"
                                />
                              </div>
                            ))}
                          {records.filter(record => record.imageId && imageCache[record.imageId]).length > 2 && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-center justify-center text-xs">
                              +{records.filter(record => record.imageId && imageCache[record.imageId]).length - 2}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-auto text-xs">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full px-1 py-0.5">
                          기록 {records.length}개
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* LocalStorage 관련 안내 */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="flex items-start p-4">
          <Info className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold mb-2">식단 기록</h3>
            
            {/* LocalStorage 관련 안내 */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                🔔 사진 저장 안내
              </p>
              <p className="text-blue-700 dark:text-blue-400">
                사진은 사용자 기기의 로컬 저장소에 저장됩니다. 브라우저 캐시를 삭제하거나 다른 기기에서 접속하면 사진이 보이지 않을 수 있습니다.
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
            </div>
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
          {/* 선택된 뷰 모드에 따라 다른 식단 표시 방식 적용 */}
          {viewMode === 'day' && (
            foodRecords.length > 0 ? (
              <div>
                {/* 날짜별로 식단 그룹화하여 표시 */}
                {Object.entries(groupFoodsByDate(foodRecords))
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // 최신순 정렬
                  .map(([dateStr, recordsForDate]) => renderFoodsByDate(dateStr, recordsForDate))
                }
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">선택한 날짜에 식단 기록이 없습니다.</p>
              </div>
            )
          )}
          
          {viewMode === 'week' && (
            Object.keys(foodGroups).length > 0 ? renderWeeklyView() : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">선택한 주에 식단 기록이 없습니다.</p>
              </div>
            )
          )}
          
          {viewMode === 'month' && renderMonthlyView()}
        </div>
      )}
    </div>
  );
};

export default FoodLog;