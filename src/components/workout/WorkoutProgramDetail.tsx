import React from 'react';
import { WorkoutProgram } from '../../types';
import { YouTube, Clock, Target, BarChart3, Award, BookOpen } from 'lucide-react';

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onClose: () => void;
}

const WorkoutProgramDetail: React.FC<WorkoutProgramDetailProps> = ({ program, onClose }) => {
  // YouTube URL에서 영상 ID 추출
  const getYoutubeVideoId = (url: string | undefined) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(program.videoUrl);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        
        {videoId ? (
          <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <YouTube className="text-red-600 dark:text-red-400 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">프로그램 영상</h3>
            </div>
            <div className="relative pt-[56.25%] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                width="100%" 
                height="315" 
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${program.name} 프로그램 영상`}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : program.videoUrl ? (
          <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <YouTube className="text-red-600 dark:text-red-400 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">프로그램 영상</h3>
            </div>
            <a 
              href={program.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
            >
              <YouTube size={20} className="mr-2" />
              유튜브에서 프로그램 영상 보기
            </a>
          </div>
        ) : null}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white border-b pb-2">주간 운동 계획</h3>
        <div className="space-y-4">
          {program.schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{day.day}</h4>
              {day.exercises.map((exercise, exIndex) => (
                <div 
                  key={exIndex} 
                  className="pl-3 border-l-2 border-blue-400 dark:border-blue-600 ml-2 mb-2"
                >
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {exercise.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {exercise.sets}세트 x {exercise.reps}회
                    {exercise.notes && ` - ${exercise.notes}`}
                  </p>
                </div>
              ))}
              {day.exercises.length === 0 && (
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