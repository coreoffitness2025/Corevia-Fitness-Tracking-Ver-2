import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.corevia.fitness',
  appName: 'Corevia Fitness',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#4285F4'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4285F4',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#4285F4',
      statusBarStyle: 'light',
      offset: 0
    },
    Camera: {
      externalStorage: true
    },
    Filesystem: {
      readIosPhotoLibrary: true,
      presentPickerOnLoad: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#4285F4"
    },
    AdMob: {
      appMuted: false,
      appVolume: 1.0,
      testingDevices: ["EMULATOR"],
      initialize: true,
      autoRequestConsent: true,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false
    }
  },
  android: {
    useLegacyStorage: false,
    requestPermissions: true
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
