import React, { useEffect, useState } from 'react';
import { BannerAdPosition } from '@capacitor-community/admob';
import { showBannerAd, removeBannerAd } from '../../services/admobService';

interface BannerAdProps {
  position?: BannerAdPosition;
  showOnMount?: boolean;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  position = BannerAdPosition.BOTTOM_CENTER,
  showOnMount = true
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);

  // 컴포넌트 마운트 시 배너 광고 표시
  useEffect(() => {
    if (isVisible) {
      showBannerAd(position)
        .then(() => console.log('BannerAd 컴포넌트: 배너 광고 표시됨'))
        .catch(error => console.error('BannerAd 컴포넌트 오류:', error));
    }

    // 컴포넌트 언마운트 시 배너 광고 제거
    return () => {
      removeBannerAd()
        .then(() => console.log('BannerAd 컴포넌트: 배너 광고 제거됨'))
        .catch(error => console.error('BannerAd 컴포넌트 제거 오류:', error));
    };
  }, [isVisible, position]);

  // 배너 광고 표시/숨김 토글 함수
  const toggleBanner = () => {
    setIsVisible(prev => !prev);
  };

  // 컴포넌트는 시각적으로 렌더링되지 않음 (Native 레이어에서 표시)
  return null;
};

export default BannerAd; 