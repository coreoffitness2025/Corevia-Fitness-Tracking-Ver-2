import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');

  // 인증 상태 변경 감지
  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated, currentUser?.uid);
    setDebugInfo(prev => `${prev}\n인증 상태: ${isAuthenticated ? '로그인됨' : '로그인되지 않음'}\n사용자 ID: ${currentUser?.uid || 'none'}`);
    
    if (isAuthenticated && currentUser) {
      // 개인화 필요 여부를 즉시 확인하고 모달 표시
      checkIfNeedsPersonalization();
    }
  }, [isAuthenticated, currentUser]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default LoginPage; 