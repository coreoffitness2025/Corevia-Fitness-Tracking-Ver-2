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
  },
  {
    id: 'ex6',
    title: '운동할 때 호흡은 어떻게 해야 하나요?',
    content: '올바른 호흡법은 운동 효율성과 안전성을 높이는 데 중요합니다:\n\n1. 근력 운동 시:\n   - 노력 단계(컨센트릭): 숨을 내쉬세요(예: 벤치프레스에서 바를 밀어올릴 때)\n   - 회복 단계(에센트릭): 숨을 들이마시세요(예: 벤치프레스에서 바를 내릴 때)\n   - 복압 유지를 위해 브레이싱 호흡법을 사용하세요(특히 스쿼트, 데드리프트)\n\n2. 유산소 운동 시:\n   - 일정한 호흡 리듬을 유지하세요\n   - 코로 들이마시고 입으로 내쉬는 것이 일반적으로 권장됩니다\n   - 운동 강도가 높을 때는 입으로 들이마시고 내쉬는 것도 효과적입니다\n\n3. 피해야 할 것: 호흡 멈춤(발살바 효과)은 혈압을 급격히 상승시킬 수 있습니다.',
    category: 'exercise',
    tags: ['호흡법', '운동 기술', '안전', '성능 향상']
  },
  {
    id: 'nt3',
    title: '식단에서 탄수화물, 단백질, 지방의 적절한 비율은 어떻게 되나요?',
    content: '영양소 비율은 개인의 목표와 활동 수준에 따라 달라질 수 있습니다:\n\n1. 일반적인 건강 유지:\n   - 탄수화물: 45-55% 총 칼로리\n   - 단백질: 15-20% 총 칼로리\n   - 지방: 25-35% 총 칼로리\n\n2. 근육 증가 목표:\n   - 탄수화물: 40-60% 총 칼로리\n   - 단백질: 25-35% 총 칼로리\n   - 지방: 15-25% 총 칼로리\n\n3. 체중 감량 목표:\n   - 탄수화물: 20-40% 총 칼로리\n   - 단백질: 30-40% 총 칼로리\n   - 지방: 20-40% 총 칼로리\n\n4. 지구력 운동선수:\n   - 탄수화물: 55-65% 총 칼로리\n   - 단백질: 15-20% 총 칼로리\n   - 지방: 20-30% 총 칼로리\n\n단, 이는 일반적인 가이드라인으로, 개인에 따라 조정이 필요할 수 있습니다. 영양소의 질도 매우 중요하므로, 가공되지 않은 자연식품 위주의 식단을 유지하세요.',
    category: 'nutrition',
    tags: ['매크로 영양소', '식단 계획', '영양 균형', '체중 관리']
  },
  {
    id: 'wt3',
    title: '체중 증가 없이 근육을 늘릴 수 있나요?',
    content: '체중 증가 없이 근육량을 늘리는 것(체구성 재조정 또는 리컴포지션)은 가능합니다만, 특정 조건에서 더 효과적입니다:\n\n가장 효과적인 경우:\n1. 운동 초보자\n2. 트레이닝을 재개한 경우\n3. 체지방이 높은 경우\n4. 청소년 또는 유전적 이점이 있는 경우\n\n성공적인 리컴포지션을 위한 전략:\n1. 충분한 단백질 섭취 (체중 1kg당 1.8-2.2g)\n2. 적절한 칼로리 섭취 (유지 칼로리 또는 약간 아래로)\n3. 점진적 부하 원칙을 따르는 강도 높은 근력 운동\n4. 충분한 회복과 수면\n5. 꾸준함과 인내심\n\n리컴포지션은 체중계의 숫자보다 체형의 변화, 옷 맞음새, 신체 측정, 체지방률 등을 모니터링하는 것이 중요합니다. 일반적으로 진행 속도가 느리므로 장기적인 관점이 필요합니다.',
    category: 'weight',
    tags: ['리컴포지션', '근육 성장', '체지방 감소', '체중 관리']
  },
  {
    id: 'sp2',
    title: '크레아틴 보충제는 효과가 있나요? 어떻게 복용해야 하나요?',
    content: '크레아틴은 가장 연구된 운동 보충제 중 하나로, 다음과 같은 효과가 과학적으로 증명되었습니다:\n\n효과:\n1. 고강도 운동 성능 향상 (특히 짧고 강한 노력이 필요한 운동)\n2. 근력 및 근육량 증가 촉진\n3. 운동 후 회복 증진\n4. 일부 연구에서는 인지 기능 향상 효과도 제시됨\n\n복용 지침:\n1. 크레아틴 모노하이드레이트가 가장 연구되고 효과적인 형태입니다.\n2. 일반적인 복용법:\n   - 부하 복용법: 1주일간 하루 20g (5g씩 4회 분할)\n   - 유지 복용법: 하루 3-5g\n   - 또는 부하 과정 없이 바로 하루 3-5g 복용도 가능 (효과 나타남까지 시간 더 소요)\n3. 매일 복용하며, 복용 시간은 크게 중요하지 않습니다.\n4. 충분한 수분 섭취를 유지하세요.\n\n안전성: 건강한 성인에게는 안전한 보충제로 알려져 있으나, 신장 질환이 있는 경우 의사와 상담이 필요합니다.',
    category: 'supplement',
    tags: ['크레아틴', '근력 향상', '운동 성능', '보충제 복용법']
  },
  {
    id: 'dt1',
    title: '식단 트래킹은 어떻게 시작해야 하나요?',
    content: '효과적인 식단 트래킹을 위한 단계별 가이드:\n\n시작하기:\n1. 간단한 앱 사용하기 (MyFitnessPal, Cronometer, LoseIt 등)\n2. 처음 3-7일은 평소 식습관 그대로 기록하여 기준점 파악하기\n3. 음식 무게 측정용 주방저울 구입 고려하기\n\n효과적인 트래킹 팁:\n1. 미리 계획하기: 하루 식단을 미리 기록하면 준수율이 높아집니다.\n2. 일관성 유지하기: 매일 같은 시간에 기록하는 습관 형성하기\n3. 외식 시: 유사한 메뉴 찾거나 성분 예상하여 기록하기\n4. 과도한 완벽주의 피하기: 100% 정확하지 않아도 괜찮습니다.\n\n트래킹 기간:\n- 목표에 따라 다르지만, 보통 최소 2-4주 기록으로 패턴을 파악할 수 있습니다.\n- 식습관이 안정되면 간헐적 트래킹으로 전환해도 됩니다.\n\n주의사항: 식단 트래킹이 강박적 행동으로 발전하지 않도록 주의하세요. 불편함을 느끼면 전문가 상담을 고려하세요.',
    category: 'diet',
    tags: ['식단 기록', '영양 추적', '식습관', '매크로 카운팅']
  },
  {
    id: 'ht1',
    title: '운동이 정신 건강에 미치는 영향은 무엇인가요?',
    content: '운동은 신체 건강뿐만 아니라 정신 건강에도 다양한 긍정적 효과가 있습니다:\n\n주요 이점:\n1. 스트레스 감소: 코르티솔 수치 감소와 스트레스 호르몬 조절\n2. 우울증 및 불안 완화: 일부 경우 가벼운-중간 정도의 우울증에 약물만큼 효과적\n3. 수면 개선: 수면 질과 지속 시간 향상\n4. 인지 기능 향상: 집중력, 기억력, 창의력 증진\n5. 자존감 향상: 달성감과 신체 이미지 개선\n\n효과적인 운동 유형:\n- 유산소 운동: 달리기, 수영, 사이클링 (세로토닌, 엔도르핀 분비 촉진)\n- 근력 운동: 심리적 강인함과 자신감 향상\n- 요가, 태극권: 마음챙김과 스트레스 관리에 특히 효과적\n\n권장사항:\n- 꾸준함이 중요: 짧더라도 규칙적인 운동이 가장 효과적\n- 즐거운 활동 선택: 지속 가능성을 위해 즐길 수 있는 운동 찾기\n- 야외 활동: 자연 속에서의 운동은 추가적인 정신 건강 이점 제공\n\n주의: 운동은 전문적 정신 건강 치료의 보완재이며, 심각한 상태의 대체제가 아닙니다.',
    category: 'health',
    tags: ['정신 건강', '스트레스 관리', '우울증', '운동 효과', '뇌 건강']
  },
  {
    id: 'dt2',
    title: '간헐적 단식은 효과가 있나요?',
    content: '간헐적 단식(IF)에 대한 과학적 관점:\n\n잠재적 이점:\n1. 체중 관리: 자연스러운 칼로리 섭취 감소로 체중 감량 도움\n2. 대사 건강: 일부 연구에서 인슐린 감수성 개선, 혈당 조절 향상 보고\n3. 세포 건강: 오토파지(세포 재생 과정) 촉진 가능성\n4. 염증 감소: 염증 지표 개선 사례 있음\n\n일반적인 방법:\n1. 16:8 방식: 16시간 단식, 8시간 섭취 윈도우 (가장 대중적)\n2. 5:2 방식: 주 5일 정상 식사, 2일은 저칼로리(500-600kcal) 섭취\n3. 격일 단식: 하루 정상 식사, 하루 단식 또는 저칼로리 섭취\n\n고려사항:\n- 개인 차이: 모든 사람에게 효과적이지 않을 수 있음\n- 적응 기간: 처음 1-2주는 배고픔, 집중력 저하, 과민함을 경험할 수 있음\n- 영양 섭취: 식사 시간이 제한되어도 영양 균형은 유지해야 함\n\n주의해야 할 대상: 임산부/수유부, 성장기 청소년, 노인, 저체중인 사람, 당뇨약 복용자, 식이장애 병력자는 의사와 상담 후 시도해야 합니다.',
    category: 'diet',
    tags: ['간헐적 단식', '시간제한 식이', '체중 관리', '대사 건강', 'IF']
  },
  {
    id: 'sp3',
    title: '프리워크아웃 보충제는 어떤 효과가 있고 안전한가요?',
    content: '프리워크아웃 보충제의 효과와 안전성에 대한 이해:\n\n일반적 성분과 효과:\n1. 카페인: 에너지 향상, 운동 능력 증가, 피로 지연\n2. 베타-알라닌: 근육 버퍼링 능력 향상, 근지구력 개선\n3. 크레아틴: 고강도 운동 성능 및 근력 향상\n4. 시트룰린/아르기닌: 혈류 개선, 근육 펌프 증가\n5. 타우린: 근육 수축 개선, 회복 지원\n\n잠재적 이점:\n- 에너지 수준과 운동 집중력 향상\n- 운동 중 지구력 및 성능 개선\n- 근력 및 파워 증가 가능성\n\n주의사항 및 안전 팁:\n1. 카페인 함량 확인: 과도한 카페인은 심계항진, 불안, 수면 장애 유발 가능\n2. 제품 성분 연구: 투명한 성분표를 가진 신뢰할 수 있는 브랜드 선택\n3. 내성 발생: 지속적 사용 시 효과가 감소할 수 있음\n4. 주기적 사용: 4-6주 사용 후 1-2주 휴식 권장\n5. 저용량으로 시작: 처음에는 권장량의 절반으로 시작하여 반응 확인\n\n피해야 할 사람: 심장질환, 고혈압, 불안장애가 있는 사람, 임산부/수유부, 18세 미만은 피해야 합니다. 의약품을 복용 중이라면 의사와 상담하세요.',
    category: 'supplement',
    tags: ['프리워크아웃', '운동 보충제', '카페인', '운동 성능', '보충제 안전성']
  },
  {
    id: 'ht2',
    title: '과훈련 증후군은 어떻게 알 수 있고 어떻게 예방하나요?',
    content: '과훈련 증후군의 인식과 예방 가이드:\n\n주요 증상:\n1. 지속적인 피로와 에너지 부족\n2. 운동 성과 저하 (보통 2주 이상)\n3. 휴식 후에도 회복되지 않는 근육 통증\n4. 면역력 저하 (잦은 감기나 감염)\n5. 수면 장애와 불면증\n6. 심박수 변화 (휴식시 심박수 증가 또는 불규칙)\n7. 식욕 감소\n8. 집중력 저하와 무기력\n9. 운동 동기 및 즐거움 상실\n\n예방 전략:\n1. 점진적 운동 강도 증가: 주당 볼륨/강도 10% 이상 증가하지 않기\n2. 주기화 트레이닝: 강도 높은 주간과 회복 주간 번갈아 계획\n3. 충분한 회복: 주 1-2일의 완전한 휴식일 포함\n4. 영양 관리: 운동량에 맞는 충분한 칼로리와 영양소 섭취\n5. 수면 최적화: 하루 7-9시간 양질의 수면 유지\n6. 스트레스 관리: 운동 외 스트레스 요인 고려 및 관리\n7. 트레이닝 일지: 운동과 상태 기록으로 패턴 인식\n\n과훈련 의심 시 조치: 트레이닝 강도와 볼륨을 50% 이상 줄이고 1-2주간 가벼운 활동만 하세요. 심각한 증상이 지속되면 의료 전문가와 상담하세요.',
    category: 'health',
    tags: ['과훈련', '회복', '운동 성과', '피로 관리', '트레이닝 계획']
  }
];

export default ExerciseFaq;
