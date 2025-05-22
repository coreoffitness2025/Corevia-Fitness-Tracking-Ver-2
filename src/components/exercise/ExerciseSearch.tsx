import React, { useState, useEffect } from 'react';
import { Exercise, ExercisePart } from '../../types';
import { exercises } from '../../data/exerciseData';
import { Heart, ArrowBigUpDash, MoveHorizontal, Footprints, Grip, ArrowUp, User as UserLucide, Bike } from 'lucide-react';
import Button from '../common/Button';

interface ExerciseSearchProps {
  onSelectExercise: (exercise: Exercise) => void;
  selectedPart?: ExercisePart;
  onPartChange?: (part: ExercisePart) => void;
}

// 운동 부위별로 분류하여 저장
const exercisesByPart: Record<ExercisePart, Exercise[]> = {
  chest: exercises.filter(exercise => exercise.part === 'chest'),
  back: exercises.filter(exercise => exercise.part === 'back'),
  shoulder: exercises.filter(exercise => exercise.part === 'shoulder'),
  leg: exercises.filter(exercise => exercise.part === 'leg'),
  biceps: exercises.filter(exercise => exercise.part === 'biceps'),
  triceps: exercises.filter(exercise => exercise.part === 'triceps'),
  abs: exercises.filter(exercise => exercise.part === 'abs'),
  cardio: exercises.filter(exercise => exercise.part === 'cardio'),
  // complex는 보통 운동 검색 대상에서 제외되거나 별도 처리
};

// 운동 부위별 아이콘 매핑
const partIcons: Record<ExercisePart, React.ReactNode> = {
  chest: <Heart size={24} className="mb-1" />,
  back: <ArrowBigUpDash size={24} className="mb-1" />,
  shoulder: <MoveHorizontal size={24} className="mb-1" />,
  leg: <Footprints size={24} className="mb-1" />,
  biceps: <Grip size={24} className="mb-1" />,
  triceps: <ArrowUp size={24} className="mb-1" />,
  abs: <UserLucide size={24} className="mb-1" />,
  cardio: <Bike size={24} className="mb-1" />,
  complex: <UserLucide size={24} className="mb-1" /> // 예비 아이콘
};

// partTextColor 헬퍼 함수 (tailwind.config.js의 색상 계열과 일치시킬 것)
const partTextColor = (part: ExercisePart): string => {
  const colorMap: Record<string, string> = { // key를 ExercisePart로 변경하거나, string 유지 시 타입 단언 주의
    chest: 'primary', back: 'secondary', shoulder: 'yellow', 
    leg: 'success', biceps: 'danger', triceps: 'indigo', 
    abs: 'gray', cardio: 'blue', complex: 'gray'
  };
  return colorMap[part] || 'gray';
};

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ 
  onSelectExercise, 
  selectedPart = 'chest', 
  onPartChange 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showAllExercises, setShowAllExercises] = useState<boolean>(false);
  const [internalSelectedPart, setInternalSelectedPart] = useState<ExercisePart>(selectedPart);

  // 외부에서 전달된 selectedPart가 변경되면 내부 상태 업데이트
  useEffect(() => {
    setInternalSelectedPart(selectedPart);
  }, [selectedPart]);

  // 부위 레이블 가져오기
  const getPartLabel = (part: ExercisePart): string => {
    const labels: { [key in ExercisePart]: string } = {
      chest: '가슴', back: '등', shoulder: '어깨', leg: '하체',
      biceps: '이두', triceps: '삼두', abs: '복근', cardio: '유산소', complex: '복합'
    };
    return labels[part] || part;
  };

  // 검색어 변경 시 검색 결과 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // 모든 운동 데이터를 하나의 배열로 합침
    const allExercises = Object.values(exercisesByPart).flat();
    
    // 검색어와 일치하는 운동 찾기
    const results = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(term) || 
      ex.description?.toLowerCase().includes(term)
    );
    
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };
  
  // 검색 결과에서 운동 선택
  const handleSearchSelect = (exercise: Exercise) => {
    // 해당 운동이 속한 부위 찾기
    for (const [part, exercises] of Object.entries(exercisesByPart)) {
      if (exercises.some(ex => ex.id === exercise.id)) {
        handlePartSelect(part as ExercisePart);
        onSelectExercise(exercise);
        setSearchTerm(exercise.name);
        setShowDropdown(false);
        break;
      }
    }
  };

  // 운동 부위 선택 처리
  const handlePartSelect = (part: ExercisePart) => {
    setInternalSelectedPart(part);
    if (onPartChange) {
      onPartChange(part);
    }
  };

  // 운동 부위별 버튼 렌더링
  const renderExerciseByParts = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {(Object.keys(exercisesByPart) as ExercisePart[]).filter(p => p !== 'complex').map((partKey) => (
          <button
            key={partKey}
            onClick={() => handlePartSelect(partKey)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg transition-all
              ${
                internalSelectedPart === partKey
                  ? 'bg-primary-400 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {partIcons[partKey]}
            <span className="font-medium">{getPartLabel(partKey)}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* 운동 검색 폼 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="운동 이름 검색..."
          className="w-full p-2 border rounded-lg focus:border-primary-500 focus:ring-primary-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {/* 검색 결과 드롭다운 */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchResults.map((exercise) => (
              <div
                key={exercise.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSearchSelect(exercise)}
              >
                <div className="font-medium">{exercise.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getPartLabel(exercise.part as ExercisePart)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 운동 부위 선택 버튼 */}
      {renderExerciseByParts()}
      
      {/* 부위별 운동 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {exercisesByPart[internalSelectedPart]?.slice(0, showAllExercises ? undefined : 4).map(exercise => (
          <div 
            key={exercise.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectExercise(exercise)}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{exercise.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-block bg-part-${exercise.part as ExercisePart} bg-opacity-20 dark:bg-opacity-30 text-${partTextColor(exercise.part as ExercisePart)}-700 dark:text-${partTextColor(exercise.part as ExercisePart)}-200 text-xs px-2 py-1 rounded-full`}>
                  {getPartLabel(exercise.part as ExercisePart)}
                </span>
                <span className="inline-block bg-success-100 text-success-700 text-xs px-2 py-1 rounded-full dark:bg-success-900 dark:text-success-300">
                  {exercise.level === 'beginner' ? '초급' : 
                  exercise.level === 'intermediate' ? '중급' : '고급'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 전체보기 버튼 */}
      <div className="text-center mt-4 mb-6">
        {exercisesByPart[internalSelectedPart]?.length > 4 && (
            <Button 
              variant="primary"
              onClick={() => setShowAllExercises(!showAllExercises)}
              iconPosition="right"
              icon={showAllExercises ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            >
              {showAllExercises ? '간략히 보기' : '전체 보기'}
            </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSearch; 