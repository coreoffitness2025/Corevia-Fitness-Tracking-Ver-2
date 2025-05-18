import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

interface ExerciseSetInputProps {
  index: number;
  weight: number;
  reps: number;
  isSuccess: boolean | null;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onSuccessToggle: (success: boolean) => void;
  onTimerClick?: () => void;
  onRemove?: () => void;
  timerStatus?: {
    active: boolean;
    paused: boolean;
    timeLeft?: string;
  };
  showRemoveButton?: boolean;
  maxReps?: number;
}

/**
 * 운동 세트 입력을 위한 재사용 가능한 컴포넌트
 * 여러 운동 컴포넌트에서 공통으로 사용되는 세트, 무게, 반복 입력 UI
 */
const ExerciseSetInput: React.FC<ExerciseSetInputProps> = ({
  index,
  weight,
  reps,
  isSuccess,
  onWeightChange,
  onRepsChange,
  onSuccessToggle,
  onTimerClick,
  onRemove,
  timerStatus,
  showRemoveButton = false,
  maxReps = 10
}) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fadeIn transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4 flex-wrap">
        {/* 세트 번호 */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm" rounded>{index + 1}</Badge>
          <span className="font-medium text-gray-800 dark:text-white">세트</span>
        </div>
        
        {/* 무게 입력 */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">무게 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            placeholder="kg"
            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        {/* 반복 횟수 입력 */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">횟수 (최대 {maxReps})</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => onRepsChange(Number(e.target.value))}
            placeholder="횟수"
            min="1"
            max={maxReps}
            className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        {/* 성공/실패 버튼 */}
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="success"
            size="sm"
            disabled={reps < 1}
            onClick={() => onSuccessToggle(true)}
            icon={<CheckCircle size={16} />}
          >
            성공
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => onSuccessToggle(false)}
            icon={<XCircle size={16} />}
          >
            실패
          </Button>
        </div>
        
        {/* 타이머 버튼 (선택적) */}
        {onTimerClick && (
          <Button
            type="button"
            variant={
              !timerStatus?.active 
                ? "secondary" 
                : timerStatus.paused 
                  ? "warning" 
                  : "danger"
            }
            size="sm"
            onClick={onTimerClick}
            icon={<Clock size={16} />}
          >
            {!timerStatus?.active
              ? '휴식 타이머' 
              : timerStatus.paused
                ? `재개 ${timerStatus.timeLeft || ''}` 
                : `정지 ${timerStatus.timeLeft || ''}`
            }
          </Button>
        )}
        
        {/* 세트 삭제 버튼 (선택적) */}
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            icon={<X size={16} className="text-danger-500" />}
            className="ml-auto"
          >
            삭제
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSetInput; 