import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import { Plus, X, Camera, Image as ImageIcon } from 'lucide-react';
import { saveBodyPhotoRecord, BodyPhotoRecord, saveBodyPhotoWithImage } from '../../services/bodyService';
import { saveFoodImage } from '../../services/foodService';
import { takePhoto, pickPhotoFromGallery, triggerHapticFeedback, ImageResult, isNativePlatform } from '../../utils/capacitorUtils';
import { v4 as uuidv4 } from 'uuid';

interface BodyPhotoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BodyPhotoForm: React.FC<BodyPhotoFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [muscleMass, setMuscleMass] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 하이브리드 방식을 위한 추가 상태
  const [imageInfo, setImageInfo] = useState<{isNative?: boolean, filePath?: string} | null>(null);
  const [imageId, setImageId] = useState<string>('');
  const [localImagePath, setLocalImagePath] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD 형식

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
      
      // 웹 환경에서 선택한 파일은 네이티브가 아님
      setImageInfo({
        isNative: false
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 카메라로 사진 촬영
  const handleTakePhoto = async () => {
    try {
      // 햅틱 피드백
      await triggerHapticFeedback('medium');
      
      // 사진 촬영
      const result = await takePhoto();
      
      if (result) {
        setImagePreview(result.dataUrl);
        // UUID 기반 이미지 ID 생성
        const newImageId = uuidv4();
        setImageId(newImageId);
        
        // 네이티브 환경과 웹 환경 구분 처리
        if (result.isNative && result.filePath) {
          // 네이티브 환경에서는 파일 경로 저장
          setLocalImagePath(result.filePath);
          setLocalImageFile(null);
        } else {
          // 웹 환경에서는 Blob 변환
          const response = await fetch(result.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'body-photo.jpg', { type: 'image/jpeg' });
          setLocalImageFile(file);
          setLocalImagePath(null);
        }
        
        toast.success('사진이 촬영되었습니다!');
      }
    } catch (error) {
      console.error('사진 촬영 실패:', error);
      toast.error('사진 촬영에 실패했습니다.');
    }
  };

  // 갤러리에서 사진 선택
  const handleSelectFromGallery = async () => {
    try {
      // 햅틱 피드백
      await triggerHapticFeedback('light');
      
      // 갤러리에서 사진 선택
      const result = await pickPhotoFromGallery();
      
      if (result) {
        setImagePreview(result.dataUrl);
        // UUID 기반 이미지 ID 생성
        const newImageId = uuidv4();
        setImageId(newImageId);
        
        // 네이티브 환경과 웹 환경 구분 처리
        if (result.isNative && result.filePath) {
          // 네이티브 환경에서는 파일 경로 저장
          setLocalImagePath(result.filePath);
          setLocalImageFile(null);
        } else {
          // 웹 환경에서는 Blob 변환
          const response = await fetch(result.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'body-photo.jpg', { type: 'image/jpeg' });
          setLocalImageFile(file);
          setLocalImagePath(null);
        }
        
        toast.success('사진이 선택되었습니다!');
      }
    } catch (error) {
      console.error('갤러리 사진 선택 실패:', error);
      toast.error('사진 선택에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!previewUrl && !localImagePath && !localImageFile) {
      toast.error('사진이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 선택한 날짜 기준으로 데이터 저장
      const selectedDate = new Date(date);
      
      // 이미지 저장 - 네이티브/웹 환경에 따라 처리
      if (imageId) {
        try {
          // 네이티브 앱 환경인 경우 (파일 경로 저장)
          if (localImagePath) {
            console.log('네이티브 환경: 파일 경로 저장:', localImagePath);
            
            // 파일 경로만 DB에 저장
            await saveFoodImage(imageId, userProfile.uid, localImagePath);
          } 
          // 웹 환경인 경우 (이미지 리사이징 후 Blob 저장)
          else if (localImageFile && previewUrl) {
            console.log('웹 환경: 이미지 리사이징 및 Blob 저장');
            
            // 이미지 리사이징 (최대 800x600, 품질 80%)
            const canvas = document.createElement('canvas');
            const img = new Image();
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // 이미지 크기 조정
                let width = img.width;
                let height = img.height;
                
                if (width > 800 || height > 600) {
                  const ratio = Math.min(800 / width, 600 / height);
                  width = Math.floor(width * ratio);
                  height = Math.floor(height * ratio);
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                  reject(new Error('Canvas context not available'));
                  return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                resolve();
              };
              
              img.onerror = () => {
                reject(new Error('이미지 로드 실패'));
              };
              
              img.src = previewUrl;
            });
            
            // Canvas를 Blob으로 변환
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Blob 생성 실패'));
                  }
                },
                'image/jpeg',
                0.8
              );
            });
            
            // IndexedDB에 이미지 저장
            await saveFoodImage(imageId, userProfile.uid, blob);
          } else {
            toast.error('이미지 데이터가 없습니다.');
            return;
          }
          
          // 신체 정보 기록 저장
          const bodyPhotoRecord: Omit<BodyPhotoRecord, 'id' | 'createdAt'> = {
            userId: userProfile.uid,
            date: selectedDate,
            weight: weight ? parseFloat(weight) : undefined,
            bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
            muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
            notes: notes.trim() || undefined,
            imageId,
            isNative: imageInfo?.isNative,
            filePath: imageInfo?.filePath
          };
          
          await saveBodyPhotoWithImage(bodyPhotoRecord, imageInfo || undefined);
          
          console.log('바디 체크 기록 저장 완료:', bodyPhotoRecord);
          
          toast.success('바디 체크가 성공적으로 기록되었습니다.');
          
          // 입력 필드 초기화
          setWeight('');
          setBodyFat('');
          setMuscleMass('');
          setNotes('');
          setSelectedFile(null);
          setPreviewUrl(null);
          setImageInfo(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setLocalImagePath(null);
          setLocalImageFile(null);
          setImageId('');
          setDate(new Date().toISOString().split('T')[0]);
          
          onSuccess?.();
        } catch (error) {
          console.error('신체 기록 저장 오류:', error);
          toast.error('신체 기록 저장에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      toast.error('제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">바디 체크 기록</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              체중 (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="예: 70.5"
              step="0.1"
              min="30"
              max="200"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              체지방률 (%)
            </label>
            <input
              type="number"
              id="bodyFat"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="예: 15.2"
              step="0.1"
              min="3"
              max="50"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="muscleMass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              근육량 (kg)
            </label>
            <input
              type="number"
              id="muscleMass"
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
              placeholder="예: 35.8"
              step="0.1"
              min="10"
              max="100"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="오늘 상태, 컨디션, 목표 등을 기록하세요..."
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            바디 체크 사진
          </label>
          
          {/* 이미지 업로드 영역 */}
          <div className="mt-2 flex justify-center flex-col items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            {previewUrl ? (
              <div className="relative w-full">
                <img 
                  src={previewUrl} 
                  alt="미리보기" 
                  className="mx-auto h-64 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">바디 체크 사진을 촬영하거나 선택해주세요</p>
                </div>
                <div className="flex justify-center space-x-4">
                  {/* 카메라 버튼 */}
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center shadow-md transition-all duration-200"
                  >
                    <Camera size={24} className="mr-2" />
                    사진 촬영
                  </button>
                  
                  {/* 갤러리 버튼 */}
                  <button
                    type="button"
                    onClick={handleSelectFromGallery}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center shadow-md transition-all duration-200"
                  >
                    <ImageIcon size={24} className="mr-2" />
                    갤러리에서 선택
                  </button>
                </div>
              </div>
            )}
            
            {/* 숨겨진 파일 입력 필드 (스타일링 목적으로만 유지) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !selectedFile}
            icon={<Plus size={20} />}
            className="flex-1 bg-purple-500 hover:bg-purple-600 border-purple-500"
          >
            {isSubmitting ? '저장 중...' : '바디 체크 기록하기'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="px-6"
            >
              취소
            </Button>
          )}
        </div>
      </form>

      {/* 측정 가이드 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          📏 측정 가이드
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>체중:</strong> 아침 공복 상태에서 측정이 가장 정확합니다</li>
          <li>• <strong>체지방률:</strong> 인바디 등 체성분 분석기 결과를 입력하세요</li>
          <li>• <strong>근육량:</strong> 인바디 등 체성분 분석기에서 측정한 골격근량 또는 근육량 수치</li>
          <li>• <strong>사진:</strong> 동일한 각도와 자세로 촬영하면 변화 추이를 더 잘 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default BodyPhotoForm; 