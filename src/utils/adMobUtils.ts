import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdOptions, RewardAdOptions } from '@capacitor-community/admob';
import { isNativePlatform } from './capacitorUtils';

// AdMob 설정 (앱 등록 전 테스트용)
export const ADMOB_CONFIG = {
  // 테스트용 광고 ID들 (실제 AdMob 계정 생성 후 변경)
  TEST_IDS: {
    APP_ID: 'ca-app-pub-3940256099942544~3347511713',
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARD: 'ca-app-pub-3940256099942544/5224354917',
  },
  // 실제 광고 ID들 (나중에 AdMob 계정에서 발급받은 ID로 교체)
  PRODUCTION_IDS: {
    APP_ID: 'YOUR_REAL_APP_ID', // 나중에 교체
    BANNER: 'YOUR_REAL_BANNER_ID', // 나중에 교체
    INTERSTITIAL: 'YOUR_REAL_INTERSTITIAL_ID', // 나중에 교체
    REWARD: 'YOUR_REAL_REWARD_ID', // 나중에 교체
  },
  IS_TESTING: true, // 실제 배포 시 false로 변경
};

// AdMob 초기화
export const initializeAdMob = async (): Promise<void> => {
  try {
    if (!isNativePlatform()) {
      console.log('AdMob는 네이티브 플랫폼에서만 지원됩니다.');
      return;
    }

    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['YOUR_TESTING_DEVICE_ID'], // 테스트용 디바이스 ID
      initializeForTesting: true, // 개발 중에는 true로 설정
    });

    console.log('AdMob 초기화 완료');
  } catch (error) {
    console.error('AdMob 초기화 실패:', error);
  }
};

// 배너 광고 표시
export const showBannerAd = async (): Promise<void> => {
  try {
    if (!isNativePlatform()) return;

    const adId = ADMOB_CONFIG.IS_TESTING 
      ? ADMOB_CONFIG.TEST_IDS.BANNER 
      : ADMOB_CONFIG.PRODUCTION_IDS.BANNER;

    const options: BannerAdOptions = {
      adId,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: ADMOB_CONFIG.IS_TESTING,
    };

    await AdMob.showBanner(options);
    console.log('배너 광고 표시 완료');
  } catch (error) {
    console.error('배너 광고 표시 실패:', error);
  }
};

// 배너 광고 숨기기
export const hideBannerAd = async (): Promise<void> => {
  try {
    if (!isNativePlatform()) return;
    
    await AdMob.hideBanner();
    console.log('배너 광고 숨김 완료');
  } catch (error) {
    console.error('배너 광고 숨김 실패:', error);
  }
};

// 전면 광고 (Interstitial)
export const showInterstitialAd = async (): Promise<void> => {
  try {
    if (!isNativePlatform()) return;

    const adId = ADMOB_CONFIG.IS_TESTING 
      ? ADMOB_CONFIG.TEST_IDS.INTERSTITIAL 
      : ADMOB_CONFIG.PRODUCTION_IDS.INTERSTITIAL;

    const options: InterstitialAdOptions = {
      adId,
      isTesting: ADMOB_CONFIG.IS_TESTING,
    };

    // 광고 준비
    await AdMob.prepareInterstitial(options);
    
    // 광고 표시
    await AdMob.showInterstitial();
    console.log('전면 광고 표시 완료');
  } catch (error) {
    console.error('전면 광고 표시 실패:', error);
  }
};

// 보상형 광고 (Reward Video)
export const showRewardAd = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) return false;

    const adId = ADMOB_CONFIG.IS_TESTING 
      ? ADMOB_CONFIG.TEST_IDS.REWARD 
      : ADMOB_CONFIG.PRODUCTION_IDS.REWARD;

    const options: RewardAdOptions = {
      adId,
      isTesting: ADMOB_CONFIG.IS_TESTING,
    };

    // 광고 준비
    await AdMob.prepareRewardVideoAd(options);
    
    // 광고 표시
    const result = await AdMob.showRewardVideoAd();
    
    if (result.rewarded) {
      console.log('보상형 광고 시청 완료 - 보상 지급');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('보상형 광고 표시 실패:', error);
    return false;
  }
};

// 실제 AdMob ID로 설정 변경 (앱 등록 후 사용)
export const updateAdMobToProduction = (productionIds: {
  APP_ID: string;
  BANNER: string;
  INTERSTITIAL: string;
  REWARD: string;
}) => {
  ADMOB_CONFIG.PRODUCTION_IDS = productionIds;
  ADMOB_CONFIG.IS_TESTING = false;
  console.log('AdMob을 실제 광고 모드로 변경했습니다:', productionIds);
};

// 광고 이벤트 리스너 설정
export const setupAdMobListeners = (): void => {
  if (!isNativePlatform()) return;

  // 배너 광고 이벤트
  AdMob.addListener('bannerAdLoaded', () => {
    console.log('배너 광고 로드됨');
  });

  AdMob.addListener('bannerAdFailedToLoad', (error) => {
    console.error('배너 광고 로드 실패:', error);
  });

  // 전면 광고 이벤트
  AdMob.addListener('interstitialAdLoaded', () => {
    console.log('전면 광고 로드됨');
  });

  AdMob.addListener('interstitialAdFailedToLoad', (error) => {
    console.error('전면 광고 로드 실패:', error);
  });

  // 보상형 광고 이벤트
  AdMob.addListener('rewardedVideoAdLoaded', () => {
    console.log('보상형 광고 로드됨');
  });

  AdMob.addListener('rewardedVideoAdFailedToLoad', (error) => {
    console.error('보상형 광고 로드 실패:', error);
  });
}; 