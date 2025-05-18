import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardTitle, CardSection } from '../common/Card';
import { Utensils, ArrowRight, Search, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface MealPlan {
  id: string;
  category: string;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    name: string;
    items: string[];
    imageUrl?: string;
  }[];
}

// 샘플 식단 데이터
const mealPlans: MealPlan[] = [
  {
    id: 'diet-1',
    category: 'diet',
    title: '저탄수화물 다이어트 식단',
    description: '체중 감량을 위한 저탄수화물 고단백 식단입니다. 하루 1500kcal로 구성되어 있습니다.',
    calories: 1500,
    protein: 120,
    carbs: 75,
    fat: 65,
    meals: [
      {
        name: '아침',
        items: ['달걀 흰자 100g', '아보카도 70g', '시금치 100g', '블랙커피'],
        imageUrl: '/images/meals/low-carb-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['구운 닭가슴살 150g', '브로콜리 100g', '올리브 오일 15g', '견과류 30g'],
        imageUrl: '/images/meals/low-carb-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['구운 연어 150g', '아스파라거스 100g', '양상추 100g', '올리브 오일 15g'],
        imageUrl: '/images/meals/low-carb-dinner.jpg'
      },
      {
        name: '간식',
        items: ['단백질 쉐이크 30g', '아몬드 20g'],
        imageUrl: '/images/meals/low-carb-snack.jpg'
      }
    ]
  },
  {
    id: 'diet-2',
    category: 'diet',
    title: '간헐적 단식 다이어트 식단',
    description: '8시간 섭취, 16시간 단식의 간헐적 단식 식단입니다. 1600kcal로 구성되어 있습니다.',
    calories: 1600,
    protein: 110,
    carbs: 120,
    fat: 60,
    meals: [
      {
        name: '첫 식사 (12시)',
        items: ['그릭 요거트 200g', '블루베리 75g', '아몬드 15g', '꿀 5g'],
        imageUrl: '/images/meals/if-meal1.jpg'
      },
      {
        name: '두번째 식사 (15시)',
        items: ['현미밥 100g', '닭가슴살 150g', '채소 샐러드 100g', '올리브 오일 드레싱 15g'],
        imageUrl: '/images/meals/if-meal2.jpg'
      },
      {
        name: '마지막 식사 (19시)',
        items: ['구운 두부 100g', '현미밥 100g', '볶은 채소 믹스 150g', '김치 50g'],
        imageUrl: '/images/meals/if-meal3.jpg'
      }
    ]
  },
  {
    id: 'bulk-1',
    category: 'bulk',
    title: '벌크업 고칼로리 식단',
    description: '근육 증가를 위한 고칼로리 고단백 식단입니다. 하루 3000kcal로 구성되어 있습니다.',
    calories: 3000,
    protein: 180,
    carbs: 350,
    fat: 80,
    meals: [
      {
        name: '아침',
        items: ['오트밀 100g', '바나나 120g', '단백질 쉐이크 30g', '계란 150g', '땅콩버터 15g'],
        imageUrl: '/images/meals/bulk-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['현미밥 150g', '닭가슴살 200g', '고구마 150g', '브로콜리 100g', '올리브 오일 15g'],
        imageUrl: '/images/meals/bulk-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['현미밥 100g', '소고기 스테이크 200g', '구운 채소 150g', '아보카도 70g'],
        imageUrl: '/images/meals/bulk-dinner.jpg'
      },
      {
        name: '간식 1',
        items: ['그릭 요거트 200g', '견과류 50g', '꿀 15g'],
        imageUrl: '/images/meals/bulk-snack1.jpg'
      },
      {
        name: '간식 2',
        items: ['단백질 쉐이크 30g', '바나나 120g', '오트밀 쿠키 40g'],
        imageUrl: '/images/meals/bulk-snack2.jpg'
      }
    ]
  },
  {
    id: 'bulk-2',
    category: 'bulk',
    title: '클린 벌크업 식단',
    description: '체지방 증가를 최소화하며 근육 증가를 목표로 하는 클린 벌크업 식단입니다.',
    calories: 2800,
    protein: 170,
    carbs: 320,
    fat: 70,
    meals: [
      {
        name: '아침',
        items: ['달걀 250g(흰자 150g, 노른자 100g)', '오트밀 80g', '블루베리 75g', '아몬드 15g'],
        imageUrl: '/images/meals/clean-bulk-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['닭가슴살 200g', '현미밥 100g', '아보카도 70g', '브로콜리 100g'],
        imageUrl: '/images/meals/clean-bulk-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['연어 200g', '고구마 150g', '아스파라거스 100g', '올리브 오일 15g'],
        imageUrl: '/images/meals/clean-bulk-dinner.jpg'
      },
      {
        name: '운동 전',
        items: ['바나나 120g', '아몬드 20g'],
        imageUrl: '/images/meals/clean-bulk-pre.jpg'
      },
      {
        name: '운동 후',
        items: ['단백질 쉐이크 30g', '덱스트로즈 파우더 25g'],
        imageUrl: '/images/meals/clean-bulk-post.jpg'
      }
    ]
  },
  {
    id: 'quickmeal-1',
    category: 'quickmeal',
    title: '바쁜 직장인을 위한 간편식',
    description: '준비 시간이 15분 이내인 빠르고 영양가 있는 간편식 레시피입니다.',
    calories: 2000,
    protein: 120,
    carbs: 200,
    fat: 60,
    meals: [
      {
        name: '아침',
        items: ['그릭 요거트 150g', '오트밀 50g', '바나나 120g', '땅콩버터 15g'],
        imageUrl: '/images/meals/quick-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['닭가슴살 150g', '채소 샐러드 100g', '견과류 30g', '올리브 오일 드레싱 15g'],
        imageUrl: '/images/meals/quick-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['참치 100g', '통밀 또띠아 50g', '삶은 달걀 50g', '아보카도 50g', '토마토 70g'],
        imageUrl: '/images/meals/quick-dinner.jpg'
      },
      {
        name: '간식',
        items: ['프로틴 바 60g', '사과 150g'],
        imageUrl: '/images/meals/quick-snack.jpg'
      }
    ]
  },
  {
    id: 'quickmeal-2',
    category: 'quickmeal',
    title: '3분 완성 초간단 식단',
    description: '전자레인지로 3분 이내에 완성할 수 있는 초간단 식단입니다.',
    calories: 1800,
    protein: 100,
    carbs: 180,
    fat: 70,
    meals: [
      {
        name: '아침',
        items: ['전자레인지 계란찜 100g', '통밀 토스트 60g', '스트링치즈 30g', '견과류 믹스 25g'],
        imageUrl: '/images/meals/microwave-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['전자레인지 현미밥 150g', '참치캔 100g', '냉동 채소 믹스 100g', '올리브 오일 15g'],
        imageUrl: '/images/meals/microwave-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['냉동 닭가슴살 150g', '냉동 고구마 150g', '냉동 브로콜리 100g', '바나나 120g'],
        imageUrl: '/images/meals/microwave-dinner.jpg'
      },
      {
        name: '간식',
        items: ['프로틴 쉐이크 30g', '우유 200g', '냉동 베리믹스 50g'],
        imageUrl: '/images/meals/microwave-snack.jpg'
      }
    ]
  },
  {
    id: 'highprotein-1',
    category: 'highprotein',
    title: '초고단백 식단 (200g+)',
    description: '하루 단백질 200g 이상 섭취를 목표로 하는 고단백 식단입니다.',
    calories: 2500,
    protein: 220,
    carbs: 200,
    fat: 80,
    meals: [
      {
        name: '아침',
        items: ['계란 흰자 6개', '통곡물 토스트 2장', '닭가슴살 100g', '그릭 요거트 100g'],
        imageUrl: '/images/meals/highprotein-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['닭가슴살 200g', '현미밥 1/2공기', '브로콜리 1컵', '견과류 30g'],
        imageUrl: '/images/meals/highprotein-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['삶은 달걀 2개', '참치 캔 1개', '두부 150g', '그린 샐러드'],
        imageUrl: '/images/meals/highprotein-dinner.jpg'
      },
      {
        name: '간식 1',
        items: ['단백질 쉐이크 (50g 단백질)', '저지방 우유 200ml'],
        imageUrl: '/images/meals/highprotein-snack1.jpg'
      },
      {
        name: '간식 2',
        items: ['저지방 코티지 치즈 100g', '땅콩버터 1큰술'],
        imageUrl: '/images/meals/highprotein-snack2.jpg'
      }
    ]
  },
  {
    id: 'highprotein-2',
    category: 'highprotein',
    title: '비건 고단백 식단',
    description: '동물성 단백질 없이 식물성 단백질로만 구성된 고단백 비건 식단입니다.',
    calories: 2200,
    protein: 140,
    carbs: 250,
    fat: 70,
    meals: [
      {
        name: '아침',
        items: ['두부 스크램블 150g', '통곡물 토스트 2장', '아보카도 1/2개', '견과류 30g'],
        imageUrl: '/images/meals/vegan-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['템페 150g', '퀴노아 1컵', '구운 채소 믹스', '병아리콩 1/2컵'],
        imageUrl: '/images/meals/vegan-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['렌틸콩 스튜 1컵', '현미밥 1/2공기', '구운 두부 100g', '케일 샐러드'],
        imageUrl: '/images/meals/vegan-dinner.jpg'
      },
      {
        name: '간식 1',
        items: ['식물성 단백질 쉐이크', '아몬드 밀크 250ml'],
        imageUrl: '/images/meals/vegan-snack1.jpg'
      },
      {
        name: '간식 2',
        items: ['에다마메 1컵', '견과류 믹스 30g'],
        imageUrl: '/images/meals/vegan-snack2.jpg'
      }
    ]
  },
  {
    id: 'balanced-1',
    category: 'balanced',
    title: '영양 균형 식단',
    description: '탄수화물, 단백질, 지방의 균형이 잡힌 전반적으로 건강한 식단입니다.',
    calories: 2200,
    protein: 120,
    carbs: 230,
    fat: 70,
    meals: [
      {
        name: '아침',
        items: ['오트밀 60g', '그릭 요거트 150g', '블루베리 1/2컵', '아몬드 15개'],
        imageUrl: '/images/meals/balanced-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['구운 닭가슴살 120g', '현미밥 3/4공기', '찐 브로콜리 1컵', '올리브 오일 1큰술'],
        imageUrl: '/images/meals/balanced-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['연어 120g', '고구마 1/2개', '아스파라거스 1컵', '혼합 샐러드'],
        imageUrl: '/images/meals/balanced-dinner.jpg'
      },
      {
        name: '간식',
        items: ['오렌지 1개', '아몬드 15개'],
        imageUrl: '/images/meals/balanced-snack.jpg'
      }
    ]
  }
];

const MealPlans: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('diet');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredMeals = mealPlans.filter(meal => meal.category === selectedCategory);

  // 음식 이름을 클릭하면 영양 검색 페이지로 이동
  const handleMealClick = (mealName: string) => {
    navigate('/qna', { 
      state: { 
        activeTab: 'nutrition',
        openNutritionScout: true,
        searchTerm: mealName 
      } 
    });
  };

  // 식단 카드 클릭 처리
  const toggleMealDetails = (mealId: string) => {
    if (selectedMeal === mealId) {
      setSelectedMeal(null); // 이미 선택된 카드를 다시 클릭하면 닫기
    } else {
      setSelectedMeal(mealId); // 새 카드 선택
    }
  };

  return (
    <div>
      {/* 영양 정보 확인 메모 - 상단에 표시 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
        <Info className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={20} />
        <div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            음식별 영양성분은 '음식 영양성분 확인'을 통해 탄/단/지 정보를 파악할 수 있습니다.
            식품 이름을 클릭하면 해당 음식의 영양 정보를 검색할 수 있습니다.
          </p>
        </div>
      </div>
      
      {/* 식단 카테고리 선택 */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => setSelectedCategory('diet')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${
              selectedCategory === 'diet' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <span className="text-lg mb-1">🥗</span>
            <span className="text-sm font-medium">다이어트</span>
          </button>
          
          <button
            onClick={() => setSelectedCategory('bulk')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${
              selectedCategory === 'bulk' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <span className="text-lg mb-1">💪</span>
            <span className="text-sm font-medium">벌크업</span>
          </button>
          
          <button
            onClick={() => setSelectedCategory('quickmeal')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${
              selectedCategory === 'quickmeal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <span className="text-lg mb-1">⏱️</span>
            <span className="text-sm font-medium">간편식</span>
          </button>
          
          <button
            onClick={() => setSelectedCategory('highprotein')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${
              selectedCategory === 'highprotein' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <span className="text-lg mb-1">🥩</span>
            <span className="text-sm font-medium">고단백</span>
          </button>
          
          <button
            onClick={() => setSelectedCategory('balanced')}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${
              selectedCategory === 'balanced' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <span className="text-lg mb-1">⚖️</span>
            <span className="text-sm font-medium">균형식단</span>
          </button>
        </div>
      </div>

      {/* 식단 목록 */}
      <div className="space-y-4">
        {filteredMeals.map(meal => (
          <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleMealDetails(meal.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{meal.title}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                      {meal.calories}kcal
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">
                      단백질 {meal.protein}g
                    </span>
                  </div>
                  {selectedMeal === meal.id ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{meal.description}</p>
            </div>
            
            {/* 식단 상세 정보 - 선택된 식단만 표시 */}
            {selectedMeal === meal.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-2">영양 정보</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">칼로리</span>
                          <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{meal.calories}kcal</span>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">단백질</span>
                          <span className="block text-lg font-bold text-green-600 dark:text-green-400">{meal.protein}g</span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">탄수화물</span>
                          <span className="block text-lg font-bold text-yellow-600 dark:text-yellow-400">{meal.carbs}g</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center col-span-3">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">지방</span>
                          <span className="block text-lg font-bold text-red-600 dark:text-red-400">{meal.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-4">
                      <button
                        onClick={() => {
                          const searchParams = new URLSearchParams();
                          searchParams.set('activeTab', 'nutrition');
                          searchParams.set('openNutritionScout', 'true');
                          navigate(`/qna?${searchParams.toString()}`);
                        }}
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <Search size={16} className="mr-1" />
                        <span>식재료 영양정보 찾아보기</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg mb-3">{meal.title} 식단 구성</h4>
                  {/* 해당 카테고리의 모든 식단을 하나로 통합하여 표시 */}
                  {meal.meals.map((mealItem, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden mb-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 font-medium border-b flex justify-between">
                        <span>{mealItem.name}</span>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {mealItem.items.map((item, itemIdx) => (
                            <li 
                              key={itemIdx} 
                              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation(); // 버블링 방지
                                handleMealClick(item.split(' ')[0]);
                              }}
                            >
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlans; 