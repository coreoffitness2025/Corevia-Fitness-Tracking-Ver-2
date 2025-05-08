import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue-500' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-t-${color} ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">로딩 중...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 