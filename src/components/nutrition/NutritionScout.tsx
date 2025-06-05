import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

interface NutritionData {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

// 기본 음식 데이터
const foods: NutritionData[] = [
  { name: '닭가슴살', calories: 165, carbs: 0, protein: 23, fat: 2 },
  { name: '연어', calories: 208, carbs: 0, protein: 20, fat: 13 },
  { name: '계란', calories: 155, carbs: 1, protein: 13, fat: 11 },
  { name: '현미밥', calories: 112, carbs: 35, protein: 3, fat: 1 },
  { name: '고구마', calories: 86, carbs: 20, protein: 2, fat: 0 },
  { name: '바나나', calories: 89, carbs: 23, protein: 1, fat: 0 },
  { name: '아보카도', calories: 160, carbs: 9, protein: 2, fat: 15 },
  { name: '브로콜리', calories: 34, carbs: 7, protein: 3, fat: 0 },
  { name: '치킨', calories: 239, carbs: 8, protein: 19, fat: 12 },
  { name: '우유', calories: 61, carbs: 5, protein: 3, fat: 3 }
];

const NutritionScout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('음식 이름을 입력해주세요.');
      return;
    }

    const result = foods.find(food => 
      food.name.includes(searchQuery.trim())
    );

    if (result) {
      setSearchResult(result);
      toast.success('검색 완료!');
    } else {
      setSearchResult(null);
      toast.error('검색 결과가 없습니다.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <Toaster position="top-center" />
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-2">Nutrition Scout</h1>
        <p className="text-gray-600 dark:text-gray-400">영양정보 검색 도구</p>
      </div>
      
      {/* 검색 입력 */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="음식 이름을 입력하세요"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                   focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
        >
          검색
        </button>
      </div>

      {/* 검색 결과 */}
      {searchResult ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{searchResult.name}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">칼로리</p>
              <p className="text-lg font-bold text-blue-500">{searchResult.calories} kcal</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">탄수화물</p>
              <p className="text-lg font-bold text-yellow-500">{searchResult.carbs}g</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">단백질</p>
              <p className="text-lg font-bold text-green-500">{searchResult.protein}g</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">지방</p>
              <p className="text-lg font-bold text-red-500">{searchResult.fat}g</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            음식 이름을 검색해보세요
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            예시: 닭가슴살, 연어, 계란, 현미밥, 고구마, 치킨
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        총 {foods.length}개 음식 데이터 보유
      </div>
    </div>
  );
};

export default NutritionScout;
