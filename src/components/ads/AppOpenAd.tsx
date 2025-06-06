import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showAppOpenAd } from '../../services/admobService';

interface AppOpenAdProps {
  showOnMount?: boolean;
  showOnRouteChange?: boolean;
}

const AppOpenAd: React.FC<AppOpenAdProps> = ({
  showOnMount = true,
  showOnRouteChange = false
}) => {
  const location = useLocation();

  // 컴포넌트 마운트 시 광고 표시
  useEffect(() => {
    if (showOnMount) {
      showAppOpenAd()
        .then(shown => console.log('AppOpenAd 컴포넌트: 광고 표시 결과 -', shown))
        .catch(error => console.error('AppOpenAd 컴포넌트 오류:', error));
    }
  }, [showOnMount]);

  // 라우트 변경 시 광고 표시 (옵션)
  useEffect(() => {
    if (showOnRouteChange) {
      showAppOpenAd()
        .then(shown => console.log('AppOpenAd 컴포넌트: 라우트 변경 시 광고 표시 결과 -', shown))
        .catch(error => console.error('AppOpenAd 컴포넌트 오류:', error));
    }
  }, [location, showOnRouteChange]);

  // 컴포넌트는 시각적으로 렌더링되지 않음
  return null;
};

export default AppOpenAd; 