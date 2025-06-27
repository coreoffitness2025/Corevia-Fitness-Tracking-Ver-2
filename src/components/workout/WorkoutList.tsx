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
import { getPartLabel, getPartColor, generateCalendarDays, parseFirestoreDate } from '../../utils/workoutUtils';

// 뷰 모드 타입 정의
type ViewMode = 'day' | 'week' | 'month';

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [sessions, setSessions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [workoutsByDate, setWorkoutsByDate] = useState<DateWorkoutMap>({});
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const captureRef = useRef<HTMLDivElement>(null);
  const [stampImage, setStampImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const workoutStampRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dateWorkouts, setDateWorkouts] = useState<DateWorkoutMap>({});
  
  // 뷰 모드 상태 추가
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  useEffect(() => {
    fetchWorkouts();
  }, [userProfile, currentDate, viewMode]);

  const fetchWorkouts = async () => {
    if (!userProfile?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let startDate: Date;
      let endDate: Date;
      
      // 뷰 모드에 따라 날짜 범위 설정
      if (viewMode === 'day') {
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewMode === 'week') {
        // 선택된 날짜의 주의 시작일과 종료일 계산
        startDate = new Date(selectedDate);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek); // 주의 시작일 (일요일)
        
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // 주의 마지막일 (토요일)
        endDate.setHours(23, 59, 59, 999);
      } else {
        // 월 단위 뷰 (기존 로직)
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      
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

  useEffect(() => {
    setSelectedWorkouts(workoutsByDate[selectedDate] || []);
  }, [workoutsByDate, selectedDate]);
  
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

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    if (viewMode !== 'day') {
      setViewMode('day');
    }
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
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
    setCurrentDate(date);
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
    setCurrentDate(date);
  };

  const calendarDays = generateCalendarDays(currentDate, workoutsByDate);
  
  // 주간 뷰를 위한 날짜 배열 생성
  const getWeekDays = () => {
    const startDate = new Date(selectedDate);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // 주의 시작일 (일요일)
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };
  
  // 일별 뷰 렌더링
  const renderDailyView = () => {
    return (
      <div className="mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
            {new Date(selectedDate).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </h3>

          {selectedWorkouts.length > 0 && (
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  if (window.confirm('선택한 날짜의 모든 운동 기록을 삭제하시겠습니까?')) {
                    selectedWorkouts.forEach((workout) => {
                      if (workout.id) {
                        deleteWorkout(workout.id);
                      }
                    });
                  }
                }}
                variant="danger"
                size="sm"
                icon={<Trash size={16} />}
              >
                전체 삭제
              </Button>
            </div>
          )}
        </div>

        {selectedWorkouts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-2">이 날짜에 기록된 운동이 없습니다.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">운동 입력 탭에서 운동을 기록해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedWorkouts.map((workout) => renderWorkoutCard(workout))}
          </div>
        )}
      </div>
    );
  };
  
  // 주간 뷰 렌더링
  const renderWeeklyView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="mt-4 space-y-4">
        {weekDays.map(day => {
          const dateStr = formatDate(day);
          const dayWorkouts = workoutsByDate[dateStr] || [];
          
          return (
            <div key={dateStr} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-medium">
                  {day.toLocaleDateString('ko-KR', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              
              {dayWorkouts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  이 날짜에 기록된 운동이 없습니다.
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {dayWorkouts.map(workout => renderWorkoutCard(workout))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // 월간 뷰 렌더링 (기존 달력 뷰)
  const renderMonthlyView = () => {
    return (
      <>
        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {weekdays.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="border rounded-lg bg-gray-50 dark:bg-gray-800/20" />;
            }
            const { dateStr, dayOfMonth, isCurrentMonth, isToday, workouts } = day;
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                className={`p-1 sm:p-2 text-center cursor-pointer border rounded-lg transition-colors duration-200 ${
                  isSelected ? 'bg-blue-500 text-white' : 
                  isToday ? 'bg-blue-100 dark:bg-blue-900/50' : 
                  isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800/30 text-gray-400'
                } ${isCurrentMonth && !isSelected ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30' : ''}`}
              >
                <div className={`mx-auto mb-1 ${isSelected ? 'font-bold' : isToday ? 'text-blue-600 dark:text-blue-300 font-bold' : ''}`}>
                  {dayOfMonth}
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {workouts.slice(0, 2).map(p => (
                    <div key={p} className={`w-1.5 h-1.5 rounded-full ${getPartColor(p)}`}></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 선택된 날짜의 운동 기록 */}
        {renderDailyView()}
      </>
    );
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
              {viewMode === 'month' && `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
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
      <div ref={captureRef} className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-6 rounded-lg">
        {/* 선택된 뷰 모드에 따라 다른 컴포넌트 렌더링 */}
        {viewMode === 'day' && renderDailyView()}
        {viewMode === 'week' && renderWeeklyView()}
        {viewMode === 'month' && renderMonthlyView()}
      </div>
    </div>
  );
};

export default WorkoutList; 