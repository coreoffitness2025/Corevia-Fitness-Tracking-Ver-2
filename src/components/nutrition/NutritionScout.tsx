import { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

interface NutritionData {
  '요리명': string;
  '탄수화물(g/100g)': number;
  '단백질(g/100g)': number;
  '지방(g/100g)': number;
  '코멘트': string;
}

const NutritionScout = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>([]);
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCSVData();
    
    // URL에서 검색어 파라미터 가져오기
    const state = location.state as { searchTerm?: string } | null;
    if (state && state.searchTerm) {
      setSearchQuery(state.searchTerm);
      setTimeout(() => {
        handleSearch(state.searchTerm);
      }, 500);
    }
    
    // 자동완성 외부 클릭 감지
    const handleClickOutside = (event: MouseEvent) => {
      if (autoCompleteRef.current && !autoCompleteRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutoComplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.state]);

  const loadCSVData = async () => {
    try {
      setIsLoading(true);
      console.log('CSV 로딩 시작...');
      
      const response = await fetch('/nutrition_db.csv');
      const text = await response.text();
      
      console.log('CSV 텍스트 길이:', text.length);
      
      // CSV 파싱 (따옴표가 있는 필드 처리)
      const lines = text.split('\n').filter(line => line.trim());
      console.log('전체 라인 수:', lines.length);
      
      const headers = lines[0].split(',');
      console.log('헤더:', headers);
      
      const data: NutritionData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // CSV 필드 파싱 (따옴표 고려)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // 마지막 필드
        
        if (values.length >= 5) {
          const item: NutritionData = {
            '요리명': values[0]?.trim() || '',
            '탄수화물(g/100g)': parseFloat(values[1]) || 0,
            '단백질(g/100g)': parseFloat(values[2]) || 0,
            '지방(g/100g)': parseFloat(values[3]) || 0,
            '코멘트': values[4]?.replace(/^"|"$/g, '').trim() || '' // 앞뒤 따옴표 제거
          };
          
          if (item['요리명']) {
            data.push(item);
          }
        }
      }
      
      console.log('최종 데이터 개수:', data.length);
      console.log('처음 5개 데이터:', data.slice(0, 5));
      
      setFoodData(data);
      toast.success(`${data.length}개 음식 데이터 로드 완료`);
    } catch (error) {
      console.error('CSV 로드 오류:', error);
      toast.error('데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchParam?: string) => {
    const queryText = (searchParam || searchQuery).trim();
    
    console.log('검색 시작:', queryText, '데이터 개수:', foodData.length);
    
    if (!queryText) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    // 정확한 일치 검색
    const exactMatch = foodData.find(
      item => item['요리명'] && item['요리명'].toLowerCase() === queryText.toLowerCase()
    );
    
    // 부분 일치 검색
    const partialMatch = foodData.find(
      item => item['요리명'] && item['요리명'].toLowerCase().includes(queryText.toLowerCase())
    );

    console.log('검색 결과:', exactMatch || partialMatch || '없음');

    if (exactMatch) {
      setSearchResult(exactMatch);
      setShowAutoComplete(false);
      toast.success('검색 완료!');
    } else if (partialMatch) {
      setSearchResult(partialMatch);
      setShowAutoComplete(false);
      toast.success('검색 완료!');
    } else {
      setSearchResult(null);
      toast.error('검색 결과가 없습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const matchingFoods = foodData.filter(item => 
        item['요리명'] && 
        item['요리명'].toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      console.log('자동완성:', matchingFoods.length, '개');
      
      setSuggestions(matchingFoods);
      setShowAutoComplete(matchingFoods.length > 0);
    } else {
      setSuggestions([]);
      setShowAutoComplete(false);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowAutoComplete(true);
    }
  };

  const selectSuggestion = (suggestion: NutritionData) => {
    setSearchQuery(suggestion['요리명']);
    setSearchResult(suggestion);
    setShowAutoComplete(false);
  };

  // 칼로리 계산
  const calculateCalories = (food: NutritionData): number => {
    if (!food) return 0;
    
    const carbs = food['탄수화물(g/100g)'] || 0;
    const protein = food['단백질(g/100g)'] || 0;
    const fat = food['지방(g/100g)'] || 0;
    
    // 칼로리 계산: 1g 탄수화물 = 4kcal, 1g 단백질 = 4kcal, 1g 지방 = 9kcal
    return Math.round((carbs * 4) + (protein * 4) + (fat * 9));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <Toaster position="top-center" />
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-2">Nutrition Scout</h1>
        <p className="text-gray-600 dark:text-gray-400">영양정보 검색 도구</p>
      </div>
      
      {/* 검색 입력 */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="음식 이름을 입력하세요"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                     focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            검색
          </button>
        </div>

        {/* 자동완성 리스트 */}
        {showAutoComplete && (
          <div 
            ref={autoCompleteRef}
            className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                {suggestion['요리명']}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-600 border-t-blue-500 mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {searchResult && !isLoading && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">{searchResult['요리명']}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">100g당 영양성분(음식의 영양성분은 절대적이지 않고 조리 방법 등에 따라 달라질 수 있습니다.)</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">칼로리</p>
              <p className="text-lg font-bold text-blue-500">{calculateCalories(searchResult)} kcal</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">탄수화물</p>
              <p className="text-lg font-bold text-yellow-500">{searchResult['탄수화물(g/100g)']}g</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">단백질</p>
              <p className="text-lg font-bold text-green-500">{searchResult['단백질(g/100g)']}g</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">지방</p>
              <p className="text-lg font-bold text-red-500">{searchResult['지방(g/100g)']}g</p>
            </div>
          </div>

          {/* 트레이너 코멘트 */}
          {searchResult['코멘트'] && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-primary-500">
              <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-2 flex items-center">
                <span className="mr-2">💪</span>
                코멘트
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {searchResult['코멘트']}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!searchResult && !isLoading && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            음식 이름을 검색해보세요
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {foodData.length > 0 ? `${foodData.length}개 음식 데이터에서 검색할 수 있습니다 .` : '데이터를 로드하는 중입니다...'}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        총 {foodData.length}개 음식 데이터 보유
      </div>
    </div>
  );
};

export default NutritionScout;
