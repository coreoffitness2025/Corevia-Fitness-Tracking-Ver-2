import { Exercise } from '../../types';
import { exercises } from '../../data/exerciseData';

// 부위별 운동 필터링 함수
const filterExercisesByPart = (part: string): Exercise[] => {
  if (part === 'all') {
    return exercises;
  }
  return exercises.filter(exercise => exercise.part === part);
};

// 운동 목록 컴포넌트
const ExerciseList: React.FC<{
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}> = ({ exercises, onSelectExercise }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {exercises.map(exercise => (
        <Card 
          key={exercise.id} 
          className="hover:shadow-lg transition-shadow"
          onClick={() => onSelectExercise(exercise)}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold">{exercise.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getPartLabel(exercise.part)}</p>
            <p className="mt-2 text-sm line-clamp-2">{exercise.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

// 부위 라벨 변환 함수
const getPartLabel = (part: string): string => {
  const partMap: Record<string, string> = {
    'chest': '가슴',
    'back': '등',
    'shoulder': '어깨',
    'leg': '하체',
    'biceps': '이두',
    'triceps': '삼두',
    'abs': '복근',
    'cardio': '유산소'
  };
  return partMap[part] || part;
};

const ExerciseListPage: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // 검색어 처리
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // 부위별 운동 필터링
  const handlePartChange = (part: string) => {
    setSelectedPart(part);
  };
  
  // 검색어와 부위에 따라 운동 필터링
  const filteredExercises = useMemo(() => {
    const exercisesByPart = filterExercisesByPart(selectedPart);
    if (!searchQuery.trim()) {
      return exercisesByPart;
    }
    return exercisesByPart.filter(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedPart, searchQuery]);
  
  // 운동 선택 처리
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };
  
  // 운동 상세 모달 닫기
  const handleCloseModal = () => {
    setSelectedExercise(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">운동 정보 검색</h1>
      
      {/* 검색바 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="운동 이름 검색..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* 부위별 필터 버튼 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('all')}
        >
          전체
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'chest' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('chest')}
        >
          가슴
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('back')}
        >
          등
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'shoulder' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('shoulder')}
        >
          어깨
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'leg' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('leg')}
        >
          하체
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'biceps' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('biceps')}
        >
          이두
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'triceps' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('triceps')}
        >
          삼두
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'abs' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('abs')}
        >
          복근
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${selectedPart === 'cardio' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => handlePartChange('cardio')}
        >
          유산소
        </button>
      </div>
      
      {/* 운동 목록 */}
      <ExerciseList exercises={filteredExercises} onSelectExercise={handleSelectExercise} />
      
      {/* 운동 상세 모달 */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedExercise.name}</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                {getPartLabel(selectedExercise.part)}
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded ml-2 dark:bg-green-900 dark:text-green-300">
                {selectedExercise.level === 'beginner' ? '초급' : 
                 selectedExercise.level === 'intermediate' ? '중급' : '고급'}
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedExercise.description}</p>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">수행 방법:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                {selectedExercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{instruction}</li>
                ))}
              </ol>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">사용 장비:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.equipment.map((item, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">주요 근육:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.muscles.map((muscle, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            
            {selectedExercise.videoUrl && (
              <div className="mt-6">
                <a 
                  href={selectedExercise.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  동영상 보기
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseListPage; 