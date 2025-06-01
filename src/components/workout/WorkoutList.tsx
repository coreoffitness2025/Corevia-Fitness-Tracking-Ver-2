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
    <div className="space-y-6">
      {/* 달력 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">운동 달력</h3>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={goToPreviousMonth} 
              variant="outline"
              size="sm"
              icon={<ChevronLeft size={16} />}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              이전
            </Button>
            
            <div className="flex items-center space-x-2">
              <select
                value={currentYear}
                onChange={(e) => goToSelectedMonth(parseInt(e.target.value), currentMonth)}
                className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12 appearance-none"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
              <div className="relative inline-block">
                <select
                  value={currentMonth}
                  onChange={(e) => goToSelectedMonth(currentYear, parseInt(e.target.value))}
                  className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12 appearance-none"
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={goToNextMonth} 
              variant="outline"
              size="sm"
              icon={<ChevronRight size={16} />}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              다음
            </Button>
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {weekdays.map((weekday, i) => (
            <div 
              key={`weekday-${i}`} 
              className={`text-center py-2 text-sm font-medium ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {weekday}
            </div>
          ))}
          
          {/* 날짜 */}
          {calendarDays.map((day, i) => {
            const dateStr = formatDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = dateStr === formatDate(new Date());
            const isSelected = dateStr === selectedDate;
            const dayWorkouts = workoutsByDate[dateStr] || [];
            const hasWorkout = dayWorkouts.length > 0;
            
            let workoutPartsLabels: string[] = [];
            let allSuccessForDay = true; // 해당 날짜의 모든 운동이 성공했는지 여부
            
            if (hasWorkout) {
              const parts = new Set<ExercisePart>();
              dayWorkouts.forEach(workout => {
                if (workout.part) {
                  parts.add(workout.part);
                }
                if (!workout.isAllSuccess) { // 하나라도 실패한 운동이 있으면 그날은 전체 성공이 아님
                  allSuccessForDay = false;
                }
              });
              workoutPartsLabels = Array.from(parts).map(part => getPartLabel(part));
            }
            
            return (
              <div 
                key={`day-${i}`} 
                onClick={() => setSelectedDate(dateStr)}
                className={`relative p-2 min-h-[80px] text-center cursor-pointer border rounded-lg
                  ${isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-40'}
                  ${isToday ? 'border-primary-500' : 'border-transparent'}
                  ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''}
                `}
              >
                <span className={`text-sm ${ 
                  isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {day.getDate()}
                </span>
                
                {hasWorkout && (
                  <div className="mt-1 flex flex-col gap-1">
                    <div 
                      className={`text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 truncate`}
                      title={workoutPartsLabels.join(' / ') + (allSuccessForDay ? ' ✓' : '')}
                    >
                      {workoutPartsLabels.join('/')} {allSuccessForDay ? '✓' : ''}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 선택된 날짜 표시 및 기록 삭제 버튼 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {new Date(selectedDate).toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}
        </h3>
        
        {selectedWorkouts.length > 0 && (
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                if (window.confirm('선택한 날짜의 모든 운동 기록을 삭제하시겠습니까?')) {
                  selectedWorkouts.forEach(workout => {
                    if (workout.id) {
                      deleteWorkout(workout.id);
                    }
                  });
                }
              }}
              variant="outline"
              size="sm"
              icon={<Trash size={16} />}
              className="text-red-500 hover:text-red-700"
            >
              기록 삭제
            </Button>
          </div>
        )}
        
        {selectedWorkouts.length === 0 && (
          <span className="text-sm text-gray-500">
            운동 기록이 없습니다
          </span>
        )}
      </div>
      
      {/* 선택된 날짜의 운동 기록 목록 */}
      <div className="space-y-6">
        {selectedWorkouts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              이 날짜에 기록된 운동이 없습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              운동 입력 탭에서 운동을 기록해보세요.
            </p>
          </div>
        ) : (
          selectedWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full text-sm mr-2">
                    {getPartLabel(workout.part)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {parseFirestoreDate(workout.date as any).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <Button
                    onClick={() => {
                      if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
                        deleteWorkout(workout.id);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    icon={<Trash size={16} />}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </div>
              </div>
              
              {/* 성공/실패 뱃지 */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  workout.isAllSuccess ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {workout.isAllSuccess ? '성공' : '실패'} ({workout.successSets || 0}/{workout.mainExercise.sets.length} 세트)
                </span>
              </div>
              
              {/* 메인 운동 세트 정보 */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">메인 운동 세트</h4>
                <div className="flex flex-wrap gap-2">
                  {workout.mainExercise.sets.map((set, index) => (
                    <div 
                      key={index} 
                      className={`px-3 py-1 rounded text-sm ${
                        set.isSuccess 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {set.weight}kg {set.reps}/10
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 보조 운동 정보 */}
              {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">보조 운동</h4>
                  <div className="space-y-3">
                    {workout.accessoryExercises.map((exercise, exIndex) => {
                      const exerciseSets = exercise.sets;
                      return (
                        <div key={exIndex} className="ml-2">
                          <p className="text-gray-700 dark:text-gray-300 mb-1">{exercise.name || '보조운동'}</p>
                          {typeof exerciseSets === 'number' ? (
                            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                              {exercise.weight}kg x {exercise.reps}회 x {exerciseSets}세트
                            </div>
                          ) : Array.isArray(exerciseSets) && exerciseSets.map((set, setIndex) => (
                            <div 
                              key={setIndex} 
                              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm"
                            >
                              {set.weight}kg x {set.reps}회
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 메모 */}
              {workout.notes && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">메모</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {workout.notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutList; 