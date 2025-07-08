import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.corevia.fitness',
  appName: 'Corevia Fitness',
  webDir: 'dist',
  server: {
    androidScheme: 'capacitor',
    cleartext: true,
    allowNavigation: ['*'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    initialFocus: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#f5f5f5",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#1976d2",
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1976d2",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#4285F4'
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
    AdMob: {
      appMuted: false,
      appVolume: 1.0,
      testingDevices: ["EMULATOR"],
      initialize: true,
      autoRequestConsent: true,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      applicationID: {
        android: 'ca-app-pub-2952925573999681~7155228371',
        ios: 'ca-app-pub-2952925573999681~7155228371'
      }
    }
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
