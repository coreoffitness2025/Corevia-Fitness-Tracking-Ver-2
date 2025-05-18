import React from 'react';
import { WorkoutProgram } from '../../types';
import { Youtube, Clock, Target, BarChart3, Award, BookOpen } from 'lucide-react';

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onClose: () => void;
}

// 운동 이름에 따른 GIF 이미지 경로 매핑
const exerciseGifMap: Record<string, string> = {
  '벤치 프레스': '/images/exercises/bench-press.gif',
  '스쿼트': '/images/exercises/squat.gif',
  '데드리프트': '/images/exercises/deadlift.gif',
  '오버헤드 프레스': '/images/exercises/overhead-press.gif',
  '바벨 로우': '/images/exercises/barbell-row.gif',
  '풀업': '/images/exercises/pull-up.gif',
  '밀리터리 프레스': '/images/exercises/military-press.gif',
  '레그 프레스': '/images/exercises/leg-press.gif',
  '인클라인 벤치 프레스': '/images/exercises/incline-bench-press.gif',
  '인클라인 푸시업': '/images/exercises/incline-pushup.gif',
  '가중 풀업': '/images/exercises/weighted-pullup.gif',
  '가중 딥스': '/images/exercises/weighted-dips.gif',
  '덤벨 로우': '/images/exercises/dumbbell-row.gif',
  '덤벨 컬': '/images/exercises/dumbbell-curl.gif',
  '덤벨 숄더 프레스': '/images/exercises/dumbbell-shoulder-press.gif',
  '사이드 래터럴 레이즈': '/images/exercises/lateral-raise.gif',
  '사이드 레터럴 레이즈': '/images/exercises/lateral-raise.gif',
  '리어 델트 플라이': '/images/exercises/rear-delt-fly.gif',
  '바벨 컬': '/images/exercises/barbell-curl.gif',
  '스컬 크러셔': '/images/exercises/skull-crusher.gif',
  '프리처 컬': '/images/exercises/preacher-curl.gif',
  '해머 컬': '/images/exercises/hammer-curl.gif',
  '트라이셉스 익스텐션': '/images/exercises/triceps-extension.gif',
  '트라이셉스 푸시다운': '/images/exercises/triceps-pushdown.gif',
  '루마니안 데드리프트': '/images/exercises/romanian-deadlift.gif',
  '레그 익스텐션': '/images/exercises/leg-extension.gif',
  '레그 컬': '/images/exercises/leg-curl.gif',
  '카프 레이즈': '/images/exercises/calf-raise.gif',
  '시티드 카프 레이즈': '/images/exercises/seated-calf-raise.gif',
  '스탠딩 카프 레이즈': '/images/exercises/standing-calf-raise.gif',
  '불가리안 스플릿 스쿼트': '/images/exercises/bulgarian-split-squat.gif',
  '글루트 햄 레이즈': '/images/exercises/glute-ham-raise.gif',
  '프론트 스쿼트': '/images/exercises/front-squat.gif',
  '랫 풀다운': '/images/exercises/lat-pulldown.gif',
  '시티드 로우': '/images/exercises/seated-row.gif',
  '시티드 케이블 로우': '/images/exercises/seated-cable-row.gif',
  '케이블 플라이': '/images/exercises/cable-fly.gif',
  '푸시업': '/images/exercises/pushup.gif',
  '페이스 풀': '/images/exercises/face-pull.gif'
};

// 운동 이미지 URL 가져오기
const getExerciseGifUrl = (exerciseName: string): string => {
  return exerciseGifMap[exerciseName] || '/images/exercises/default-exercise.gif';
};

const WorkoutProgramDetail: React.FC<WorkoutProgramDetailProps> = ({ program, onClose }) => {
  // Youtube URL에서 영상 ID 추출
  const getYoutubeVideoId = (url: string | undefined) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(program.videoUrl);

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
              <Youtube className="text-red-600 dark:text-red-400 mr-2" size={20} />
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
              <Youtube className="text-red-600 dark:text-red-400 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">프로그램 영상</h3>
            </div>
            <a 
              href={program.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
            >
              <Youtube size={20} className="mr-2" />
              유튜브에서 프로그램 영상 보기
            </a>
          </div>
        ) : null}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white border-b pb-2">주간 운동 계획</h3>
        <div className="space-y-6">
          {program.schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">{day.day}</h4>
              {day.exercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {day.exercises.map((exercise, exIndex) => (
                    <div 
                      key={exIndex} 
                      className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={getExerciseGifUrl(exercise.name)}
                          alt={exercise.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/exercises/default-exercise.gif';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h5 className="font-medium text-gray-800 dark:text-white mb-1">
                          {exercise.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {exercise.sets}세트 x {exercise.reps}회
                          {exercise.notes && <span className="text-blue-600 dark:text-blue-400 ml-1">({exercise.notes})</span>}
                        </p>
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