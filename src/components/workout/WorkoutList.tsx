import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, weekdays } from '../../utils/dateUtils';
import { ExercisePart, Workout, WorkoutSet, DateWorkoutMap } from '../../types';
import { Camera, Download, Share, Image, ChevronLeft, ChevronRight, X, Trash, Calendar, CalendarDays } from 'lucide-react';
import html2canvas from 'html2canvas';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';
// 유틸리티 함수 import
import { getPartLabel, getPartColor, parseFirestoreDate } from '../../utils/workoutUtils';

// 뷰 모드 타입 정의
type ViewMode = 'day' | 'week' | 'month';

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [sessions, setSessions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // FoodLog.tsx와 동일한 상태 관리 방식으로 변경
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [workoutsByDate, setWorkoutsByDate] = useState<DateWorkoutMap>({});
  
  // 월별 보기에서 클릭된 날짜를 관리할 별도 상태
  const [monthlyViewSelectedDate, setMonthlyViewSelectedDate] = useState<string | null>(null);
  // 달력 날짜 배열 상태 추가
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchWorkouts();
      // 뷰 모드가 변경될 때 월별 선택 날짜 초기화
      setMonthlyViewSelectedDate(null);
    }
  }, [userProfile?.uid, selectedDate, viewMode]);

  useEffect(() => {
    const groupedWorkouts = sessions.reduce<DateWorkoutMap>((acc, session) => {
      const dateStr = formatDate(session.date as Date);
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(session);
      return acc;
    }, {});
    setWorkoutsByDate(groupedWorkouts);
  }, [sessions]);

  // 월별 뷰일 때 달력 날짜 계산
  useEffect(() => {
    if (viewMode === 'month') {
      const dates = getDatesForCalendar();
      setCalendarDates(dates);
    }
  }, [viewMode, selectedDate]);
  
  // FoodLog.tsx에서 가져온 달력 날짜 계산 함수
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
  
  const fetchWorkouts = async () => {
    if (!userProfile?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let startDate: Date;
      let endDate: Date;
      const baseDate = new Date(selectedDate);
      
      if (viewMode === 'day') {
        startDate = new Date(baseDate);
        endDate = new Date(baseDate);
      } else if (viewMode === 'week') {
        const dayOfWeek = baseDate.getDay();
        startDate = new Date(baseDate.setDate(baseDate.getDate() - dayOfWeek));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else { // 'month'
        startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', userProfile.uid),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const sessionData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        } as Workout;
      });
      
      setSessions(sessionData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('운동 기록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateClick = (date: string) => {
    const dayHasWorkouts = workoutsByDate[date] && workoutsByDate[date].length > 0;

    if (viewMode === 'month') {
      if (dayHasWorkouts) {
        setMonthlyViewSelectedDate(prev => (prev === date ? null : date));
      }
    } else {
      setSelectedDate(date);
      setViewMode('day');
    }
  };

  const navigatePrevious = () => {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() - 1);
    }
    setSelectedDate(formatDate(date));
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
    setSelectedDate(formatDate(date));
  };

  const getWeekDays = () => {
    const start = new Date(selectedDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(start.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  };

  // 해당 날짜의 운동 부위별 개수를 계산하는 함수
  const getWorkoutPartCounts = (workouts: Workout[]) => {
    const partCounts: Record<ExercisePart, number> = {
      chest: 0,
      back: 0,
      shoulder: 0,
      leg: 0,
      biceps: 0,
      triceps: 0,
      abs: 0,
      cardio: 0,
      complex: 0
    };
    
    workouts.forEach(workout => {
      partCounts[workout.part] = (partCounts[workout.part] || 0) + 1;
    });
    
    return partCounts;
  };

  // 색상을 더 진하게 반환하는 함수 추가
  const getPartColorDarker = (part: ExercisePart): string => {
    switch (part) {
      case 'chest':
        return 'bg-red-600';
      case 'back':
        return 'bg-blue-600';
      case 'shoulder':
        return 'bg-yellow-600';
      case 'leg':
        return 'bg-purple-600';
      case 'biceps':
        return 'bg-green-600';
      case 'triceps':
        return 'bg-indigo-600';
      case 'abs':
        return 'bg-orange-600';
      case 'cardio':
        return 'bg-pink-600';
      case 'complex':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const renderMonthlyView = () => {
    const todayCal = new Date();
    const currentDateCal = new Date(selectedDate);
    const currentMonth = currentDateCal.getMonth();
    const currentYear = currentDateCal.getFullYear();
    
    return (
      <>
        <div className="text-center mb-4">
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
            const dateStr = formatDate(date);
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isTodayCal = date.toDateString() === todayCal.toDateString();
            const workouts = workoutsByDate[dateStr] || [];
            const isSelected = monthlyViewSelectedDate === dateStr;
            const partCounts = getWorkoutPartCounts(workouts);
            
            // 운동 부위별 아이콘 또는 텍스트 표시
            const hasWorkouts = workouts.length > 0;
            
            return (
              <div 
                key={index} 
                onClick={() => handleDateClick(dateStr)}
                className={`
                  p-1 min-h-24 border border-gray-100 dark:border-gray-700 transition-colors
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20' : ''}
                  ${isTodayCal ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400' : ''}
                  ${isCurrentMonth && hasWorkouts ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : 'cursor-default'}
                `}
              >
                <div className="h-full flex flex-col">
                  <div className="text-right p-1">
                    <span className={`text-sm rounded-full w-6 h-6 flex items-center justify-center
                      ${isTodayCal ? 'bg-blue-500 text-white' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {hasWorkouts && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {Object.entries(partCounts).map(([part, count]) => {
                          if (count > 0) {
                            return (
                              <div 
                                key={part} 
                                className={`px-2 py-0.5 text-xs rounded-full ${getPartColorDarker(part as ExercisePart)} text-white font-medium`}
                                title={`${getPartLabel(part as ExercisePart)} ${count}개`}
                              >
                                {getPartLabel(part as ExercisePart)}
                                {count > 1 ? ` ${count}` : ''}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <div className="mt-auto text-xs text-center">
                        <span className="text-info-700 dark:text-info-300">
                          기록 {workouts.length}개
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {monthlyViewSelectedDate && (
          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {new Date(monthlyViewSelectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </h3>
            {workoutsByDate[monthlyViewSelectedDate] && workoutsByDate[monthlyViewSelectedDate].length > 0 ? (
              <div className="space-y-4">
                {workoutsByDate[monthlyViewSelectedDate].map((workout) => renderWorkoutCard(workout))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-500 dark:text-gray-400">이 날짜에 기록된 운동이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </>
    );
  };
  
  const renderDailyView = () => {
    const dailyWorkouts = workoutsByDate[selectedDate] || [];
    return (
      <div className="mt-4 sm:mt-6">
        {dailyWorkouts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-500 dark:text-gray-400">이 날짜에 기록된 운동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyWorkouts.map((workout) => renderWorkoutCard(workout))}
          </div>
        )}
      </div>
    );
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!currentUser || !workoutId) return;

    try {
      await deleteDoc(doc(db, 'sessions', workoutId));
      
      const updatedSessions = sessions.filter(session => session.id !== workoutId);
      setSessions(updatedSessions);
      
      toast.success('운동 기록이 삭제되었습니다.');
    } catch (err) {
      console.error('운동 기록 삭제 실패:', err);
      toast.error('운동 기록 삭제에 실패했습니다.');
    }
  };
  
  // 운동 카드 렌더링 함수 (중복 코드 제거)
  const renderWorkoutCard = (workout: Workout) => {
    return (
      <div key={workout.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {/* 카드 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span
              className={`py-1 px-3 rounded-full text-xs sm:text-sm font-semibold text-white ${getPartColor(
                workout.part
              )}`}
            >
              {getPartLabel(workout.part)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {parseFirestoreDate(workout.date as any).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <Button
            onClick={() => {
              if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
                if (workout.id) deleteWorkout(workout.id);
              }
            }}
            variant="ghost"
            size="sm"
            icon={<Trash size={14} />}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            삭제
          </Button>
        </div>

        {/* 메인 운동 정보 */}
        <div className="mb-3">
          <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-2">
            {workout.mainExercise.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {workout.mainExercise.sets.map((set, index) => (
              <div
                key={index}
                className={`px-2 py-1 text-xs sm:text-sm rounded ${
                  set.isSuccess
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {set.weight}kg &times; {set.reps}회
              </div>
            ))}
          </div>
        </div>

        {/* 보조 운동 정보 */}
        {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
          <div>
            {workout.accessoryExercises.map((accEx, accIndex) => (
              <div key={accIndex} className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <p className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {accEx.name}
                </p>
                <div className="flex flex-wrap gap-1">
                  {accEx.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`px-1.5 py-0.5 text-xs rounded ${
                        set.isSuccess
                          ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      }`}
                    >
                      {set.weight}kg &times; {set.reps}회
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return <LoadingSpinner message="운동 기록을 불러오고 있습니다..." />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      {/* 날짜 네비게이션 및 뷰 모드 선택 UI 통합 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex items-center">
          <button 
            onClick={navigatePrevious}
            className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-700/50"
            aria-label="이전"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="mx-4 text-center">
            <h2 className="font-medium text-base sm:text-lg">
              {viewMode === 'day' && new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
              {viewMode === 'week' && (
                <>
                  {getWeekDays()[0].toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - {getWeekDays()[6].toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </>
              )}
              {viewMode === 'month' && `${new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long' })}`}
            </h2>
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
            icon={<Calendar size={16} />}
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
      
      {/* 캡처 영역 시작 */}
      <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-6 rounded-lg">
        {/* 선택된 뷰 모드에 따라 다른 컴포넌트 렌더링 */}
        {viewMode === 'day' && renderDailyView()}
        {viewMode === 'week' && renderDailyView()}
        {viewMode === 'month' && renderMonthlyView()}
      </div>
    </div>
  );
};

export default WorkoutList; 