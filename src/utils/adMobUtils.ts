import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdOptions, RewardAdOptions } from '@capacitor-community/admob';
import { isNativePlatform } from './capacitorUtils';
import { Capacitor } from '@capacitor/core';
import { RewardAdPluginEvents, AdMobRewardItem, AdLoadInfo, InterstitialAdPluginEvents, BannerAdPluginEvents } from '@capacitor-community/admob';
import { initializeAdMob as initAdMobService } from '../services/admobService';

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
    APP_ID: 'ca-app-pub-2952925573999681~7155228371', // AndroidManifest.xml에 설정된 ID와 일치시킴
    BANNER: 'ca-app-pub-2952925573999681/6261034822', 
    INTERSTITIAL: 'ca-app-pub-2952925573999681/1623785812',
    REWARD: 'YOUR_REAL_REWARD_ID', // 아직 설정되지 않음
  },
  IS_TESTING: false, // 실제 배포 시 false로 변경
};

/**
 * AdMob 초기화
 */
export const initializeAdMob = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // 웹 환경에서는 초기화를 수행하지 않음
    return false;
  }

  try {
    // admobService의 초기화 함수 사용
    await initAdMobService();
    return true;
  } catch (error) {
    console.error('[AdMobUtils] 초기화 실패:', error);
    return false;
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

/**
 * AdMob 이벤트 리스너 설정
 */
export const setupAdMobListeners = (): void => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 배너 광고 이벤트
    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: AdLoadInfo) => {
      console.log('[AdMobUtils] 배너 크기 변경:', info.size);
    });

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('[AdMobUtils] 배너 광고 로드됨');
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (info: AdLoadInfo) => {
      console.error('[AdMobUtils] 배너 광고 로드 실패:', info.error);
    });

    // 전면 광고 이벤트 (앱 오픈 및 네이티브 광고용)
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      console.log('[AdMobUtils] 전면 광고 로드됨:', info);
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info: AdLoadInfo) => {
      console.error('[AdMobUtils] 전면 광고 로드 실패:', info.error);
    });

    AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
      console.log('[AdMobUtils] 전면 광고 표시됨');
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('[AdMobUtils] 전면 광고 닫힘');
    });

    // 보상형 광고 이벤트 (필요한 경우)
    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      console.log('[AdMobUtils] 보상형 광고 로드됨:', info);
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.log('[AdMobUtils] 보상 획득:', reward);
    });
  } catch (error) {
    console.error('[AdMobUtils] 이벤트 리스너 설정 실패:', error);
  }
}; 