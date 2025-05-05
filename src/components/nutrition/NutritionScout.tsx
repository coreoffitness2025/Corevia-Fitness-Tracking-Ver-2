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

// 기본 영양소 데이터
const DEFAULT_FOOD_DATA: NutritionData[] = [
  {
    '요리명': '닭가슴살',
    '탄수화물(g/100g)': 0,
    '단백질(g/100g)': 23,
    '지방(g/100g)': 2,
    '코멘트': '고단백 저지방 식품'
  },
  {
    '요리명': '현미밥',
    '탄수화물(g/100g)': 35,
    '단백질(g/100g)': 3,
    '지방(g/100g)': 1,
    '코멘트': '고탄수화물 식품'
  },
  {
    '요리명': '연어',
    '탄수화물(g/100g)': 0,
    '단백질(g/100g)': 20,
    '지방(g/100g)': 13,
    '코멘트': '고단백 고지방 식품'
  },
  {
    '요리명': '고구마',
    '탄수화물(g/100g)': 30,
    '단백질(g/100g)': 1.5,
    '지방(g/100g)': 0.1,
    '코멘트': '고탄수화물 저지방 식품'
  },
  {
    '요리명': '계란',
    '탄수화물(g/100g)': 1,
    '단백질(g/100g)': 12,
    '지방(g/100g)': 10,
    '코멘트': '고단백 식품'
  },
  {
    '요리명': '아보카도',
    '탄수화물(g/100g)': 9,
    '단백질(g/100g)': 2,
    '지방(g/100g)': 15,
    '코멘트': '건강한 지방이 풍부한 식품'
  },
  {
    '요리명': '두부',
    '탄수화물(g/100g)': 2,
    '단백질(g/100g)': 8,
    '지방(g/100g)': 4,
    '코멘트': '식물성 단백질이 풍부한 식품'
  },
  {
    '요리명': '견과류',
    '탄수화물(g/100g)': 20,
    '단백질(g/100g)': 15,
    '지방(g/100g)': 50,
    '코멘트': '건강한 지방과 단백질이 풍부한 식품'
  },
  {
    '요리명': '바나나',
    '탄수화물(g/100g)': 23,
    '단백질(g/100g)': 1,
    '지방(g/100g)': 0.3,
    '코멘트': '칼륨이 풍부한 과일'
  },
  {
    '요리명': '오트밀',
    '탄수화물(g/100g)': 67,
    '단백질(g/100g)': 13,
    '지방(g/100g)': 7,
    '코멘트': '식이섬유가 풍부한 건강한 탄수화물 식품'
  }
];

const NutritionScout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>(DEFAULT_FOOD_DATA);
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
      // 개발 환경과 배포 환경에서 모두 작동하는 경로 구성
      const baseUrl = import.meta.env.DEV ? '' : import.meta.env.BASE_URL;
      console.log('Base URL:', baseUrl); // 디버깅용
      
      const response = await fetch(`${baseUrl}/nutrition_db.csv`);
      console.log('CSV 로드 응답 상태:', response.status); // 디버깅용
      
      if (response.ok) {
        const csvText = await response.text();
        console.log('CSV 첫 줄:', csvText.split('\n')[0]); // 디버깅용
        
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const row: any = {};
          
          headers.forEach((header, j) => {
            const value = values[j]?.trim() || '';
            row[header] = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
          });
          
          data.push(row);
        }
        
        console.log(`CSV에서 ${data.length}개의 항목 로드됨`); // 디버깅용
        setFoodData([...DEFAULT_FOOD_DATA, ...data]);
        toast.success(`데이터 로드 성공 (${data.length}개 항목)`);
      } else {
        console.error('CSV 로드 실패:', response.status, response.statusText);
        console.log('기본 데이터만 사용합니다.');
        setFoodData(DEFAULT_FOOD_DATA);
        toast.error(`데이터를 불러올 수 없습니다. (${response.status})`);
      }
    } catch (error) {
      console.error('CSV 로드 에러:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
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
      setShowAutoComplete(filtered.length > 0);
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
    setSearchQuery(suggestion.요리명);
    setSearchResult(suggestion);
    setShowAutoComplete(false);
  };

  const formatNumber = (value: number | string) => {
    if (value === null || value === undefined) return '0';
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full">
      <div className="mb-6">
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
            onFocus={handleInputFocus}
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
        {showAutoComplete && (
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

      {!searchResult && !isLoading && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          음식 이름을 검색하여 영양 정보를 확인해보세요.<br />
          예시: 닭가슴살, 현미밥, 연어, 고구마, 계란, 두부, 아보카도 등
        </div>
      )}
    </div>
  );
};

export default NutritionScout;
