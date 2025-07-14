import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.corevia.fitness',
  appName: 'Corevia Fitness',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    initialFocus: true,
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    // 스플래시 화면은 이제 안드로이드 네이티브에서 100% 제어하므로,
    // Capacitor 설정은 비워두어 충돌을 방지합니다.
    SplashScreen: {},
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
    },
    "assets": {
      "icon": {
        "source": "src/assets/Corevia-logo.png",
        "backgroundColor": "#ffffff"
      }
    }
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
