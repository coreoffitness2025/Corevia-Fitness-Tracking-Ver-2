package com.corevia.fitness;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;
import android.webkit.WebView;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.content.Context;
import android.provider.Settings;
import java.lang.reflect.Method;
import java.lang.reflect.Field;

import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "CoreFitDebug";
    private ConnectivityManager.NetworkCallback networkCallback;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            // 상태바 설정
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            
            // Firebase 및 Google Play 서비스 확인
            checkGooglePlayServices();
            
            // DNS 설정 확인 및 수정
            checkAndFixDNSSettings();
            
            // 웹뷰 원격 디버깅 활성화
            WebView.setWebContentsDebuggingEnabled(true);
            
            // 네트워크 연결 모니터링
            setupNetworkMonitoring();
            
            logEvent("onCreate 완료");
        } catch (Exception e) {
            Log.e(TAG, "onCreate 오류: " + e.getMessage(), e);
        }
    }
    
    private void checkGooglePlayServices() {
        try {
            GoogleApiAvailability googleAPI = GoogleApiAvailability.getInstance();
            int result = googleAPI.isGooglePlayServicesAvailable(this);
            
            if (result != com.google.android.gms.common.ConnectionResult.SUCCESS) {
                Log.w(TAG, "Google Play 서비스가 사용 불가능합니다: " + result);
                
                if (googleAPI.isUserResolvableError(result)) {
                    Log.i(TAG, "사용자가 해결할 수 있는 Google Play 서비스 오류입니다.");
                    googleAPI.showErrorNotification(this, result);
                } else {
                    Log.e(TAG, "이 기기는 Google Play 서비스를 지원하지 않습니다.");
                }
            } else {
                Log.i(TAG, "Google Play 서비스가 사용 가능합니다.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Google Play 서비스 확인 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    private void checkAndFixDNSSettings() {
        try {
            // 현재 DNS 설정 확인
            String dns1 = Settings.Global.getString(getContentResolver(), "net.dns1");
            String dns2 = Settings.Global.getString(getContentResolver(), "net.dns2");
            
            Log.d(TAG, "현재 DNS 설정: DNS1=" + dns1 + ", DNS2=" + dns2);
            
            // 네트워크 연결 테스트
            new Thread(() -> {
                try {
                    // Firebase 도메인 연결 테스트
                    boolean canReachFirebase = isHostReachable("firestore.googleapis.com");
                    boolean canReachAnalytics = isHostReachable("firebase-analytics.googleapis.com");
                    
                    Log.i(TAG, "Firebase 서비스 연결 테스트: firestore=" + canReachFirebase + ", analytics=" + canReachAnalytics);
                    
                    if (!canReachFirebase || !canReachAnalytics) {
                        Log.w(TAG, "Firebase 서비스에 연결할 수 없습니다: firestore=" + canReachFirebase + ", analytics=" + canReachAnalytics);
                    } else {
                        Log.i(TAG, "Firebase 서비스에 연결할 수 있습니다.");
                    }
                } catch (Exception e) {
                    Log.e(TAG, "네트워크 연결 테스트 중 오류 발생: " + e.getMessage(), e);
                }
            }).start();
        } catch (Exception e) {
            Log.e(TAG, "DNS 설정 확인 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    private boolean isHostReachable(String host) {
        try {
            Process process = Runtime.getRuntime().exec("/system/bin/ping -c 1 " + host);
            int returnVal = process.waitFor();
            return (returnVal == 0);
        } catch (Exception e) {
            Log.e(TAG, "호스트 연결 확인 중 오류 발생: " + e.getMessage(), e);
            return false;
        }
    }
    
    private void setupNetworkMonitoring() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        
        // 현재 네트워크 상태 확인
        boolean isConnected = isNetworkConnected(connectivityManager);
        Log.d(TAG, "현재 네트워크 연결 상태: " + (isConnected ? "연결됨" : "연결 안됨"));
        
        if (!isConnected) {
            Log.w(TAG, "네트워크 연결이 없습니다. Firebase 서비스에 연결할 수 없습니다.");
        }
        
        // 네트워크 변경 콜백 등록
        networkCallback = new ConnectivityManager.NetworkCallback() {
            @Override
            public void onAvailable(Network network) {
                Log.d(TAG, "네트워크 연결됨");
                runOnUiThread(() -> {
                    // 웹뷰 새로고침
                    bridge.getWebView().reload();
                });
            }
            
            @Override
            public void onLost(Network network) {
                Log.d(TAG, "네트워크 연결 끊김");
            }
        };
        
        NetworkRequest networkRequest = new NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build();
        
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback);
    }
    
    private boolean isNetworkConnected(ConnectivityManager connectivityManager) {
        Network network = connectivityManager.getActiveNetwork();
        if (network == null) return false;
        
        NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(network);
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }
    
    private void logEvent(String message) {
        Log.d(TAG, message);
    }
    
    // Crashlytics 테스트 버튼 추가 메서드
    private void addCrashlyticsTestButton() {
        try {
            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            
            android.widget.Button crashButton = new android.widget.Button(this);
            crashButton.setText("Crash 테스트");
            crashButton.setOnClickListener(view -> {
                throw new RuntimeException("Crashlytics 테스트 크래시");
            });
            
            layout.addView(crashButton);
            
            addContentView(
                layout,
                new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            );
        } catch (Exception e) {
            Log.e(TAG, "Crashlytics 테스트 버튼 추가 중 오류: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onDestroy() {
        logEvent("onDestroy 호출됨");
        super.onDestroy();
        
        // 네트워크 콜백 해제
        if (networkCallback != null) {
            ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            connectivityManager.unregisterNetworkCallback(networkCallback);
        }
    }
}

