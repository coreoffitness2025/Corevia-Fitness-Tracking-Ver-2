# Android Build Guide for Corevia Fitness RN

This guide outlines the necessary steps to configure the native Android project for a successful build.

## 1. Firebase Setup

You must configure the native Android project to connect with Firebase.

1.  **`google-services.json`**: Download your `google-services.json` file from the Firebase console (Project Settings > General > Your apps).
2.  **Placement**: Place this file in the `android/app/` directory.

3.  **`build.gradle` Setup**: Ensure the following dependencies are correctly set up.

    -   In `android/build.gradle`:
        ```gradle
        buildscript {
          dependencies {
            // ... other dependencies
            classpath 'com.google.gms:google-services:4.3.15' // Or a newer version
          }
        }
        ```

    -   In `android/app/build.gradle`:
        ```gradle
        apply plugin: 'com.google.gms.google-services'

        dependencies {
          // ... other dependencies
          implementation platform('com.google.firebase:firebase-bom:32.3.1') // Check for the latest version
          implementation 'com.google.firebase:firebase-auth'
          implementation 'com.google.firebase:firebase-firestore'
          // ... etc.
        }
        ```

## 2. Splash Screen Setup (`react-native-splash-screen`)

Follow the setup instructions from the `react-native-splash-screen` library.

1.  **Create `launch_screen.xml`**: In `android/app/src/main/res/layout`, create a file named `launch_screen.xml`.
    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
        android:orientation="vertical" android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@drawable/splash"> 
    </RelativeLayout>
    ```
    *(You need to add your splash image to the `drawable` folders)*

2.  **Update `MainActivity.java`**:
    ```java
    import android.os.Bundle;
    import org.devio.rn.splashscreen.SplashScreen; // Import this
    import com.facebook.react.ReactActivity;

    public class MainActivity extends ReactActivity {
      @Override
      protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // Show the splash screen
        super.onCreate(savedInstanceState);
      }
      // ...
    }
    ```

3.  **Hide Splash Screen in JS**: The splash screen must be hidden from your JavaScript code once the app is ready. A good place is in `AppNavigator.tsx` after the loading state is resolved.
    ```javascript
    import SplashScreen from 'react-native-splash-screen';

    const AppNavigator = () => {
      const { currentUser, loading } = useAuth();

      useEffect(() => {
        if (!loading) {
          SplashScreen.hide();
        }
      }, [loading]);
      
      // ...
    };
    ```

## 3. Permissions (`AndroidManifest.xml`)

Add necessary permissions to `android/app/src/main/AndroidManifest.xml`.

```xml
<manifest ...>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- For react-native-image-picker -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
</manifest>
```

## 4. AdMob Configuration

To use `react-native-google-mobile-ads`, you need to add your AdMob App ID to `AndroidManifest.xml`.

```xml
<manifest ...>
    <application ...>
        <!-- ... other tags -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="YOUR_ADMOB_APP_ID"/>
    </application>
</manifest>
```

After these configurations, you should be able to run `npx react-native run-android` to build and launch the app on a connected device or emulator. 