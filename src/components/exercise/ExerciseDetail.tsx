import React from 'react';
import { Exercise } from '../../types';
import { YouTube } from 'lucide-react';

interface ExerciseDetailProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, onClose }) => {
  // YouTube URL에서 영상 ID 추출
  const getYoutubeVideoId = (url: string | undefined) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(exercise.videoUrl);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg mx-auto overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{exercise.name}</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {exercise.part === 'chest' ? '가슴' :
           exercise.part === 'back' ? '등' :
           exercise.part === 'shoulder' ? '어깨' :
           exercise.part === 'leg' ? '하체' :
           exercise.part === 'biceps' ? '이두' :
           exercise.part === 'triceps' ? '삼두' :
           exercise.part === 'abs' ? '복근' : '유산소'}
        </span>
        <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {exercise.level === 'beginner' ? '초급' : 
           exercise.level === 'intermediate' ? '중급' : '고급'}
        </span>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">{exercise.description}</p>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">수행 방법</h3>
        <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
          {exercise.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">주요 자극 근육</h3>
        <div className="flex flex-wrap gap-2">
          {exercise.muscles.map((muscle, index) => (
            <span key={index} className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-sm dark:bg-purple-900 dark:text-purple-200">
              {muscle}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">필요 장비</h3>
        <div className="flex flex-wrap gap-2">
          {exercise.equipment.map((item, index) => (
            <span key={index} className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm dark:bg-gray-700 dark:text-gray-300">
              {item}
            </span>
          ))}
        </div>
      </div>
      
      {videoId && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">운동 영상</h3>
          <div className="relative pt-[56.25%] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              width="100%" 
              height="315" 
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${exercise.name} 운동 영상`}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      
      {!videoId && exercise.videoUrl && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">운동 영상</h3>
          <a 
            href={exercise.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <YouTube size={20} className="mr-2" />
            유튜브에서 운동 영상 보기
          </a>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetail; 