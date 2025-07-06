package com.corevia.fitness;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "CoreFitDebug";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        showToast("앱 시작 - onCreate");
        logEvent("앱 시작 - onCreate 호출됨");
        
        try {
            // Edge-to-Edge 활성화 (Android 15+ 호환성)
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            
            logEvent("super.onCreate 호출 전");
            super.onCreate(savedInstanceState);
            logEvent("super.onCreate 호출 성공");
            
            // 디버깅을 위한 콘솔 로그
            Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
                Log.e(TAG, "애플리케이션 크래시 발생: ", throwable);
            });
            
            // 로딩 단계 로깅
            logEvent("Bridge 초기화 단계");
            
            Log.d(TAG, "앱 시작됨");
            showToast("앱 초기화 진행 중");
            
            // 필요한 플러그인 등록
            this.registerPlugins(new ArrayList<Class<? extends Plugin>>() {{
                // 여기에 필요한 플러그인 추가
            }});
            
            // Crashlytics 테스트 버튼 추가
            addCrashlyticsTestButton();
            
            logEvent("onCreate 완료");
            
        } catch (Exception e) {
            Log.e(TAG, "onCreate에서 예외 발생: ", e);
            showToast("초기화 오류: " + e.getMessage());
        }
    }
    
    private void addCrashlyticsTestButton() {
        Button crashButton = new Button(this);
        crashButton.setText("Test Crash");
        crashButton.setOnClickListener(view -> {
            FirebaseCrashlytics.getInstance().log("테스트 크래시 버튼이 클릭되었습니다");
            throw new RuntimeException("Test Crash");
        });

        addContentView(crashButton, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
    }
    
    private void logEvent(String message) {
        Log.d(TAG, message);
    }
    
    private void showToast(String message) {
        try {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Log.e(TAG, "토스트 표시 실패: " + message, e);
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        logEvent("onResume 호출됨");
    }
    
    @Override
    public void onPause() {
        super.onPause();
        logEvent("onPause 호출됨");
    }
    
    @Override
    public void onDestroy() {
        logEvent("onDestroy 호출됨");
        super.onDestroy();
    }
}
