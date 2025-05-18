import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardTitle, CardSection } from '../common/Card';
import { Utensils, ArrowRight, Search } from 'lucide-react';

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
        items: ['달걀 흰자 3개', '아보카도 1/2개', '시금치 1컵', '블랙커피'],
        imageUrl: '/images/meals/low-carb-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['구운 닭가슴살 150g', '브로콜리 1컵', '올리브 오일 1큰술', '견과류 30g'],
        imageUrl: '/images/meals/low-carb-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['구운 연어 150g', '아스파라거스 1컵', '양상추 샐러드', '올리브 오일 1큰술'],
        imageUrl: '/images/meals/low-carb-dinner.jpg'
      },
      {
        name: '간식',
        items: ['단백질 쉐이크 1잔', '아몬드 10-15개'],
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
        items: ['그릭 요거트 200g', '블루베리 1/2컵', '아몬드 1큰술', '꿀 1작은술'],
        imageUrl: '/images/meals/if-meal1.jpg'
      },
      {
        name: '두번째 식사 (15시)',
        items: ['현미밥 1/2공기', '닭가슴살 150g', '채소 샐러드 1컵', '올리브 오일 드레싱'],
        imageUrl: '/images/meals/if-meal2.jpg'
      },
      {
        name: '마지막 식사 (19시)',
        items: ['구운 두부 100g', '현미밥 1/2공기', '볶은 채소 믹스', '김치 1접시'],
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
        items: ['오트밀 100g', '바나나 1개', '단백질 쉐이크 1잔', '계란 3개', '땅콩버터 1큰술'],
        imageUrl: '/images/meals/bulk-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['현미밥 1.5공기', '닭가슴살 200g', '고구마 1개', '브로콜리 1컵', '올리브 오일 1큰술'],
        imageUrl: '/images/meals/bulk-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['현미밥 1공기', '소고기 스테이크 200g', '구운 채소', '아보카도 1/2개'],
        imageUrl: '/images/meals/bulk-dinner.jpg'
      },
      {
        name: '간식 1',
        items: ['그릭 요거트 200g', '견과류 50g', '꿀 1큰술'],
        imageUrl: '/images/meals/bulk-snack1.jpg'
      },
      {
        name: '간식 2',
        items: ['단백질 쉐이크 1잔', '바나나 1개', '오트밀 쿠키 2개'],
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
        items: ['달걀 5개(흰자 3개, 노른자 2개)', '오트밀 80g', '블루베리 1/2컵', '아몬드 10개'],
        imageUrl: '/images/meals/clean-bulk-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['닭가슴살 200g', '현미밥 1공기', '아보카도 1/2개', '브로콜리 1컵'],
        imageUrl: '/images/meals/clean-bulk-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['연어 200g', '고구마 1개', '아스파라거스 1컵', '올리브 오일 1큰술'],
        imageUrl: '/images/meals/clean-bulk-dinner.jpg'
      },
      {
        name: '운동 전',
        items: ['바나나 1개', '아몬드 15개'],
        imageUrl: '/images/meals/clean-bulk-pre.jpg'
      },
      {
        name: '운동 후',
        items: ['단백질 쉐이크 1잔', '덱스트로즈 파우더 1스쿱'],
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
        items: ['그릭 요거트 파르페', '오트밀', '바나나', '땅콩버터'],
        imageUrl: '/images/meals/quick-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['닭가슴살 샐러드 (미리 준비된 닭가슴살)', '견과류', '올리브 오일 드레싱'],
        imageUrl: '/images/meals/quick-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['참치 샐러드 랩', '삶은 달걀', '아보카도', '토마토'],
        imageUrl: '/images/meals/quick-dinner.jpg'
      },
      {
        name: '간식',
        items: ['프로틴 바', '사과 1개'],
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
        items: ['전자레인지 계란 머그컵', '통밀 토스트', '아보카도 스프레드'],
        imageUrl: '/images/meals/3min-breakfast.jpg'
      },
      {
        name: '점심',
        items: ['냉동 닭가슴살 스테이크', '냉동 채소 믹스', '현미밥 컵'],
        imageUrl: '/images/meals/3min-lunch.jpg'
      },
      {
        name: '저녁',
        items: ['전자레인지용 참치 포켓', '양상추', '발사믹 드레싱'],
        imageUrl: '/images/meals/3min-dinner.jpg'
      },
      {
        name: '간식',
        items: ['프로틴 쉐이크', '바나나'],
        imageUrl: '/images/meals/3min-snack.jpg'
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
  const [activeTab, setActiveTab] = useState<string>('diet');
  const navigate = useNavigate();

  // 카테고리별 식단
  const filteredMealPlans = mealPlans.filter(plan => plan.category === activeTab);

  // 카테고리 탭 배열
  const categories = [
    { id: 'diet', label: '다이어트용', icon: '🥗' },
    { id: 'bulk', label: '벌크업용', icon: '💪' },
    { id: 'quickmeal', label: '간편식', icon: '⏱️' },
    { id: 'highprotein', label: '고단백', icon: '🍗' },
    { id: 'balanced', label: '균형 잡힌', icon: '⚖️' }
  ];

  // 식단 클릭 시 Nutrition Scout으로 이동
  const handleMealClick = (mealName: string) => {
    navigate('/qna', { state: { openNutritionScout: true, searchTerm: mealName } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Utensils className="text-blue-500 mr-2" size={24} />
        <h2 className="text-2xl font-bold">식단 예시</h2>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* 식단 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMealPlans.map(plan => (
          <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardSection>
              <CardTitle>{plan.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">칼로리</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">{plan.calories}kcal</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">단백질</div>
                    <div className="font-bold text-green-600 dark:text-green-400">{plan.protein}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">탄수화물</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">{plan.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">지방</div>
                    <div className="font-bold text-red-600 dark:text-red-400">{plan.fat}g</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {plan.meals.map((meal, idx) => (
                  <div 
                    key={idx} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => handleMealClick(meal.name + ' ' + meal.items.join(' '))}
                  >
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{meal.name}</h4>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {meal.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-blue-500 ml-2">
                        <div className="flex items-center text-sm">
                          <Search size={14} className="mr-1" />
                          <span>영양성분 검색</span>
                          <ArrowRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardSection>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlans; 