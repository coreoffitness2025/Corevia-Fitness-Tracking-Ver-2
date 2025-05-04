import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HandbookItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'muscle' | 'nutrition' | 'supplement' | 'wellness';
  content?: {
    sections: Array<{
      title: string;
      content: string;
      points?: string[];
    }>;
  };
}

const handbookData: HandbookItem[] = [
  {
    id: '1',
    title: '근육량 증가의 주요 요소',
    description: '근육 증가에 필요한 핵심 요소들을 알아보세요',
    image: '/images/handbook/muscle-growth.jpg',
    category: 'muscle',
    content: {
      sections: [
        {
          title: '강도 높은 트레이닝',
          content: '트레이닝 원칙은 다양한 요인 및 개인마다 다르며, 그 예시로는 아래와 같은 것들이 있습니다.',
          points: [
            '트레이닝 수준',
            '체성분',
            '건강 상태 등'
          ]
        },
        {
          title: '적절한 영양 섭취',
          content: '따라서 일반적이며, 개인에 따라 조정되어야 하는 평균 가치와 건강상향을 제안해드리려 합니다.'
        }
      ]
    }
  },
  {
    id: '2',
    title: '글리코겐의 개념과 생산 위치, 영향',
    description: '글리코겐이 운동 성능에 미치는 영향을 이해하세요',
    image: '/images/handbook/glycogen.jpg',
    category: 'muscle',
    content: {
      sections: [
        {
          title: '글리코겐이란?',
          content: '글리코겐은 탄수화물이 저장된 형태로, 주로 간과 근육에 저장됩니다.'
        },
        {
          title: '글리코겐의 역할',
          content: '운동 중 에너지원으로 사용되며, 고강도 운동에 특히 중요합니다.'
        }
      ]
    }
  },
  {
    id: '3',
    title: '기초 운동',
    description: '탄탄한 기초를 다지는 기본 운동들',
    image: '/images/handbook/basic-exercise.jpg',
    category: 'muscle',
  },
  {
    id: '4',
    title: '스포츠 영양',
    description: '운동 효과를 극대화하는 영양 가이드',
    image: '/images/handbook/sports-nutrition.jpg',
    category: 'nutrition',
  },
  {
    id: '5',
    title: '성분 및 칼로리 목록',
    description: '식품별 영양 성분과 칼로리 정보',
    image: '/images/handbook/nutrition-info.jpg',
    category: 'nutrition',
  },
  {
    id: '6',
    title: '약리학',
    description: '안전한 보충제 사용을 위한 기초 지식',
    image: '/images/handbook/pharmacology.jpg',
    category: 'supplement',
  }
];

const categoryNames = {
  muscle: '운동',
  nutrition: '영양',
  supplement: '보충제',
  wellness: '웰빙'
};

const HandbookDetailModal = ({ item, onClose }: { item: HandbookItem; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {item.title}
            </h2>
            
            {item.content?.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {section.content}
                </p>
                {section.points && (
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {section.points.map((point, i) => (
                      <li key={i} className="mb-1">{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Handbook = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HandbookItem | null>(null);
  const navigate = useNavigate();

  const filteredItems = selectedCategory === 'all' 
    ? handbookData 
    : handbookData.filter(item => item.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'muscle': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'nutrition': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'supplement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'wellness': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          핸드북
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          운동과 영양에 대한 전문 가이드를 확인하세요
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedCategory === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          전체
        </button>
        {Object.entries(categoryNames).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === key 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* 핸드북 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="relative overflow-hidden rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
          >
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-32 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/400/200';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${getCategoryColor(item.category)}`}>
                  {categoryNames[item.category]}
                </span>
                <h3 className="text-white font-bold text-lg mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-200 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 디테일 모달 */}
      {selectedItem && (
        <HandbookDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default Handbook;
