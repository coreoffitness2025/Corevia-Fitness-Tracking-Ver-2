import { useState } from 'react';
import { ChevronRight, Dumbbell, Utensils, Scale, Pizza, Coffee, Heart, BookOpen } from 'lucide-react';
import Card, { CardTitle } from '../common/Card';

// 핸드북 카테고리 타입 정의
type HandbookCategory = 'workout' | 'nutrition' | 'diet' | 'cheating' | 'health';

// 핸드북 카드 데이터 타입 정의
interface HandbookCard {
  id: string;
  title: string;
  content: string;
  category: HandbookCategory;
  imageUrl?: string;
}

// 카테고리별 아이콘 및 레이블 매핑
const categoryInfo: Record<HandbookCategory, { icon: React.ReactNode; label: string }> = {
  workout: { icon: <Dumbbell className="w-5 h-5" />, label: '운동 정보' },
  nutrition: { icon: <Utensils className="w-5 h-5" />, label: '영양 정보' },
  diet: { icon: <Scale className="w-5 h-5" />, label: '다이어트 방법' },
  cheating: { icon: <Pizza className="w-5 h-5" />, label: '치팅' },
  health: { icon: <Heart className="w-5 h-5" />, label: '건강' },
};

// 핸드북 카드 데이터
const handbookData: HandbookCard[] = [
  {
    id: '1',
    title: '근육 생성에 필요한 단백질 양',
    content: '근육 성장을 위해서는 체중 1kg당 1.6~2.2g의 단백질이 필요합니다. 70kg 체중인 사람은 하루에 112~154g의 단백질을 섭취해야 합니다. 단백질은 여러 끼니에 나눠 섭취하는 것이 효율적이며, 운동 후 30분 이내에 20~40g 정도의 단백질을 섭취하는 것이 근육 회복에 도움이 됩니다.',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae754'
  },
  {
    id: '2',
    title: '올바른 스쿼트 자세',
    content: '스쿼트를 할 때는 발을 어깨 너비로 벌리고, 발끝은 약간 바깥쪽으로 향하게 합니다. 상체를 곧게 펴고 복부에 힘을 주어 안정성을 유지합니다. 내려갈 때는 엉덩이를 뒤로 빼면서 무릎이 발끝보다 앞으로 나가지 않도록 주의합니다. 대퇴부가 바닥과 평행해질 때까지 내려간 후 발바닥으로 바닥을 강하게 밀어 올라옵니다.',
    category: 'workout'
  },
  {
    id: '3',
    title: '운동 시 물 섭취량',
    content: '운동 중 적절한 수분 섭취는 체온 조절과 영양소 운반에 중요합니다. 일반적으로 운동 시작 2시간 전에 500ml, 30분 전에 250ml 정도의 물을 마시는 것이 좋습니다. 운동 중에는 15~20분마다 150~250ml 정도를 마시고, 운동 후에는 소실된 체중 1kg당 1.5L의 물을 마셔야 합니다.',
    category: 'health'
  },
  {
    id: '4',
    title: '체중 감량을 위한 식단 구성',
    content: '체중 감량을 위해서는 단백질 비중을 높이고 탄수화물과 지방의 비중을 적절히 조절해야 합니다. 하루 칼로리 소모량보다 10~20% 정도 적게 섭취하는 것이 이상적입니다. 식단 구성은 단백질 30~35%, 탄수화물 40~45%, 지방 20~25% 정도로 구성하는 것이 효과적입니다. 과일과 채소는 충분히 섭취하고, 가공식품과 설탕이 많은 음식은 피하는 것이 좋습니다.',
    category: 'diet'
  },
  {
    id: '5',
    title: '치팅데이의 효과적인 활용법',
    content: '치팅데이(Cheating Day)는 다이어트 중 계획적으로 평소 제한하던 음식을 먹는 날입니다. 치팅데이를 통해 정신적 피로감을 줄이고, 대사량 감소를 방지하며, 렙틴 호르몬 분비를 촉진할 수 있습니다. 효과적인 활용법은 주 1회로 제한하고, 아침부터 시작하며, 과도한 폭식은 피하는 것입니다. 또한 치팅데이 다음 날에는 바로 정상 식단으로 복귀해야 합니다.',
    category: 'cheating'
  },
  {
    id: '6',
    title: '운동 전후 적절한 식사 시간',
    content: '운동 성과를 최대화하기 위해서는 식사 시간이 중요합니다. 큰 식사는 운동 2~3시간 전에, 가벼운 간식은 운동 30분~1시간 전에 먹는 것이 좋습니다. 운동 전에는 탄수화물 위주로, 운동 후에는 단백질과 탄수화물을 함께 섭취하는 것이 효과적입니다. 운동 후 30분 이내에 영양소를 섭취하면 근육 회복과 성장에 도움이 됩니다.',
    category: 'nutrition'
  },
  {
    id: '7',
    title: '유산소 vs 무산소 운동: 어떤 것이 더 효과적인가?',
    content: '유산소 운동은 지방 연소와 심폐 기능 향상에 효과적이며, 무산소 운동은 근력 강화와 대사량 증가에 좋습니다. 최적의 효과를 위해서는 두 가지를 병행하는 것이 좋습니다. 체중 감량이 목표라면 무산소 운동 후 유산소 운동을 하는 것이 효과적이며, 근육 발달이 목표라면 유산소 운동은 별도 일자에 하거나 무산소 운동 후 20~30분 정도만 가볍게 하는 것이 좋습니다.',
    category: 'workout'
  },
  {
    id: '8',
    title: '간헐적 단식의 효과와 방법',
    content: '간헐적 단식은 일정 시간 동안 음식 섭취를 제한하는 방법입니다. 16:8 방식(16시간 금식, 8시간 섭취), 5:2 방식(주 5일 정상 식사, 2일 저칼로리 식사) 등 다양한 방법이 있습니다. 간헐적 단식은 인슐린 감수성을 높이고, 세포 재생을 촉진하며, 지방 연소에 도움이 됩니다. 단, 급격한 도입보다는 점진적으로 적응하는 것이 중요하며, 금식 시간 동안 충분한 수분 섭취가 필요합니다.',
    category: 'diet'
  },
  {
    id: '9',
    title: '운동 중 빠른 에너지 보충법',
    content: '장시간 운동 시에는 에너지 보충이 필요합니다. 운동 중에는 빠르게 흡수되는 단순 탄수화물이 효과적입니다. 스포츠 음료, 바나나, 에너지 젤 등이 좋은 선택입니다. 1시간 이상의 운동에서는 30~60분마다 30~60g의 탄수화물을 섭취하는 것이 권장됩니다. 단, 짧은 운동에서는 별도의 에너지 보충 없이 물만 마셔도 충분합니다.',
    category: 'nutrition'
  },
  {
    id: '10',
    title: '건강한 치팅 음식 선택하기',
    content: '치팅데이에도 완전히 건강을 무시할 필요는 없습니다. 다크 초콜릿(70% 이상 카카오 함유), 수제 버거(품질 좋은 고기와 통밀 빵 사용), 홈메이드 피자(얇은 도우와 다양한 야채 토핑), 그릭 요거트와 과일, 구운 고구마 칩 등은 상대적으로 건강하면서도 만족감을 주는 치팅 음식입니다. 과도한 당분, 트랜스 지방, 인공 첨가물이 많은 음식은 피하는 것이 좋습니다.',
    category: 'cheating'
  },
  {
    id: '11',
    title: '수면과 근육 회복의 관계',
    content: '충분한 수면은 근육 회복과 성장에 필수적입니다. 수면 중에는 성장호르몬이 분비되어 근육 회복과 단백질 합성을 촉진합니다. 성인은 하루 7~9시간의 수면이 권장되며, 강도 높은 운동을 하는 사람은 더 많은 수면이 필요할 수 있습니다. 수면의 질을 높이기 위해 일정한 취침 시간을 유지하고, 취침 전 카페인과 블루라이트 노출을 피하며, 편안한 수면 환경을 조성하는 것이 중요합니다.',
    category: 'health'
  },
  {
    id: '12',
    title: '효과적인 유연성 훈련',
    content: '유연성 훈련은 부상 예방과 운동 능력 향상에 중요합니다. 정적 스트레칭(15~30초 유지)은 운동 후 회복에 좋고, 동적 스트레칭(움직임을 포함)은 운동 전 워밍업에 적합합니다. 주요 근육군에 대해 주 2~3회, 각 스트레칭을 2~4회 반복하는 것이 권장됩니다. 호흡을 조절하며 천천히 진행하고, 통증이 느껴지는 지점을 넘어가지 않는 것이 중요합니다.',
    category: 'workout'
  }
];

const ExerciseFaq = () => {
  const [selectedCategory, setSelectedCategory] = useState<HandbookCategory | 'all'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // 카드 확장/축소 토글
  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // 카테고리별 필터링
  const filteredCards = selectedCategory === 'all' 
    ? handbookData 
    : handbookData.filter(card => card.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 transition-all duration-300">
      <div className="flex items-center mb-6">
        <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">핸드북</h2>
      </div>
      
      {/* 카테고리 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <CardTitle>카테고리</CardTitle>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="font-semibold">전체</span>
          </button>
          
          {Object.entries(categoryInfo).map(([category, info]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as HandbookCategory)}
              className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mb-1">{info.icon}</span>
              <span className="text-xs font-semibold text-center">{info.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              해당 카테고리에 대한 정보가 없습니다.
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <Card
              key={card.id}
              className={`border-l-4 overflow-hidden transition-all duration-300 ${
                expandedCard === card.id 
                  ? 'border-blue-500 shadow-md' 
                  : `border-gray-200 dark:border-gray-700 hover:border-${card.category === 'workout' ? 'blue' : 
                     card.category === 'nutrition' ? 'green' : 
                     card.category === 'diet' ? 'indigo' : 
                     card.category === 'cheating' ? 'yellow' : 'red'}-300`
              }`}
            >
              <div 
                className="flex justify-between items-center cursor-pointer p-4"
                onClick={() => toggleCard(card.id)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                    ${card.category === 'workout' ? 'bg-blue-100 text-blue-600' : 
                     card.category === 'nutrition' ? 'bg-green-100 text-green-600' : 
                     card.category === 'diet' ? 'bg-indigo-100 text-indigo-600' : 
                     card.category === 'cheating' ? 'bg-yellow-100 text-yellow-600' : 
                     'bg-red-100 text-red-600'} dark:bg-opacity-20`}
                  >
                    {categoryInfo[card.category].icon}
                  </div>
                  <h3 className={`font-bold text-lg ${
                    expandedCard === card.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-800 dark:text-white'
                  }`}>
                    {card.title}
                  </h3>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                  expandedCard === card.id ? 'transform rotate-90 text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              
              {expandedCard === card.id && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">{card.content}</p>
                  </div>
                  
                  {card.imageUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img 
                        src={card.imageUrl} 
                        alt={card.title} 
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseFaq;
