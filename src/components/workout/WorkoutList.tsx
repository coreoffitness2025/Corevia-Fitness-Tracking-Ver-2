import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, weekdays } from '../../utils/dateUtils';
import { ExercisePart, Session, AccessoryExercise } from '../../types';
import { Camera, Download, Share, Image, ChevronLeft, ChevronRight, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import LoadingSpinner from '../common/LoadingSpinner';

// WorkoutSet 인터페이스 로컬 정의
interface WorkoutSet {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

interface Workout {
  id: string;
  date: string;
  part: ExercisePart;
  mainExercise: {
    name: string;
    weight: number;
    sets: WorkoutSet[];
  };
  accessoryExercises?: AccessoryExercise[];
  notes?: string;
  isAllSuccess: boolean;
  successSets?: number;
}

// 현재 달의 날짜 배열 생성
const generateCalendarDays = (year: number, month: number) => {
  // 선택된 달의 첫째 날
  const firstDay = new Date(year, month, 1);
  // 선택된 달의 마지막 날
  const lastDay = new Date(year, month + 1, 0);
  
  // 달력 시작일 (이전 달의 일부 포함)
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // 달력 종료일 (다음 달의 일부 포함)
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - lastDay.getDay();
  endDate.setDate(lastDay.getDate() + daysToAdd);
  
  const days: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// 운동 부위에 따른 레이블 반환
const getPartLabel = (part: ExercisePart): string => {
  const labels: { [key in ExercisePart]: string } = {
    chest: '가슴',
    back: '등',
    shoulder: '어깨',
    leg: '하체',
    biceps: '이두',
    triceps: '삼두'
  };
  return labels[part];
};

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const workoutStampRef = useRef<HTMLDivElement>(null);
  
  // 년도와 월 상태 추가
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  
  // 스탬프 이미지 상태
  const [stampImage, setStampImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // 세션 데이터 상태
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 선택된 년도와 월에 따라 달력 데이터 생성
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
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
          } as Session;
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
  
  // 년도 옵션 생성 (현재 년도 기준 ±5년)
  const yearOptions = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);
  
  // 월 옵션 생성
  const monthOptions = [
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
  
  // 날짜별 운동 기록 그룹화
  const workoutsByDate = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    // date가 Date 객체인 경우 문자열로 변환
    const dateStr = formatDate(session.date instanceof Date ? session.date : new Date(session.date as string));
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(session);
    return acc;
  }, {});
  
  // 운동 부위에 따른 색상 지정 - 성공/실패 색상 더 명확하게 구분
  const getPartColor = (part: ExercisePart, isSuccess: boolean = true) => {
    const baseColors = {
      chest: isSuccess ? 'bg-blue-200 text-blue-800 border-blue-400' : 'bg-red-200 text-red-800 border-red-400',
      back: isSuccess ? 'bg-green-200 text-green-800 border-green-400' : 'bg-red-200 text-red-800 border-red-400',
      shoulder: isSuccess ? 'bg-purple-200 text-purple-800 border-purple-400' : 'bg-red-200 text-red-800 border-red-400',
      leg: isSuccess ? 'bg-orange-200 text-orange-800 border-orange-400' : 'bg-red-200 text-red-800 border-red-400',
      biceps: isSuccess ? 'bg-pink-200 text-pink-800 border-pink-400' : 'bg-red-200 text-red-800 border-red-400',
      triceps: isSuccess ? 'bg-indigo-200 text-indigo-800 border-indigo-400' : 'bg-red-200 text-red-800 border-red-400'
    };
    return baseColors[part];
  };

  // 선택된 날짜의 운동 기록
  const selectedWorkouts = workoutsByDate[selectedDate] || [];

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
        backgroundColor: '#ffffff',
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
        backgroundColor: null, // 투명 배경
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

  // 달력 연도/월 표시 수정
  const monthYearText = new Date(currentYear, currentMonth).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });
  
  // ... 여기에 달력 UI와 기타 구성 요소 렌더링 코드 ...

  return (
    <div className="p-4">
      {/* 달력 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{monthYearText}</h2>
        <div className="flex items-center space-x-2">
          <button onClick={goToPreviousMonth} className="p-1 rounded hover:bg-gray-200">
            <ChevronLeft size={20} />
          </button>
          <select 
            value={currentYear}
            onChange={(e) => goToSelectedMonth(parseInt(e.target.value), currentMonth)}
            className="px-2 py-1 rounded border"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <select 
            value={currentMonth}
            onChange={(e) => goToSelectedMonth(currentYear, parseInt(e.target.value))}
            className="px-2 py-1 rounded border"
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <button onClick={goToNextMonth} className="p-1 rounded hover:bg-gray-200">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {/* 요일 헤더 */}
        {weekdays.map(day => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        
        {/* 날짜 그리드 */}
        {calendarDays.map((date, i) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === formatDate(new Date());
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = dateStr === selectedDate;
          const hasWorkout = workoutsByDate[dateStr]?.length > 0;
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={`
                p-2 rounded-lg transition-colors relative
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
              `}
            >
              <div className="text-center">
                {date.getDate()}
              </div>
              {hasWorkout && (
                <div className="flex justify-center mt-1 space-x-1">
                  {workoutsByDate[dateStr].map((session, idx) => (
                    <span 
                      key={idx} 
                      className={`
                        w-2 h-2 rounded-full 
                        ${getPartColor(session.part, session.isAllSuccess).split(' ')[0]}
                      `}
                    ></span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜의 운동 목록 */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{selectedDate} 운동 기록</h3>
          <div className="flex space-x-2">
            {selectedWorkouts.length > 0 && (
              <>
                <Button 
                  onClick={captureWorkoutStamp}
                  variant="outline"
                  icon={<Download size={16} />}
                >
                  이미지 생성
                </Button>
                <Button 
                  onClick={handleCameraCapture} 
                  variant="outline"
                  icon={<Camera size={16} />}
                >
                  사진 촬영
                </Button>
                <Button 
                  onClick={handleFileSelect}
                  variant="outline"
                  icon={<Image size={16} />}
                >
                  앨범에서 선택
                </Button>
                {stampImage && (
                  <>
                    <Button 
                      onClick={downloadStampImage}
                      variant="outline"
                      icon={<Download size={16} />}
                    >
                      다운로드
                    </Button>
                    <Button 
                      onClick={shareWorkoutStamp}
                      variant="outline"
                      icon={<Share size={16} />}
                    >
                      공유하기
                    </Button>
                  </>
                )}
              </>
            )}
            <Button 
              onClick={() => navigate('/workout')}
              variant="primary"
            >
              운동 등록
            </Button>
          </div>
        </div>

        {/* 운동 내용 렌더링 */}
        {selectedWorkouts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            선택한 날짜에 기록된 운동이 없습니다.
          </div>
        ) : (
          <>
            {/* 스탬프 이미지 표시 영역 */}
            {stampImage && (
              <div className="mb-4 relative">
                <button 
                  onClick={() => setStampImage(null)} 
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                >
                  <X size={16} />
                </button>
                <img 
                  src={stampImage} 
                  alt="운동 스탬프" 
                  className="max-w-full rounded-lg shadow-lg" 
                />
              </div>
            )}
            
            {/* 실제 운동 목록 (스탬프 캡처용 ref 포함) */}
            <div 
              ref={workoutStampRef}
              className="space-y-4 bg-white p-4 rounded-lg shadow"
            >
              {selectedWorkouts.map((workout, index) => (
                <div 
                  key={workout.id} 
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span 
                        className={`inline-block w-4 h-4 rounded-full mr-2 
                          ${getPartColor(workout.part, workout.isAllSuccess).split(' ')[0]}`}
                      ></span>
                      {getPartLabel(workout.part)} 운동
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${workout.isAllSuccess 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}
                    >
                      {workout.isAllSuccess ? '완료' : '미완료'}
                    </span>
                  </div>
                  
                  {/* 메인 운동 */}
                  <div className="mb-3">
                    <h4 className="font-medium">{workout.mainExercise.name}</h4>
                    <div className="ml-4 mt-1">
                      {workout.mainExercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center text-sm">
                          <span className="w-6 mr-1">#{setIndex + 1}</span>
                          <span className="mr-2">{set.weight}kg</span>
                          <span className="mr-1">{set.reps}회</span>
                          {set.isSuccess !== undefined && (
                            <span className="ml-2">
                              {set.isSuccess 
                                ? <span className="text-green-500">✓</span> 
                                : <span className="text-red-500">✗</span>}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 보조 운동 */}
                  {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
                    <div>
                      <h4 className="font-medium">보조 운동</h4>
                      {workout.accessoryExercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="ml-4 mt-1 mb-2">
                          <h5 className="text-sm font-medium">{exercise.name}</h5>
                          <div className="ml-2">
                            {exercise.sets && exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="flex items-center text-sm">
                                <span className="w-6 mr-1">#{setIndex + 1}</span>
                                <span className="mr-2">{set.weight}kg</span>
                                <span className="mr-1">{set.reps}회</span>
                                {set.isSuccess !== undefined && (
                                  <span className="ml-2">
                                    {set.isSuccess 
                                      ? <span className="text-green-500">✓</span> 
                                      : <span className="text-red-500">✗</span>}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 메모 */}
                  {workout.notes && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      <span className="font-medium">메모:</span> {workout.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutList; 