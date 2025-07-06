package com.corevia.fitness;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Edge-to-Edge 활성화 (Android 15+ 호환성)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }
}
