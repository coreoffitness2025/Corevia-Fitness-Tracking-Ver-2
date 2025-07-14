import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Firestore 플러그인 import
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { Scale, Calendar, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';

interface WeightRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const WeightRecordForm: React.FC<WeightRecordFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile, updateProfile } = useAuth();
  const [weight, setWeight] = useState<number>(userProfile?.weight || 70);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[WeightRecordForm] 체중 기록 시작:', { 
      userProfile: userProfile?.uid, 
      weight, 
      date 
    });
    
    if (!userProfile?.uid) {
      console.error('[WeightRecordForm] 사용자 정보가 없습니다:', userProfile);
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (weight <= 0 || weight > 300) {
      console.error('[WeightRecordForm] 잘못된 체중 값:', weight);
      toast.error('올바른 체중을 입력해주세요 (1-300kg).');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[WeightRecordForm] Firebase 저장 시작...');
      
      // Firebase weightRecords 컬렉션에 저장
      const recordData = { 
        userId: userProfile.uid,
        weight: parseFloat(weight.toString()),
        date: new Date(date),
        notes: notes.trim(),
        createdAt: new Date()
      };

      console.log('[WeightRecordForm] 저장할 데이터:', recordData);
      
      await FirebaseFirestore.addDocument({
        collection: 'weightRecords',
        data: recordData,
      });
      console.log('[WeightRecordForm] Firebase 저장 성공');

      console.log('[WeightRecordForm] 사용자 프로필 업데이트 시작...');
      
      // 사용자 프로필의 현재 체중도 업데이트
      await updateProfile({
        weight: weight,
        lastWeightUpdate: new Date()
      });
      
      console.log('[WeightRecordForm] 사용자 프로필 업데이트 성공');

      toast.success('체중이 성공적으로 기록되었습니다!');
      onSuccess();
    } catch (error) {
      console.error('[WeightRecordForm] 체중 기록 저장 오류:', error);
      console.error('[WeightRecordForm] 오류 상세:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      toast.error('체중 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Scale size={24} className="text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">체중 기록하기</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 체중 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Scale size={16} className="inline mr-1" />
            체중 (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-xl font-semibold"
            min="1"
            max="300"
            step="0.1"
            required
            placeholder="70.0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            소수점 첫째 자리까지 입력 가능합니다 (예: 70.5)
          </p>
        </div>

        {/* 날짜 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar size={16} className="inline mr-1" />
            측정 날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* 메모 입력 (선택사항) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="운동 후, 아침 공복 등..."
            maxLength={200}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length}/200자
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
            icon={<Scale size={18} />}
          >
            {isSubmitting ? '저장 중...' : '체중 기록'}
          </Button>
        </div>
      </form>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 팁:</strong> 정확한 체중 변화 추이를 위해 매일 같은 시간(예: 아침 공복)에 측정하는 것을 권장합니다.
        </p>
      </div>
    </div>
  );
};

export default WeightRecordForm; 