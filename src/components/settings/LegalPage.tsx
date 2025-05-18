import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import Button from '../common/Button';
import { ChevronLeft } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms';
  onBack?: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'privacy', onBack }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex items-center mb-6">
        {onBack && (
          <Button 
            variant="text" 
            onClick={onBack}
            className="mr-2"
            icon={<ChevronLeft size={20} />}
          >
            뒤로 가기
          </Button>
        )}
        <h1 className="text-2xl font-bold">법적 정보</h1>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'privacy'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          개인정보처리방침
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'terms'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('terms')}
        >
          이용약관
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </div>
  );
};

export default LegalPage; 