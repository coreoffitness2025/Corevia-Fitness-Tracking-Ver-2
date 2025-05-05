import { useState, useEffect } from 'react';
import { ExercisePart, FAQ } from '../../types';
import { getFAQs } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import { BookOpen, Circle, ChevronRight } from 'lucide-react';
import Card, { CardTitle } from '../common/Card';

const partNames: Record<ExercisePart, string> = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체',
};

const partIcons: Record<ExercisePart, string> = {
  chest: '💪',
  back: '🔙',
  shoulder: '🏋️',
  leg: '🦵'
};

type FAQType = 'method' | 'sets';

const ExerciseFaq = () => {
  const [faqType, setFaqType] = useState<FAQType>('method');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getFAQs(selectedPart, faqType);
        setFaqs(data);
      } catch (err) {
        console.error('FAQ 로딩 중 오류:', err);
        setError('FAQ를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [selectedPart, faqType]);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 transition-all duration-300">
      <div className="flex items-center mb-6">
        <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">핸드북</h2>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <CardTitle>문의 유형 선택</CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => setFaqType('method')}
            className={`py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
              faqType === 'method'
                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="font-semibold">운동 방법</span>
          </button>
          <button
            onClick={() => setFaqType('sets')}
            className={`py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
              faqType === 'sets'
                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="font-semibold">운동 세트 수</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <CardTitle>부위 선택</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {Object.entries(partNames).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedPart(value as ExercisePart)}
              className={`py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                selectedPart === value
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-2xl mb-1">{partIcons[value as ExercisePart]}</span>
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              해당 카테고리에 대한 정보가 없습니다.
            </p>
          </div>
        ) : (
          faqs.map((faq) => (
            <Card
              key={faq.id}
              className={`border-l-4 overflow-hidden transition-all duration-300 ${
                expandedFaq === faq.id 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFaq(faq.id)}
              >
                <h3 className={`font-bold text-lg ${
                  expandedFaq === faq.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-800 dark:text-white'
                }`}>
                  {faq.question}
                </h3>
                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                  expandedFaq === faq.id ? 'transform rotate-90 text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              
              {expandedFaq === faq.id && (
                <div className="mt-4 animate-slideDown">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </div>
                  
                  {faq.videoUrl && (
                    <div className="mt-4">
                      <div className="relative w-full pt-[56.25%] bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                        <video
                          src={faq.videoUrl}
                          controls
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.error('비디오 로드 실패:', e);
                            toast.error('비디오를 재생할 수 없습니다.');
                          }}
                        />
                      </div>
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
