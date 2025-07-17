import React from 'react';
import { AuthProvider } from './rn_src/features/auth/contexts/AuthContext';
import AppNavigator from './rn_src/navigation/AppNavigator';
import { ThemeProvider } from './rn_src/contexts/ThemeContext';

/**
 * 이 App 컴포넌트는 앱의 최상위 래퍼(wrapper) 역할을 합니다.
 * 모든 주요 Context Provider(인증, 테마 등)를 여기에 배치하여
 * 앱 전체에서 관련 상태와 기능에 접근할 수 있도록 합니다.
 * 
 * 실제 화면 구성과 네비게이션은 AppNavigator에서 처리합니다.
 */
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 