import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { handleRedirectResult } from '../../firebase/firebaseConfig';
import { LoadingScreen } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // 리디렉션 결과 확인
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          toast.success('로그인에 성공했습니다.');
        }
      } catch (error: any) {
        console.error('리디렉션 결과 확인 중 오류:', error);
        if (error.code === 'auth/disallowed-useragent') {
          setRedirectError('모바일 브라우저에서는 지원되지 않는 기능입니다. Firebase 콘솔에서 모바일 브라우저를 허용하도록 설정해주세요.');
          toast.error('모바일 브라우저에서 로그인 제한이 있습니다.');
        }
      } finally {
        setIsCheckingRedirect(false);
      }
    };

    checkRedirectResult();
  }, []);

  // 로딩 중이거나 리디렉션 확인 중이면 로딩 상태 표시
  if (loading || isCheckingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingScreen message="앱을 준비하는 중입니다..." />
      </div>
    );
  }

  // 리디렉션 오류 발생 시
  if (redirectError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="text-red-500 text-xl font-bold mb-4">인증 오류</div>
          <p className="mb-6">{redirectError}</p>
          <p className="mb-6">Firebase 콘솔에서 &apos;인증 &rarr; 설정 &rarr; 승인된 도메인&apos;에 현재 사용 중인 도메인을 추가하고, &apos;OAuth 2.0 허용된 플랫폼&apos;에 모바일 브라우저를 허용하도록 설정해야 합니다.</p>
          <Navigate to="/login" state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 사용자는 요청된 페이지로 접근 허용
  return <>{children}</>;
};

export default ProtectedRoute;
