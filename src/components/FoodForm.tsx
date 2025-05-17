import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { convertImageToBase64 } from '../utils/imageUtils';
import { saveFoodEntry } from '../services/foodService';

const FoodForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    date: '',
    description: '',
    imageFile: null,
    image: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        setIsUploading(true);
        
        // 파일 크기 검증 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('이미지 크기는 10MB 이하여야 합니다.');
          setIsUploading(false);
          return;
        }
        
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
          toast.error('이미지 파일만 업로드 가능합니다.');
          setIsUploading(false);
          return;
        }
        
        // 이미지 미리보기를 위한 Base64 변환
        const base64 = await convertImageToBase64(file);
        
        // 이미지 파일과 미리보기 URL 설정
        setFormData({
          ...formData,
          imageFile: file,
          image: base64
        });
        
        console.log('이미지 업로드 성공:', file.name);
        setIsUploading(false);
      } catch (error) {
        console.error('이미지 업로드 중 오류:', error);
        toast.error('이미지 업로드에 실패했습니다.');
        setIsUploading(false);
      }
    }
  };
  
  // 이미지 압축 (필요시 활성화)
  const compressImage = async (file: File, maxSizeMB = 1): Promise<File> => {
    try {
      // 이 부분은 실제 구현이 필요할 수 있습니다
      // 참고: browser-image-compression 라이브러리를 사용할 수 있습니다
      console.log('이미지 압축 시도:', file.name);
      return file;
    } catch (error) {
      console.error('이미지 압축 중 오류:', error);
      return file;
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('식사 이름을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 식단 데이터 준비
      const foodData = {
        name: formData.name,
        calories: Number(formData.calories) || 0,
        date: formData.date,
        description: formData.description,
        imageFile: formData.imageFile,
        image: formData.image,
        nutrients: {
          protein: Number(formData.protein) || 0,
          carbs: Number(formData.carbs) || 0,
          fat: Number(formData.fat) || 0
        },
        mealType: formData.mealType
      };
      
      // 식단 기록 저장
      await saveFoodEntry(userProfile.uid, foodData);
      
      toast.success('식단 기록이 저장되었습니다!');
      
      // 폼 초기화
      setFormData({
        name: '',
        calories: '',
        date: '',
        description: '',
        imageFile: null,
        image: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'breakfast'
      });
      
      // 페이지 이동 (필요시)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('식단 기록 저장 오류:', error);
      toast.error('식단 기록 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 이미지 업로드 관련 코드는 여기에 추가해야 합니다 */}
    </div>
  );
};

export default FoodForm; 