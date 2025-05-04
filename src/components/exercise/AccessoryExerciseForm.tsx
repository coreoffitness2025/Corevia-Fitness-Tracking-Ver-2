import { useState } from 'react';
import { AccessoryExercise } from '../../types';
import { useSessionStore } from '../../stores/sessionStore';

interface AccessoryExercisesProps {
  part: string;
}

const accessoryExerciseOptions: Record<string, string[]> = {
  chest: ['인클라인 덤벨 프레스', '케이블 플라이', '푸시업', '펙덱 플라이'],
  back: ['턱걸이', '시티드 로우', '랫풀다운', '페이스풀'],
  shoulder: ['사이드 레터럴 레이즈', '프론트 레이즈', '리버스 플라이', '오버헤드 프레스'],
  leg: ['레그 익스텐션', '레그 컬', '카프 레이즈', '불가리안 스플릿 스쿼트']
};

const AccessoryExerciseForm = ({ part }: AccessoryExercisesProps) => {
  const { accessoryExercises, addAccessoryExercise, removeAccessoryExercise } = useSessionStore();
  const [newExercise, setNewExercise] = useState<AccessoryExercise>({
    name: accessoryExerciseOptions[part][0] || '',
    weight: 10,
    reps: 12,
    sets: Array(3).fill({ reps: 12, weight: 10, isSuccess: false })
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setNewExercise({
        ...newExercise,
        name: value
      });
    } else if (name === 'weight' || name === 'reps') {
      const numValue = Number(value);
      setNewExercise({
        ...newExercise,
        [name]: numValue,
        sets: newExercise.sets?.map(set => ({
          ...set,
          [name]: numValue
        })) || []
      });
    } else if (name === 'sets') {
      const numSets = Number(value);
      setNewExercise({
        ...newExercise,
        sets: Array(numSets).fill({ 
          reps: newExercise.reps || 12, 
          weight: newExercise.weight || 10, 
          isSuccess: false 
        })
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccessoryExercise(newExercise);
    setNewExercise({
      name: accessoryExerciseOptions[part][0] || '',
      weight: 10,
      reps: 12,
      sets: Array(3).fill({ reps: 12, weight: 10, isSuccess: false })
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">보조 운동</h3>
      
      {accessoryExercises.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">추가된 보조 운동</h4>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {accessoryExercises.map((exercise, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{exercise.name}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {exercise.weight}kg x {exercise.reps}회 x {exercise.sets?.length || 0}세트
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAccessoryExercise(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            운동 선택
          </label>
          <select
            name="name"
            value={newExercise.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {accessoryExerciseOptions[part]?.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              무게 (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={newExercise.weight}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
              step="2.5"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              반복
            </label>
            <input
              type="number"
              name="reps"
              value={newExercise.reps}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              세트
            </label>
            <input
              type="number"
              name="sets"
              value={newExercise.sets?.length || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            추가하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccessoryExerciseForm;
