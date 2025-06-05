import { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
// CSV 파일 import 삭제
import { useLocation } from 'react-router-dom';

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

// 확장된 음식 데이터베이스 (CSV 대신 사용)
const NUTRITION_DATABASE: NutritionData[] = [
  // 육류
  { '요리명': '닭가슴살', '탄수화물(g/100g)': 0, '단백질(g/100g)': 23, '지방(g/100g)': 2 },
  { '요리명': '닭다리살', '탄수화물(g/100g)': 0, '단백질(g/100g)': 18, '지방(g/100g)': 9 },
  { '요리명': '소고기등심', '탄수화물(g/100g)': 0, '단백질(g/100g)': 20, '지방(g/100g)': 15 },
  { '요리명': '돼지고기안심', '탄수화물(g/100g)': 0, '단백질(g/100g)': 22, '지방(g/100g)': 3 },
  
  // 해산물
  { '요리명': '연어', '탄수화물(g/100g)': 0, '단백질(g/100g)': 20.4, '지방(g/100g)': 13.4 },
  { '요리명': '고등어', '탄수화물(g/100g)': 0, '단백질(g/100g)': 18.5, '지방(g/100g)': 12 },
  { '요리명': '참치', '탄수화물(g/100g)': 0, '단백질(g/100g)': 25, '지방(g/100g)': 1 },
  { '요리명': '새우', '탄수화물(g/100g)': 0, '단백질(g/100g)': 18, '지방(g/100g)': 1 },
  
  // 유제품/계란
  { '요리명': '계란', '탄수화물(g/100g)': 1.1, '단백질(g/100g)': 12.5, '지방(g/100g)': 10.6 },
  { '요리명': '우유', '탄수화물(g/100g)': 4.9, '단백질(g/100g)': 3.3, '지방(g/100g)': 3.2 },
  { '요리명': '그릭요거트', '탄수화물(g/100g)': 4, '단백질(g/100g)': 10, '지방(g/100g)': 0.4 },
  { '요리명': '체다치즈', '탄수화물(g/100g)': 1.3, '단백질(g/100g)': 25, '지방(g/100g)': 33 },
  
  // 콩류/견과류
  { '요리명': '두부', '탄수화물(g/100g)': 1.9, '단백질(g/100g)': 8.1, '지방(g/100g)': 4.2 },
  { '요리명': '아몬드', '탄수화물(g/100g)': 21.6, '단백질(g/100g)': 21.2, '지방(g/100g)': 49.9 },
  { '요리명': '호두', '탄수화물(g/100g)': 13.7, '단백질(g/100g)': 15.2, '지방(g/100g)': 65.2 },
  { '요리명': '땅콩', '탄수화물(g/100g)': 16.1, '단백질(g/100g)': 25.8, '지방(g/100g)': 49.2 },
  
  // 곡류
  { '요리명': '현미밥', '탄수화물(g/100g)': 34.6, '단백질(g/100g)': 2.7, '지방(g/100g)': 0.6 },
  { '요리명': '백미밥', '탄수화물(g/100g)': 28, '단백질(g/100g)': 2.7, '지방(g/100g)': 0.3 },
  { '요리명': '오트밀', '탄수화물(g/100g)': 66, '단백질(g/100g)': 17, '지방(g/100g)': 7 },
  { '요리명': '퀴노아', '탄수화물(g/100g)': 64, '단백질(g/100g)': 14, '지방(g/100g)': 6 },
  
  // 채소
  { '요리명': '브로콜리', '탄수화물(g/100g)': 7, '단백질(g/100g)': 2.8, '지방(g/100g)': 0.4 },
  { '요리명': '시금치', '탄수화물(g/100g)': 3.6, '단백질(g/100g)': 2.9, '지방(g/100g)': 0.4 },
  { '요리명': '당근', '탄수화물(g/100g)': 9.6, '단백질(g/100g)': 0.9, '지방(g/100g)': 0.2 },
  { '요리명': '양배추', '탄수화물(g/100g)': 5.8, '단백질(g/100g)': 1.3, '지방(g/100g)': 0.1 },
  
  // 과일
  { '요리명': '바나나', '탄수화물(g/100g)': 22.8, '단백질(g/100g)': 1.1, '지방(g/100g)': 0.3 },
  { '요리명': '사과', '탄수화물(g/100g)': 14.3, '단백질(g/100g)': 0.3, '지방(g/100g)': 0.2 },
  { '요리명': '아보카도', '탄수화물(g/100g)': 8.5, '단백질(g/100g)': 2, '지방(g/100g)': 14.7 },
  { '요리명': '블루베리', '탄수화물(g/100g)': 14.5, '단백질(g/100g)': 0.7, '지방(g/100g)': 0.3 },
  
  // 기타
  { '요리명': '고구마', '탄수화물(g/100g)': 20.1, '단백질(g/100g)': 1.6, '지방(g/100g)': 0.1 },
  { '요리명': '감자', '탄수화물(g/100g)': 17, '단백질(g/100g)': 2, '지방(g/100g)': 0.1 },
  
  // 인기 음식들
  { '요리명': '치킨', '탄수화물(g/100g)': 8, '단백질(g/100g)': 19, '지방(g/100g)': 12 },
  { '요리명': '삼겹살', '탄수화물(g/100g)': 0, '단백질(g/100g)': 17, '지방(g/100g)': 28 },
  { '요리명': '김치', '탄수화물(g/100g)': 2.4, '단백질(g/100g)': 1.6, '지방(g/100g)': 0.6 },
  { '요리명': '미역국', '탄수화물(g/100g)': 1.2, '단백질(g/100g)': 0.8, '지방(g/100g)': 0.1 },
];

const NutritionScout = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>(NUTRITION_DATABASE);
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // URL에서 검색어 파라미터 가져오기
    const state = location.state as { searchTerm?: string } | null;
    if (state && state.searchTerm) {
      setSearchQuery(state.searchTerm);
      // 약간의 지연 후 자동 검색 실행
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

  const handleSearch = (searchParam?: string) => {
    const queryText = searchParam || searchQuery.toLowerCase().trim();
    
    if (!queryText) {
      showToast.error('검색어를 입력해주세요.');
      return;
    }

    console.log('검색어:', queryText);
    
    // 정확한 일치 검색 (안전한 문자열 처리)
    const exactMatch = foodData.find(
      item => item.요리명 && typeof item.요리명 === 'string' && item.요리명.toLowerCase() === queryText
    );
    
    // 부분 일치 검색 (안전한 문자열 처리)
    const partialMatch = foodData.find(
      item => item.요리명 && typeof item.요리명 === 'string' && item.요리명.toLowerCase().includes(queryText)
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
      // 검색어와 일치하는 항목 찾기 (더 엄격한 필터링)
      const matchingFoods = foodData.filter(item => 
        item.요리명 && 
        typeof item.요리명 === 'string' && 
        item.요리명.trim().length > 0 &&
        item.요리명.toLowerCase().includes(value.toLowerCase())
      );
      
      // 정확한 일치 항목을 우선 정렬
      const sortedSuggestions = matchingFoods.sort((a, b) => {
        // 안전한 문자열 처리
        const aName = a.요리명 && typeof a.요리명 === 'string' ? a.요리명.toLowerCase() : '';
        const bName = b.요리명 && typeof b.요리명 === 'string' ? b.요리명.toLowerCase() : '';
        const queryLower = value.toLowerCase();
        
        const aStarts = aName.startsWith(queryLower);
        const bStarts = bName.startsWith(queryLower);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      }).slice(0, 5);
      
      setSuggestions(sortedSuggestions);
      setShowAutoComplete(sortedSuggestions.length > 0);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <Toaster position="top-center" />
      
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
            onClick={() => handleSearch()}
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
              // 검색어 하이라이트를 위한 처리 (안전한 문자열 처리)
              const itemName = suggestion.요리명 || '';
              const lowerName = typeof itemName === 'string' ? itemName.toLowerCase() : '';
              const lowerQuery = searchQuery.toLowerCase();
              const matchIndex = lowerName.indexOf(lowerQuery);
              
              let highlightedName;
              if (matchIndex >= 0 && itemName) {
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
                highlightedName = itemName || '이름 없음';
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
            {/* 영양소 정보를 한 행에 모두 표시 */}
            <div className="grid grid-cols-4 gap-4">
              {/* 칼로리 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">칼로리</span>
                <span className="text-lg font-bold text-[#4285F4]">
                  {calculateCalories(searchResult)} kcal
                </span>
              </div>
              
              {/* 탄수화물 */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <span className="block text-sm text-yellow-700 dark:text-yellow-300 mb-1">탄수화물</span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(searchResult['탄수화물(g/100g)'])}g
                </span>
              </div>
              
              {/* 단백질 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <span className="block text-sm text-blue-700 dark:text-blue-300 mb-1">단백질</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(searchResult['단백질(g/100g)'])}g
                </span>
              </div>
              
              {/* 지방 */}
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <span className="block text-sm text-red-700 dark:text-red-300 mb-1">지방</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatNumber(searchResult['지방(g/100g)'] || 0)}g
                </span>
              </div>
            </div>
            
            {/* 상세 바 그래프 */}
            <div className="mt-6">
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
            </div>
          </div>
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
            예시: 닭가슴살, 연어, 계란, 현미밥, 고구마, 치킨, 아보카도, 브로콜리, 아몬드
          </p>
        </div>
      )}

      {/* 데이터베이스 정보 표시 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <span>데이터베이스: {foodData.length}개 음식 항목 보유</span>
      </div>
    </div>
  );
};

export default NutritionScout;
