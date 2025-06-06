import React, { useEffect } from 'react';
import { prepareNativeAd, showNativeAd } from '../../services/admobService';

interface NativeAdCardProps {
  showOnMount?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 네이티브 광고 컴포넌트
 * 
 * 참고: Capacitor/AdMob에서 네이티브 광고는 네이티브 UI로 표시되므로
 * 실제로 이 컴포넌트는 네이티브 광고가 표시될 영역을 마련하거나
 * 네이티브 광고를 트리거하는 용도로 사용됩니다.
 */
const NativeAdCard: React.FC<NativeAdCardProps> = ({
  showOnMount = true,
  className = '',
  children
}) => {
  // 컴포넌트 마운트 시 네이티브 광고 준비 및 표시
  useEffect(() => {
    if (showOnMount) {
      // 광고 로드
      prepareNativeAd()
        .then(info => {
          console.log('NativeAdCard: 광고 준비됨', info);
          
          // 필요한 경우 여기서 광고를 표시
          if (info) {
            showNativeAd()
              .then(shown => console.log('NativeAdCard: 광고 표시 결과 -', shown))
              .catch(error => console.error('NativeAdCard 표시 오류:', error));
          }
        })
        .catch(error => console.error('NativeAdCard 준비 오류:', error));
    }
  }, [showOnMount]);

  // 광고가 표시될 때까지 대체 콘텐츠 또는 플레이스홀더 표시
  return (
    <div className={`native-ad-container ${className}`}>
      {children || (
        <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            <div className="mt-4 flex justify-end">
              <div className="h-8 bg-blue-200 dark:bg-blue-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeAdCard; 