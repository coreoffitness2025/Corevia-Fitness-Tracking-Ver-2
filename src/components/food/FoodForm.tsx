import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { toast } from 'react-hot-toast';
import { saveFoodRecord } from '../../services/foodService';
import Card from '../common/Card';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FoodFormProps {
  onSuccess?: () => void; // 식단 저장 후 호출될 콜백
}

// 활동 수준에 따른 칼로리 계수
const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,    // 거의 운동 안함
  light: 1.375,      // 가벼운 운동 (주 1-3회)
  moderate: 1.55,    // 중간 정도 운동 (주 3-5회)
  active: 1.725,     // 활발한 운동 (주 6-7회)
  veryActive: 1.9    // 매우 활발한 운동 (하루 2회 이상)
};

// 목표에 따른 칼로리 조정
const goalMultipliers: Record<string, number> = {
  lose: 0.8,     // 체중 감량
  maintain: 1.0, // 체중 유지
  gain: 1.15     // 체중 증가
};

// 성별에 따른 기초 대사량 계산 (Harris-Benedict 방정식)
function calculateBMR(gender: 'male' | 'female', weight: number, height: number, age: number) {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

const FoodForm: React.FC<FoodFormProps> = ({ onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const { addFood } = useFoodStore();
  const navigate = useNavigate();
  const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD 형식
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  
  // 칼로리 목표 관련 상태
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [proteinTarget, setProteinTarget] = useState<number>(0);
  const [carbsTarget, setCarbsTarget] = useState<number>(0);
  const [fatTarget, setFatTarget] = useState<number>(0);

  // 사용자 프로필에서 목표 칼로리 계산
  useEffect(() => {
    if (userProfile) {
      console.log('식단 컴포넌트: 사용자 프로필 로드됨, 목표 칼로리/영양소 설정 시작:', userProfile);
      updateNutritionTargets(userProfile);
    }
  }, [userProfile]); // userProfile 직접 의존

  const updateNutritionTargets = (profile: typeof userProfile) => { // profile 타입을 userProfile 타입으로 명시
    if (!profile) return; // profile이 null/undefined일 경우 조기 반환

    // 이미 계산된 목표 칼로리가 있으면 사용
    if (profile.targetCalories && !isNaN(profile.targetCalories)) {
      console.log('계산된 목표 칼로리 사용:', profile.targetCalories);
      setTargetCalories(profile.targetCalories);
    } else {
      // 계산된 목표 칼로리가 없으면 직접 계산
      console.log('목표 칼로리 직접 계산. Profile data:', profile);
      if (profile.height && profile.weight && profile.age && profile.gender && profile.activityLevel && profile.fitnessGoal) {
        const bmr = calculateBMR(
          profile.gender, 
          Number(profile.weight), 
          Number(profile.height), 
          Number(profile.age)
        );
        
        // 기본값 사용 및 타입 안전성 확보
        const activityLevel = profile.activityLevel && activityMultipliers[profile.activityLevel] ? profile.activityLevel : 'moderate';
        const fitnessGoal = profile.fitnessGoal && goalMultipliers[profile.fitnessGoal] ? profile.fitnessGoal : 'maintain';
        
        // 총 일일 에너지 소비량(TDEE) 계산
        const tdee = bmr * activityMultipliers[activityLevel];
        
        // 목표에 따른 칼로리 조정
        const calculatedCalories = Math.round(tdee * goalMultipliers[fitnessGoal]);
        
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
    
    // targetCalories가 업데이트 된 이후에 이 함수가 호출되도록 구조 변경 필요 가능성 있음
    // 현재는 updateNutritionTargets 내부에서 호출되므로, targetCalories 최신값을 사용할 수 있음
    const localTargetCalories = targetCalories > 0 ? targetCalories : (userProfile?.targetCalories || 2000); // profile.targetCalories 우선 사용

    const remainingCalories = Math.max(0, localTargetCalories - proteinCalories);
    
    // 탄수화물 45-65%, 지방 20-35% (여기서는 중간값 사용)
    const carbsCalories = Math.max(0, remainingCalories * 0.55);
    const fatCalories = Math.max(0, remainingCalories * 0.3);
    
    setProteinTarget(proteinGrams);
    setCarbsTarget(Math.round(carbsCalories / 4)); // 탄수화물 1g = 4 칼로리
    setFatTarget(Math.round(fatCalories / 9));     // 지방 1g = 9 칼로리
  };

  // 파일 선택 처리 - 로컬 이미지 파일 저장
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 로컬 파일 저장
      setLocalImageFile(file);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
          // 로컬 식별자로 이미지 URL 설정
          setImageUrl(`local_image_${Date.now()}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 카메라로 촬영 (모바일 웹앱에서 작동)
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 모바일 기기에서 카메라 활성화
    input.onchange = (e: Event) => {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        // 로컬 파일 저장
        setLocalImageFile(fileInput.files[0]);
        
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setImagePreview(reader.result);
            // 로컬 식별자로 이미지 URL 설정
            setImageUrl(`local_camera_${Date.now()}`);
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!imageUrl) {
      toast.error('식사 사진이 필요합니다.');
      return;
    }

    try {
      const mealDateTime = new Date(`${mealDate}T12:00:00`); // 기본 시간 정오로 설정
      
      // 로컬 저장소에 이미지 저장 (웹 브라우저의 IndexedDB나 localStorage를 사용할 수 있음)
      // 실제 구현에서는 IndexedDB를 사용하는 것이 좋습니다
      if (localImageFile && imagePreview) {
        // 여기서는 로컬 저장소 API를 직접 구현하지 않고, 미리보기 이미지 URL을 사용합니다
        localStorage.setItem(imageUrl, imagePreview);
        console.log('로컬 이미지 저장됨:', imageUrl);
      }
      
      const foodData: Omit<Food, 'id'> = {
        userId: currentUser.uid,
        date: mealDateTime,
        name: '식사 기록', // 기본 이름 설정
        imageUrl: imageUrl,
        notes: notes || '', // undefined 대신 빈 문자열 사용
        type: '식사', // 기본 타입
        // 영양소 정보는 제공하지 않음으로 기본값 설정
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };

      const newFood = await saveFoodRecord(foodData);
      addFood(newFood);

      toast.success('식단이 저장되었습니다.');
      
      // 폼 초기화
      setImageUrl('');
      setImagePreview(null);
      setLocalImageFile(null);
      setNotes('');

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving food:', error);
      toast.error('식단 저장 중 오류가 발생했습니다.');
    }
  };

  // 영양정보 페이지로 이동하는 함수
  const navigateToNutritionInfo = () => {
    navigate('/qna', { state: { activeTab: 'nutrition' } });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 목표 칼로리 및 영양소 가이드 */}
      <Card className="mb-6 border-l-4 border-[#4285F4]">
        <div className="flex items-start">
          <Info className="text-[#4285F4] mr-2 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">영양소 목표</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-[#4285F4]/20 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-500 dark:text-gray-400">칼로리</span>
                <span className="block text-lg font-bold text-[#4285F4] dark:text-sky-400">{targetCalories} kcal</span>
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
              <p className="mt-1">💡 단백질은 근육 합성과 유지를 돕고, 적절한 탄수화물은 에너지를 공급하며, 지방은 호르몬 생성을 지원합니다.</p>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={navigateToNutritionInfo}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
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

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        식단 입력
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="mealDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            날짜
          </label>
          <input
            type="date"
            id="mealDate"
            value={mealDate}
            onChange={(e) => setMealDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            식사 사진
          </label>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#4285F4] border border-transparent rounded-md shadow-sm hover:bg-[#3b78db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              카메라로 촬영
            </button>
            
            <label className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#00C853] border border-transparent rounded-md shadow-sm hover:bg-[#00B04A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C853] cursor-pointer text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
              </svg>
              앨범에서 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          
          {imagePreview && (
            <div className="mt-4">
              <img 
                src={imagePreview} 
                alt="식사 사진 미리보기" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>
              💡 <strong>참고:</strong> 식단 사진은 기기 내부 저장소에 저장됩니다. 기기에서 해당 파일이 삭제되거나 브라우저 데이터가 초기화되면 사진을 볼 수 없게 됩니다.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            메모 (선택사항)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="이 식사에 대한 메모를 남겨보세요"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={!imageUrl}
            className={`px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200 ${
              imageUrl 
                ? 'bg-[#4285F4] hover:bg-[#3b78db] focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]' 
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm; 