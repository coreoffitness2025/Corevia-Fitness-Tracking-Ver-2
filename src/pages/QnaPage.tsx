import { useState, useEffect } from 'react';
import { ExercisePart, FAQ } from '../types';
import { getFAQs } from '../services/firebaseService';
import Layout from '../components/common/Layout';

const partNames = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체'
};

const QnaPage = () => {
  const [selectedPart, setSelectedPart] = useState<ExercisePart>('chest');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      const data = await getFAQs(selectedPart);
      setFaqs(data);
      setIsLoading(false);
    };
    
    fetchFAQs();
  }, [selectedPart]);
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          자주 묻는 질문
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          올바른 운동 방법 정보
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="spinner"></div>
          </div>
        ) : faqs.length > 0 ? (
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {faq.answer}
                </p>
                {faq.videoUrl && (
                  
                    href={faq.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    영상 보기
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              이 부위에 대한 Q&A가 없습니다.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QnaPage;
