import React, { useState } from 'react';
import { ExercisePart } from '../../types';

interface WorkoutData {
  date: string;
  weight: number;
  isSuccess: boolean;
}

interface ExercisePartOption {
  value: ExercisePart;
  label: string;
  mainExerciseName: string;
}

const exercisePartOptions: ExercisePartOption[] = [
  { value: 'chest',    label: '가슴',   mainExerciseName: '벤치 프레스' },
  { value: 'back',     label: '등',     mainExerciseName: '데드리프트' },
  { value: 'shoulder', label: '어깨',   mainExerciseName: '오버헤드 프레스' },
  { value: 'leg',      label: '하체',   mainExerciseName: '스쿼트' }
];

const WorkoutGraph: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  
  // 선택된 부위에 따른 데이터 필터링 (실제로는 API에서 데이터 가져와야 함)
  const workoutData: Record<ExercisePart, WorkoutData[]> = {
    chest: [
      { date: '2024-03-01', weight: 80, isSuccess: true },
      { date: '2024-03-08', weight: 82.5, isSuccess: true },
      { date: '2024-03-15', weight: 85, isSuccess: false },
      { date: '2024-03-22', weight: 85, isSuccess: true },
      { date: '2024-03-29', weight: 87.5, isSuccess: true }
    ],
    back: [
      { date: '2024-03-02', weight: 100, isSuccess: true },
      { date: '2024-03-09', weight: 105, isSuccess: true },
      { date: '2024-03-16', weight: 110, isSuccess: false },
      { date: '2024-03-23', weight: 110, isSuccess: true }
    ],
    shoulder: [
      { date: '2024-03-03', weight: 60, isSuccess: true },
      { date: '2024-03-10', weight: 62.5, isSuccess: true },
      { date: '2024-03-17', weight: 65, isSuccess: true },
      { date: '2024-03-24', weight: 67.5, isSuccess: false }
    ],
    leg: [
      { date: '2024-03-04', weight: 120, isSuccess: true },
      { date: '2024-03-11', weight: 125, isSuccess: true },
      { date: '2024-03-18', weight: 130, isSuccess: false },
      { date: '2024-03-25', weight: 130, isSuccess: true }
    ]
  };

  const currentWorkouts = workoutData[selectedPart] || [];
  
  // y축 범위 계산
  const maxWeight = Math.max(...currentWorkouts.map(d => d.weight), 0);
  const minWeight = Math.max(0, Math.min(...currentWorkouts.map(d => d.weight)) - 10);
  const range = maxWeight - minWeight > 0 ? maxWeight - minWeight : 10;
  
  // 선택된 부위의 메인 운동 이름
  const selectedExercise = exercisePartOptions.find(opt => opt.value === selectedPart)?.mainExerciseName || '';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {selectedExercise} 무게 추이
        </h2>
        
        <div className="flex">
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {exercisePartOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.mainExerciseName})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {currentWorkouts.length > 0 ? (
        <>
          {/* Y 축 레이블 */}
          <div className="flex mb-2">
            <div className="w-10 text-right pr-2 text-sm text-gray-600 dark:text-gray-400">
              무게(kg)
            </div>
            <div className="flex-1"></div>
          </div>
          
          <div className="flex">
            {/* Y 축 눈금 */}
            <div className="w-10 relative h-64">
              <div className="absolute top-0 right-2 text-xs text-gray-600 dark:text-gray-400">{maxWeight}</div>
              <div className="absolute top-1/3 right-2 text-xs text-gray-600 dark:text-gray-400">
                {Math.round(maxWeight - (range / 3))}
              </div>
              <div className="absolute top-2/3 right-2 text-xs text-gray-600 dark:text-gray-400">
                {Math.round(maxWeight - (2 * range / 3))}
              </div>
              <div className="absolute bottom-0 right-2 text-xs text-gray-600 dark:text-gray-400">{minWeight}</div>
            </div>
            
            {/* 그래프 */}
            <div className="flex-1 h-64">
              <div className="h-full flex items-end gap-2">
                {currentWorkouts.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${
                        data.isSuccess ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        height: `${((data.weight - minWeight) / range) * 100}%`
                      }}
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold rotate-90 origin-center">
                          {data.weight}kg
                        </span>
                      </div>
                    </div>
                    <div className="w-full text-center mt-1 text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                      {new Date(data.date).toLocaleDateString('ko-KR', {
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2" />
              <span className="text-sm">성공</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2" />
              <span className="text-sm">실패</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            기록된 운동 데이터가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutGraph; 