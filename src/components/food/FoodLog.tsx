import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { calculateTotalNutrition, formatDate } from '../../utils/nutritionUtils';
import { fetchFoodsByDate } from '../../services/foodService';
import FoodItem from './FoodItem';
import NutritionSummary from './NutritionSummary';
import Card from '../common/Card';
import { Info, Download, Share, Calendar, CalendarDays, Camera, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

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
  const { foods, setFoods } = useFoodStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [proteinTarget, setProteinTarget] = useState<number>(0);
  const [carbsTarget, setCarbsTarget] = useState<number>(0);
  const [fatTarget, setFatTarget] = useState<number>(0);
  const foodStampRef = useRef<HTMLDivElement>(null);
  const [stampImage, setStampImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (user) {
      // 사용자 프로필에서 목표 칼로리 계산 (실제 앱에서는 Firebase에서 가져옴)
      const mockUserProfile = {
        height: 175,
        weight: 70,
        age: 30,
        gender: 'male' as 'male' | 'female',
        activityLevel: 'moderate' as 'low' | 'moderate' | 'high',
        fitnessGoal: 'maintain' as 'loss' | 'maintain' | 'gain'
      };
      
      // 기초 대사량(BMR) 계산
      const bmr = calculateBMR(
        mockUserProfile.gender, 
        mockUserProfile.weight, 
        mockUserProfile.height, 
        mockUserProfile.age
      );
      
      // 총 일일 에너지 소비량(TDEE) 계산
      const tdee = bmr * activityMultipliers[mockUserProfile.activityLevel];
      
      // 목표에 따른 칼로리 조정
      const calculatedCalories = Math.round(tdee * goalMultipliers[mockUserProfile.fitnessGoal]);
      
      setTargetCalories(calculatedCalories);
      
      // 단백질, 탄수화물, 지방 목표량 계산
      const proteinGrams = Math.round(mockUserProfile.weight * 1.6);
      const proteinCalories = proteinGrams * 4; // 단백질 1g = 4 칼로리
      
      const remainingCalories = calculatedCalories - proteinCalories;
      const carbsCalories = remainingCalories * 0.55;
      const fatCalories = remainingCalories * 0.3;
      
      setProteinTarget(proteinGrams);
      setCarbsTarget(Math.round(carbsCalories / 4)); // 탄수화물 1g = 4 칼로리
      setFatTarget(Math.round(fatCalories / 9));     // 지방 1g = 9 칼로리
      
      loadFoodData();
    }
  }, [user, selectedDate, viewMode]);

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

  // 스탬프 캡처 및 다운로드 기능
  const captureFoodStamp = async () => {
    if (!foodStampRef.current || dates.length === 0) return;
    
    try {
      const canvas = await html2canvas(foodStampRef.current, {
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

  // 카메라로 촬영 (모바일 웹앱에서 작동)
  const handleCameraCapture = () => {
    setShowCamera(true);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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
  
  // 업로드된 이미지에 식단 내용 오버레이 하기
  const createStampWithImage = async () => {
    if (!uploadedImage || !foodStampRef.current || dates.length === 0) return;
    
    try {
      // 식단 정보 캡처
      const infoCanvas = await html2canvas(foodStampRef.current, {
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
        
        // 식단 정보를 반투명하게 오버레이
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // 오버레이 영역 (이미지 하단 40% 영역)
        const overlayHeight = img.height * 0.4;
        ctx.fillRect(0, img.height - overlayHeight, img.width, overlayHeight);
        
        // 식단 정보 오버레이
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
    if (uploadedImage && dates.length > 0) {
      createStampWithImage();
    }
  }, [uploadedImage]);

  // 이미지 다운로드
  const downloadStampImage = () => {
    if (stampImage) {
      const link = document.createElement('a');
      link.href = stampImage;
      link.download = `식단스탬프_${selectedDate}.png`;
      link.click();
    }
  };

  // 스탬프 공유 기능
  const shareFoodStamp = async () => {
    if (!stampImage) {
      if (foodStampRef.current) {
        await captureFoodStamp();
      } else {
        return;
      }
    }
    
    if (stampImage) {
      try {
        // 공유 API 사용 (if supported)
        if (navigator.share) {
          const blob = await (await fetch(stampImage)).blob();
          const file = new File([blob], `식단스탬프_${selectedDate}.png`, { type: 'image/png' });
          
          await navigator.share({
            title: `${selectedDate} 식단 기록`,
            text: '오늘의 식단 기록입니다!',
            files: [file]
          });
        } else {
          // 클립보드에 복사 (fallback)
          await navigator.clipboard.writeText(`${selectedDate} 식단 기록`);
          alert('이미지 URL이 클립보드에 복사되었습니다.');
        }
      } catch (error) {
        console.error('스탬프 공유 중 오류:', error);
      }
    }
  };

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

  return (
    <div className="space-y-8">
      {/* 목표 칼로리 및 영양소 가이드 */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold mb-2">영양소 목표</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">칼로리</span>
                <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{targetCalories} kcal</span>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">단백질</span>
                <span className="block text-lg font-bold text-green-600 dark:text-green-400">{proteinTarget}g</span>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">탄수화물</span>
                <span className="block text-lg font-bold text-yellow-600 dark:text-yellow-400">{carbsTarget}g</span>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">지방</span>
                <span className="block text-lg font-bold text-red-600 dark:text-red-400">{fatTarget}g</span>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              <p>식사별 목표: 아침 <strong>{Math.round(targetCalories * 0.3)}kcal</strong>, 점심 <strong>{Math.round(targetCalories * 0.4)}kcal</strong>, 저녁 <strong>{Math.round(targetCalories * 0.3)}kcal</strong></p>
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
      
      {/* 식단 그룹화 및 표시 */}
      {foodGroups && (
        <div className="space-y-4">
          {dates.map(date => (
            <div key={date}>
              <h2 className="text-2xl font-semibold mb-2">{date}</h2>
              <div className="space-y-2">
                {foodGroups[date].map(food => (
                  <FoodItem key={food.id} food={food} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 스탬프 캡처 및 다운로드 기능 */}
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
        <button
          onClick={captureFoodStamp}
          className="flex items-center px-3 py-1 rounded bg-blue-500 text-white"
        >
          <Camera size={16} className="mr-1" /> 스탬프 캡처
        </button>
        <button
          onClick={downloadStampImage}
          className="flex items-center px-3 py-1 rounded bg-blue-500 text-white ml-2"
        >
          <Download size={16} className="mr-1" /> 스탬프 다운로드
        </button>
        <button
          onClick={shareFoodStamp}
          className="flex items-center px-3 py-1 rounded bg-blue-500 text-white ml-2"
        >
          <Share size={16} className="mr-1" /> 스탬프 공유
        </button>
      </div>
    </div>
  );
};

export default FoodLog;