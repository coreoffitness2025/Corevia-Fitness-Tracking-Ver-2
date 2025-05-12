import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="text-blue-500 hover:underline">홈으로 돌아가기</Link>
    </div>
  );
};

export default NotFoundPage; 