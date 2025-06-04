import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WaterIntake } from '../../types';
import { saveWaterRecord, WaterRecord } from '../../utils/indexedDB';
import Button from '../common/Button';
import { Droplets, Clock, Plus, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WaterFormProps {
  onSuccess?: () => void;
}

const WaterForm: React.FC<WaterFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [amount, setAmount] = useState<number>(250); // 기본값 250ml
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [isUnknownTime, setIsUnknownTime] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 빠른 선택 버튼용 물량 옵션
  const quickAmounts = [200, 250, 300, 500, 750, 1000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount);
  };

  const handleTimeUnknown = () => {
    setIsUnknownTime(!isUnknownTime);
    if (!isUnknownTime) {
      setTime('');
    } else {
      setTime(new Date().toTimeString().slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (amount <= 0) {
      toast.error('물 섭취량을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const waterRecord: Omit<WaterRecord, 'id' | 'createdAt'> = {
        userId: userProfile.uid,
        date: new Date(),
        amount,
        time: isUnknownTime ? undefined : time,
        notes: notes.trim() || undefined,
      };

      // IndexedDB에 저장
      await saveWaterRecord(waterRecord);
      
      console.log('물 섭취 기록 저장 완료:', waterRecord);
      
      toast.success(`물 ${amount}ml 섭취 기록이 저장되었습니다.`);
      
      // 폼 초기화
      setAmount(250);
      setTime(new Date().toTimeString().slice(0, 5));
      setIsUnknownTime(false);
      setNotes('');
      
      onSuccess?.();
    } catch (error) {
      console.error('물 섭취 기록 저장 오류:', error);
      toast.error('물 섭취 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Droplets size={28} className="text-blue-500 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">물 섭취 기록</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 물 섭취량 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            섭취량 (ml)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
              min="1"
              max="2000"
              step="1"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 dark:text-gray-400">ml</span>
            </div>
          </div>
        </div>

        {/* 빠른 선택 버튼들 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            빠른 선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  amount === quickAmount
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {quickAmount}ml
              </button>
            ))}
          </div>
        </div>

        {/* 섭취 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock size={16} className="inline mr-1" />
            섭취 시간
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUnknownTime}
              required={!isUnknownTime}
            />
            <button
              type="button"
              onClick={handleTimeUnknown}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isUnknownTime
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <HelpCircle size={16} />
              알 수 없음
            </button>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="물 섭취에 대한 메모를 입력하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length}/200자
          </p>
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          icon={<Plus size={20} />}
          className="w-full"
        >
          {isSubmitting ? '저장 중...' : '물 섭취 기록하기'}
        </Button>
      </form>

      {/* 일일 목표 안내 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center mb-2">
          <Droplets size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">일일 권장 수분 섭취량</h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          성인 기준: 하루 1.5~2.0L (1500~2000ml)
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          운동 시에는 추가로 500~750ml 더 섭취하는 것이 좋습니다.
        </p>
      </div>
    </div>
  );
};

export default WaterForm; 