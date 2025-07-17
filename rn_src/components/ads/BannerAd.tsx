import React from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.OS === 'android' 
    ? 'YOUR_ANDROID_BANNER_AD_UNIT_ID' 
    : 'YOUR_IOS_BANNER_AD_UNIT_ID';

const AppBannerAd = () => {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdFailedToLoad={(error) => console.error('Banner Ad Failed To Load', error)}
    />
  );
};

export default AppBannerAd; 