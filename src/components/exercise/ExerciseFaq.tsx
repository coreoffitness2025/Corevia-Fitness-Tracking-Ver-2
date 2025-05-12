import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Dumbbell, Utensils, Scale, Pizza, Coffee, Heart } from 'lucide-react';
import Card, { CardTitle } from '../common/Card';

type HandbookCategory = 'exercise' | 'nutrition' | 'weight' | 'diet' | 'supplement' | 'health';

interface HandbookItem {
  id: string;
  title: string;
  content: string;
  category: HandbookCategory;
  tags: string[];
}

interface ExerciseFaqProps {
  searchTerm?: string;
}

const ExerciseFaq: React.FC<ExerciseFaqProps> = ({ searchTerm = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<HandbookCategory | 'all'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filteredCards, setFilteredCards] = useState<HandbookItem[]>(handbookData);
  const expandedCardRef = useRef<HTMLDivElement>(null);

  // 카드 확장/축소 토글
  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // 카테고리 필터
  const handleCategoryChange = (category: HandbookCategory | 'all') => {
    setSelectedCategory(category);
  };

  // 검색어 또는 카테고리 변경 시 필터링
  useEffect(() => {
    let filtered = handbookData;
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }
    
    // 검색어 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.content.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
      
      // 검색어가 있으면 첫 번째 결과를 자동으로 열기
      if (filtered.length > 0) {
        setExpandedCard(filtered[0].id);
      }
    }
    
    setFilteredCards(filtered);
  }, [searchTerm, selectedCategory]);

  // 확장된 카드로 스크롤
  useEffect(() => {
    if (expandedCard && expandedCardRef.current) {
      setTimeout(() => {
        expandedCardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }, 100);
    }
  }, [expandedCard]);

  // 핸드북 검색 이벤트 리스너
  useEffect(() => {
    const handleHandbookSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{searchTerm: string}>;
      if (customEvent.detail?.searchTerm) {
        const term = customEvent.detail.searchTerm;
        
        // 해당 검색어와 일치하는 항목 찾기
        const matchingItem = handbookData.find(item => 
          item.title.toLowerCase().includes(term.toLowerCase())
        );
        
        // 일치하는 항목이 있으면 열기
        if (matchingItem) {
          setExpandedCard(matchingItem.id);
        }
      }
    };
    
    document.addEventListener('handbookSearch', handleHandbookSearch as EventListener);
    
    return () => {
      document.removeEventListener('handbookSearch', handleHandbookSearch as EventListener);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 transition-all duration-300">
      {/* 카테고리 선택 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
            selectedCategory === 'all'
              ? 'bg-[#4285F4] text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <ChevronRight size={16} className="mr-1" />
          전체
        </button>
        
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              selectedCategory === category.value
                ? 'bg-[#4285F4] text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>
      
      {/* 카드 그리드 */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card) => (
            <div key={card.id} ref={expandedCard === card.id ? expandedCardRef : null}>
              <Card 
                className={`overflow-hidden transition-all duration-300 ${
                  expandedCard === card.id ? 'ring-2 ring-blue-500' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleCard(card.id)}
                >
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                    {card.title}
                  </CardTitle>
                  <span className={`transform transition-transform duration-300 ${
                    expandedCard === card.id ? 'rotate-90' : ''
                  }`}>
                    <ChevronRight size={20} />
                  </span>
                </div>
                
                {expandedCard === card.id && (
                  <div className="p-4 pt-0 animate-fadeIn">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {card.content}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {card.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 카테고리 데이터
const categories = [
  { value: 'exercise' as HandbookCategory, label: '운동', icon: <Dumbbell size={16} className="mr-1" /> },
  { value: 'nutrition' as HandbookCategory, label: '영양', icon: <Utensils size={16} className="mr-1" /> },
  { value: 'weight' as HandbookCategory, label: '체중 관리', icon: <Scale size={16} className="mr-1" /> },
  { value: 'diet' as HandbookCategory, label: '식단', icon: <Pizza size={16} className="mr-1" /> },
  { value: 'supplement' as HandbookCategory, label: '보충제', icon: <Coffee size={16} className="mr-1" /> },
  { value: 'health' as HandbookCategory, label: '건강', icon: <Heart size={16} className="mr-1" /> }
];

// 핸드북 데이터
const handbookData: HandbookItem[] = [
  {
    id: 'ex1',
    title: '운동 전 스트레칭은 꼭 해야 하나요?',
    content: '운동 전 워밍업과 동적 스트레칭은 부상 방지와 운동 효과 증대를 위해 매우 중요합니다. 일반적인 권장사항은 다음과 같습니다:\n\n1. 5-10분간 가벼운 유산소 운동으로 체온을 올리세요.\n2. 운동에 사용할 근육군을 위한 동적 스트레칭을 실시하세요.\n3. 정적 스트레칭은 운동 후에 하는 것이 더 효과적입니다.\n\n워밍업은 근육에 혈류를 증가시켜 부상 위험을 줄이고 운동 성과를 향상시킵니다.',
    category: 'exercise',
    tags: ['스트레칭', '워밍업', '부상 방지', '초보자 가이드']
  },
  {
    id: 'ex2',
    title: '근육통이 생겼을 때 계속 운동해도 되나요?',
    content: '가벼운 근육통(DOMS)은 운동 24-72시간 후에 나타나는 정상적인 반응입니다. 이런 경우에는 다음 지침을 따르는 것이 좋습니다:\n\n1. 가벼운 통증: 강도를 낮추거나 다른 부위 운동으로 전환해도 됩니다.\n2. 중간 정도의 통증: 활동적 회복(가벼운 유산소, 스트레칭)이 도움이 됩니다.\n3. 심한 통증: 완전한 휴식이 필요합니다.\n\n단, 날카로운 통증, 관절 통증, 또는 부종이 있다면 운동을 중단하고 전문가의 조언을 구하세요.',
    category: 'exercise',
    tags: ['근육통', 'DOMS', '회복', '과훈련']
  },
  {
    id: 'nt1',
    title: '단백질 섭취는 언제 하는 것이 가장 효과적인가요?',
    content: `단백질 섭취 타이밍은 다음과 같이 권장됩니다:\n\n1. 운동 후 30분-2시간 내: 이는 '단백질 섭취 골든 타임'으로 근육 회복과 성장에 가장 효과적입니다.\n2. 균등한 분배: 하루 총 단백질 섭취량을 3-5끼로 나누어 섭취하는 것이 지속적인 근단백질 합성에 도움이 됩니다.\n3. 취침 전: 카제인 단백질과 같은 천천히 소화되는 단백질은 취침 전 섭취 시 야간 회복을 도울 수 있습니다.\n\n체중 1kg당 1.6-2.2g의 단백질 섭취가 근육 성장에 이상적입니다.`,
    category: 'nutrition',
    tags: ['단백질', '영양', '식이요법', '근육 성장']
  },
  {
    id: 'wt1',
    title: '체중 감량을 위한 최적의 운동 방법은?',
    content: '효과적인 체중 감량을 위해서는 다음과 같은 복합적 접근이 필요합니다:\n\n1. 유산소 운동: 주 3-5회, 30-60분의 중강도 유산소 운동(조깅, 사이클링, 수영 등)\n2. 근력 운동: 주 2-3회의 전신 근력 운동으로 기초 대사량 증가\n3. HIIT(고강도 인터벌 트레이닝): 주 1-2회 실시하여 운동 후 칼로리 소모량 극대화\n4. 활동적 생활 습관: 일상 생활에서의 활동량 증가(계단 이용, 걷기 등)\n\n이와 함께 적절한 칼로리 제한(10-20%)과 균형 잡힌 식단이 중요합니다. 급격한 체중 감량보다는 주당 0.5-1kg의 완만한 감량이 더 건강하고 지속 가능합니다.',
    category: 'weight',
    tags: ['체중 감량', '다이어트', '유산소', 'HIIT', '칼로리 적자']
  },
  {
    id: 'ex3',
    title: '하루에 몇 시간 운동하는 것이 적당한가요?',
    content: '적절한 운동 시간은 개인의 체력, 경험, 목표에 따라 다르지만, 일반적인 지침은 다음과 같습니다:\n\n1. 초보자: 일일 30-45분, 주 3-4회\n2. 중급자: 일일 45-75분, 주 4-5회\n3. 상급자: 일일 60-90분, 주 5-6회\n\n운동 종류에 따라 다를 수 있으며, 강도 높은 운동은 짧게, 가벼운 운동은 조금 더 길게 할 수 있습니다. 중요한 것은 일관성과 점진적 증가입니다. 과훈련 징후(지속적 피로, 수행능력 저하, 부상 등)가 나타나면 휴식을 취하세요.',
    category: 'exercise',
    tags: ['운동 시간', '트레이닝 빈도', '과훈련', '회복']
  },
  {
    id: 'wt2',
    title: '어떤 운동이 복부 지방 감소에 가장 효과적인가요?',
    content: `복부 지방을 특정하여 감소시키는 '국소 지방 감량'은 과학적으로 입증되지 않았습니다. 효과적인 복부 지방 감소를 위해서는 전체적인 접근이 필요합니다:\n\n1. 전신 운동: HIIT, 조깅, 사이클링 등의 유산소 운동이 전반적인 체지방 감소에 효과적입니다.\n2. 근력 운동: 복부 운동(플랭크, 크런치 등)뿐만 아니라 전신 근력 운동이 중요합니다.\n3. 식이 관리: 설탕, 가공식품, 정제된 탄수화물 섭취를 줄이고 단백질과 섬유질 섭취를 늘리세요.\n4. 스트레스 관리: 코르티솔 수치를 낮추기 위한 스트레스 관리도 중요합니다.\n\n복부 지방 감소는 시간이 필요한 과정이므로 꾸준함과 인내심이 중요합니다.`,
    category: 'weight',
    tags: ['복부 지방', '코어 운동', '지방 감량', '대사율']
  },
  {
    id: 'ex4',
    title: '헬스장 없이 집에서 할 수 있는 효과적인 운동은?',
    content: '집에서 할 수 있는 효과적인 운동들은 다음과 같습니다:\n\n1. 체중 운동: 스쿼트, 푸시업, 런지, 플랭크, 버피, 마운틴 클라이머 등\n2. 서킷 트레이닝: 여러 운동을 쉬지 않고 연속해서 수행하여 심박수 유지\n3. 타바타 훈련: 20초 고강도 운동 후 10초 휴식을 8세트 반복\n4. 요가/필라테스: 유연성, 코어 강화, 자세 개선에 효과적\n5. 홈트레이닝 장비(선택적): 덤벨, 저항 밴드, 케틀벨 등을 활용\n\n유튜브나 피트니스 앱을 통해 다양한 홈트레이닝 루틴을 찾을 수 있습니다. 공간과 소음 제약을 고려한 운동 선택이 중요합니다.',
    category: 'exercise',
    tags: ['홈트레이닝', '맨몸운동', '서킷 트레이닝', '타바타']
  },
  {
    id: 'sp1',
    title: '운동 후 단백질 셰이크는 꼭 필요한가요?',
    content: '단백질 셰이크가 필수는 아니지만, 다음과 같은 이점이 있습니다:\n\n1. 편의성: 운동 직후 빠르게 단백질을 섭취할 수 있습니다.\n2. 흡수율: 유청 단백질은 빠르게 흡수되어 근육 회복을 돕습니다.\n3. 정량화: 정확한 단백질 양을 쉽게 측정할 수 있습니다.\n\n그러나 닭가슴살, 계란, 그릭 요거트 등의 자연식품을 통해서도 충분한 단백질을 섭취할 수 있습니다. 중요한 것은 총 단백질 섭취량으로, 식사만으로 충분한 단백질을 섭취하기 어렵다면 보충제가 도움이 될 수 있습니다.',
    category: 'supplement',
    tags: ['단백질 보충제', '근육 회복', '영양 보충', '운동 후 영양']
  },
  {
    id: 'ex5',
    title: '근력 운동과 유산소 운동의 순서는 어떻게 해야 하나요?',
    content: '일반적인 권장사항은 다음과 같습니다:\n\n1. 주요 목표가 근력 향상인 경우: 근력 운동 → 유산소 운동\n2. 주요 목표가 체중 감량인 경우: 유산소 운동 → 근력 운동 또는 HIIT → 근력 운동\n3. 주요 목표가 지구력 향상인 경우: 유산소 운동 → 근력 운동\n\n같은 날 두 운동을 모두 할 경우, 먼저 하는 운동에 더 많은 에너지를 쓰게 됩니다. 또한 근력 운동과 유산소 운동을 다른 날에 나누어 하는 분할 트레이닝도 효과적인 방법입니다.',
    category: 'exercise',
    tags: ['운동 순서', '근력 운동', '유산소 운동', '트레이닝 계획']
  },
  {
    id: 'nt2',
    title: '운동 전후에 탄수화물 섭취가 필요한가요?',
    content: '운동 전후 탄수화물 섭취에 대한 지침은 다음과 같습니다:\n\n운동 전 (1-3시간 전):\n1. 중강도 이상 운동 시 유용합니다.\n2. 복합 탄수화물(오트밀, 현미, 고구마 등) 섭취가 좋습니다.\n3. 개인차가 있으므로, 자신에게 맞는 양과 타이밍을 찾는 것이 중요합니다.\n\n운동 후 (30분-2시간 내):\n1. 글리코겐 재합성을 위해 단순 탄수화물과 단백질을 함께 섭취하는 것이 좋습니다.\n2. 체중 감량이 목표라면 탄수화물 양을 조절할 수 있습니다.\n\n장시간 운동(90분 이상)이나 고강도 운동에서는 탄수화물 섭취가 더 중요합니다.',
    category: 'nutrition',
    tags: ['탄수화물', '영양 타이밍', '글리코겐', '운동 전 식사', '운동 후 식사']
  }
];

export default ExerciseFaq;
