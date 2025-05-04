import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface NutritionData {
  [key: string]: any;
  '요리명': string;
  '탄수화물(g/100g)': number;
  '단백질(g/100g)': number;
  '지방(g/100g)': number;
  '코멘트': string;
}

const NutritionScout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>([]);
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  useEffect(() => {
    loadCSV();
  }, []);

  const loadCSV = async () => {
    setIsLoading(true);
    try {
      // 여러 경로 시도
      const paths = [
        '/nutrition_db.csv',
        '/public/nutrition_db.csv',
        './nutrition_db.csv',
        import.meta.env.BASE_URL + 'nutrition_db.csv',
        // 절대 경로로도 시도
        window.location.origin + '/nutrition_db.csv'
      ];
      
      let csvText = '';
      let foundPath = '';
      
      // 모든 경로 시도
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            csvText = await response.text();
            foundPath = path;
            console.log('성공적으로 로드한 경로:', path);
            break;
          }
          console.log(`실패 - ${path}: ${response.status}`);
        } catch (err) {
          console.log(`에러 - ${path}:`, err);
        }
      }
      
      if (!csvText) {
        throw new Error('모든 경로에서 파일을 찾을 수 없습니다');
      }
      
      // CSV 파싱
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      console.log('CSV 헤더:', headers);
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const row: any = {};
        
        headers.forEach((header, j) => {
          const value = values[j]?.trim() || '';
          
          // 숫자로 변환 시도
          if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
            row[header] = parseFloat(value);
          } else {
            row[header] = value;
          }
        });
        
        data.push(row);
      }
      
      console.log('파싱된 데이터 수:', data.length);
      console.log('첫 번째 행:', data[0]);
      
      // 데이터 표준화
      const standardizedData = data.map((item: any) => {
        const standardizedItem: NutritionData = { ...item };
        
        // 요리명 필드 표준화
        const possibleKeys = ['요리명', '음식명', '이름', '식품명', 'food_name', 'name'];
        for (const key of possibleKeys) {
          if (item[key]) {
            standardizedItem['요리명'] = item[key];
            console.log('요리명 필드 발견:', key, '=', item[key]);
            break;
          }
        }
        
        return standardizedItem;
      }) as NutritionData[];
      
      setFoodData(standardizedData);
      toast.success(`데이터 로드 성공 (${standardizedData.length}개 항목)`);
      
    } catch (error) {
      console.error('전체 에러:', error);
      toast.error(`데이터를 불러올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }
    
    const result = foodData.find(
      item => item.요리명 && item.요리명.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (result) {
      setSearchResult(result);
      setShowAutoComplete(false);
    } else {
      const partialMatch = foodData.find(
        item => item.요리명 && item.요리명.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (partialMatch) {
        setSearchResult(partialMatch);
        setShowAutoComplete(false);
      } else {
        setSearchResult(null);
        toast.error('검색 결과가 없습니다.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = foodData
        .filter(item => 
          item.요리명 && 
          item.요리명.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      
      setSuggestions(filtered);
      setShowAutoComplete(true);
    } else {
      setShowAutoComplete(false);
    }
  };

  const selectSuggestion = (suggestion: NutritionData) => {
    setSearchQuery(suggestion.요리명);
    setSearchResult(suggestion);
    setShowAutoComplete(false);
  };

  const formatNumber = (value: number | string) => {
    if (value === null || value === undefined) return '0';
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          영양 정보 검색
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          음식 이름을 검색하여 영양 정보를 확인하세요
        </p>
      </div>

      {/* 검색 입력 */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="음식 이름을 입력하세요"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                     focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            검색
          </button>
        </div>

        {/* 자동완성 리스트 */}
        {showAutoComplete && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                {suggestion.요리명}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 검색 결과 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
        </div>
      )}

      {searchResult && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-blue-500 pb-2">
            {searchResult.요리명}
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">탄수화물</p>
              <p className="text-lg font-bold text-blue-500">
                {formatNumber(searchResult['탄수화물(g/100g)'])}g
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">단백질</p>
              <p className="text-lg font-bold text-blue-500">
                {formatNumber(searchResult['단백질(g/100g)'])}g
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">지방</p>
              <p className="text-lg font-bold text-blue-500">
                {formatNumber(searchResult['지방(g/100g)'])}g
              </p>
            </div>
          </div>

          {searchResult.코멘트 && (
            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {searchResult.코멘트}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionScout;
