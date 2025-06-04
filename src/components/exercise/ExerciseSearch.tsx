import React, { useState, useEffect } from 'react';
import { Exercise as ImportedExercise, ExercisePart } from '../../types';
import { exercises as exerciseDataFromFile } from '../../data/exerciseData';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

interface ExerciseSearchProps {
  onSelectExercise: (exercise: ImportedExercise) => void;
  selectedPart?: ExercisePart;
  onPartChange?: (part: ExercisePart) => void;
}

// 운동 부위별로 분류하여 저장
const exercisesByPart: Record<ExercisePart, ImportedExercise[]> = {
  chest: exerciseDataFromFile.filter(exercise => exercise.part === 'chest') as ImportedExercise[],
  back: exerciseDataFromFile.filter(exercise => exercise.part === 'back') as ImportedExercise[],
  shoulder: exerciseDataFromFile.filter(exercise => exercise.part === 'shoulder') as ImportedExercise[],
  leg: exerciseDataFromFile.filter(exercise => exercise.part === 'leg') as ImportedExercise[],
  biceps: exerciseDataFromFile.filter(exercise => exercise.part === 'biceps') as ImportedExercise[],
  triceps: exerciseDataFromFile.filter(exercise => exercise.part === 'triceps') as ImportedExercise[],
  abs: exerciseDataFromFile.filter(exercise => exercise.part === 'abs') as ImportedExercise[],
  cardio: exerciseDataFromFile.filter(exercise => exercise.part === 'cardio') as ImportedExercise[],
  complex: exerciseDataFromFile.filter(exercise => exercise.part === 'complex') as ImportedExercise[],
};

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ 
  onSelectExercise, 
  selectedPart = 'chest', 
  onPartChange 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ImportedExercise[]>([]);
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
      (ex.description && ex.description.toLowerCase().includes(term))
    );
    
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };
  
  // 검색 결과에서 운동 선택
  const handleSearchSelect = (exercise: ImportedExercise) => {
    // 해당 운동이 속한 부위 찾기
    for (const [part, exercisesAtPath] of Object.entries(exercisesByPart)) {
      if (exercisesAtPath.some(ex => ex.id === exercise.id)) {
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

  // 운동 부위별 버튼 렌더링 (아이콘 및 스타일 복원)
  const renderExerciseByParts = () => {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {(Object.keys(exercisesByPart) as ExercisePart[]).filter(p => p !== 'complex').map((partKey) => (
          <button
            key={partKey}
            onClick={() => handlePartSelect(partKey)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg transition-all text-sm
              ${
                internalSelectedPart === partKey
                  ? 'bg-primary-400 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
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
                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-1 mt-1">
                  {exercise.muscles?.map((muscle, index) => (
                    <span key={index} className="text-primary-600 dark:text-primary-400">
                      {muscle}{index < exercise.muscles!.length - 1 ? ',' : ''}
                    </span>
                  )) || <span>{getPartLabel(exercise.part as ExercisePart)}</span>}
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
                {/* 디테일한 부위 정보 표시 */}
                {exercise.muscles?.map((muscle, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-primary-100 dark:bg-primary-800/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full"
                  >
                    {muscle}
                  </span>
                ))}
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