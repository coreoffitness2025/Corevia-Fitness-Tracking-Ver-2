import React from 'react';
import { toast } from 'react-hot-toast';

interface ComplexWorkout {
  id: string;
  name: string;
  mainExercises: Array<{
    name: string;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>;
  accessoryExercises: Array<{
    name: string;
    weight: number;
    reps: number;
    sets: Array<{ reps: number; weight: number; isSuccess: boolean | null }>;
  }>;
}

interface ComplexWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWorkouts: ComplexWorkout[];
  isLoading: boolean;
  onSelect: (workoutId: string) => void;
  selectedWorkoutId: string | null;
}

const ComplexWorkoutModal: React.FC<ComplexWorkoutModalProps> = ({
  isOpen,
  onClose,
  savedWorkouts,
  isLoading,
  onSelect,
  selectedWorkoutId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">복합 운동 불러오기</h3>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p>복합 운동을 불러오는 중입니다...</p>
          </div>
        ) : savedWorkouts.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {savedWorkouts.map(workout => (
              <div 
                key={workout.id}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedWorkoutId === workout.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelect(workout.id)}
              >
                <div className="font-medium">{workout.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  메인 운동: {workout.mainExercises?.length || 0}개, 
                  보조 운동: {workout.accessoryExercises?.length || 0}개
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            저장된 복합 운동이 없습니다.
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            취소
          </button>
          <button
            onClick={() => {
              if (selectedWorkoutId) {
                onSelect(selectedWorkoutId);
                onClose();
              } else {
                toast.error('복합 운동을 선택해주세요');
              }
            }}
            disabled={!selectedWorkoutId}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            불러오기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplexWorkoutModal; 