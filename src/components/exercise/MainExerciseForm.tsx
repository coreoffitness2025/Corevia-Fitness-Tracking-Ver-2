import { useState, useEffect } from 'react';
import { useSessionStore } from '../../stores/sessionStore';

interface MainExerciseFormProps {
  initialWeight?: number;
}

const MainExerciseForm = ({ initialWeight = 20 }: MainExerciseFormProps) => {
  const { mainExercise, updateReps, toggleSuccess } = useSessionStore();
  const [weight, setWeight] = useState(initialWeight);
  
  useEffect(() => {
    if (!mainExercise && weight) {
      useSessionStore.setState({
        mainExercise: {
          part: useSessionStore.getState().part!,
          weight,
          sets: [
            { reps: 0, isSuccess: false },
            { reps: 0, isSuccess: false },
            { reps: 0, isSuccess: false },
            { reps: 0, isSuccess: false },
            { reps: 0, isSuccess: false }
          ]
        }
      });
    }
  }, [mainExercise, weight]);
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Number(e.target.value);
    setWeight(newWeight);
    if (mainExercise) {
      useSessionStore.setState({
        mainExercise: {
          ...mainExercise,
          weight: newWeight
        }
      });
    }
  };
  
  const handleRepsChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const reps = Number(e.target.value);
    updateReps(setIndex, reps);
  };
  
  if (!mainExercise) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          무게 (kg)
        </label>
        <input
          type="number"
          value={weight}
          onChange={handleWeightChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="0"
          step="2.5"
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">세트</h3>
        
        {mainExercise.sets.map((set, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-8">
              <span className="font-medium text-gray-700 dark:text-gray-300">{index + 1}</span>
            </div>
            
            <div className="flex-grow">
              <input
                type="number"
                value={set.reps || ''}
                onChange={(e) => handleRepsChange(index, e)}
                placeholder="반복 횟수"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => toggleSuccess(index)}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  set.isSuccess
                    ? 'bg-green-500 text-white focus:ring-green-500'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
                }`}
              >
                {set.isSuccess ? '성공' : '실패'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainExerciseForm;
