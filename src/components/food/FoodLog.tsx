import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { formatDate, formatDateWithWeekday, isToday } from '../../utils/dateUtils';
import Card from '../common/Card';
import { Info, Calendar, CalendarDays, ExternalLink, X, Plus, Droplets, Pill, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { getFoodRecordsByDate, getFoodImage, FoodRecord, getWaterRecordsByDate, getSupplementRecordsByDate, WaterRecord, SupplementRecord } from '../../utils/indexedDB';
import { WaterIntake, Supplement } from '../../types';
import { 
  calculateNutritionGoals, 
  DEFAULT_USER_PROFILE,
  calculateBMR 
} from '../../utils/nutritionUtils';
import type { UserProfile } from '../../types';
import NutritionSourcesGuide from './NutritionSourcesGuide';
import Button from '../common/Button';

type ViewMode = 'day' | 'week' | 'month';

interface FoodLogProps {
  selectedDate?: Date;
}

const FoodLog: React.FC<FoodLogProps> = ({ selectedDate: propSelectedDate }) => {
  const { user } = useAuthStore();
  const { userProfile } = useAuth();
  const { foods, setFoods } = useFoodStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    propSelectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [proteinTarget, setProteinTarget] = useState<number>(0);
  const [carbsTarget, setCarbsTarget] = useState<number>(0);
  const [fatTarget, setFatTarget] = useState<number>(0);
  const [showNutritionSources, setShowNutritionSources] = useState<boolean>(false);
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  
  // 물과 영양제 기록을 위한 상태 추가
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([]);
  const [supplementRecords, setSupplementRecords] = useState<SupplementRecord[]>([]);
  
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [recordsByDate, setRecordsByDate] = useState<Record<string, FoodRecord[]>>({});
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, record: FoodRecord, index: number} | null>(null);
  
  // 달력 모달 관련 상태 추가
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarCurrentDate, setCalendarCurrentDate] = useState<Date>(new Date(selectedDate));

  const [nutritionGoals, setNutritionGoals] = useState(() => {
    return calculateNutritionGoals(userProfile || DEFAULT_USER_PROFILE);
  });

  const [foodForm_targetCalories, setFoodForm_TargetCalories] = useState<number>(nutritionGoals.daily.calories);
  const [foodForm_proteinTarget, setFoodForm_ProteinTarget] = useState<number>(nutritionGoals.daily.protein);
  const [foodForm_carbsTarget, setFoodForm_CarbsTarget] = useState<number>(nutritionGoals.daily.carbs);
  const [foodForm_fatTarget, setFoodForm_FatTarget] = useState<number>(nutritionGoals.daily.fat);

  useEffect(() => {
    if (userProfile?.uid) {
      loadFoodRecords();
      loadAdditionalRecords();
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

  const loadFoodRecords = async () => {
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

  // 달력 모달 관련 함수들
  const openCalendarModal = () => {
    setCalendarCurrentDate(new Date(selectedDate));
    setShowCalendarModal(true);
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    closeCalendarModal();
  };

  const getCalendarDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const navigateCalendarPrevious = () => {
    const newDate = new Date(calendarCurrentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarCurrentDate(newDate);
  };

  const navigateCalendarNext = () => {
    const newDate = new Date(calendarCurrentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarCurrentDate(newDate);
  };

  const renderFoodsByDate = (dateStr: string, recordsForDate: FoodRecord[]) => {
    const date = new Date(dateStr);
    const hasPhotos = recordsForDate.some(record => record.imageId);
    
    // 해당 날짜의 물과 영양제 기록 필터링
    const dayWaterRecords = waterRecords.filter(record => 
      record.date.toISOString().split('T')[0] === dateStr
    );
    const daySupplementRecords = supplementRecords.filter(record => 
      record.date.toISOString().split('T')[0] === dateStr
    );
    
    return (
      <div key={dateStr} className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {formatDate(date)}
        </h3>
        
        {/* 기존 음식 사진 */}
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
                    <p className="font-medium text-sm text-center">
                      {record.name && record.name !== '식사' ? record.name : `식사 ${recordsForDate.indexOf(record) + 1}`}
                    </p>
                    {record.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1 truncate">
                        {record.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 물과 영양제 기록 섹션 */}
        {(dayWaterRecords.length > 0 || daySupplementRecords.length > 0) && (
          <div className="mt-4 space-y-3">
            {/* 물 섭취 기록 */}
            {dayWaterRecords.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={16} className="text-blue-500" />
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">물 섭취</h4>
                </div>
                <div className="space-y-1">
                  {dayWaterRecords.map((record) => (
                    <div key={record.id} className="flex justify-between items-center text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        {record.time} - {record.amount}ml
                      </span>
                      {record.notes && (
                        <span className="text-blue-600 dark:text-blue-400 text-xs">
                          {record.notes}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm">
                      총 {dayWaterRecords.reduce((sum, record) => sum + record.amount, 0)}ml 섭취
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 영양제 복용 기록 */}
            {daySupplementRecords.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Pill size={16} className="text-green-500" />
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">영양제 복용</h4>
                </div>
                <div className="space-y-1">
                  {daySupplementRecords.map((record) => (
                    <div key={record.id} className="flex justify-between items-center text-sm">
                      <span className="text-green-700 dark:text-green-300">
                        {record.time} - {record.name} ({record.dosage})
                      </span>
                      {record.notes && (
                        <span className="text-green-600 dark:text-green-400 text-xs">
                          {record.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 기록이 없을 때 */}
        {!hasPhotos && dayWaterRecords.length === 0 && daySupplementRecords.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">이 날의 기록이 없습니다.</p>
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
          
          // 해당 날짜의 물과 영양제 기록
          const dayWaterRecords = waterRecords.filter(record => 
            record.date.toISOString().split('T')[0] === dateStr
          );
          const daySupplementRecords = supplementRecords.filter(record => 
            record.date.toISOString().split('T')[0] === dateStr
          );
          
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
                
                {records.length === 0 && dayWaterRecords.length === 0 && daySupplementRecords.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    이 날의 기록이 없습니다.
                  </p>
                ) : (
                  <div>
                    {/* 음식 사진 */}
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
                              {record.name && record.name !== '식사' ? record.name : `식사 ${records.indexOf(record) + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : records.length > 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
                        식사 기록 {records.length}개 (사진 없음)
                      </p>
                    )}
                    
                    {/* 물과 영양제 요약 */}
                    {(dayWaterRecords.length > 0 || daySupplementRecords.length > 0) && (
                      <div className="flex gap-2 mt-2">
                        {dayWaterRecords.length > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                            <Droplets size={12} />
                            <span>물 {dayWaterRecords.reduce((sum, record) => sum + record.amount, 0)}ml</span>
                          </div>
                        )}
                        {daySupplementRecords.length > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            <Pill size={12} />
                            <span>{daySupplementRecords.map(s => s.name).join(', ')}</span>
                          </div>
                        )}
                      </div>
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
            
            // 해당 날짜의 물과 영양제 기록
            const dayWaterRecords = waterRecords.filter(record => 
              record.date.toISOString().split('T')[0] === dateStr
            );
            const daySupplementRecords = supplementRecords.filter(record => 
              record.date.toISOString().split('T')[0] === dateStr
            );
            
            const hasWaterOrSupplement = dayWaterRecords.length > 0 || daySupplementRecords.length > 0;
            const totalRecords = records.length + dayWaterRecords.length + daySupplementRecords.length;
            
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
                  
                  {(hasRecords || hasWaterOrSupplement) && (
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
                      
                      {/* 물과 영양제 표시 */}
                      {hasWaterOrSupplement && (
                        <div className="flex gap-1 px-1 py-0.5">
                          {dayWaterRecords.length > 0 && (
                            <div className="flex items-center">
                              <Droplets size={8} className="text-blue-500" />
                              <span className="text-xs text-blue-600 ml-0.5">{dayWaterRecords.reduce((sum, record) => sum + record.amount, 0)}</span>
                            </div>
                          )}
                          {daySupplementRecords.length > 0 && (
                            <div className="flex items-center">
                              <Pill size={8} className="text-green-500" />
                              <span className="text-xs text-green-600 ml-0.5" title={daySupplementRecords.map(s => s.name).join(', ')}>
                                {daySupplementRecords.length === 1 
                                  ? daySupplementRecords[0].name.length > 4 
                                    ? daySupplementRecords[0].name.slice(0, 4) + '...'
                                    : daySupplementRecords[0].name
                                  : `${daySupplementRecords.length}개`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-auto text-xs">
                        <span className="bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-300 rounded-full px-1 py-0.5">
                          기록 {totalRecords}개
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

  // 물과 영양제 데이터 로드 함수
  const loadAdditionalRecords = async () => {
    if (!userProfile?.uid) return;
    
    try {
      if (viewMode === 'day') {
        // 일별 뷰: 선택된 날짜의 기록만 로드
        const waters = await getWaterRecordsByDate(userProfile.uid, new Date(selectedDate));
        const supplements = await getSupplementRecordsByDate(userProfile.uid, new Date(selectedDate));
        setWaterRecords(waters);
        setSupplementRecords(supplements);
      } else if (viewMode === 'week') {
        // 주별 뷰: 해당 주의 모든 기록 로드
        const weekDates = getDaysOfWeek();
        let allWaters: WaterRecord[] = [];
        let allSupplements: SupplementRecord[] = [];
        
        for (const date of weekDates) {
          const waters = await getWaterRecordsByDate(userProfile.uid, date);
          const supplements = await getSupplementRecordsByDate(userProfile.uid, date);
          allWaters = [...allWaters, ...waters];
          allSupplements = [...allSupplements, ...supplements];
        }
        
        setWaterRecords(allWaters);
        setSupplementRecords(allSupplements);
      } else if (viewMode === 'month') {
        // 월별 뷰: 해당 월의 모든 기록 로드
        const monthDates = getDatesForCalendar();
        let allWaters: WaterRecord[] = [];
        let allSupplements: SupplementRecord[] = [];
        
        for (const date of monthDates) {
          const waters = await getWaterRecordsByDate(userProfile.uid, date);
          const supplements = await getSupplementRecordsByDate(userProfile.uid, date);
          allWaters = [...allWaters, ...waters];
          allSupplements = [...allSupplements, ...supplements];
        }
        
        setWaterRecords(allWaters);
        setSupplementRecords(allSupplements);
      }
    } catch (error) {
      console.error('물/영양제 기록 로드 오류:', error);
      setWaterRecords([]);
      setSupplementRecords([]);
    }
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
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center mx-4">
            <span className="font-medium text-center w-48 md:w-auto mr-2">
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
              onClick={openCalendarModal}
              className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700/50 text-primary-600 dark:text-primary-400"
              aria-label="달력으로 날짜 선택"
              title="달력으로 날짜 선택"
            >
              <Calendar size={20} />
            </button>
          </div>
          
          <button 
            onClick={navigateNext}
            className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-700/50"
            aria-label="다음"
          >
            <ChevronRight size={20} />
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
                {selectedPhoto.record.name && selectedPhoto.record.name !== '식사' 
                  ? selectedPhoto.record.name 
                  : `식사 ${selectedPhoto.index}`}
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

      {/* 달력 모달 */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">날짜 선택</h3>
              <button 
                onClick={closeCalendarModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* 월 네비게이션 */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={navigateCalendarPrevious}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <h4 className="text-lg font-semibold">
                  {calendarCurrentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                </h4>
                
                <button 
                  onClick={navigateCalendarNext}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {/* 달력 그리드 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDates(calendarCurrentDate).map((date, index) => {
                  const isCurrentMonth = date.getMonth() === calendarCurrentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = date.toISOString().split('T')[0] === selectedDate;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors
                        ${!isCurrentMonth 
                          ? 'text-gray-400 dark:text-gray-600' 
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        ${isToday 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : ''
                        }
                        ${isSelected 
                          ? 'bg-primary-500 text-white hover:bg-primary-600' 
                          : ''
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              
              {/* 오늘 날짜로 이동 버튼 */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSelect(new Date())}
                >
                  오늘
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog;