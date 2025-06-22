import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, weekdays } from '../../utils/dateUtils';
import { ExercisePart, Workout, WorkoutSet, DateWorkoutMap } from '../../types';
import { Camera, Download, Share, Image, ChevronLeft, ChevronRight, X, Trash } from 'lucide-react';
import html2canvas from 'html2canvas';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';
// 유틸리티 함수 import
import { getPartLabel, getPartColor, generateCalendarDays, parseFirestoreDate } from '../../utils/workoutUtils';

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [sessions, setSessions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [monthOptions, setMonthOptions] = useState<{value: number; label: string}[]>([]);
  const [workoutsByDate, setWorkoutsByDate] = useState<DateWorkoutMap>({});
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [stampImage, setStampImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const workoutStampRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dateWorkouts, setDateWorkouts] = useState<DateWorkoutMap>({});
  
  // 현재 년월이 변경될 때 달력 일자 업데이트
  useEffect(() => {
    const days = generateCalendarDays(currentYear, currentMonth);
    setCalendarDays(days);
  }, [currentYear, currentMonth]);
  
  // 운동 기록 삭제 함수
  const deleteWorkout = async (workoutId: string) => {
    if (!currentUser || !workoutId) return;

    try {
      // Firestore에서 해당 ID의 문서 삭제
      const sessionRef = doc(db, 'sessions', workoutId);
      await deleteDoc(sessionRef);
      
      // 상태 업데이트
      setSessions((prev: Workout[]) => prev.filter(session => session.id !== workoutId));
      setSelectedWorkouts((prev: Workout[]) => prev.filter(workout => workout.id !== workoutId));
      setWorkoutsByDate((prev: DateWorkoutMap) => {
        const updated = { ...prev };
        
        // 모든 날짜에서 해당 ID의 workout 제거
        Object.keys(updated).forEach(date => {
          updated[date] = updated[date].filter((workout: Workout) => workout.id !== workoutId);
          if (updated[date].length === 0) {
            delete updated[date];
          }
        });
        
        return updated;
      });
      
      toast.success('운동 기록이 삭제되었습니다.');
    } catch (err) {
      console.error('운동 기록 삭제 실패:', err);
      toast.error('운동 기록 삭제에 실패했습니다.');
    }
  };
  
  // Firebase에서 운동 세션 데이터 불러오기
  useEffect(() => {
    const fetchSessions = async () => {
      if (!userProfile?.uid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 현재 년월의 시작일과 종료일 계산
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        
        // 세션 데이터 쿼리
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
    
    fetchSessions();
  }, [userProfile, currentYear, currentMonth]);
  
  // 이전/다음 달 이동 함수
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // 특정 년도/월로 이동하는 함수
  const goToSelectedMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  // 년도 및 월 옵션 생성
  useEffect(() => {
    // 년도 옵션 생성 (현재 년도 기준 ±5년)
    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
    setYearOptions(years);
    
    // 월 옵션 생성
    const months = [
      { value: 0, label: '1월' },
      { value: 1, label: '2월' },
      { value: 2, label: '3월' },
      { value: 3, label: '4월' },
      { value: 4, label: '5월' },
      { value: 5, label: '6월' },
      { value: 6, label: '7월' },
      { value: 7, label: '8월' },
      { value: 8, label: '9월' },
      { value: 9, label: '10월' },
      { value: 10, label: '11월' },
      { value: 11, label: '12월' }
    ];
    setMonthOptions(months);
  }, []);
  
  // 날짜별 운동 기록 그룹화
  useEffect(() => {
    const groupedWorkouts = sessions.reduce<DateWorkoutMap>((acc, session) => {
      const dateObj = parseFirestoreDate(session.date as any);
      const dateStr = formatDate(dateObj);
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(session);
      return acc;
    }, {});
    
    setWorkoutsByDate(groupedWorkouts);
  }, [sessions]);

  // 선택된 날짜의 운동 기록 가져오기
  useEffect(() => {
    setSelectedWorkouts(workoutsByDate[selectedDate] || []);
  }, [workoutsByDate, selectedDate]);

  // 카메라로 촬영 (모바일 웹앱에서 작동)
  const handleCameraCapture = () => {
    setShowCamera(true);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // TypeScript에서 HTMLInputElement는 capture 속성을 직접 지원하지 않으므로 attribute로 설정
    input.setAttribute('capture', 'environment'); // 모바일 기기에서 카메라 활성화
    input.onchange = (e: Event) => {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedImage(reader.result);
            setShowCamera(false);
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        setShowCamera(false);
      }
    };
    input.click();
  };

  // 앨범에서 이미지 선택
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedImage(reader.result);
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    };
    input.click();
  };

  // 스탬프 캡처 및 다운로드 기능
  const captureWorkoutStamp = async () => {
    if (!workoutStampRef.current || selectedWorkouts.length === 0) return;
    
    try {
      const canvas = await html2canvas(workoutStampRef.current, {
        background: '#ffffff',
        // @ts-ignore
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setStampImage(dataUrl);
    } catch (error) {
      console.error('스탬프 캡처 중 오류:', error);
    }
  };
  
  // 업로드된 이미지에 운동 내용 오버레이 하기
  const createStampWithImage = async () => {
    if (!uploadedImage || !workoutStampRef.current || selectedWorkouts.length === 0) return;
    
    try {
      // 운동 정보 캡처
      const infoCanvas = await html2canvas(workoutStampRef.current, {
        background: 'transparent',
        // @ts-ignore
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      // 새 캔버스 생성
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) return;
      
      // 업로드된 이미지 로드
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = uploadedImage;
      
      img.onload = () => {
        // 캔버스 크기 설정
        finalCanvas.width = img.width;
        finalCanvas.height = img.height;
        
        // 배경 이미지 그리기
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // 운동 정보를 반투명하게 오버레이
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // 오버레이 영역 (이미지 하단 40% 영역)
        const overlayHeight = img.height * 0.4;
        ctx.fillRect(0, img.height - overlayHeight, img.width, overlayHeight);
        
        // 운동 정보 오버레이
        ctx.globalAlpha = 1.0;
        const scale = img.width / infoCanvas.width;
        const scaledHeight = infoCanvas.height * scale * 0.7; // 70% 크기로 조정
        
        ctx.drawImage(
          infoCanvas, 
          0, 0, infoCanvas.width, infoCanvas.height,
          img.width * 0.05, // 좌측 5% 여백
          img.height - scaledHeight - (img.height * 0.05), // 하단 5% 여백
          img.width * 0.9, // 90% 너비 사용
          scaledHeight
        );
        
        // 앱 워터마크 추가
        ctx.font = `bold ${Math.round(img.width * 0.04)}px Arial`;
        ctx.fillStyle = '#3B82F6';
        ctx.textAlign = 'right';
        ctx.fillText('Corevia Fitness', img.width - (img.width * 0.05), img.height - (img.height * 0.02));
        
        // 최종 이미지 설정
        const finalImage = finalCanvas.toDataURL('image/jpeg', 0.9);
        setStampImage(finalImage);
        setUploadedImage(null);
      };
    } catch (error) {
      console.error('스탬프 생성 중 오류:', error);
    }
  };
  
  // 업로드된 이미지가 있으면 스탬프 생성
  useEffect(() => {
    if (uploadedImage && selectedWorkouts.length > 0) {
      createStampWithImage();
    }
  }, [uploadedImage]);

  // 이미지 다운로드
  const downloadStampImage = () => {
    if (stampImage) {
      const link = document.createElement('a');
      link.href = stampImage;
      link.download = `운동스탬프_${selectedDate}.png`;
      link.click();
    }
  };

  // 스탬프 공유 기능
  const shareWorkoutStamp = async () => {
    if (!stampImage) {
      if (workoutStampRef.current) {
        await captureWorkoutStamp();
      } else {
        return;
      }
    }
    
    if (stampImage) {
      try {
        // 공유 API 사용 (if supported)
        if (navigator.share) {
          const blob = await (await fetch(stampImage)).blob();
          const file = new File([blob], `운동스탬프_${selectedDate}.png`, { type: 'image/png' });
          
          await navigator.share({
            title: `${selectedDate} 운동 기록`,
            text: '오늘의 운동 기록입니다!',
            files: [file]
          });
        } else {
          // 클립보드에 복사 (fallback)
          await navigator.clipboard.writeText(`${selectedDate} 운동 기록`);
          alert('이미지 URL이 클립보드에 복사되었습니다.');
        }
      } catch (error) {
        console.error('스탬프 공유 중 오류:', error);
      }
    }
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSelectedWorkouts(workoutsByDate[date] || []);
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays(currentDate, workoutsByDate);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
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
      {/* 캡처 영역 시작 */}
      <div ref={captureRef} className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-6 rounded-lg">
        {/* 달력 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button onClick={() => changeMonth(-1)} variant="outline" size="icon" aria-label="이전 달">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <Button onClick={() => changeMonth(1)} variant="outline" size="icon" aria-label="다음 달">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
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
      </div>
      
      {/* 선택된 날짜의 운동 기록 */}
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
            {selectedWorkouts.map((workout) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutList; 