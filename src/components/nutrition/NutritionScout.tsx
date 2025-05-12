import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// 디버깅용 코드 제거
// console.log('toast 객체 구조:', Object.keys(toast));
// console.log('toast 타입:', typeof toast);
// console.log('toast.warning 존재 여부:', 'warning' in toast);
// console.log('toast.success 존재 여부:', 'success' in toast);
// console.log('toast.error 존재 여부:', 'error' in toast);

// 커스텀 토스트 함수 정의
const showToast = {
  success: (message: string) => {
    toast(message, {
      duration: 3000,
      icon: '🍽️',
      style: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
        border: '1px solid #C3E6CB'
      }
    });
  },
  warning: (message: string) => {
    toast(message, {
      duration: 3000,
      icon: '⚠️',
      style: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
        border: '1px solid #FFEEBA'
      }
    });
  },
  error: (message: string) => {
    toast(message, {
      duration: 3000,
      icon: '❌',
      style: {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
        border: '1px solid #F5C6CB'
      }
    });
  }
};

interface NutritionData {
  [key: string]: any;
  '요리명': string;
  '탄수화물(g/100g)': number;
  '단백질(g/100g)': number;
  '지방(g/100g)': number;
  '코멘트'?: string; // 코멘트 필드를 옵셔널로 처리
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
    '요리명': '계란',
    '탄수화물(g/100g)': 1.1,
    '단백질(g/100g)': 12.5,
    '지방(g/100g)': 10.6,
    '코멘트': '필수 아미노산이 풍부한 완전식품'
  },
  {
    '요리명': '우유',
    '탄수화물(g/100g)': 4.9,
    '단백질(g/100g)': 3.3,
    '지방(g/100g)': 3.2,
    '코멘트': '칼슘이 풍부한 유제품'
  },
  {
    '요리명': '두부',
    '탄수화물(g/100g)': 1.9,
    '단백질(g/100g)': 8.1,
    '지방(g/100g)': 4.2,
    '코멘트': '식물성 단백질 공급원'
  },
  {
    '요리명': '현미밥',
    '탄수화물(g/100g)': 34.6,
    '단백질(g/100g)': 2.7,
    '지방(g/100g)': 0.6,
    '코멘트': '식이섬유가 풍부한 탄수화물 공급원'
  },
  {
    '요리명': '고구마',
    '탄수화물(g/100g)': 20.1,
    '단백질(g/100g)': 1.6,
    '지방(g/100g)': 0.1,
    '코멘트': '비타민 A가 풍부한 복합 탄수화물'
  },
  {
    '요리명': '아보카도',
    '탄수화물(g/100g)': 8.5,
    '단백질(g/100g)': 2,
    '지방(g/100g)': 14.7,
    '코멘트': '건강한 지방과 비타민이 풍부한 과일'
  },
  {
    '요리명': '연어',
    '탄수화물(g/100g)': 0,
    '단백질(g/100g)': 20.4,
    '지방(g/100g)': 13.4,
    '코멘트': '오메가-3 지방산이 풍부한 생선'
  },
  {
    '요리명': '견과류',
    '탄수화물(g/100g)': 16.2,
    '단백질(g/100g)': 14.3,
    '지방(g/100g)': 49.9,
    '코멘트': '건강한 지방과 단백질 공급원'
  },
  {
    '요리명': '바나나',
    '탄수화물(g/100g)': 22.8,
    '단백질(g/100g)': 1.1,
    '지방(g/100g)': 0.3,
    '코멘트': '칼륨이 풍부한 과일'
  }
];

const NutritionScout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>(DEFAULT_FOOD_DATA);
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCSV();
    
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
  }, []);

  const loadCSV = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // 외부 CSV 로드 시도
      const response = await fetch('/data/nutrition_db.csv');
      if (!response.ok) {
        // 첫 번째 경로에서 실패했다면 다른 경로로 시도
        const altResponse = await fetch('/nutrition_db.csv');
        if (!altResponse.ok) {
          throw new Error(`CSV 로드 실패: ${response.status} ${response.statusText}`);
        }
        const text = await altResponse.text();
        const data = parseCSV(text);
        
        if (data.length > 0) {
          console.log('대체 경로에서 CSV 로드 성공:', data.length);
          setFoodData(data);
          return;
        }
      }
      
      const text = await response.text();
      const data = parseCSV(text);
      
      if (data.length > 0) {
        console.log('CSV 로드 성공:', data.length);
        setFoodData(data);
      } else {
        throw new Error('CSV 데이터가 비어있습니다.');
      }
    } catch (error) {
      console.error('CSV 로드 오류:', error);
      // 로드 실패 시 기본 데이터 사용
      setFoodData(DEFAULT_FOOD_DATA);
      setLoadError(error instanceof Error ? error.message : '알 수 없는 오류');
      showToast.warning('영양 데이터베이스 로드에 실패하여 기본 데이터를 사용합니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast.error('검색어를 입력해주세요.');
      return;
    }
    
    const query = searchQuery.trim().toLowerCase();
    
    // 정확한 일치 검색
    const exactMatch = foodData.find(
      item => item.요리명 && item.요리명.toLowerCase() === query
    );
    
    // 부분 일치 검색
    const partialMatch = foodData.find(
      item => item.요리명 && item.요리명.toLowerCase().includes(query)
    );
    
    if (exactMatch) {
      console.log('정확한 일치 결과:', exactMatch);
      setSearchResult(exactMatch);
      setShowAutoComplete(false);
    } else if (partialMatch) {
      console.log('부분 일치 결과:', partialMatch);
      setSearchResult(partialMatch);
      setShowAutoComplete(false);
    } else {
      setSearchResult(null);
      showToast.error('검색 결과가 없습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      // 음식 이름으로만 필터링 (코멘트 제외)
      const exactMatches = foodData.filter(item => 
        item.요리명 && item.요리명.toLowerCase().startsWith(value.toLowerCase())
      );
      
      const partialMatches = foodData.filter(item => 
        item.요리명 && 
        item.요리명.toLowerCase().includes(value.toLowerCase()) && 
        !item.요리명.toLowerCase().startsWith(value.toLowerCase())
      );
      
      // 정확한 일치 항목을 먼저 보여주고, 그 다음 부분 일치 항목
      const filtered = [...exactMatches, ...partialMatches].slice(0, 5);
      
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

  const toggleComments = () => {
    setShowComments(!showComments);
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

  // CSV 데이터 파싱 함수
  const parseCSV = (text: string): NutritionData[] => {
    const rows = text.split('\n');
    if (rows.length <= 1) {
      throw new Error('CSV 데이터 형식이 올바르지 않습니다.');
    }
    
    const headers = rows[0].split(',');
    
    return rows.slice(1)
      .filter(row => row.trim()) // 빈 줄 제거
      .map(row => {
        // 따옴표로 묶인 내용 처리를 위한 로직 추가
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // 마지막 값 추가
        values.push(currentValue);
        
        const item: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim().replace(/^"|"$/g, '') || '';
          // 숫자로 변환 가능한 경우 숫자로 변환
          if (header.includes('g/100g') && !isNaN(parseFloat(value))) {
            item[header] = parseFloat(value);
          } else {
            item[header] = value;
          }
        });
        
        return item as NutritionData;
      })
      .filter(item => item['요리명']); // 요리명이 있는 항목만 필터링
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#4285F4] md:text-3xl mb-2">Nutrition Scout</h1>
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
                     focus:ring-[#4285F4] text-base"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`px-5 py-3 rounded-lg text-white font-medium text-base ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#4285F4] hover:bg-[#2a75f3]'
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
            style={{ right: 0, left: 0 }}
          >
            {suggestions.map((suggestion, index) => {
              // 검색어 하이라이트를 위한 처리
              const itemName = suggestion.요리명;
              const lowerName = itemName.toLowerCase();
              const lowerQuery = searchQuery.toLowerCase();
              const matchIndex = lowerName.indexOf(lowerQuery);
              
              let highlightedName;
              if (matchIndex >= 0) {
                const before = itemName.substring(0, matchIndex);
                const match = itemName.substring(matchIndex, matchIndex + lowerQuery.length);
                const after = itemName.substring(matchIndex + lowerQuery.length);
                highlightedName = (
                  <>
                    {before}
                    <span className="font-bold text-[#4285F4] dark:text-[#78a9f9]">{match}</span>
                    {after}
                  </>
                );
              } else {
                highlightedName = itemName;
              }
              
              return (
                <div
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  {highlightedName}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-600 border-t-[#4285F4] mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {searchResult && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 mb-4">
          {/* 음식 이름 헤더 */}
          <div className="bg-[#f8f9fa] dark:bg-gray-700 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              {searchResult.요리명}
              <button
                onClick={() => setSearchResult(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </h2>
          </div>
          
          {/* 영양소 정보 */}
          <div className="p-5">
            {/* 탄수화물 */}
            <div className="mb-4">
              <div className="flex justify-between mb-1 items-center">
                <span className="text-gray-700 dark:text-gray-300">탄수화물</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(searchResult['탄수화물(g/100g)'])}g/100g
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-[#fbbc04] h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, searchResult['탄수화물(g/100g)'] * 1.5)}%` }}
                ></div>
              </div>
            </div>
            
            {/* 단백질 */}
            <div className="mb-4">
              <div className="flex justify-between mb-1 items-center">
                <span className="text-gray-700 dark:text-gray-300">단백질</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(searchResult['단백질(g/100g)'])}g/100g
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-[#4285F4] h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, searchResult['단백질(g/100g)'] * 4)}%` }}
                ></div>
              </div>
            </div>
            
            {/* 지방 */}
            <div className="mb-4">
              <div className="flex justify-between mb-1 items-center">
                <span className="text-gray-700 dark:text-gray-300">지방</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(searchResult['지방(g/100g)'] || 0)}g/100g
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-[#ea4335] h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (searchResult['지방(g/100g)'] || 0) * 2)}%` }}
                ></div>
              </div>
            </div>
            
            {/* 칼로리 추정치 */}
            <div className="flex justify-between items-center mt-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <span className="text-gray-700 dark:text-gray-300">칼로리 추정치 (100g 기준)</span>
              <span className="text-lg font-bold text-[#4285F4]">
                {calculateCalories(searchResult)} kcal
              </span>
            </div>
          </div>
          
          {/* 코멘트 */}
          {searchResult?.코멘트 && typeof searchResult.코멘트 === 'string' && searchResult.코멘트.trim() !== '' && (
            <div className="p-5 bg-[#f0f0f0] dark:bg-[#1E2235] border-t border-gray-200 dark:border-gray-600">
              <div className="bg-[#E8F0FE] dark:bg-[#1A3A6B] border-l-4 border-[#4285F4] p-4 rounded-r">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {searchResult.코멘트.replace(/\\n/g, '\n')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!searchResult && !isLoading && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">음식 이름을 검색해보세요</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            음식 이름을 입력하고 검색하면 영양 정보를 확인할 수 있습니다.<br />
            예시: 닭가슴살, 현미밥, 연어, 고구마, 치킨, 데리야끼킨롤밥
          </p>
        </div>
      )}

      {/* 데이터베이스 정보 표시 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>데이터베이스: {foodData.length}개 항목</span>
        {loadError && (
          <span className="text-red-500">{loadError}</span>
        )}
      </div>
    </div>
  );
};

export default NutritionScout;
