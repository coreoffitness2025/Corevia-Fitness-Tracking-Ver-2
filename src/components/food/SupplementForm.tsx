import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Supplement } from '../../types';
import Button from '../common/Button';
import { Pill, Clock, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SupplementFormProps {
  onSuccess?: () => void;
}

const SupplementForm: React.FC<SupplementFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [type, setType] = useState<Supplement['type']>('vitamin');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 일반적인 영양제 이름 옵션
  const commonSupplements = [
    '멀티비타민', '오메가3', '비타민D', '비타민C', '마그네슘',
    '프로바이오틱스', '단백질 파우더', '크레아틴', 'BCAA', '글루타민'
  ];

  // 영양제 타입별 한국어 라벨
  const supplementTypeLabels = {
    vitamin: '비타민',
    mineral: '미네랄',
    protein: '단백질',
    preworkout: '운동 전',
    postworkout: '운동 후',
    other: '기타'
  };

  const handleQuickName = (supplementName: string) => {
    setName(supplementName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!name.trim()) {
      toast.error('영양제 이름을 입력해주세요.');
      return;
    }

    if (!dosage.trim()) {
      toast.error('복용량을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supplementRecord: Omit<Supplement, 'id'> = {
        userId: userProfile.uid,
        date: new Date(),
        name: name.trim(),
        dosage: dosage.trim(),
        time,
        type,
        notes: notes.trim() || undefined,
      };

      // IndexedDB에 저장하는 로직 추가 예정
      // await addSupplementRecord(supplementRecord);
      
      console.log('영양제 섭취 기록:', supplementRecord);
      
      toast.success(`${name} 복용 기록이 저장되었습니다.`);
      
      // 폼 초기화
      setName('');
      setDosage('');
      setTime(new Date().toTimeString().slice(0, 5));
      setType('vitamin');
      setNotes('');
      
      onSuccess?.();
    } catch (error) {
      console.error('영양제 기록 저장 오류:', error);
      toast.error('영양제 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Pill size={28} className="text-green-500 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">영양제 복용 기록</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 영양제 이름 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영양제 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="영양제 이름을 입력하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
            maxLength={50}
          />
        </div>

        {/* 빠른 선택 버튼들 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            자주 복용하는 영양제
          </label>
          <div className="grid grid-cols-2 gap-2">
            {commonSupplements.map((supplement) => (
              <button
                key={supplement}
                type="button"
                onClick={() => handleQuickName(supplement)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  name === supplement
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {supplement}
              </button>
            ))}
          </div>
        </div>

        {/* 복용량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            복용량
          </label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="예: 1정, 2스푼, 10ml"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
            maxLength={20}
          />
        </div>

        {/* 영양제 타입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            종류
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Supplement['type'])}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
          >
            {Object.entries(supplementTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 복용 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock size={16} className="inline mr-1" />
            복용 시간
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="복용 목적, 부작용 등을 기록하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
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
          className="w-full bg-green-500 hover:bg-green-600 border-green-500"
        >
          {isSubmitting ? '저장 중...' : '영양제 복용 기록하기'}
        </Button>
      </form>

      {/* 복용 시간 가이드 */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center mb-2">
          <Pill size={20} className="text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">복용 시간 가이드</h3>
        </div>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• <strong>비타민:</strong> 식후 30분 (지용성 비타민은 기름과 함께)</li>
          <li>• <strong>미네랄:</strong> 공복 또는 식간</li>
          <li>• <strong>운동 전:</strong> 운동 30분 전</li>
          <li>• <strong>운동 후:</strong> 운동 후 30분 이내</li>
        </ul>
      </div>
    </div>
  );
};

export default SupplementForm; 