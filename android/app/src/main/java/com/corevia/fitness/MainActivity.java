package com.corevia.fitness;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "CoreFitDebug";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 디버깅을 위한 콘솔 로그
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "애플리케이션 크래시 발생: ", throwable);
        });
        
        Log.d(TAG, "앱 시작됨");
    }
}
