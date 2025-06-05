import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveBodyPhotoRecord, saveFoodImage, BodyPhotoRecord } from '../../utils/indexedDB';
import Button from '../common/Button';
import { Camera, User, Scale, Percent, Zap, Plus, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('이미지 파일만 선택할 수 있습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!selectedFile) {
      toast.error('바디 체크 사진을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 ID 생성
      const imageId = `body_${userProfile.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 이미지 저장
      await saveFoodImage(imageId, userProfile.uid, selectedFile);
      
      const bodyPhotoRecord: Omit<BodyPhotoRecord, 'id' | 'createdAt'> = {
        userId: userProfile.uid,
        date: new Date(),
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
        notes: notes.trim() || undefined,
        imageId
      };

      // IndexedDB에 신체 사진 기록 저장
      await saveBodyPhotoRecord(bodyPhotoRecord);
      
      console.log('바디 체크 기록 저장 완료:', bodyPhotoRecord);
      
      toast.success('바디 체크가 성공적으로 기록되었습니다.');
      
      // 폼 초기화
      setWeight('');
      setBodyFat('');
      setMuscleMass('');
      setNotes('');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('바디 체크 기록 저장 오류:', error);
      toast.error('바디 체크 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <User size={28} className="text-purple-500 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">바디 체크</h2>
      </div>

      {/* 중요 안내 */}
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start">
          <Info size={20} className="text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
              개인정보 보호
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              바디 체크 사진은 민감한 개인정보로, <strong>오직 사용자의 기기에만 로컬 저장</strong>됩니다. 
              서버나 클라우드에 업로드되지 않으며, 다른 기기에서는 확인할 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 사진 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Camera size={16} className="inline mr-1" />
            바디 체크 사진 *
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="바디 체크 사진 미리보기" 
                  className="mx-auto max-h-64 rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  다른 사진 선택
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera size={48} className="mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    바디 체크 사진을 선택해주세요
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    사진 선택
                  </Button>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 체중 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Scale size={16} className="inline mr-1" />
            체중 (kg) <span className="text-gray-500 dark:text-gray-400">(선택사항)</span>
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="예: 70.5"
            step="0.1"
            min="20"
            max="200"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* 체지방률 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Percent size={16} className="inline mr-1" />
            체지방률 (%) <span className="text-gray-500 dark:text-gray-400">(선택사항)</span>
          </label>
          <input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="예: 15.2"
            step="0.1"
            min="3"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* 근육량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Zap size={16} className="inline mr-1" />
            근육량 (kg) <span className="text-gray-500 dark:text-gray-400">(선택사항)</span>
          </label>
          <input
            type="number"
            value={muscleMass}
            onChange={(e) => setMuscleMass(e.target.value)}
            placeholder="예: 35.8"
            step="0.1"
            min="10"
            max="100"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 <span className="text-gray-500 dark:text-gray-400">(선택사항)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="운동 상태, 컨디션, 목표 등을 기록하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length}/500자
          </p>
        </div>

        {/* 버튼들 */}
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