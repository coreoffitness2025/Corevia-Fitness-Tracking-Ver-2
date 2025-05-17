import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showText?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue-500',
  showText = false,
  text = '로딩 중...'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative">
        <div 
          className={`animate-spin rounded-full border-t-4 border-r-4 border-b-4 border-transparent border-t-${color} ${sizeClasses[size]}`}
          role="status"
        >
          <span className="sr-only">로딩 중...</span>
        </div>
        
        {/* 애니메이션 오버레이 효과 */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full bg-transparent border-2 border-gray-200 dark:border-gray-700 opacity-30 animate-ping`}></div>
      </div>
      
      {showText && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
            {text}
          </p>
          <div className="mt-2 w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulsate-slow rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// 고급 로딩 화면 컴포넌트
export const LoadingScreen: React.FC<{message?: string}> = ({ message = '데이터를 불러오는 중입니다...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-96">
      <LoadingSpinner size="lg" />
      
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {message}
        </p>
        <div className="mt-3 w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 