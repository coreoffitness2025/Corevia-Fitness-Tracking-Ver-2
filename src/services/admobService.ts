import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  AdLoadInfo,
  RewardAdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  AdMobBannerSize,
  AdmobConsentStatus
} from '@capacitor-community/admob';

// 광고 ID 상수
export const AD_IDS = {
  BANNER: 'ca-app-pub-2952925573999681/6261034822',
  APP_OPEN: 'ca-app-pub-2952925573999681/1623785812',
  NATIVE: 'ca-app-pub-2952925573999681/5870605862',
  // 테스트 광고 ID
  TEST_BANNER: 'ca-app-pub-3940256099942544/6300978111',
  TEST_INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  TEST_APP_OPEN: 'ca-app-pub-3940256099942544/3419835294',
  TEST_NATIVE: 'ca-app-pub-3940256099942544/2247696110'
};

// 개발 모드에서는 테스트 광고 ID 사용
const isDevelopment = process.env.NODE_ENV === 'development';

// AdMob 서비스 초기화
export const initializeAdMob = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { status } = await AdMob.trackingAuthorizationStatus();
      
      if (status === AdmobConsentStatus.REQUIRED) {
        await AdMob.requestConsentInfo();
        await AdMob.showConsentForm();
      }

      await AdMob.initialize();
      console.log('AdMob 초기화 완료');
    }
  } catch (error) {
    console.error('AdMob 초기화 실패:', error);
  }
};

// 배너 광고 표시
export const showBannerAd = async (position = BannerAdPosition.BOTTOM_CENTER): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const options: BannerAdOptions = {
      adId: isDevelopment ? AD_IDS.TEST_BANNER : AD_IDS.BANNER,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position,
      margin: 0,
    };
    
    await AdMob.showBanner(options);
    console.log('배너 광고 표시됨');
  } catch (error) {
    console.error('배너 광고 표시 실패:', error);
  }
};

// 배너 광고 숨기기
export const hideBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('배너 광고 숨기기 실패:', error);
  }
};

// 배너 광고 제거
export const removeBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await AdMob.removeBanner();
  } catch (error) {
    console.error('배너 광고 제거 실패:', error);
  }
};

// 앱 오픈 광고 준비
export const prepareAppOpenAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const options: AdOptions = {
      adId: isDevelopment ? AD_IDS.TEST_APP_OPEN : AD_IDS.APP_OPEN,
    };
    
    await AdMob.prepareInterstitial(options);
    console.log('앱 오픈 광고 준비됨');
  } catch (error) {
    console.error('앱 오픈 광고 준비 실패:', error);
  }
};

// 앱 오픈 광고 표시
export const showAppOpenAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  
  try {
    // 광고 준비 확인
    await prepareAppOpenAd();
    
    // 광고 표시
    await AdMob.showInterstitial();
    console.log('앱 오픈 광고 표시됨');
    return true;
  } catch (error) {
    console.error('앱 오픈 광고 표시 실패:', error);
    return false;
  }
};

// 네이티브 광고 설정 (주로 커스텀 컴포넌트에서 사용)
export const prepareNativeAd = async (): Promise<AdLoadInfo | null> => {
  if (!Capacitor.isNativePlatform()) return null;
  
  try {
    const options: AdOptions = {
      adId: isDevelopment ? AD_IDS.TEST_NATIVE : AD_IDS.NATIVE,
    };
    
    const info = await AdMob.prepareInterstitial(options);
    console.log('네이티브 광고 준비됨:', info);
    return info;
  } catch (error) {
    console.error('네이티브 광고 준비 실패:', error);
    return null;
  }
};

// 네이티브 광고 표시
export const showNativeAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  
  try {
    // 광고 준비
    await prepareNativeAd();
    
    // 광고 표시
    await AdMob.showInterstitial();
    console.log('네이티브 광고 표시됨');
    return true;
  } catch (error) {
    console.error('네이티브 광고 표시 실패:', error);
    return false;
  }
};

export default {
  initializeAdMob,
  showBannerAd,
  hideBannerAd,
  removeBannerAd,
  prepareAppOpenAd,
  showAppOpenAd,
  prepareNativeAd,
  showNativeAd
}; 