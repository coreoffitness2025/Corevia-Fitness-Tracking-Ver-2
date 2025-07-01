package com.corevia.fitness;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "CoreFitDebug";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        showToast("앱 시작 - onCreate");
        logEvent("앱 시작 - onCreate 호출됨");
        
        try {
            // 네이티브 크래시 방지를 위한 예외 처리
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
            FirebaseCrashlytics.getInstance().sendUnsentReports();
            logEvent("Crashlytics 초기화 성공");
        } catch (Exception e) {
            Log.e(TAG, "Crashlytics 초기화 실패", e);
        }
        
        try {
            logEvent("super.onCreate 호출 전");
            super.onCreate(savedInstanceState);
            logEvent("super.onCreate 호출 성공");
            
            // 디버깅을 위한 콘솔 로그
            Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
                Log.e(TAG, "애플리케이션 크래시 발생: ", throwable);
                try {
                    FirebaseCrashlytics.getInstance().recordException(throwable);
                    logEvent("크래시 기록 완료: " + throwable.getMessage());
                } catch (Exception e) {
                    Log.e(TAG, "Crashlytics 오류 기록 실패", e);
                }
            });
            
            // 로딩 단계 로깅
            logEvent("Bridge 초기화 단계");
            // Bridge 관련 디버깅
            getBridge().addListener("onPageLoaded", (info) -> {
                logEvent("웹뷰 페이지 로드 완료");
                showToast("웹뷰 페이지 로드 완료");
            });
            
            getBridge().addListener("capacitorPageDidLoad", (info) -> {
                logEvent("Capacitor 페이지 로드 완료");
                showToast("Capacitor 페이지 로드 완료");
            });
            
            getBridge().addListener("capacitorReady", (info) -> {
                logEvent("Capacitor 초기화 완료");
            });
            
            Log.d(TAG, "앱 시작됨");
            showToast("앱 초기화 진행 중");
            
            // 테스트 크래시 버튼 추가
            // 개발 모드에서만 표시되도록 설정
            if (BuildConfig.DEBUG) {
                logEvent("디버그 모드 - 테스트 버튼 추가");
                Button crashButton = new Button(this);
                crashButton.setText("테스트 크래시");
                crashButton.setOnClickListener(view -> {
                    FirebaseCrashlytics.getInstance().log("테스트 크래시 버튼 클릭됨");
                    throw new RuntimeException("테스트 크래시");
                });
                
                // 버튼을 메인 레이아웃에 지연 추가 (Capacitor UI가 로드된 후)
                getContentView().post(() -> {
                    logEvent("테스트 버튼 레이아웃 추가");
                    try {
                        LinearLayout layout = new LinearLayout(this);
                        layout.setLayoutParams(new LinearLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.WRAP_CONTENT));
                        layout.addView(crashButton);
                        
                        ((ViewGroup) getContentView().getParent()).addView(layout);
                        logEvent("테스트 버튼 추가 성공");
                    } catch (Exception e) {
                        Log.e(TAG, "테스트 버튼 추가 실패", e);
                        FirebaseCrashlytics.getInstance().recordException(e);
                    }
                });
            }
            
            logEvent("onCreate 완료");
            
        } catch (Exception e) {
            Log.e(TAG, "onCreate에서 예외 발생: ", e);
            try {
                FirebaseCrashlytics.getInstance().recordException(e);
                showToast("초기화 오류: " + e.getMessage());
            } catch (Exception ex) {
                Log.e(TAG, "Crashlytics 오류 기록 실패", ex);
            }
        }
    }
    
    private void logEvent(String message) {
        Log.d(TAG, message);
        try {
            FirebaseCrashlytics.getInstance().log(message);
        } catch (Exception e) {
            Log.e(TAG, "로그 기록 실패: " + message, e);
        }
    }
    
    private void showToast(String message) {
        try {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Log.e(TAG, "토스트 표시 실패: " + message, e);
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        logEvent("onResume 호출됨");
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        logEvent("onPause 호출됨");
    }
    
    @Override
    public void onDestroy() {
        logEvent("onDestroy 호출됨");
        super.onDestroy();
    }
}
