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

// 더미 데이터 사용
const DEFAULT_FOOD_DATA: NutritionData[] = [
  {
    '요리명': '닭가슴살',
    '탄수화물(g/100g)': 0,
    '단백질(g/100g)': 23,
    '지방(g/100g)': 2
  },
  {
    '요리명': '계란',
    '탄수화물(g/100g)': 1.1,
    '단백질(g/100g)': 12.5,
    '지방(g/100g)': 10.6
  },
  {
    '요리명': '우유',
    '탄수화물(g/100g)': 4.9,
    '단백질(g/100g)': 3.3,
    '지방(g/100g)': 3.2
  },
  {
    '요리명': '두부',
    '탄수화물(g/100g)': 1.9,
    '단백질(g/100g)': 8.1,
    '지방(g/100g)': 4.2
  },
  {
    '요리명': '현미밥',
    '탄수화물(g/100g)': 34.6,
    '단백질(g/100g)': 2.7,
    '지방(g/100g)': 0.6
  },
  {
    '요리명': '고구마',
    '탄수화물(g/100g)': 20.1,
    '단백질(g/100g)': 1.6,
    '지방(g/100g)': 0.1
  },
  {
    '요리명': '아보카도',
    '탄수화물(g/100g)': 8.5,
    '단백질(g/100g)': 2,
    '지방(g/100g)': 14.7
  },
  {
    '요리명': '연어',
    '탄수화물(g/100g)': 0,
    '단백질(g/100g)': 20.4,
    '지방(g/100g)': 13.4
  },
  {
    '요리명': '견과류',
    '탄수화물(g/100g)': 16.2,
    '단백질(g/100g)': 14.3,
    '지방(g/100g)': 49.9
  },
  {
    '요리명': '바나나',
    '탄수화물(g/100g)': 22.8,
    '단백질(g/100g)': 1.1,
    '지방(g/100g)': 0.3
  }
];

const NutritionScout = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodData, setFoodData] = useState<NutritionData[]>(DEFAULT_FOOD_DATA);
  const [searchResult, setSearchResult] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCSV();
    
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

  const loadCSV = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // CSV 파일 URL 설정 (public 폴더의 파일을 직접 URL로 참조)
      const csvUrl = '/nutrition_db.csv';
      console.log(`[DEBUG] 파일 로드 시도: ${csvUrl}`);
      
      // 외부 CSV 로드 시도
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        console.error(`[DEBUG] 파일 로드 실패: 상태 코드 ${response.status}`);
        throw new Error(`HTTP 오류: ${response.status}`);
      }
      
      console.log(`[DEBUG] 파일 로드 성공: 상태 코드 ${response.status}`);
      
      // ArrayBuffer로 응답 받기
      const buffer = await response.arrayBuffer();
      
      // 다양한 인코딩 시도
      const encodings = ['UTF-8', 'EUC-KR', 'CP949'];
      let csvText = '';
      let success = false;
      
      for (const encoding of encodings) {
        try {
          // TextDecoder로 다양한 인코딩 시도
          const decoder = new TextDecoder(encoding);
          csvText = decoder.decode(buffer);
          
          // 첫 줄에 '요리명' 또는 '음식명'이 포함되어 있는지 확인
          if (csvText.includes('요리명') || csvText.includes('음식명')) {
            console.log(`[DEBUG] ${encoding} 인코딩으로 성공적으로 디코딩했습니다.`);
            success = true;
            break;
          }
        } catch (error) {
          console.warn(`[DEBUG] ${encoding} 인코딩 시도 실패:`, error);
        }
      }
      
      if (!success) {
        console.error(`[DEBUG] 지원되는 인코딩으로 CSV를 읽을 수 없습니다.`);
        console.log(`[DEBUG] 파일 내용 첫 부분: ${csvText.substring(0, 200)}`);
        throw new Error('지원되는 인코딩으로 CSV를 읽을 수 없습니다.');
      }
      
      console.log(`[DEBUG] CSV 데이터 수신 (첫 100자): ${csvText.substring(0, 100)}...`);
      
      const data = parseCSVImproved(csvText);
      
      if (data.length > 0) {
        console.log(`[DEBUG] CSV 로드 성공: ${data.length}개 항목`);
        console.log(`[DEBUG] 첫 번째 항목:`, JSON.stringify(data[0]));
        setFoodData(data);
      } else {
        console.error(`[DEBUG] CSV 데이터가 비어있습니다.`);
        throw new Error('CSV 데이터가 비어있습니다.');
      }
    } catch (error) {
      console.error(`[DEBUG] CSV 로드 오류:`, error);
      console.log(`[DEBUG] 기본 데이터 사용`);
      setFoodData(DEFAULT_FOOD_DATA);
      setLoadError(error instanceof Error ? error.message : '알 수 없는 오류');
      showToast.warning('영양 데이터베이스 로드에 실패하여 기본 데이터를 사용합니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // 코멘트 관련 필드 제거 함수
    const removeCommentFields = (data: any) => {
      const result = {...data};
      
      // 모든 코멘트 관련 필드 제거
      Object.keys(result).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = result[key];
        
        if (
          key === '코멘트' || 
          key.includes('코멘트') || 
          key.includes('comment') || 
          key.includes('설명') || 
          lowerKey.includes('ment') ||
          key.includes('') ||
          (typeof value === 'string' && value.length > 50 && 
           (value.includes('다이어트') || value.includes('단백질') || value.includes('영양')))
        ) {
          delete result[key];
        }
      });
      
      return result;
    };
    
    if (exactMatch) {
      console.log('정확한 일치 결과:', exactMatch);
      const result = removeCommentFields(exactMatch);
      setSearchResult(result);
      setShowAutoComplete(false);
    } else if (partialMatch) {
      console.log('부분 일치 결과:', partialMatch);
      const result = removeCommentFields(partialMatch);
      setSearchResult(result);
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
      // 검색어와 일치하는 항목 찾기
      const matchingFoods = foodData.filter(item => 
        item.요리명 && typeof item.요리명 === 'string' && item.요리명.toLowerCase().includes(value.toLowerCase())
      );
      
      // 자동완성 항목을 위한 정제된 데이터 생성 (코멘트 제거)
      const cleanedSuggestions = matchingFoods.map(item => {
        const result = {...item};
        
        // 모든 코멘트 관련 필드 제거
        Object.keys(result).forEach(key => {
          const lowerKey = key.toLowerCase();
          const value = result[key];
          
          if (
            key === '코멘트' || 
            key.includes('코멘트') || 
            key.includes('comment') || 
            key.includes('설명') || 
            lowerKey.includes('ment') ||
            key.includes('') ||
            (typeof value === 'string' && value.length > 50 && 
             (value.includes('다이어트') || value.includes('단백질') || value.includes('영양')))
          ) {
            delete result[key];
          }
        });
        
        return result as NutritionData;
      });
      
      // 정확한 일치 항목을 우선 정렬
      const sortedSuggestions = cleanedSuggestions.sort((a, b) => {
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
    
    // 전체 foodData에서 선택된 요리명과 일치하는 완전한 데이터를 찾음
    const originalData = foodData.find(item => item.요리명 === suggestion.요리명);
    
    // 코멘트 관련 필드 제거 함수
    const removeCommentFields = (data: any) => {
      const result = {...data};
      
      // 모든 코멘트 관련 필드 제거
      Object.keys(result).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = result[key];
        
        if (
          key === '코멘트' || 
          key.includes('코멘트') || 
          key.includes('comment') || 
          key.includes('설명') || 
          lowerKey.includes('ment') ||
          key.includes('') ||
          (typeof value === 'string' && value.length > 50 && 
           (value.includes('다이어트') || value.includes('단백질') || value.includes('영양')))
        ) {
          delete result[key];
        }
      });
      
      return result;
    };
    
    if (originalData) {
      const result = removeCommentFields(originalData);
      setSearchResult(result);
    } else {
      // 전체 데이터에서 찾을 수 없는 경우 (드문 케이스)
      const result = removeCommentFields(suggestion);
      setSearchResult(result);
    }
    
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

  // 개선된 CSV 파싱 함수
  const parseCSVImproved = (text: string): NutritionData[] => {
    const rows = text.split('\n');
    if (rows.length <= 1) {
      throw new Error('CSV 데이터 형식이 올바르지 않습니다.');
    }
    
    const headers = rows[0].split(',');
    console.log('[DEBUG] 원본 헤더:', headers);
    
    const result = rows.slice(1)
      .filter(row => row.trim()) // 빈 줄 제거
      .map(row => {
        // 간단한 CSV 파싱
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        const item: any = {};
        
        // 인덱스 기반으로 필드 매핑
        if (values[0] && typeof values[0] === 'string' && values[0].length > 0 && values[0].length < 50) {
          item['요리명'] = values[0];
        }
        
        // 영양소 데이터 (숫자로 변환)
        if (values[1] && !isNaN(parseFloat(values[1]))) {
          item['탄수화물(g/100g)'] = parseFloat(values[1]);
        }
        if (values[2] && !isNaN(parseFloat(values[2]))) {
          item['단백질(g/100g)'] = parseFloat(values[2]);
        }
        if (values[3] && !isNaN(parseFloat(values[3]))) {
          item['지방(g/100g)'] = parseFloat(values[3]);
        }
        
        return item;
      })
      .filter(item => item['요리명'] && typeof item['요리명'] === 'string' && item['요리명'].length > 0); // 요리명이 유효한 문자열인 항목만
      
    console.log('[DEBUG] 파싱된 데이터 샘플:', result.slice(0, 5));
    return result as NutritionData[];
  };
  
  // 필드명 표준화 함수
  const standardizeFields = (item: Record<string, any>): Record<string, any> => {
    const standardizedItem = {...item};
    
    // 요리명 필드 표준화 (안전한 문자열 처리)
    for (const key of Object.keys(item)) {
      if (key.includes('음식') || key.includes('요리') || key.includes('이름')) {
        const value = item[key];
        if (value && typeof value === 'string' && value.trim().length > 0) {
          standardizedItem['요리명'] = value.trim();
          break;
        }
      }
    }
    
    // 요리명이 없거나 유효하지 않은 경우 기본값 설정
    if (!standardizedItem['요리명'] || typeof standardizedItem['요리명'] !== 'string') {
      standardizedItem['요리명'] = '이름 없음';
    }
    
    // 영양소 필드 표준화
    const nutritionFields: [string, string[]][] = [
      ['탄수화물(g/100g)', ['탄수화물', 'carbs', '탄수', '탄수화물(g)']],
      ['단백질(g/100g)', ['단백질', 'protein', '단백', '단백질(g)']],
      ['지방(g/100g)', ['지방', 'fat', '지방(g)']]
    ];
    
    nutritionFields.forEach(([standard, alternates]) => {
      if (!item.hasOwnProperty(standard)) {
        for (const alt of alternates) {
          for (const key of Object.keys(item)) {
            if (key.includes(alt)) {
              standardizedItem[standard] = item[key];
              break;
            }
          }
        }
      }
    });
    
    // 코멘트 관련 필드 모두 제거 (인코딩이 깨진 경우도 포함)
    const fieldsToRemove = Object.keys(standardizedItem).filter(key => {
      const lowerKey = key.toLowerCase();
      const value = standardizedItem[key];
      
      return (
        key === '코멘트' || 
        key.includes('코멘트') || 
        key.includes('comment') || 
        key.includes('설명') || 
        lowerKey.includes('ment') ||
        // 깨진 인코딩 패턴도 체크
        key.includes('') ||
        // 마지막 열이 긴 설명 텍스트를 포함하는 경우
        (typeof value === 'string' && value.length > 50 && 
         (value.includes('다이어트') || value.includes('단백질') || value.includes('영양'))));
    });
    
    fieldsToRemove.forEach(key => {
      delete standardizedItem[key];
    });
    
    return standardizedItem;
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
              
              // 코멘트 필드가 없음을 확인
              if (suggestion.코멘트) {
                console.warn('자동완성 항목에 코멘트가 포함되어 있습니다:', suggestion.요리명);
              }
              
              return (
                <div
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  {/* 요리명만 표시, 코멘트 제외 */}
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
