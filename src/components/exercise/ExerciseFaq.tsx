import { useState, useEffect } from 'react';
import { ExercisePart, FAQ } from '../../types';
import { getFAQs } from '../../services/firebaseService';
import { toast } from 'react-hot-toast';

const partNames: Record<ExercisePart, string> = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체',
  biceps: '이두',
  triceps: '삼두'
};

type FAQType = 'method' | 'sets';

const ExerciseFaq = () => {
  const [faqType, setFaqType] = useState<FAQType>('method');
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
        문의 유형 선택
      </label>
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="faqType"
            value="method"
            checked={faqType === 'method'}
            onChange={() => setFaqType('method')}
            className="mr-2"
          />
          운동 방법
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="faqType"
            value="sets"
            checked={faqType === 'sets'}
            onChange={() => setFaqType('sets')}
            className="mr-2"
          />
          운동 세트 수
        </label>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          부위 선택
        </label>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as ExercisePart)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(partNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">{faq.question}</h3>
            <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
            {faq.videoUrl && (
              <div className="mt-2">
                <video
                  src={faq.videoUrl}
                  controls
                  className="w-full rounded"
                  onError={(e) => {
                    console.error('비디오 로드 실패:', e);
                    toast.error('비디오를 재생할 수 없습니다.');
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseFaq;
