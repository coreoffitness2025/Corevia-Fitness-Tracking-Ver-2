import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExercisePart } from '../../types';

interface WorkoutSet {
  reps: number;
  weight: number;
  isSuccess: boolean;
}

interface Workout {
  id: string;
  date: string;
  part: ExercisePart;
  mainExercise: {
    name: string;
    weight: number;
    sets: WorkoutSet[];
  };
  accessoryExercises?: Array<{
    name: string;
    sets: WorkoutSet[];
  }>;
  notes?: string;
  isAllSuccess: boolean;
  successSets?: number;
}

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const workouts: Workout[] = [
    {
      id: '1',
      date: '2024-03-20',
      part: 'chest',
      mainExercise: {
        name: '벤치프레스',
        weight: 80,
        sets: [
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 8, weight: 80, isSuccess: false },
          { reps: 10, weight: 80, isSuccess: true },
          { reps: 10, weight: 80, isSuccess: true }
        ]
      },
      accessoryExercises: [
        {
          name: '인클라인 덤벨 프레스',
          sets: [
            { reps: 12, weight: 20, isSuccess: true },
            { reps: 12, weight: 20, isSuccess: true },
            { reps: 10, weight: 20, isSuccess: true }
          ]
        },
        {
          name: '케이블 플라이',
          sets: [
            { reps: 15, weight: 15, isSuccess: true },
            { reps: 15, weight: 15, isSuccess: true }
          ]
        }
      ],
      notes: '오늘은 컨디션이 좋아서 잘 진행했습니다. 다음에는 벤치프레스 무게를 조금 더 올려볼 예정입니다.',
      isAllSuccess: false,
      successSets: 4
    },
    {
      id: '2',
      date: '2024-03-18',
      part: 'back',
      mainExercise: {
        name: '데드리프트',
        weight: 100,
        sets: [
          { reps: 8, weight: 100, isSuccess: true },
          { reps: 8, weight: 100, isSuccess: true },
          { reps: 7, weight: 100, isSuccess: false }
        ]
      },
      accessoryExercises: [
        {
          name: '랫 풀다운',
          sets: [
            { reps: 12, weight: 60, isSuccess: true },
            { reps: 12, weight: 60, isSuccess: true }
          ]
        }
      ],
      notes: '허리 통증이 약간 있어서 조심하며 진행했습니다.',
      isAllSuccess: false,
      successSets: 2
    }
  ];

  const getPartLabel = (part: ExercisePart) => {
    const labels: { [key in ExercisePart]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체'
    };
    return labels[part];
  };

  return (
    <div className="space-y-6">
      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            운동 기록이 없습니다. 운동 입력 탭에서 운동을 기록해보세요.
          </p>
        </div>
      ) : (
        workouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full text-sm mr-2">
                  {getPartLabel(workout.part)}
                </span>
                <h3 className="text-lg font-semibold">{workout.mainExercise.name}</h3>
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {new Date(workout.date).toLocaleDateString('ko-KR')}
              </span>
            </div>
            
            {/* 성공/실패 뱃지 */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                workout.isAllSuccess ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {workout.isAllSuccess ? '성공' : '실패'} ({workout.successSets || 0}/{workout.mainExercise.sets.length} 세트)
              </span>
            </div>
            
            {/* 메인 운동 세트 정보 */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">메인 운동 세트</h4>
              <div className="flex flex-wrap gap-2">
                {workout.mainExercise.sets.map((set, index) => (
                  <div 
                    key={index} 
                    className={`px-3 py-1 rounded text-sm ${
                      set.isSuccess 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {set.weight}kg {set.reps}/10
                  </div>
                ))}
              </div>
            </div>
            
            {/* 보조 운동 정보 */}
            {workout.accessoryExercises && workout.accessoryExercises.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">보조 운동</h4>
                <div className="space-y-3">
                  {workout.accessoryExercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="ml-2">
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{exercise.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div 
                            key={setIndex} 
                            className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm"
                          >
                            {set.weight}kg x {set.reps}회
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 메모 */}
            {workout.notes && (
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">메모</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {workout.notes}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default WorkoutList; 