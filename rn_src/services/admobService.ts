import mobileAds from 'react-native-google-mobile-ads';

export const initializeAds = async () => {
  try {
    const adapterStatuses = await mobileAds().initialize();
    console.log('Mobile Ads Initialized', adapterStatuses);
  } catch (error) {
    console.error('Error initializing mobile ads', error);
  }
}; 