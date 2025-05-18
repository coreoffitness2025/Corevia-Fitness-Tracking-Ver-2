import React from 'react';
import { WorkoutProgram } from '../../types';
import { Clock, Target, BarChart3, Award, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onClose: () => void;
}

const WorkoutProgramDetail: React.FC<WorkoutProgramDetailProps> = ({ program, onClose }) => {
  const navigate = useNavigate();

  // 목표에 따른 텍스트 및 클래스
  const getGoalClass = (goal: string): string => {
    switch (goal) {
      case 'strength':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'hypertrophy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'endurance':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'weight-loss':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getGoalText = (goal: string): string => {
    switch (goal) {
      case 'strength': return '근력 향상';
      case 'hypertrophy': return '근비대';
      case 'endurance': return '근지구력';
      case 'weight-loss': return '체중 감량';
      default: return '종합';
    }
  };

  // 수준에 따른 텍스트 및 클래스
  const getLevelClass = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLevelText = (level: string): string => {
    switch (level) {
      case 'beginner': return '초보자';
      case 'intermediate': return '중급자';
      case 'advanced': return '고급자';
      default: return '모든 수준';
    }
  };

  // 운동 검색 페이지로 이동
  const navigateToExerciseSearch = (exerciseName: string) => {
    navigate('/qna', { 
      state: { 
        activeTab: 'exercise',
        searchTerm: exerciseName
      } 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{program.name}</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <div className="flex items-center mb-3">
              <Target className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">프로그램 정보</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
                <span className="text-gray-700 dark:text-gray-300">
                  기간: {program.duration} {program.durationType === 'weeks' ? '주' : '일'}
                </span>
              </div>
              
              <div className="flex items-center">
                <BarChart3 className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
                <span className="text-gray-700 dark:text-gray-300">
                  난이도: {program.level === 'beginner' ? '초급' : program.level === 'intermediate' ? '중급' : '고급'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Award className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
                <span className="text-gray-700 dark:text-gray-300">
                  목표: {program.goal}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <BookOpen className="text-amber-600 dark:text-amber-400 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">프로그램 설명</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{program.description}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white border-b pb-2">주간 운동 계획</h3>
        <div className="space-y-6">
          {program.schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">{day.day}</h4>
              {day.exercises.length > 0 ? (
                <div className="space-y-3">
                  {day.exercises.map((exercise, exIndex) => (
                    <div 
                      key={exIndex} 
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <button
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={() => navigateToExerciseSearch(exercise.name)}
                        >
                          {exercise.name}
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.sets}세트 x {exercise.reps}회
                          {exercise.notes && <span className="text-blue-600 dark:text-blue-400 ml-1">({exercise.notes})</span>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">휴식일</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {program.tips && program.tips.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white border-b pb-2">운동 팁</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {program.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutProgramDetail; 