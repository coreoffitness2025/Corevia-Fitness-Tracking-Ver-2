import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { formatDate, formatDateWithWeekday, isToday } from '../../utils/dateUtils';
import Card from '../common/Card';
import { Info, Calendar, CalendarDays, ExternalLink, X, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { getFoodRecordsByDate, getFoodImage, FoodRecord } from '../../utils/indexedDB';
import { 
  calculateNutritionGoals, 
  DEFAULT_USER_PROFILE,
  calculateBMR 
} from '../../utils/nutritionUtils';
import type { UserProfile } from '../../types';
import NutritionSourcesGuide from './NutritionSourcesGuide';
import Button from '../common/Button';

type ViewMode = 'day' | 'week' | 'month';

const FoodLog = () => {
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
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, record: FoodRecord, index: number} | null>(null);

  const [nutritionGoals, setNutritionGoals] = useState(() => {
    return calculateNutritionGoals(userProfile || DEFAULT_USER_PROFILE);
  });

  const [foodForm_targetCalories, setFoodForm_TargetCalories] = useState<number>(nutritionGoals.daily.calories);
  const [foodForm_proteinTarget, setFoodForm_ProteinTarget] = useState<number>(nutritionGoals.daily.protein);
  const [foodForm_carbsTarget, setFoodForm_CarbsTarget] = useState<number>(nutritionGoals.daily.carbs);
  const [foodForm_fatTarget, setFoodForm_FatTarget] = useState<number>(nutritionGoals.daily.fat);

  useEffect(() => {
    if (userProfile?.uid) {
      loadFoodData();
    }
  }, [userProfile?.uid, selectedDate, viewMode]);

  useEffect(() => {
    if (userProfile) {
      const calculatedGoals = calculateNutritionGoals(userProfile);
      setNutritionGoals(calculatedGoals);
      setFoodForm_TargetCalories(calculatedGoals.daily.calories);
      setFoodForm_ProteinTarget(calculatedGoals.daily.protein);
      setFoodForm_CarbsTarget(calculatedGoals.daily.carbs);
      setFoodForm_FatTarget(calculatedGoals.daily.fat);
    } else {
      const defaultGoals = calculateNutritionGoals(DEFAULT_USER_PROFILE);
      setNutritionGoals(defaultGoals);
      setFoodForm_TargetCalories(defaultGoals.daily.calories);
      setFoodForm_ProteinTarget(defaultGoals.daily.protein);
      setFoodForm_CarbsTarget(defaultGoals.daily.carbs);
      setFoodForm_FatTarget(defaultGoals.daily.fat);
    }
  }, [userProfile]);

  useEffect(() => {
    if (viewMode === 'month') {
      const dates = getDatesForCalendar();
      setCalendarDates(dates);
    }
  }, [viewMode, selectedDate]);

  const loadFoodData = async () => {
    if (!userProfile?.uid) return;
    
    setIsLoading(true);
    try {
      let records: FoodRecord[] = [];
      
      if (viewMode === 'day') {
        records = await getFoodRecordsByDate(userProfile.uid, new Date(selectedDate));
      } else if (viewMode === 'week') {
        const weekDates = getDaysOfWeek();
        for (const date of weekDates) {
          const dateRecords = await getFoodRecordsByDate(userProfile.uid, date);
          records = [...records, ...dateRecords];
        }
      } else if (viewMode === 'month') {
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
      
      await loadImages(records);
    } catch (error) {
      console.error('식단 기록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getDaysOfWeek = () => {
    const startDate = new Date(selectedDate);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDatesForCalendar = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstCalendarDay.getDate() - firstCalendarDay.getDay());
    
    const lastCalendarDay = new Date(lastDay);
    const remainingDays = 6 - lastCalendarDay.getDay();
    lastCalendarDay.setDate(lastCalendarDay.getDate() + remainingDays);
    
    const dates = [];
    let currentDate = new Date(firstCalendarDay);
    
    while (currentDate <= lastCalendarDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

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

  const navigateToNutritionInfo = () => {
    navigate('/qna', { state: { activeTab: 'nutrition' } });
  };

  const handleImageClick = (imageUrl: string, record: FoodRecord, index: number) => {
    setSelectedPhoto({url: imageUrl, record, index});
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  const renderFoodsByDate = (dateStr: string, recordsForDate: FoodRecord[]) => {
    const date = new Date(dateStr);
    const hasPhotos = recordsForDate.some(record => record.imageId);
    
    return (
      <div key={dateStr} className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {formatDate(date)}
        </h3>
        
        {hasPhotos && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recordsForDate.filter(record => record.imageId && imageCache[record.imageId]).map((record, idx) => (
                <div key={record.id} className="overflow-hidden rounded-lg cursor-pointer" 
                     onClick={() => handleImageClick(imageCache[record.imageId!], record, recordsForDate.indexOf(record) + 1)}>
                  <img 
                    src={imageCache[record.imageId!]} 
                    alt={record.name || '식사 이미지'} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-gray-100 dark:bg-gray-800">
                    <p className="font-medium text-sm text-center">식사 {recordsForDate.indexOf(record) + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!hasPhotos && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">식단 기록이 없습니다.</p>
          </div>
        )}
      </div>
    );
  };

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
                    {hasPhotos ? (
                      <div className="flex overflow-x-auto space-x-3 pb-2 mb-2">
                        {records.filter(record => record.imageId && imageCache[record.imageId]).map((record) => (
                          <div key={record.id} className="flex-shrink-0 w-24 cursor-pointer"
                               onClick={() => handleImageClick(imageCache[record.imageId!], record, records.indexOf(record) + 1)}>
                            <img 
                              src={imageCache[record.imageId!]} 
                              alt={record.name || '식사 이미지'} 
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <p className="text-xs text-center mt-1">
                              식사 {records.indexOf(record) + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        사진이 없습니다.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const todayCal = new Date();
    const currentDateCal = new Date(selectedDate);
    const currentMonth = currentDateCal.getMonth();
    const currentYear = currentDateCal.getFullYear();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">
            {currentDateCal.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
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
            const isTodayCal = date.toDateString() === todayCal.toDateString();
            const hasRecords = records.length > 0;
            const hasPhotos = records.some(record => record.imageId && imageCache[record.imageId]);
            
            return (
              <div 
                key={index} 
                className={`
                  p-1 min-h-24 border border-gray-100 dark:border-gray-700 
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800' : ''} 
                  ${isTodayCal ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                `}
              >
                <div className="h-full flex flex-col">
                  <div className="text-right p-1">
                    <span className={`text-sm rounded-full w-6 h-6 flex items-center justify-center
                      ${isTodayCal ? 'bg-primary-400 text-white' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {hasRecords && (
                    <div className="flex-1 flex flex-col">
                      {hasPhotos && (
                        <div className="flex overflow-x-auto space-x-1 py-1">
                          {records
                            .filter(record => record.imageId && imageCache[record.imageId])
                            .slice(0, 2)
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
                        <span className="bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-300 rounded-full px-1 py-0.5">
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
      <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-400 rounded-r-lg text-sm">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-primary-700 dark:text-primary-300">
            사진은 현재 사용자의 로컬 저장소에 저장됩니다. 브라우저 캐시를 삭제하거나 다른 기기에서 접속하면 사진이 보이지 않을 수 있습니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex items-center">
          <button 
            onClick={navigatePrevious}
            className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-700/50"
            aria-label="이전"
          >
            &lt;
          </button>
          
          <span className="mx-4 font-medium text-center w-48 md:w-auto">
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
            className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-700/50"
            aria-label="다음"
          >
            &gt;
          </button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'day' ? 'primary' : 'default'}
            onClick={() => setViewMode('day')}
            icon={<Calendar size={16}  />}
          >
            일별
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'primary' : 'default'}
            onClick={() => setViewMode('week')}
            icon={<Calendar size={16} />}
          >
            주별
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'primary' : 'default'}
            onClick={() => setViewMode('month')}
            icon={<CalendarDays size={16} />}
          >
            월별
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" showText={true} text="식단 기록을 불러오는 중입니다..." />
        </div>
      ) : (
        <div>
          {viewMode === 'day' && (
            foodRecords.length > 0 ? (
              <div>
                {Object.entries(groupFoodsByDate(foodRecords))
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([dateStr, recordsForDate]) => renderFoodsByDate(dateStr, recordsForDate))}
              </div>
            ) : (
              <div className="bg-light-bg dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">선택한 날짜에 식단 기록이 없습니다.</p>
              </div>
            )
          )}
          
          {viewMode === 'week' && (
            Object.keys(foodGroups).length > 0 ? renderWeeklyView() : (
              <div className="bg-light-bg dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">선택한 주에 식단 기록이 없습니다.</p>
              </div>
            )
          )}
          
          {viewMode === 'month' && renderMonthlyView()}
        </div>
      )}

      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">
                식사 {selectedPhoto.index} 
              </h3>
              <button 
                onClick={closePhotoModal} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="p-4 flex justify-center">
                <img 
                  src={selectedPhoto.url} 
                  alt="식사 이미지" 
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              {selectedPhoto.record.description && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedPhoto.record.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog;