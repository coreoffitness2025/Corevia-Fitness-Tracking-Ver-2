import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, weekdays } from '../../utils/dateUtils';
import { ExercisePart } from '../../types';
import { Camera, Download, Share, Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import Button from '../common/Button';

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
  accessoryExercises?: Array<{
    name: string;
    sets: WorkoutSet[];
  }>;
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
  
  // 선택된 년도와 월에 따라 달력 데이터 생성
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
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
  
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workouts: Workout[] = [
    {
      id: '1',
      date: '2024-03-20',
      part: 'chest',
      mainExercise: {
        name: '벤치프레스',
        weight: 80,
        sets: [
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 8, weight: 80, isSuccess: false },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true }
        ]
      },
      accessoryExercises: [
        {
          name: '인클라인 덤벨 프레스',
          sets: [
            { reps: 12, weight: 20, isSuccess: true },
            { reps: 12, weight: 20, isSuccess: true },
            { reps: 10, weight: 20, isSuccess: true }
          ]
        },
        {
          name: '케이블 플라이',
          sets: [
            { reps: 15, weight: 15, isSuccess: true },
            { reps: 15, weight: 15, isSuccess: true }
          ]
        }
      ],
      notes: '오늘은 컨디션이 좋아서 잘 진행했습니다. 다음에는 벤치프레스 무게를 조금 더 올려볼 예정입니다.',
      isAllSuccess: false,
      successSets: 4
    },
    {
      id: '2',
      date: '2024-03-18',
      part: 'back',
      mainExercise: {
        name: '데드리프트',
        weight: 100,
        sets: [
          { reps: 8, weight: 100, isSuccess: true },
          { reps: 8, weight: 100, isSuccess: true },
          { reps: 7, weight: 100, isSuccess: false }
        ]
      },
      accessoryExercises: [
        {
          name: '랫 풀다운',
          sets: [
            { reps: 12, weight: 60, isSuccess: true },
            { reps: 12, weight: 60, isSuccess: true }
          ]
        }
      ],
      notes: '허리 통증이 약간 있어서 조심하며 진행했습니다.',
      isAllSuccess: false,
      successSets: 2
    },
    // 현재 날짜에 대한 더미 데이터 추가
    {
      id: '3',
      date: formatDate(new Date()), // 오늘 날짜
      part: 'shoulder',
      mainExercise: {
        name: '오버헤드 프레스',
        weight: 60,
        sets: [
          { reps: 8, weight: 60, isSuccess: true },
          { reps: 8, weight: 60, isSuccess: true },
          { reps: 10, weight: 60, isSuccess: true }
        ]
      },
      accessoryExercises: [
        {
          name: '사이드 레터럴 레이즈',
          sets: [
            { reps: 12, weight: 10, isSuccess: true },
            { reps: 12, weight: 10, isSuccess: true }
          ]
        }
      ],
      notes: '어깨 컨디션이 좋았습니다.',
      isAllSuccess: true,
      successSets: 3
    }
  ];

  // 달력 연도/월 표시 수정
  const monthYearText = new Date(currentYear, currentMonth).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });

  // 날짜별 운동 기록 그룹화
  const workoutsByDate = workouts.reduce<Record<string, Workout[]>>((acc, workout) => {
    const date = workout.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workout);
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
      const img: HTMLImageElement = new Image();
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

  return (
    <div className="space-y-6">
      {/* 달력 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">운동 달력</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={goToPreviousMonth} 
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &lt;
            </button>
            
            <div className="flex items-center space-x-2">
              <select
                value={currentYear}
                onChange={(e) => goToSelectedMonth(parseInt(e.target.value), currentMonth)}
                className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 appearance-none"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
              <div className="relative inline-block">
                <select
                  value={currentMonth}
                  onChange={(e) => goToSelectedMonth(currentYear, parseInt(e.target.value))}
                  className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 appearance-none"
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button 
              onClick={goToNextMonth} 
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &gt;
            </button>
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
            
            return (
              <div 
                key={`day-${i}`} 
                onClick={() => setSelectedDate(dateStr)}
                className={`relative p-2 min-h-[80px] text-center cursor-pointer border rounded-lg
                  ${isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-40'}
                  ${isToday ? 'border-blue-500' : 'border-transparent'}
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              >
                <span className={`text-sm ${
                  day.getDay() === 0 ? 'text-red-500' : 
                  day.getDay() === 6 ? 'text-blue-500' : 
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {day.getDate()}
                </span>
                
                {/* 운동 마커 - 메인 운동명 포함 */}
                {hasWorkout && (
                  <div className="mt-1 flex flex-col gap-1">
                    {dayWorkouts.map((workout, j) => {
                      // 주요 정보 추출
                      const mainExerciseName = workout.mainExercise.name;
                      const mainExerciseWeight = workout.mainExercise.weight;
                      const partLabel = getPartLabel(workout.part);
                      const statusLabel = workout.isAllSuccess ? '성공' : '실패';
                      
                      return (
                        <div 
                          key={`workout-${j}`} 
                          className={`text-xs px-1 py-0.5 rounded-sm truncate ${getPartColor(workout.part, workout.isAllSuccess)}`}
                          title={`${partLabel} - ${mainExerciseName} ${mainExerciseWeight}kg - ${statusLabel}`}
                        >
                          <span className="font-medium">{partLabel}</span>
                          <span className="mx-1">-</span>
                          <span className="hidden md:inline">{mainExerciseName}</span>
                          <span>{mainExerciseWeight}kg</span>
                          <span className="ml-1">
                            {workout.isAllSuccess ? '✓' : '✗'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 선택된 날짜 표시 및 스탬프 기능 */}
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
            <button
              type="button"
              className="flex items-center px-3 py-1 rounded text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200"
              onClick={captureWorkoutStamp}
            >
              <Camera size={16} className="mr-1" /> 스탬프 생성
            </button>
            <button
              type="button"
              className="flex items-center px-3 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200"
              onClick={handleCameraCapture}
            >
              <Camera size={16} className="mr-1" /> 카메라로 촬영
            </button>
            <button
              type="button"
              className="flex items-center px-3 py-1 rounded text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200"
              onClick={handleFileSelect}
            >
              <Image size={16} className="mr-1" /> 앨범에서 선택
            </button>
          </div>
        )}
        
        {selectedWorkouts.length === 0 && (
          <span className="text-sm text-gray-500">
            운동 기록이 없습니다
          </span>
        )}
      </div>
      
      {/* 운동 스탬프 이미지 */}
      {stampImage && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              운동 스탬프
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex items-center px-3 py-1 rounded text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200"
                onClick={downloadStampImage}
              >
                <Download size={16} className="mr-1" /> 저장
              </button>
              <button
                type="button"
                className="flex items-center px-3 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200"
                onClick={shareWorkoutStamp}
              >
                <Share size={16} className="mr-1" /> 공유
              </button>
              <button
                type="button"
                className="flex items-center px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200"
                onClick={() => setStampImage(null)}
              >
                <span>✕</span> 닫기
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src={stampImage}
              alt="운동 스탬프"
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      )}
      
      {/* 기존 운동 스탬프 영역 - 캡처용으로만 사용 */}
      {selectedWorkouts.length > 0 && (
        <div 
          ref={workoutStampRef}
          className={`bg-white p-6 rounded-lg shadow-lg border-2 border-blue-500 dark:bg-gray-800 mb-6 ${stampImage || uploadedImage ? 'hidden' : ''}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })} 운동 스탬프
            </h3>
            <div className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full">
              <Camera size={16} className="mr-1" />
              <span className="text-sm">Corevia Fitness</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedWorkouts.map((workout, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${workout.isAllSuccess ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={`py-1 px-2 rounded-md text-sm mr-2 ${getPartColor(workout.part, workout.isAllSuccess)}`}>
                      {getPartLabel(workout.part)}
                    </span>
                    <h4 className="font-semibold">{workout.mainExercise.name}</h4>
                  </div>
                  <span className="text-sm text-gray-500">
                    {workout.successSets}/{workout.mainExercise.sets.length} 세트
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {workout.mainExercise.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex}
                      className={`text-xs py-1 px-2 rounded ${set.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {set.weight}kg x {set.reps}회
                    </div>
                  ))}
                </div>
                
                {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">보조 운동:</span> {workout.accessoryExercises.map(ex => ex.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Corevia Fitness Tracking App에서 생성됨
          </div>
        </div>
      )}
      
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
                  <h3 className="text-lg font-semibold">{workout.mainExercise.name}</h3>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {new Date(workout.date).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
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
                    {workout.accessoryExercises.map((exercise, exIndex) => (
                      <div key={exIndex} className="ml-2">
                        <p className="text-gray-700 dark:text-gray-300 mb-1">{exercise.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div 
                              key={setIndex} 
                              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm"
                            >
                              {set.weight}kg x {set.reps}회
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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