package com.corevia.fitness;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "CoreFitDebug";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Crashlytics 디버그 모드 활성화
        FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
        FirebaseCrashlytics.getInstance().sendUnsentReports();
        FirebaseCrashlytics.getInstance().log("MainActivity onCreate 시작");
        
        try {
            super.onCreate(savedInstanceState);
            
            // 디버깅을 위한 콘솔 로그
            Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
                Log.e(TAG, "애플리케이션 크래시 발생: ", throwable);
                FirebaseCrashlytics.getInstance().recordException(throwable);
            });
            
            Log.d(TAG, "앱 시작됨");
            FirebaseCrashlytics.getInstance().log("앱 정상 초기화됨");

            // 테스트 크래시 버튼 추가
            // 개발 모드에서만 표시되도록 설정
            if (BuildConfig.DEBUG) {
                Button crashButton = new Button(this);
                crashButton.setText("테스트 크래시");
                crashButton.setOnClickListener(view -> {
                    FirebaseCrashlytics.getInstance().log("테스트 크래시 버튼 클릭됨");
                    throw new RuntimeException("테스트 크래시");
                });
                
                // 버튼을 메인 레이아웃에 지연 추가 (Capacitor UI가 로드된 후)
                getContentView().post(() -> {
                    LinearLayout layout = new LinearLayout(this);
                    layout.setLayoutParams(new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT));
                    layout.addView(crashButton);
                    
                    ((ViewGroup) getContentView().getParent()).addView(layout);
                });
            }
        } catch (Exception e) {
            Log.e(TAG, "onCreate에서 예외 발생: ", e);
            FirebaseCrashlytics.getInstance().recordException(e);
        }
    }
}
