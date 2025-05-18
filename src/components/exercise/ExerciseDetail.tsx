import React from 'react';
import { Exercise, ExercisePart } from '../../types';

interface ExerciseDetailProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, onClose }) => {
  // 운동 부위 레이블
  const getPartLabel = (part: ExercisePart): string => {
    const labels: { [key in ExercisePart]: string } = {
      chest: '가슴',
      back: '등',
      shoulder: '어깨',
      leg: '하체',
      biceps: '이두',
      triceps: '삼두',
      abs: '복근',
      cardio: '유산소'
    };
    return labels[part as ExercisePart];
  };

  // 유튜브 URL에서 비디오 ID 추출
  const getYoutubeVideoId = (url: string | undefined): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 유튜브 영상 임베드 URL 생성 (한글 자막 자동 설정)
  const getYoutubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?cc_load_policy=1&cc_lang_pref=ko`;
  };

  // 운동 GIF 이미지 URL 생성
  const getExerciseGifUrl = (exerciseId: string): string => {
    return `/images/exercises/${exerciseId}.gif`;
  };

  // 비디오 ID 가져오기
  const videoId = getYoutubeVideoId(exercise.videoUrl);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-4 max-w-4xl mx-auto">
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
          {getPartLabel(exercise.part as ExercisePart)}
        </span>
        <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {exercise.level === 'beginner' ? '초급' : 
           exercise.level === 'intermediate' ? '중급' : '고급'}
        </span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{exercise.description}</p>

      {/* 운동 GIF 이미지 표시 */}
      <div className="mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img 
            src={getExerciseGifUrl(exercise.id)} 
            alt={`${exercise.name} 운동 방법`} 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/exercise-placeholder.jpg'; // 기본 이미지로 대체
            }}
            className="w-full object-cover"
          />
        </div>
      </div>

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

      {/* 유튜브 영상 - 고정된 비율의 컨테이너로 감싸서 흔들림 방지 */}
      {videoId ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">운동 영상</h3>
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe 
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={getYoutubeEmbedUrl(videoId)}
              title={`${exercise.name} 운동 영상`}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : exercise.videoUrl ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">운동 영상</h3>
          <a 
            href={exercise.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            유튜브에서 운동 영상 보기
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default ExerciseDetail; 