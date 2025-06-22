import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { toast } from 'react-hot-toast';
import { saveFoodRecord, saveFoodImage, FoodRecord } from '../../utils/indexedDB';
import Card from '../common/Card';
import { Info, Camera, Upload, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NutritionSourcesGuide from './NutritionSourcesGuide';
import { v4 as uuidv4 } from 'uuid';
import Button from '../common/Button';
import { takePhoto, pickPhotoFromGallery, triggerHapticFeedback, isNativePlatform } from '../../utils/capacitorUtils';
import { format } from 'date-fns';

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
  const [mealDate, setMealDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [intakeTime, setIntakeTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [showTimeSlots, setShowTimeSlots] = useState<boolean>(false);
  const [showTimeInput, setShowTimeInput] = useState<boolean>(false);
  const [foodName, setFoodName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePath, setLocalImagePath] = useState<string | null>(null);
  const [showNutritionSources, setShowNutritionSources] = useState<boolean>(false);
  
  // 목표 영양소 계산을 위한 상태
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
          // UUID 기반 이미지 ID 생성
          setImageUrl(uuidv4());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 카메라로 촬영 (Capacitor 네이티브 카메라 지원)
  const handleCameraCapture = async () => {
    try {
      // 햅틱 피드백
      await triggerHapticFeedback('light');
      
      // Capacitor 네이티브 카메라 또는 웹 카메라 사용
      const photoResult = await takePhoto();
      
      if (photoResult) {
        setImagePreview(photoResult.dataUrl);
        // UUID 기반 이미지 ID 생성
        setImageUrl(uuidv4());
        
        // 네이티브 환경에서는 filePath 저장, 웹 환경에서는 Blob 변환
        if (photoResult.isNative && photoResult.filePath) {
          // 네이티브 환경에서는 파일 경로 저장
          setLocalImagePath(photoResult.filePath);
          setLocalImageFile(null);
        } else {
          // 웹 환경에서는 Blob 변환
          const response = await fetch(photoResult.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          setLocalImageFile(file);
          setLocalImagePath(null);
        }
        
        toast.success('사진이 선택되었습니다!');
      }
    } catch (error) {
      console.error('카메라 촬영 실패:', error);
      toast.error('카메라 촬영 중 오류가 발생했습니다.');
    }
  };

  // 갤러리에서 사진 선택 (Capacitor 네이티브 갤러리 지원)
  const handleGallerySelect = async () => {
    try {
      // 햅틱 피드백
      await triggerHapticFeedback('light');
      
      // Capacitor 네이티브 갤러리 또는 웹 파일 선택 사용
      const photoResult = await pickPhotoFromGallery();
      
      if (photoResult) {
        setImagePreview(photoResult.dataUrl);
        // UUID 기반 이미지 ID 생성
        setImageUrl(uuidv4());
        
        // 네이티브 환경에서는 filePath 저장, 웹 환경에서는 Blob 변환
        if (photoResult.isNative && photoResult.filePath) {
          // 네이티브 환경에서는 파일 경로 저장
          setLocalImagePath(photoResult.filePath);
          setLocalImageFile(null);
        } else {
          // 웹 환경에서는 Blob 변환
          const response = await fetch(photoResult.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'gallery-photo.jpg', { type: 'image/jpeg' });
          setLocalImageFile(file);
          setLocalImagePath(null);
        }
        
        toast.success('사진이 선택되었습니다!');
      }
    } catch (error) {
      console.error('갤러리 선택 실패:', error);
      toast.error('갤러리에서 사진 선택 중 오류가 발생했습니다.');
    }
  };

  // 이미지를 저장하는 부분을 수정합니다.
  // 이미지 크기 조정 함수 추가
  const resizeImage = (dataUrl: string, maxWidth: number = 800, maxHeight: number = 600): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // 최대 크기 조정
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          // 캔버스에 그리기
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Blob으로 변환 (품질 0.8)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('이미지를 Blob으로 변환할 수 없습니다.'));
              }
            },
            'image/jpeg', 
            0.8
          );
        };
        
        img.onerror = () => {
          console.error('이미지 로드 중 오류 발생');
          reject(new Error('이미지 로드 중 오류가 발생했습니다.'));
        };
        
        img.src = dataUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!imageUrl && !imagePreview) {
      toast.error('식사 사진이 필요합니다.');
      return;
    }

    if (!foodName.trim()) {
      toast.error('음식 이름을 입력해주세요.');
      return;
    }

    try {
      const mealDateTime = new Date(`${mealDate}T${intakeTime}`);
      
      // 이미지 저장 처리 - 네이티브/웹 환경에 따라 다르게 처리
      if (imageUrl) {
        try {
          // 네이티브 앱 환경인 경우 (파일 경로 저장)
          if (isNativePlatform() && localImagePath) {
            console.log('네이티브 환경: 파일 경로 저장:', localImagePath);
            
            // 파일 경로를 DB에 저장 (Blob 대신)
            await saveFoodImage(imageUrl, currentUser.uid, localImagePath);
          } 
          // 웹 환경인 경우 (이미지 리사이징 후 Blob 저장)
          else if (localImageFile) {
            console.log('웹 환경: 이미지 리사이징 및 Blob 저장');
            
            // 이미지 데이터 리사이징
            let imageBlob: Blob;
            
            if (imagePreview && imagePreview.startsWith('data:')) {
              // 데이터 URL인 경우 리사이징
              try {
                imageBlob = await resizeImage(imagePreview, 800, 600);
                console.log('이미지 리사이징 완료. 크기:', imageBlob.size);
              } catch (resizeError) {
                console.error('이미지 리사이징 오류:', resizeError);
                // 리사이징 실패 시 원본 파일 사용
                imageBlob = localImageFile;
              }
            } else {
              // 그 외의 경우 원본 파일 사용
              imageBlob = localImageFile;
            }
            
            // IndexedDB에 이미지 저장
            await saveFoodImage(imageUrl, currentUser.uid, imageBlob);
          } else {
            toast.error('이미지 데이터가 없습니다.');
            return;
          }
          
          console.log('이미지 저장 완료:', imageUrl);
          
          // 식단 기록 저장
          const foodRecord: FoodRecord = {
            userId: currentUser.uid,
            name: foodName,
            description: notes || undefined,
            calories: targetCalories || undefined,
            protein: proteinTarget || undefined,
            carbs: carbsTarget || undefined,
            fat: fatTarget || undefined,
            date: mealDateTime,
            imageId: imageUrl,
            createdAt: new Date()
          };
          
          const recordId = await saveFoodRecord(foodRecord);
          console.log('식단 기록 저장됨:', recordId);
          
          // 성공 메시지
          toast.success('식단이 저장되었습니다.');
          
          // 상태 초기화
          setImageUrl('');
          setImagePreview(null);
          setLocalImageFile(null);
          setLocalImagePath(null);
          setNotes('');
          setFoodName('');
          
          // 성공 콜백 호출
          if (onSuccess) {
            onSuccess();
          }
          
          // 웹 환경인 경우 로컬 저장 안내 메시지 표시
          if (!isNativePlatform()) {
            setTimeout(() => {
              toast.custom((t: any) => (
                <div className={`${t.visible ? 'animate-slide-in' : 'animate-slide-out'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-blue-500">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          브라우저 로컬 저장소 안내
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          사진은 현재 기기에만 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서는 사진을 볼 수 없습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ), { duration: 5000 });
            }, 1000);
          }
          
        } catch (storageError) {
          console.error('이미지 저장 오류:', storageError);
          
          // 스토리지 쿼터 초과 오류 처리
          if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
            toast.error('저장 공간이 부족합니다. 일부 오래된 이미지를 삭제하거나 더 작은 이미지를 사용해주세요.');
            return;
          } else {
            toast.error('이미지 저장 중 오류가 발생했습니다.');
            return;
          }
        }
      } else {
        toast.error('이미지 데이터가 없습니다.');
        return;
      }
    } catch (error) {
      console.error('식단 저장 오류:', error);
      toast.error('식단 저장에 실패했습니다.');
    }
  };

  // 영양정보 페이지로 이동하는 함수
  const navigateToNutritionInfo = () => {
    navigate('/qna', { state: { activeTab: 'nutrition', openNutritionScout: true } });
  };

  // 시간대 슬롯 선택 함수
  const handleTimeSlotSelect = (slot: string) => {
    let timeValue = '';
    switch(slot) {
      case '08:00 ~ 12:00':
        timeValue = '10:00';
        break;
      case '12:00 ~ 16:00':
        timeValue = '14:00';
        break;
      case '16:00 ~ 20:00':
        timeValue = '18:00';
        break;
      case '20:00 ~ 24:00':
        timeValue = '22:00';
        break;
      case '새벽 야식':
        timeValue = '02:00';
        break;
      case '알수없음':
        timeValue = '12:00'; // 기본값으로 점심 시간 설정
        break;
    }
    setIntakeTime(timeValue);
    setShowTimeSlots(false);
    setShowTimeInput(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4">
      {/* 목표 칼로리 및 영양소 가이드 */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="p-4">
          <div className="flex items-start">
            <Info className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 dark:text-white">1끼당 권장 섭취량 (3끼 기준)</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                <div className="bg-green-50 dark:bg-green-800/30 p-2 sm:p-3 rounded-lg text-center shadow-sm">
                  <span className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400">단백질</span>
                  <span className="block text-base sm:text-xl font-bold text-green-700 dark:text-green-400">{Math.round(proteinTarget/3)}g</span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-800/30 p-2 sm:p-3 rounded-lg text-center shadow-sm">
                  <span className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400">탄수화물</span>
                  <span className="block text-base sm:text-xl font-bold text-yellow-700 dark:text-yellow-400">{Math.round(carbsTarget/3)}g</span>
                </div>
                <div className="bg-red-50 dark:bg-red-800/30 p-2 sm:p-3 rounded-lg text-center shadow-sm">
                  <span className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400">지방</span>
                  <span className="block text-base sm:text-lg font-bold text-red-700 dark:text-red-400">{Math.round(fatTarget/3)}g</span>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  💡 하루 총 목표: 단백질 <strong>{proteinTarget}g</strong>, 탄수화물 <strong>{carbsTarget}g</strong>, 지방 <strong>{fatTarget}g</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  * 개인 설정의 목표 칼로리 기반으로 산출되었습니다.
                </p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToNutritionInfo}
                >
                  음식별 칼로리 확인
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNutritionSources(!showNutritionSources)}
                >
                  주요 영양소 급원 확인
                </Button>
              </div>
            </div>
          </div>
          {showNutritionSources && <NutritionSourcesGuide />}
        </div>
      </Card>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6">
        식단 입력
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mealDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <div>
            <label htmlFor="intakeTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              섭취 시간
            </label>
            <input
              type="time"
              id="intakeTime"
              value={intakeTime}
              onChange={(e) => setIntakeTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            식사 사진
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button"
              onClick={handleCameraCapture}
              variant="outline" 
              className="w-full"
              icon={<Camera size={16} />}
            >
              카메라로 촬영
            </Button>
            <Button
              type="button"
              onClick={handleGallerySelect}
              variant="outline"
              className="w-full"
              icon={<Upload size={16} />}
            >
              갤러리에서 선택
            </Button>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img 
                src={imagePreview} 
                alt="식사 사진 미리보기" 
                className="w-full h-auto max-h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            음식 이름
          </label>
          <input
            type="text"
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="예: 닭가슴살 샐러드, 현미밥"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            메모 (선택)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="이 식사에 대한 생각이나 느낌을 기록해보세요."
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!imageUrl && !imagePreview}
            size="lg"
            className="w-full sm:w-auto"
          >
            식단 기록 저장
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm; 