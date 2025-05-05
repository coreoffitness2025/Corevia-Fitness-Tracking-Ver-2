import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFoodStore } from '../../stores/foodStore';
import { Food } from '../../types';
import { toast } from 'react-hot-toast';
import { saveFoodRecord } from '../../services/foodService';

interface FoodFormProps {
  onSuccess?: () => void; // 식단 저장 후 호출될 콜백
}

const FoodForm: React.FC<FoodFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const { addFood } = useFoodStore();
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState('아침');
  const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD 형식
  const [mealTime, setMealTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substr(0, 5) // HH:MM 형식
  );
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 가상의 파일 선택 처리 (실제로는 Firebase Storage 등을 사용해야 함)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
          // 실제로는 이미지를 서버에 업로드하고 URL을 받아와야 함
          // 여기서는 가상으로 처리
          setImageUrl('이미지_URL_' + Date.now());
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
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setImagePreview(reader.result);
            setImageUrl('카메라_이미지_URL_' + Date.now());
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!imageUrl) {
      toast.error('식사 사진이 필요합니다.');
      return;
    }

    try {
      const mealDateTime = new Date(`${mealDate}T${mealTime}`);
      
      const foodData: Omit<Food, 'id'> = {
        userId: user.uid,
        date: mealDateTime,
        name: foodName || `${mealType} 식사`,
        imageUrl: imageUrl,
        notes: notes || undefined,
        type: mealType,
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
      setFoodName('');
      setImageUrl('');
      setImagePreview(null);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        식단 입력
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="mealType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              식사 종류
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="아침">아침</option>
              <option value="점심">점심</option>
              <option value="저녁">저녁</option>
              <option value="간식">간식</option>
            </select>
          </div>
          
          <div>
            <label
              htmlFor="foodName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              음식 이름 (선택사항)
            </label>
            <input
              type="text"
              id="foodName"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="예: 닭가슴살 샐러드"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          
          <div>
            <label
              htmlFor="mealTime"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              시간
            </label>
            <input
              type="time"
              id="mealTime"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            식사 사진
          </label>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              카메라로 촬영
            </button>
            
            <label className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer text-center">
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
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
              imageUrl 
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                : 'bg-gray-400 cursor-not-allowed'
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